import { useMemo, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpeakButton } from "./SpeakButton";
import { toast } from "sonner";

// minimal types for the Web Speech API
type SR = any;
const SpeechRecognition: SR =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string) {
  return normalize(s).split(" ").filter(Boolean);
}

function diff(target: string[], spoken: string[]) {
  // simple word-by-word match with lookahead tolerance
  const result: { word: string; ok: boolean }[] = [];
  let j = 0;
  for (let i = 0; i < target.length; i++) {
    const t = target[i];
    let matched = false;
    for (let k = j; k < Math.min(spoken.length, j + 3); k++) {
      if (spoken[k] === t) { matched = true; j = k + 1; break; }
    }
    result.push({ word: target[i], ok: matched });
  }
  return result;
}

export function PronunciationPractice({ phrases }: { phrases: string[] }) {
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string>("");
  const [result, setResult] = useState<{ word: string; ok: boolean }[] | null>(null);
  const recRef = useRef<any>(null);

  const target = phrases[idx];
  const targetTokens = useMemo(() => tokenize(target), [target]);
  const score = result ? Math.round((result.filter((r) => r.ok).length / result.length) * 100) : 0;

  function start() {
    if (!SpeechRecognition) {
      toast.error("متصفحك لا يدعم التعرف على الصوت — جرّب Chrome");
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.onresult = (e: any) => {
        const alts: string[] = [];
        for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
        // pick alternative with most matches
        let best = { spoken: alts[0], diff: diff(targetTokens, tokenize(alts[0])) };
        for (const a of alts.slice(1)) {
          const d = diff(targetTokens, tokenize(a));
          if (d.filter((x) => x.ok).length > best.diff.filter((x) => x.ok).length) best = { spoken: a, diff: d };
        }
        setHeard(best.spoken);
        setResult(best.diff);
      };
      rec.onerror = (e: any) => {
        toast.error(e.error === "not-allowed" ? "يجب السماح باستخدام الميكروفون" : "خطأ في التعرف على الصوت");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setHeard("");
      setResult(null);
      setListening(true);
      rec.start();
    } catch (e) {
      console.error(e);
      setListening(false);
    }
  }

  function stop() {
    recRef.current?.stop();
    setListening(false);
  }

  function next() {
    setIdx((i) => (i + 1) % phrases.length);
    setHeard(""); setResult(null);
  }

  return (
    <Card className="p-5 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-primary text-base">🎙️ تدرب على النطق</h3>
        <span className="text-xs text-muted-foreground">{idx + 1}/{phrases.length}</span>
      </div>

      <div className="bg-card rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="font-en text-base font-bold text-foreground flex-1">{target}</p>
          <SpeakButton text={target} size="md" />
        </div>
        <p className="text-xs text-muted-foreground">اضغط 🔊 لسماع النطق الصحيح، ثم سجّل صوتك</p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={listening ? stop : start}
          variant={listening ? "destructive" : "default"}
          className="flex-1 h-11"
        >
          {listening ? <><MicOff className="size-4" /> إيقاف</> : <><Mic className="size-4" /> ابدأ التسجيل</>}
        </Button>
        <Button variant="outline" onClick={next} className="h-11">
          <RotateCcw className="size-4" /> التالي
        </Button>
      </div>

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">سمعنا:</p>
            <span className={cn(
              "text-xs font-black px-2 py-0.5 rounded-full",
              score >= 80 ? "bg-success/15 text-success" : score >= 50 ? "bg-orange-100 text-orange-700" : "bg-destructive/15 text-destructive"
            )}>{score}%</span>
          </div>
          <p className="text-sm font-en italic text-muted-foreground bg-muted/50 rounded-lg p-2">"{heard}"</p>

          <div className="bg-card rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1.5">نتيجة لكل كلمة:</p>
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {result.map((r, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-sm font-en font-bold px-2 py-0.5 rounded-md",
                    r.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive line-through"
                  )}
                >
                  {r.word}
                </span>
              ))}
            </div>
            {score < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 الكلمات بالأحمر لم تُنطق بشكل صحيح — اضغط 🔊 واستمع لها مجدداً
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
