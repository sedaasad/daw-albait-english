import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MODULES } from "@/data/curriculum";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";
import { RuleSection, FormulaSection, DialogueSection, VocabSection } from "@/components/lesson/Sections";
import { PronunciationPractice } from "@/components/lesson/PronunciationPractice";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


function collectPhrases(lesson: { sections: any[] }): string[] {
  const out: string[] = [];
  for (const s of lesson.sections) {
    if (s.type === "rule") out.push(...s.data.examples.map((e: any) => e.en));
    else if (s.type === "vocab") out.push(...s.data.words.map((w: any) => w.en));
    else if (s.type === "dialogue") out.push(...s.data.exchanges.map((e: any) => e.en));
    else if (s.type === "formula") {
      for (const k of ["positive", "negative", "question"]) {
        if (s.data[k]) out.push(...s.data[k].map((e: any) => e.en));
      }
    }
  }
  return Array.from(new Set(out)).slice(0, 12);
}

type Tab = "learn" | "quiz";

export default function LessonDetail() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { completed, markComplete } = useCompletedLessons();
  const { user, profile, refreshProfile } = useAuth();

  const mod = MODULES.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  const [tab, setTab] = useState<Tab>("learn");
  const [qStarted, setQStarted] = useState(false);
  const [qDone, setQDone] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [qSel, setQSel] = useState<number | null>(null);
  const [qScore, setQScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef<string | null>(null);

  if (!mod || !lesson) {
    return <div dir="rtl" className="p-10 text-center text-muted-foreground">الدرس غير موجود</div>;
  }

  const quiz = lesson.quiz;

  function resetQuiz() {
    setQStarted(false); setQDone(false); setQIdx(0); setQSel(null); setQScore(0);
    savedRef.current = null;
  }



  function handleAnswer(idx: number) {
    if (qSel !== null) return;
    setQSel(idx);
    const ok = idx === quiz[qIdx].c;
    if (ok) setQScore((s) => s + 1);
    setTimeout(() => {
      if (qIdx + 1 < quiz.length) {
        setQIdx((q) => q + 1); setQSel(null);
      } else {
        setQDone(true);
      }
    }, 900);
  }

  // Persist quiz result to DB once per attempt (looks up DB lesson by slug = local lesson id)
  useEffect(() => {
    if (!qDone || !user || !lesson || quiz.length === 0) return;
    const attemptKey = `${lesson.id}:${Date.now()}`;
    if (savedRef.current === lesson.id) return;
    savedRef.current = lesson.id;
    (async () => {
      setSaving(true);
      try {
        const { data: dbLesson } = await supabase
          .from("lessons")
          .select("id")
          .eq("slug", lesson.id)
          .maybeSingle();
        if (!dbLesson?.id) return;

        const { error: insErr } = await supabase.from("quiz_scores").insert({
          user_id: user.id,
          lesson_id: dbLesson.id,
          score: qScore,
          total: quiz.length,
        });
        if (insErr) {
          console.error("quiz_scores insert failed", insErr);
          toast.error("تعذّر حفظ النتيجة");
          return;
        }

        const pts = qScore * 10;
        if (pts > 0 && profile) {
          await supabase
            .from("profiles")
            .update({ total_points: (profile.total_points ?? 0) + pts })
            .eq("id", user.id);
          await refreshProfile();
        }
        toast.success(`تم حفظ النتيجة: ${qScore}/${quiz.length} (+${pts} نقطة)`);
      } finally {
        setSaving(false);
      }
    })();
    void attemptKey;
  }, [qDone]);



  function finishLesson() {
    if (!completed.has(lesson!.id)) {
      markComplete(lesson!.id);
      toast.success("أحسنت! تم إنجاز الدرس (+10 نقاط)");
    }
    setTab("quiz");
  }

  return (
    <div dir="rtl" className="min-h-screen pb-24">
      <div className="bg-card px-5 pt-10 pb-4 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { navigate(`/modules/${mod.id}`); resetQuiz(); }}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            aria-label="رجوع"
          >
            <ArrowRight className="size-4" />
          </button>
          <div>
            <h1 className="font-black text-foreground">{lesson.titleAr}</h1>
            <p className="text-xs text-muted-foreground font-en">{lesson.titleEn}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="mt-4 bg-card rounded-2xl flex overflow-hidden shadow-card">
          {(["learn", "quiz"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); resetQuiz(); }}
              className={cn(
                "flex-1 py-3 text-sm font-black transition-smooth",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {t === "learn" ? "📖 الشرح" : "🎯 الاختبار"}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div className="mt-4 space-y-4">
            {lesson.sections.map((sec, si) => (
              <Card key={si} className="p-5 shadow-card">
                <h3 className="font-black text-primary mb-3 text-base">{sec.titleAr}</h3>
                {sec.type === "rule" && <RuleSection d={sec.data} />}
                {sec.type === "formula" && <FormulaSection d={sec.data} />}
                {sec.type === "dialogue" && <DialogueSection d={sec.data} />}
                {sec.type === "vocab" && <VocabSection d={sec.data} />}
              </Card>
            ))}
            {(() => {
              const phrases = collectPhrases(lesson);
              return phrases.length > 0 ? <PronunciationPractice phrases={phrases} /> : null;
            })()}
            {quiz.length > 0 && (
              <Button className="w-full h-12" onClick={finishLesson}>
                {completed.has(lesson.id) ? "انتقل للاختبار 🎯" : "أنهِ الدرس وانتقل للاختبار 🎯"}
              </Button>
            )}
          </div>
        )}

        {tab === "quiz" && (
          <div className="mt-4">
            {!qStarted ? (
              <Card className="p-8 text-center shadow-card">
                <span className="text-5xl block mb-3">🎯</span>
                <h3 className="font-black text-lg mb-1">اختبار الدرس</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {quiz.length} أسئلة — +{quiz.length * 10} نقطة
                </p>
                <Button className="w-full h-12" onClick={() => setQStarted(true)}>ابدأ الاختبار</Button>
              </Card>
            ) : qDone ? (
              <Card className="p-8 text-center shadow-card">
                <span className="text-5xl block mb-3">
                  {qScore === quiz.length ? "🏆" : qScore >= quiz.length / 2 ? "⭐" : "💪"}
                </span>
                <h3 className="font-black text-lg mb-1">
                  {qScore === quiz.length ? "ممتاز!" : qScore >= quiz.length / 2 ? "أحسنت!" : "حاول مرة أخرى"}
                </h3>
                <p className="text-2xl font-black text-primary my-3">
                  {qScore}/{quiz.length}
                </p>
                <p className="text-sm text-success mb-5">+{qScore * 10} نقطة ⭐</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetQuiz}>
                    <RotateCcw className="size-4" /> إعادة
                  </Button>
                  <Button className="flex-1" onClick={() => navigate(`/modules/${mod.id}`)}>
                    الدروس
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-5 shadow-card">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>سؤال {qIdx + 1} من {quiz.length}</span>
                  <span>النتيجة: {qScore} ✓</span>
                </div>
                <Progress value={(qIdx / quiz.length) * 100} className="h-1.5 mb-4" />
                <p className="font-black text-base mb-4 leading-relaxed">{quiz[qIdx].q}</p>
                <div className="space-y-2">
                  {quiz[qIdx].opts.map((opt, i) => {
                    const isCorrect = i === quiz[qIdx].c;
                    const isPicked = qSel === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={qSel !== null}
                        className={cn(
                          "w-full text-right py-3 px-4 rounded-xl border-2 text-sm font-bold transition-smooth flex items-center justify-between",
                          qSel === null && "border-border bg-muted/50 hover:border-primary",
                          qSel !== null && isCorrect && "border-success bg-success/10 text-success",
                          qSel !== null && isPicked && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                          qSel !== null && !isCorrect && !isPicked && "border-border bg-muted/30 opacity-40"
                        )}
                      >
                        <span>{opt}</span>
                        {qSel !== null && isCorrect && <CheckCircle2 className="size-4 text-success" />}
                        {isPicked && !isCorrect && <XCircle className="size-4 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
                {qSel !== null && (
                  <div className={cn(
                    "mt-3 rounded-xl p-3 text-xs",
                    qSel === quiz[qIdx].c ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    💡 {quiz[qIdx].exp}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
