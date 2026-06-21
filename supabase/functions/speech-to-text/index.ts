// Edge function: speech-to-text
// Accepts multipart/form-data with `file` (audio blob) and optional `model`.
// Forwards to Lovable AI Gateway transcription endpoint and returns { text }.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data with `file`" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get("file");
    const model = (form.get("model") as string) || "openai/gpt-4o-mini-transcribe";

    if (!(file instanceof File) && !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "Missing `file` audio part" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const blob = file as Blob;
    if (blob.size < 1024) {
      return new Response(
        JSON.stringify({ error: "Audio recording is empty or too short — please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (blob.size > 24 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Audio is too large (max 24 MiB)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derive filename extension from MIME so OpenAI infers the format correctly.
    const mime = (blob.type || "").split(";")[0];
    const extMap: Record<string, string> = {
      "audio/webm": "webm",
      "audio/mp4": "mp4",
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/wav": "wav",
      "audio/wave": "wav",
      "audio/x-wav": "wav",
      "audio/ogg": "ogg",
      "audio/flac": "flac",
    };
    const ext = extMap[mime] ?? "webm";
    const filename = (file instanceof File && file.name) ? file.name : `recording.${ext}`;

    const upstream = new FormData();
    upstream.append("model", model);
    upstream.append("file", blob, filename.includes(".") ? filename : `${filename}.${ext}`);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: upstream,
    });

    const bodyText = await resp.text();
    if (!resp.ok) {
      console.error("STT upstream error", resp.status, bodyText);
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 500;
      let message = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        message = parsed.error?.message ?? parsed.error ?? bodyText;
      } catch (_) { /* keep raw */ }
      return new Response(
        JSON.stringify({
          error:
            resp.status === 429
              ? "Rate limit reached — please try again in a moment."
              : resp.status === 402
              ? "AI credits exhausted. Please add credits in workspace settings."
              : `Transcription failed: ${message}`,
          provider_status: resp.status,
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let text = "";
    try {
      const json = JSON.parse(bodyText);
      text = (json.text ?? "").trim();
    } catch (_) {
      text = bodyText.trim();
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("speech-to-text error", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
