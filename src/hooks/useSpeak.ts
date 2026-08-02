import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const cache = new Map<string, string>(); // text -> blob url
let fallbackNotified = false; // show the "switched to backup voice" toast once per session

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/tts`;

function reasonMessage(reason: string | null): string {
  switch (reason) {
    case "auth": return "مفتاح ElevenLabs غير صالح — تم التبديل للصوت الاحتياطي.";
    case "rate_limit": return "تم تجاوز حد ElevenLabs مؤقتاً — تم التبديل للصوت الاحتياطي.";
    case "quota": return "نفدت حصة ElevenLabs — تم التبديل للصوت الاحتياطي.";
    case "network": return "تعذر الوصول إلى ElevenLabs — تم التبديل للصوت الاحتياطي.";
    default: return "تم التبديل تلقائياً إلى الصوت الاحتياطي.";
  }
}

export function useSpeak() {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, key?: string) => {
    const k = key ?? text;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingKey(k);

      let url = cache.get(text);
      if (!url) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          toast.error("سجّل الدخول لاستخدام الصوت.");
          setSpeakingKey(null);
          return;
        }
        const res = await fetch(FUNCTIONS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text, voice: "alloy" }),
        });


        if (!res.ok) {
          let msg = `TTS ${res.status}`;
          try {
            const j = await res.json();
            msg = j.error || msg;
          } catch {}
          throw new Error(msg);
        }

        // Notify user once if the server fell back to the backup provider
        if (res.headers.get("X-TTS-Fallback") === "true" && !fallbackNotified) {
          fallbackNotified = true;
          toast.warning(reasonMessage(res.headers.get("X-TTS-Fallback-Reason")));
        }

        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        cache.set(text, url);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeakingKey(null);
      audio.onerror = () => setSpeakingKey(null);
      await audio.play();
    } catch (e) {
      console.error("TTS error", e);
      toast.error("تعذر تشغيل الصوت. حاول مرة أخرى.");
      setSpeakingKey(null);
    }
  }, []);

  return { speak, speakingKey };
}
