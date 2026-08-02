import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getAuthenticatedUserId } from "../_shared/auth.ts";

const exposeHeaders = {
  ...corsHeaders,
  "Access-Control-Expose-Headers": "X-TTS-Provider, X-TTS-Fallback, X-TTS-Fallback-Reason",
};


async function tryLovable(text: string, voice: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return { ok: false as const, status: 500, error: "LOVABLE_API_KEY missing" };
  }
  const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts",
      input: text,
      voice: voice || "alloy",
      response_format: "mp3",
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    return { ok: false as const, status: r.status, error: err || r.statusText };
  }
  return { ok: true as const, buf: await r.arrayBuffer() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: exposeHeaders });
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...exposeHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, voice } = await req.json();
    if (!text || typeof text !== "string") {

      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...exposeHeaders, "Content-Type": "application/json" },
      });
    }

    const elKey = Deno.env.get("ELEVENLABS_API_KEY");
    const elVoice = Deno.env.get("ELEVENLABS_VOICE_ID");

    // Try ElevenLabs first if configured
    if (elKey && elVoice) {
      const voiceId = (voice && typeof voice === "string" && voice.length > 10) ? voice : elVoice;
      try {
        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": elKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
                speed: 0.95,
              },
            }),
          },
        );

        if (upstream.ok) {
          const buf = await upstream.arrayBuffer();
          return new Response(buf, {
            status: 200,
            headers: {
              ...exposeHeaders,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
              "X-TTS-Provider": "elevenlabs",
            },
          });
        }

        // ElevenLabs failed → fall back
        const errText = await upstream.text().catch(() => upstream.statusText);
        console.warn("ElevenLabs failed, falling back to Lovable AI:", upstream.status, errText);
        const reason =
          upstream.status === 401 ? "auth" :
          upstream.status === 429 ? "rate_limit" :
          upstream.status === 402 ? "quota" :
          `http_${upstream.status}`;

        const fb = await tryLovable(text, voice);
        if (fb.ok) {
          return new Response(fb.buf, {
            status: 200,
            headers: {
              ...exposeHeaders,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
              "X-TTS-Provider": "lovable",
              "X-TTS-Fallback": "true",
              "X-TTS-Fallback-Reason": reason,
            },
          });
        }
        return new Response(
          JSON.stringify({
            error: "Both ElevenLabs and fallback failed",
            elevenlabs: errText,
            fallback: fb.error,
            reason,
          }),
          { status: fb.status, headers: { ...exposeHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        console.warn("ElevenLabs threw, falling back:", (e as Error).message);
        const fb = await tryLovable(text, voice);
        if (fb.ok) {
          return new Response(fb.buf, {
            status: 200,
            headers: {
              ...exposeHeaders,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
              "X-TTS-Provider": "lovable",
              "X-TTS-Fallback": "true",
              "X-TTS-Fallback-Reason": "network",
            },
          });
        }
        return new Response(JSON.stringify({ error: fb.error }), {
          status: fb.status,
          headers: { ...exposeHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // No ElevenLabs configured → use Lovable directly
    const fb = await tryLovable(text, voice);
    if (fb.ok) {
      return new Response(fb.buf, {
        status: 200,
        headers: {
          ...exposeHeaders,
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "X-TTS-Provider": "lovable",
        },
      });
    }
    return new Response(JSON.stringify({ error: fb.error }), {
      status: fb.status,
      headers: { ...exposeHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...exposeHeaders, "Content-Type": "application/json" },
    });
  }
});
