import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Sparkles, BookOpen, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Lesson {
  id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
}

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [totalLessons, setTotalLessons] = useState(45);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, day_number, title_ar, title_en, description_ar")
        .eq("is_published", true)
        .order("day_number", { ascending: true });
      if (data) {
        setTotalLessons(data.length);
        const completed = profile?.completed_lessons ?? [];
        const next = data.find((l) => !completed.includes(l.id)) ?? data[data.length - 1];
        setNextLesson(next as Lesson);
      }
      setLoading(false);
    })();
  }, [profile?.completed_lessons]);

  const completed = profile?.completed_lessons.length ?? 0;
  const progressPct = Math.round((completed / totalLessons) * 100);

  return (
    <div dir="rtl">
      {/* Hero */}
      <div className="gradient-primary text-primary-foreground rounded-b-[2rem] px-5 pt-8 pb-10 shadow-elevated safe-top">
        <div className="max-w-md mx-auto">
          <p className="text-primary-foreground/80 text-sm">مرحباً بعودتك</p>
          <h1 className="font-display text-2xl mt-1">
            {profile?.display_name || "طالبنا العزيز"} 👋
          </h1>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <StatPill icon={<Flame className="size-5" />} value={profile?.streak_days ?? 0} label="يوم متتالي" />
            <StatPill icon={<Trophy className="size-5" />} value={profile?.total_points ?? 0} label="نقطة" />
            <StatPill icon={<Sparkles className="size-5" />} value={completed} label="درس منجز" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-6 space-y-5">
        {/* Progress card */}
        <Card className="p-5 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">رحلتك في الـ 45 يوماً</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completed} من {totalLessons} درس
              </p>
            </div>
            <div className="text-2xl font-display text-primary">{progressPct}%</div>
          </div>
          <Progress value={progressPct} className="h-3" />
        </Card>

        {/* Continue card */}
        <Card className="p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-2">
            <BookOpen className="size-4" />
            <span>تابع التعلم</span>
          </div>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : nextLesson ? (
            <>
              <h2 className="font-display text-xl text-foreground mb-1">
                اليوم {nextLesson.day_number}
              </h2>
              <p className="text-sm text-muted-foreground mb-1">{nextLesson.title_ar}</p>
              {nextLesson.title_en && (
                <p className="font-en text-xs text-muted-foreground mb-4">{nextLesson.title_en}</p>
              )}
              <Button
                className="w-full h-11 mt-2"
                onClick={() => navigate(`/lessons/${nextLesson.id}`)}
              >
                ابدأ الدرس
                <ChevronLeft className="size-4" />
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">لا توجد دروس متاحة بعد.</p>
          )}
        </Card>

        <Card className="p-5 shadow-card animate-fade-in">
          <h3 className="font-semibold mb-2">نصيحة اليوم 💡</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            الاستمرارية أهم من الكمال — حتى ١٥ دقيقة يومياً ستحدث فارقاً كبيراً في طلاقتك خلال أسابيع.
          </p>
        </Card>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
      <div className="flex justify-center mb-1 opacity-90">{icon}</div>
      <div className="font-display text-xl">{value}</div>
      <div className="text-[10px] text-primary-foreground/80 mt-0.5">{label}</div>
    </div>
  );
}
