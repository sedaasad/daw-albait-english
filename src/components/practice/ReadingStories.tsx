import { useState } from "react";
import { useSpeak } from "@/hooks/useSpeak";
import { useDictionary } from "@/components/dictionary/DictionaryProvider";
import { Volume2, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { STORIES } from "@/data/readingPronunciation";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function ReadingStories() {
  const [sid, setSid] = useState(STORIES[0].id);
  const [showAr, setShowAr] = useState<Record<number, boolean>>({});
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const story = STORIES.find((s) => s.id === sid)!;
  const [rate, setRate] = useState(1);
  const [word, setWord] = useState<string | null>(null);
  const { speak, speakingKey } = useSpeak();
  const { lookup } = useDictionary();
  const meaning = word ? story.glossary?.[word.toLowerCase()] : undefined;
  const tapWord = (raw: string) => { const w = raw.replace(/[^A-Za-z'-]/g, ""); if (w) setWord(w); };

  const pick = (id: string) => { setSid(id); setShowAr({}); setAnswers({}); setWord(null); };

  return (
    <Card className="p-4 shadow-card space-y-4">
      <h3 className="font-black">📖 قصص للقراءة</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STORIES.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-smooth",
              s.id === sid ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
            {s.titleAr} · {s.level}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-en font-black text-lg" dir="ltr">{story.title}</p>
          <button onClick={() => speak(story.sentences.map((s) => s.en).join(" "), "all", rate)} aria-label="استمع للقصة"
            className={cn("w-9 h-9 rounded-full flex items-center justify-center bg-primary/10 text-primary", speakingKey === "all" && "bg-primary text-primary-foreground animate-pulse")}>
            <Volume2 size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">سرعة القراءة:</span>
          {[0.5, 0.75, 1, 1.25].map((r) => (
            <button key={r} onClick={() => setRate(r)}
              className={cn("px-2 py-0.5 rounded-full text-xs font-en font-bold", rate === r ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {r}x
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">اضغط على أي كلمة لترجمتها، أو على "ع" لترجمة الجملة</p>
        {word && (
          <div className="sticky top-2 z-10 mb-2 rounded-xl border border-primary/30 bg-card p-2.5 flex items-center gap-2 shadow-card">
            <button onClick={() => speak(word, "w:" + word, rate)} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Volume2 size={14} /></button>
            <span className="font-en font-black" dir="ltr">{word}</span>
            <span className="text-sm flex-1">{meaning ? `= ${meaning}` : ""}</span>
            {!meaning && <button onClick={() => lookup(word)} className="text-xs text-primary font-bold">ابحث في القاموس</button>}
            <button onClick={() => setWord(null)} className="text-xs text-muted-foreground px-1">✕</button>
          </div>
        )}
        <div className="space-y-2">
          {story.sentences.map((s, i) => (
            <div key={i} className="rounded-xl bg-muted/50 p-2.5">
              <div className="flex items-start gap-2" dir="ltr">
                <button onClick={() => speak(s.en, "s" + i, rate)} aria-label="استمع"
                  className={cn("w-7 h-7 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary", speakingKey === "s" + i && "bg-primary text-primary-foreground animate-pulse")}>
                  <Volume2 size={14} />
                </button>
                <p className="font-en flex-1 leading-relaxed">
                  {s.en.split(/(\s+)/).map((p, j) => /^\s+$/.test(p) ? p : (
                    <button key={j} onClick={() => tapWord(p)} className="hover:text-primary hover:underline underline-offset-4">{p}</button>
                  ))}
                </p>
                <button onClick={() => setShowAr((m) => ({ ...m, [i]: !m[i] }))} className="shrink-0 text-xs font-bold text-primary bg-primary/10 rounded-md px-1.5 py-0.5">ع</button>
              </div>
              {showAr[i] && <p className="text-sm text-primary mt-1.5 pe-9">{s.ar}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
        <p className="font-bold text-sm mb-1.5">💡 شرح القصة</p>
        <ul className="list-disc ps-5 space-y-1 text-sm">
          {story.explanation.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="space-y-3">
        <p className="font-bold text-sm">✅ أسئلة الفهم</p>
        {story.questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <div key={qi} className="space-y-1.5">
              <p className="text-sm">{q.q}</p>
              <div className="grid grid-cols-3 gap-1.5" dir="ltr">
                {q.options.map((o, oi) => (
                  <button key={oi} disabled={chosen !== undefined}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={cn("rounded-lg py-2 text-xs font-en font-bold transition-smooth",
                      chosen === undefined ? "bg-muted hover:bg-muted/70"
                        : oi === q.answer ? "bg-success/20 text-success"
                        : oi === chosen ? "bg-destructive/15 text-destructive" : "bg-muted opacity-50")}>
                    {o}
                  </button>
                ))}
              </div>
              {chosen !== undefined && (
                <p className={cn("text-xs flex items-center gap-1", chosen === q.answer ? "text-success" : "text-destructive")}>
                  {chosen === q.answer ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                  {chosen === q.answer ? "إجابة صحيحة! " : "ليست صحيحة. "}{q.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
