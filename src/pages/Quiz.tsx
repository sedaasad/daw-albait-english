import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_ar: string;
  question_en: string;
  options: string[];
  correct_index: number;
}

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select("id, question_ar, question_en, options, correct_index")
        .eq("lesson_id", id)
        .order("order_index");
      setQuestions(
        (data ?? []).map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? (q.options as string[]) : [],
        }))
      );
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit() {
    if (!user || !id) return;
    if (Object.keys(answers).length < questions.length) {
      toast.error("الرجاء الإجابة على جميع الأسئلة");
      return;
    }
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_index ? 1 : 0), 0);
    setSubmitted(true);

    await supabase
      .from("quiz_scores")
      .insert({ user_id: user.id, lesson_id: id, score, total: questions.length });

    if (profile) {
      await supabase
        .from("profiles")
        .update({ total_points: profile.total_points + score * 5 })
        .eq("id", user.id);
      await refreshProfile();
    }
    toast.success(`نتيجتك: ${score} من ${questions.length}`);
  }

  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correct_index ? 1 : 0),
    0
  );

  return (
    <div dir="rtl">
      <PageHeader title="الاختبار" back variant="gradient" />
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4 pb-8">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : questions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لا يوجد اختبار لهذا الدرس بعد.</p>
          </Card>
        ) : submitted ? (
          <Card className="p-6 text-center shadow-elevated animate-scale-in">
            <div className="size-20 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
              <Award className="size-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl mb-1">أحسنت!</h2>
            <p className="text-muted-foreground mb-2">حصلت على</p>
            <p className="font-display text-4xl text-primary mb-1">
              {score} / {questions.length}
            </p>
            <p className="text-sm text-success font-medium mb-6">+{score * 5} نقطة</p>
            <Button className="w-full h-11" onClick={() => navigate(-1)}>
              <ChevronLeft className="size-4" />
              العودة للدرس
            </Button>
          </Card>
        ) : (
          <>
            {questions.map((q, idx) => (
              <Card key={q.id} className="p-5 shadow-card animate-fade-in">
                <div className="text-xs text-muted-foreground mb-2">سؤال {idx + 1} من {questions.length}</div>
                <h3 className="font-semibold mb-1">{q.question_ar}</h3>
                {q.question_en && (
                  <p className="font-en text-sm text-muted-foreground mb-3">{q.question_en}</p>
                )}
                <RadioGroup
                  value={answers[q.id]?.toString()}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: parseInt(v) }))}
                  className="space-y-2 mt-3"
                >
                  {q.options.map((opt, i) => {
                    const isSel = answers[q.id] === i;
                    return (
                      <Label
                        key={i}
                        htmlFor={`${q.id}-${i}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-smooth",
                          isSel ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <RadioGroupItem value={i.toString()} id={`${q.id}-${i}`} />
                        <span className="flex-1 text-sm">{opt}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </Card>
            ))}
            <Button onClick={handleSubmit} className="w-full h-12">
              <CheckCircle2 className="size-4" />
              إرسال الإجابات
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// Avoid unused warning for icons used conditionally above
void XCircle;
