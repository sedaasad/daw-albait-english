import { useMemo, useState } from "react";
import { Check, X, MessageSquare, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RuleData, FormulaData, DialogueData, VocabData } from "@/data/curriculum";
import { SpeakButton } from "./SpeakButton";

export function RuleSection({ d }: { d: RuleData }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-en text-2xl font-black">
          {d.letter}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">يعادل بالعربي</p>
          <p className="font-black text-foreground text-lg">{d.arabic}</p>
        </div>
        <SpeakButton text={`The letter ${d.letter}`} size="md" />
      </div>
      <p className="text-sm text-foreground bg-muted rounded-xl p-3 mb-3">{d.rule}</p>
      <div className="space-y-2">
        {d.examples.map((ex, i) => (
          <div key={i} className="flex items-center justify-between gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SpeakButton text={ex.en} />
              <span className="font-black text-primary text-sm font-en truncate">{ex.en}</span>
            </div>
            <span className="text-sm text-muted-foreground">{ex.ar}</span>
          </div>
        ))}
      </div>
      {d.special && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-800 whitespace-pre-line">{d.special}</p>
        </div>
      )}
    </div>
  );
}

export function FormulaSection({ d }: { d: FormulaData }) {
  return (
    <div>
      <div className="bg-gradient-to-l from-primary to-secondary text-primary-foreground rounded-2xl p-4 mb-3 text-center">
        <p className="font-black text-base mb-1">{d.formula}</p>
        <p className="text-xs opacity-80 font-en">{d.formulaEn}</p>
      </div>
      {d.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {d.tags.map((t, i) => (
            <span key={i} className="bg-secondary/15 text-secondary text-xs px-2.5 py-1 rounded-full font-bold">{t}</span>
          ))}
        </div>
      )}
      {(["positive", "negative", "question"] as const).map((type) => {
        const items = d[type];
        if (!items) return null;
        const label = type === "positive" ? "✅ الإثبات" : type === "negative" ? "❌ النفي" : "❓ السؤال";
        return (
          <div key={type} className="mb-3">
            <p className="text-xs font-black text-muted-foreground mb-2">{label}</p>
            <div className="space-y-2">
              {items.map((ex, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-sm text-foreground mb-1">{ex.ar}</p>
                  <div className="flex items-center gap-2">
                    <SpeakButton text={ex.en} />
                    <p className="text-sm font-bold text-primary font-en flex-1">{ex.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {d.note && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 whitespace-pre-line">
          {d.note}
        </div>
      )}
    </div>
  );
}

function ReadDialogue({ d }: { d: DialogueData }) {
  return (
    <div className="space-y-2">
      {d.exchanges.map((ex, i) => {
        const isPrimary = ex.sp === 0;
        return (
          <div key={i} className={cn("flex", isPrimary ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2",
                isPrimary ? "bg-primary text-primary-foreground" : ex.sp === 2 ? "bg-secondary text-secondary-foreground" : "bg-muted"
              )}
            >
              <div className="flex items-start gap-2">
                <SpeakButton
                  text={ex.en}
                  className={cn((isPrimary || ex.sp === 2) && "bg-white/20 text-white hover:bg-white/30")}
                />
                <p className="text-sm font-en font-bold flex-1">{ex.en}</p>
              </div>
              <p className={cn("text-xs mt-1", isPrimary || ex.sp === 2 ? "opacity-70" : "text-muted-foreground")}>{ex.ar}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK_DISTRACTORS = [
  "I don't know what to say.",
  "Sorry, could you repeat that?",
  "Yes, of course.",
  "No, thank you.",
  "Maybe later.",
  "That sounds great.",
];

function InteractiveDialogue({ d }: { d: DialogueData }) {
  const studentTurns = useMemo(
    () => d.exchanges.map((e, i) => ({ ...e, i })).filter((e) => e.sp === 1),
    [d]
  );
  const [step, setStep] = useState(0); // index into exchanges
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [seed, setSeed] = useState(0);

  const current = d.exchanges[step];
  const isStudentTurn = current?.sp === 1;
  const finished = step >= d.exchanges.length;

  const options = useMemo(() => {
    if (!current || current.sp !== 1) return [] as string[];
    const others = studentTurns.filter((t) => t.i !== step).map((t) => t.en);
    const pool = Array.from(new Set([...others, ...FALLBACK_DISTRACTORS])).filter(
      (s) => s !== current.en
    );
    const distractors = shuffle(pool).slice(0, 2);
    return shuffle([current.en, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, seed, d]);

  const handlePick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    setScore((s) => ({
      correct: s.correct + (opt === current.en ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const handleNext = () => {
    setPicked(null);
    setStep((s) => s + 1);
  };

  const handleRestart = () => {
    setStep(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
    setSeed((x) => x + 1);
  };

  if (finished) {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="text-center py-6 space-y-4">
        <div className="text-5xl">{pct >= 70 ? "🎉" : "💪"}</div>
        <p className="font-black text-lg">
          {score.correct} / {score.total} إجابة صحيحة
        </p>
        <p className="text-sm text-muted-foreground">
          {pct >= 70 ? "أداء ممتاز! تابع التدريب." : "جرب مرة أخرى لتتقن الحوار."}
        </p>
        <Button onClick={handleRestart} variant="secondary" className="gap-2">
          <RotateCcw className="w-4 h-4" /> إعادة المحادثة
        </Button>
      </div>
    );
  }

  // Show previous exchanges as transcript
  const transcript = d.exchanges.slice(0, step);

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {transcript.map((ex, i) => {
          const isPrimary = ex.sp === 0;
          return (
            <div key={i} className={cn("flex", isPrimary ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2",
                  isPrimary
                    ? "bg-primary text-primary-foreground"
                    : ex.sp === 2
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm font-en font-bold">{ex.en}</p>
                <p className={cn("text-xs mt-1", isPrimary || ex.sp === 2 ? "opacity-70" : "text-muted-foreground")}>{ex.ar}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!isStudentTurn && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <SpeakButton text={current.en} />
            <div className="flex-1">
              <p className="text-sm font-en font-bold text-primary">{current.en}</p>
              <p className="text-xs text-muted-foreground mt-1">{current.ar}</p>
            </div>
          </div>
          <Button size="sm" className="w-full mt-3" onClick={handleNext}>
            متابعة
          </Button>
        </div>
      )}

      {isStudentTurn && (
        <div className="bg-muted/40 border border-border rounded-2xl p-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> اختر ردك المناسب:
          </p>
          <div className="space-y-2">
            {options.map((opt, i) => {
              const isCorrect = opt === current.en;
              const isPicked = picked === opt;
              const showState = picked !== null;
              return (
                <button
                  key={i}
                  onClick={() => handlePick(opt)}
                  disabled={showState}
                  className={cn(
                    "w-full text-right rounded-xl border px-3 py-2.5 transition flex items-center gap-2",
                    !showState && "hover:bg-muted active:scale-[0.99] border-border",
                    showState && isCorrect && "bg-green-50 border-green-400 text-green-900",
                    showState && isPicked && !isCorrect && "bg-red-50 border-red-400 text-red-900",
                    showState && !isCorrect && !isPicked && "opacity-50 border-border"
                  )}
                >
                  {showState && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                  {showState && isPicked && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                  <span className="text-sm font-en font-bold flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
          {picked && (
            <div
              className={cn(
                "mt-3 rounded-xl p-3 text-sm",
                picked === current.en
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              )}
            >
              {picked === current.en ? (
                <p className="font-bold">✅ إجابة صحيحة! {current.ar}</p>
              ) : (
                <>
                  <p className="font-bold mb-1">❌ غير صحيح. الإجابة الصحيحة:</p>
                  <p className="font-en font-bold">{current.en}</p>
                  <p className="text-xs opacity-80 mt-1">{current.ar}</p>
                </>
              )}
              <Button size="sm" className="w-full mt-3" onClick={handleNext}>
                التالي
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          {step + 1} / {d.exchanges.length}
        </span>
        <span>
          النتيجة: {score.correct} / {score.total}
        </span>
      </div>
    </div>
  );
}

export function DialogueSection({ d }: { d: DialogueData }) {
  const [interactive, setInteractive] = useState(false);
  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button
          size="sm"
          variant={interactive ? "default" : "outline"}
          onClick={() => setInteractive((v) => !v)}
          className="gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {interactive ? "وضع القراءة" : "وضع تفاعلي"}
        </Button>
      </div>
      {interactive ? <InteractiveDialogue key={String(interactive)} d={d} /> : <ReadDialogue d={d} />}
    </div>
  );
}

export function VocabSection({ d }: { d: VocabData }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {d.words.map((w, i) => (
        <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SpeakButton text={w.en} />
            <p className="font-black text-primary text-sm font-en">{w.en}</p>
          </div>
          <p className="text-xs text-muted-foreground">{w.ar}</p>
        </div>
      ))}
    </div>
  );
}
