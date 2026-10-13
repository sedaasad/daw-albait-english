import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/lesson/SpeakButton";
import { PronunciationPractice } from "@/components/lesson/PronunciationPractice";
import { PRONUNCIATION_LESSONS } from "@/data/readingPronunciation";
import { useSpeak } from "@/hooks/useSpeak";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function PronunciationLessons() {
  const [lid, setLid] = useState(PRONUNCIATION_LESSONS[0].id);
  const lesson = PRONUNCIATION_LESSONS.find((l) => l.id === lid)!;
  const { speak } = useSpeak();

  // Listening exercise: hear one word of a pair, choose which one it was.
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const target = useMemo(() => {
    const pair = lesson.pairs[round % lesson.pairs.length];
    return { pair, word: pair[Math.random() < 0.5 ? 0 : 1] };
  }, [lesson, round]);

  const pick = (id: string) => { setLid(id); setRound(0); setChosen(null); setScore(0); };
  const answer = (w: string) => {
    if (chosen) return;
    setChosen(w);
    if (w === target.word) setScore((s) => s + 1);
  };
  const next = () => { setChosen(null); setRound((r) => r + 1); };

  return (
    <Card className="p-4 shadow-card space-y-4">
      <h3 className="font-black">🗣️ دروس النطق</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRONUNCIATION_LESSONS.map((l) => (
          <button key={l.id} onClick={() => pick(l.id)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-smooth",
              l.id === lid ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
            {l.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
        <p className="font-bold text-sm mb-1.5">
          الشرح <span className="font-en text-primary" dir="ltr">{lesson.sound}</span>
        </p>
        <ul className="list-disc ps-5 space-y-1 text-sm">
          {lesson.explanation.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div>
        <p className="font-bold text-sm mb-2">استمع وقارن</p>
        <div className="grid grid-cols-2 gap-2" dir="ltr">
          {lesson.pairs.flatMap(([a, b]) => [a, b]).map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-xl p-2">
              <SpeakButton text={w} />
              <span className="font-en font-bold">{w}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">🎧 تمرين: ماذا سمعت؟</p>
          <span className="text-xs text-muted-foreground">النتيجة: {score}/{round + (chosen ? 1 : 0)}</span>
        </div>
        <button onClick={() => speak(target.word)}
          className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-bold text-sm flex items-center justify-center gap-2">
          <Play className="size-4" /> شغّل الكلمة
        </button>
        <div className="grid grid-cols-2 gap-2" dir="ltr">
          {target.pair.map((w) => (
            <button key={w} onClick={() => answer(w)}
              className={cn("rounded-xl py-3 font-en font-black transition-smooth",
                !chosen ? "bg-muted hover:bg-muted/70"
                  : w === target.word ? "bg-success/20 text-success"
                  : w === chosen ? "bg-destructive/15 text-destructive" : "bg-muted opacity-50")}>
              {w}
            </button>
          ))}
        </div>
        {chosen && (
          <div className="flex items-center justify-between">
            <p className={cn("text-xs", chosen === target.word ? "text-success" : "text-destructive")}>
              {chosen === target.word ? "ممتاز! سمعتها بشكل صحيح." : `الكلمة كانت: ${target.word}`}
            </p>
            <button onClick={next} className="text-xs font-bold text-primary">التالي ←</button>
          </div>
        )}
      </div>

      <div>
        <p className="font-bold text-sm mb-2">🎙️ تمرين النطق: قلها بصوتك</p>
        <PronunciationPractice key={lesson.id} phrases={lesson.practice} />
      </div>
    </Card>
  );
}
