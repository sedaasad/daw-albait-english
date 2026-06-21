import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "./SpeakButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

type Attempt = {
  id: string;
  transcript: string;
  target_text: string | null;
  created_at: string;
};

const TARGET_SENTENCES = [
  "I go to school every day.",
  "She is reading a book in the library.",
  "We were playing football yesterday.",
  "He has finished his homework already.",
  "They will travel to London next summer.",
  "Could you please repeat that question?",
  "I would like a cup of coffee, please.",
  "The weather is beautiful this morning.",
];

function pickMimeType(): string | null {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

export function SpeechToTextPractice() {
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [history, setHistory] = useState<Attempt[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const target = TARGET_SENTENCES[idx];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) loadHistory();
    });
  }, []);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("speech_attempts")
      .select("id, transcript, target_text, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error(error);
      return;
    }
    setHistory((data ?? []) as Attempt[]);
  }

  async function start() {
    try {
      const mimeType = pickMimeType();
      if (!mimeType) {
        toast.error("متصفحك لا يدعم تنسيق التسجيل المطلوب");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = handleStop;
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
      setLastTranscript("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.name === "NotAllowedError" ? "يجب السماح باستخدام الميكروفون" : "تعذّر بدء التسجيل");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  async function handleStop() {
    const mimeType = mediaRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size < 1024) {
      toast.error("التسجيل قصير جداً — حاول مجدداً");
      return;
    }
    if (!userId) {
      toast.error("يجب تسجيل الدخول");
      return;
    }

    setBusy(true);
    try {
      // 1) Upload to recordings bucket
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("recordings")
        .upload(path, blob, { contentType: mimeType, upsert: false });
      if (upErr) {
        console.error("upload error", upErr);
        toast.error("تعذّر رفع التسجيل");
        return;
      }

      // 2) Transcribe via edge function
      const form = new FormData();
      form.append("file", blob, `recording.${ext}`);
      const { data, error } = await supabase.functions.invoke("speech-to-text", { body: form });

      if (error) {
        console.error("stt error", error);
        toast.error("فشل التعرّف على الكلام");
        return;
      }
      const text: string = (data?.text ?? "").trim();
      setLastTranscript(text);

      // 3) Save attempt row
      const { error: insErr } = await supabase.from("speech_attempts").insert({
        user_id: userId,
        audio_path: path,
        target_text: target,
        transcript: text,
      });
      if (insErr) {
        console.error("insert error", insErr);
        toast.error("تم النسخ لكن لم نتمكن من الحفظ");
      } else {
        await loadHistory();
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeAttempt(id: string) {
    const { error } = await supabase.from("speech_attempts").delete().eq("id", id);
    if (error) {
      toast.error("تعذّر الحذف");
      return;
    }
    setHistory((h) => h.filter((a) => a.id !== id));
  }

  return (
    <Card className="p-5 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-primary text-base">🎙️ تدرّب على النطق بالذكاء الاصطناعي</h3>
        <span className="text-xs text-muted-foreground font-en">{idx + 1}/{TARGET_SENTENCES.length}</span>
      </div>

      <div className="bg-card rounded-xl p-4 mb-3">
        <p className="text-xs text-muted-foreground mb-1">Target Sentence</p>
        <div className="flex items-center justify-between gap-2">
          <p className="font-en text-base font-bold text-foreground flex-1" dir="ltr">{target}</p>
          <SpeakButton text={target} size="md" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={recording ? stop : start}
          disabled={busy}
          variant={recording ? "destructive" : "default"}
          className="flex-1 h-11"
        >
          {busy ? (
            <><Loader2 className="size-4 animate-spin" /> جارٍ التحويل…</>
          ) : recording ? (
            <><Square className="size-4" /> إيقاف التسجيل</>
          ) : (
            <><Mic className="size-4" /> ابدأ التسجيل</>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-11"
          disabled={recording || busy}
          onClick={() => { setIdx((i) => (i + 1) % TARGET_SENTENCES.length); setLastTranscript(""); }}
        >
          التالي
        </Button>
      </div>

      {lastTranscript && (
        <div className="mt-3 bg-card rounded-xl p-4 space-y-2 border border-primary/10">
          <p className="text-xs text-muted-foreground">Your Speech</p>
          <p className="font-en text-base font-bold" dir="ltr">{lastTranscript}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-5">
          <h4 className="font-black text-sm mb-2">آخر 10 محاولات</h4>
          <div className="space-y-2">
            {history.map((a) => (
              <div key={a.id} className={cn("bg-card rounded-xl p-3 border border-border/40")}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ar })}
                  </span>
                  <button
                    onClick={() => removeAttempt(a.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {a.target_text && (
                  <div className="mb-1">
                    <p className="text-[10px] text-muted-foreground">Target</p>
                    <p className="font-en text-xs" dir="ltr">{a.target_text}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-muted-foreground">Your Speech</p>
                  <p className="font-en text-xs font-bold" dir="ltr">{a.transcript || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
