import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const elKey = Deno.env.get("ELEVENLABS_API_KEY");
    const elVoice = Deno.env.get("ELEVENLABS_VOICE_ID");
    const { text, voice } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prefer ElevenLabs when configured
    if (elKey && elVoice) {
      const voiceId = (voice && typeof voice === "string" && voice.length > 10) ? voice : elVoice;
      const upstream = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elKey,
            "Content-Type": "application/json",
          },
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
      if (!upstream.ok) {
        const err = await upstream.text();
        return new Response(JSON.stringify({ error: err || upstream.statusText, provider: "elevenlabs" }), {
          status: upstream.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const buf = await upstream.arrayBuffer();
      return new Response(buf, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "X-TTS-Provider": "elevenlabs",
        },
      });
    }

    // Fallback to Lovable AI gateway
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No TTS provider configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: voice || "alloy",
        response_format: "mp3",
      }),
    });
    if (!upstream.ok) {
      const err = await upstream.text();
      return new Response(JSON.stringify({ error: err || upstream.statusText }), {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Provider": "lovable",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
