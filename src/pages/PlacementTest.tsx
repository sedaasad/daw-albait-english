import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  PLACEMENT_QUESTIONS,
  SECTION_LABEL_AR,
  gradePlacement,
  type PlacementResult,
  type Section,
} from "@/data/placementTest";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SECTION_ORDER: Section[] = ["grammar", "vocabulary", "reading"];

export default function PlacementTest() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Order questions by section for a coherent flow
  const orderedQuestions = useMemo(() => {
    return SECTION_ORDER.flatMap((s) =>
      PLACEMENT_QUESTIONS.filter((q) => q.section === s),
    );
  }, []);

  const total = orderedQuestions.length;
  const q = orderedQuestions[currentIdx];
  const answeredAll = orderedQuestions.every((qq) => answers[qq.id] !== undefined);
  const progress = Math.round(((currentIdx + (answers[q?.id] !== undefined ? 1 : 0)) / total) * 100);

  const select = (val: string) => {
    setAnswers((a) => ({ ...a, [q.id]: Number(val) }));
  };

  const next = () => setCurrentIdx((i) => Math.min(i + 1, total - 1));
  const prev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  const submit = async () => {
    const r = gradePlacement(answers);
    setResult(r);
    if (!user) {
      toast.info("سجّل الدخول لحفظ نتيجتك / Sign in to save your result");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        cefr_level: r.cefr,
        placement_score: r.score,
        placement_completed: true,
        placement_strengths: r.strengths,
        placement_weaknesses: r.weaknesses,
        placement_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("فشل حفظ النتيجة / Failed to save: " + error.message);
    } else {
      toast.success("تم حفظ نتيجتك / Result saved");
      await refreshProfile();
    }
  };

  // ----- Results view -----
  if (result) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your CEFR Level</span>
              <Badge className="text-lg px-3 py-1">{result.cefr}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground" dir="rtl">
              مستواك التقريبي بناءً على الاختبار
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Score</span>
                <span className="font-semibold">{result.score}%</span>
              </div>
              <Progress value={result.score} />
            </div>

            <div className="space-y-3">
              {result.perSection.map((s) => (
                <div key={s.section}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">
                      {s.section} <span className="text-muted-foreground">/ {SECTION_LABEL_AR[s.section]}</span>
                    </span>
                    <span>{s.percentage}%</span>
                  </div>
                  <Progress value={s.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-600">
                <CheckCircle2 className="size-4" /> Strengths
              </CardTitle>
              <p className="text-xs text-muted-foreground" dir="rtl">نقاط القوة</p>
            </CardHeader>
            <CardContent>
              {result.strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground" dir="rtl">لا يوجد نقاط قوة بارزة بعد</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((s) => (
                    <Badge key={s} variant="default" className="capitalize">
                      {s} / {SECTION_LABEL_AR[s]}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <AlertCircle className="size-4" /> Weaknesses
              </CardTitle>
              <p className="text-xs text-muted-foreground" dir="rtl">نقاط الضعف</p>
            </CardHeader>
            <CardContent>
              {result.weaknesses.length === 0 ? (
                <p className="text-sm text-muted-foreground" dir="rtl">رائع! لا توجد نقاط ضعف واضحة</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.weaknesses.map((s) => (
                    <Badge key={s} variant="destructive" className="capitalize">
                      {s} / {SECTION_LABEL_AR[s]}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Button className="w-full" size="lg" onClick={() => navigate("/home")} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : "ابدأ التعلم / Start Learning"}
        </Button>
      </div>
    );
  }

  // ----- Question view -----
  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>CEFR Placement Test</span>
            <Badge variant="outline">
              {currentIdx + 1} / {total}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground" dir="rtl">
            اختبار تحديد المستوى — أجب عن جميع الأسئلة ({total}) للحصول على مستواك.
          </p>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="capitalize">
              {q.section} / {SECTION_LABEL_AR[q.section]}
            </Badge>
          </div>

          {q.context && (
            <div className="rounded-md bg-muted p-3 text-sm leading-relaxed" dir="ltr">
              {q.context}
            </div>
          )}

          <p className="font-medium text-base leading-relaxed" dir="ltr">
            {q.prompt}
          </p>

          <RadioGroup
            value={answers[q.id]?.toString() ?? ""}
            onValueChange={select}
            className="space-y-2"
          >
            {q.choices.map((c, i) => (
              <Label
                key={i}
                htmlFor={`${q.id}-${i}`}
                className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent"
                dir="ltr"
              >
                <RadioGroupItem value={i.toString()} id={`${q.id}-${i}`} />
                <span>{c}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={prev} disabled={currentIdx === 0} className="flex-1">
              السابق / Back
            </Button>
            {currentIdx < total - 1 ? (
              <Button onClick={next} disabled={answers[q.id] === undefined} className="flex-1">
                التالي / Next
              </Button>
            ) : (
              <Button onClick={submit} disabled={!answeredAll || saving} className="flex-1">
                {saving ? <Loader2 className="size-4 animate-spin" /> : "إنهاء / Finish"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
