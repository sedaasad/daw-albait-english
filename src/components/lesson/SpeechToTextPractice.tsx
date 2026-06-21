import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Loader2, Trash2, Check, X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  accuracy_percentage: number | null;
  created_at: string;
};

type WordDiff = {
  correct: string[];
  missing: string[];
  extra: string[];
  accuracy: number;
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

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function compareWords(target: string, spoken: string): WordDiff {
  const t = normalize(target);
  const s = normalize(spoken);
  const sCounts = new Map<string, number>();
  s.forEach((w) => sCounts.set(w, (sCounts.get(w) ?? 0) + 1));

  const correct: string[] = [];
  const missing: string[] = [];
  for (const w of t) {
    const c = sCounts.get(w) ?? 0;
    if (c > 0) {
      correct.push(w);
      sCounts.set(w, c - 1);
    } else {
      missing.push(w);
    }
  }
  const extra: string[] = [];
  sCounts.forEach((count, w) => {
    for (let i = 0; i < count; i++) extra.push(w);
  });
  const accuracy = t.length === 0 ? 0 : Math.round((correct.length / t.length) * 100);
  return { correct, missing, extra, accuracy };
}

function pickMimeType(): string | null {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

function accuracyColor(pct: number): string {
  if (pct >= 85) return "text-green-600";
  if (pct >= 60) return "text-amber-600";
  return "text-destructive";
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
  const diff = useMemo(
    () => (lastTranscript ? compareWords(target, lastTranscript) : null),
    [lastTranscript, target],
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) loadHistory();
    });
  }, []);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("speech_attempts")
      .select("id, transcript, target_text, accuracy_percentage, created_at")
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

      const localDiff = compareWords(target, text);

      const { error: insErr } = await supabase.from("speech_attempts").insert({
        user_id: userId,
        audio_path: path,
        target_text: target,
        transcript: text,
        accuracy_percentage: localDiff.accuracy,
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

  const targetWords = useMemo(() => normalize(target), [target]);
  const correctSet = useMemo(() => new Set(diff?.correct ?? []), [diff]);

  return (
    <Card className="p-4 sm:p-5 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-primary text-base">🎙️ تدرّب على النطق بالذكاء الاصطناعي</h3>
        <span className="text-xs text-muted-foreground font-en">{idx + 1}/{TARGET_SENTENCES.length}</span>
      </div>

      <div className="bg-card rounded-xl p-4 mb-3">
        <p className="text-xs text-muted-foreground mb-1">الجملة المستهدفة · Target</p>
        <div className="flex items-center justify-between gap-2">
          <p className="font-en text-base font-bold text-foreground flex-1 leading-relaxed" dir="ltr">{target}</p>
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

      {lastTranscript && diff && (
        <div className="mt-3 space-y-3">
          {/* Accuracy */}
          <div className="bg-card rounded-xl p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">نسبة المطابقة · Accuracy</p>
              <span className={cn("font-black text-lg font-en", accuracyColor(diff.accuracy))}>
                {diff.accuracy}%
              </span>
            </div>
            <Progress value={diff.accuracy} className="h-2" />
          </div>

          {/* Your speech (raw) */}
          <div className="bg-card rounded-xl p-4 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">ما قلته · Your Speech</p>
            <p className="font-en text-base font-bold" dir="ltr">{lastTranscript || "—"}</p>
          </div>

          {/* Word-by-word target comparison */}
          <div className="bg-card rounded-xl p-4 border border-border/40">
            <p className="text-xs text-muted-foreground mb-2">المقارنة كلمة بكلمة · Word match</p>
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {targetWords.map((w, i) => {
                const ok = correctSet.has(w);
                return (
                  <span
                    key={`${w}-${i}`}
                    className={cn(
                      "px-2 py-1 rounded-md text-sm font-en font-semibold",
                      ok
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-destructive/10 text-destructive line-through",
                    )}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Missing & extra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-3 border border-border/40">
              <p className="text-xs font-bold text-destructive mb-1 flex items-center gap-1">
                <X className="size-3.5" /> كلمات ناقصة · Missing
              </p>
              {diff.missing.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا يوجد ✓</p>
              ) : (
                <div className="flex flex-wrap gap-1" dir="ltr">
                  {diff.missing.map((w, i) => (
                    <Badge key={`m-${w}-${i}`} variant="destructive" className="font-en">{w}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-card rounded-xl p-3 border border-border/40">
              <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1">
                <Plus className="size-3.5" /> كلمات زائدة · Extra
              </p>
              {diff.extra.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا يوجد ✓</p>
              ) : (
                <div className="flex flex-wrap gap-1" dir="ltr">
                  {diff.extra.map((w, i) => (
                    <Badge key={`e-${w}-${i}`} variant="secondary" className="font-en bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{w}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {diff.correct.length > 0 && (
            <div className="bg-card rounded-xl p-3 border border-border/40">
              <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                <Check className="size-3.5" /> كلمات صحيحة · Correct
              </p>
              <div className="flex flex-wrap gap-1" dir="ltr">
                {diff.correct.map((w, i) => (
                  <Badge key={`c-${w}-${i}`} className="font-en bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">{w}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-5">
          <h4 className="font-black text-sm mb-2">آخر 10 محاولات · History</h4>
          <div className="space-y-2">
            {history.map((a) => {
              const pct = a.accuracy_percentage ?? 0;
              return (
                <div key={a.id} className="bg-card rounded-xl p-3 border border-border/40">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-en font-black text-sm", accuracyColor(pct))}>{pct}%</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttempt(a.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="حذف"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  {a.target_text && (
                    <p className="font-en text-xs text-muted-foreground truncate" dir="ltr">🎯 {a.target_text}</p>
                  )}
                  <p className="font-en text-xs font-bold truncate" dir="ltr">🗣️ {a.transcript || "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
