import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/lesson/SpeakButton";
import { STORIES } from "@/data/readingPronunciation";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function ReadingStories() {
  const [sid, setSid] = useState(STORIES[0].id);
  const [showAr, setShowAr] = useState<Record<number, boolean>>({});
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const story = STORIES.find((s) => s.id === sid)!;

  const pick = (id: string) => { setSid(id); setShowAr({}); setAnswers({}); };

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
          <SpeakButton text={story.sentences.map((s) => s.en).join(" ")} size="md" />
        </div>
        <p className="text-xs text-muted-foreground mb-2">اضغط على أي جملة لرؤية ترجمتها</p>
        <div className="space-y-2">
          {story.sentences.map((s, i) => (
            <div key={i} className="rounded-xl bg-muted/50 p-2.5">
              <div className="flex items-start gap-2" dir="ltr">
                <SpeakButton text={s.en} />
                <button className="text-start font-en flex-1" onClick={() => setShowAr((m) => ({ ...m, [i]: !m[i] }))}>
                  {s.en}
                </button>
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
