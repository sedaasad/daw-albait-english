import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const cache = new Map<string, string>(); // text -> blob url

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
        const { data, error } = await supabase.functions.invoke("tts", {
          body: { text, voice: "alloy" },
        });
        if (error) throw error;
        // Supabase invoke returns Blob for binary content
        const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });
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
      toast.error("تعذر تشغيل الصوت");
      setSpeakingKey(null);
    }
  }, []);

  return { speak, speakingKey };
}
