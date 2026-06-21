import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Sparkles, BookOpen, ChevronLeft, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULES, QUICK_VOCAB, TOTAL_LESSONS } from "@/data/curriculum";
import { FlipCard } from "@/components/lesson/FlipCard";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { completed } = useCompletedLessons();

  const allLessons = MODULES.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completed.has(l.id)).length;
  const progressPct = TOTAL_LESSONS ? Math.round((completedCount / TOTAL_LESSONS) * 100) : 0;

  // Next lesson = first lesson in any unlocked module that isn't completed
  const nextLesson = (() => {
    for (const mod of MODULES) {
      if (mod.locked) continue;
      const l = mod.lessons.find((x) => !completed.has(x.id));
      if (l) return { mod, lesson: l };
    }
    return null;
  })();

  return (
    <div dir="rtl">
      <div className="gradient-primary text-primary-foreground rounded-b-[2rem] px-5 pt-8 pb-10 shadow-elevated safe-top">
        <div className="max-w-md mx-auto">
          <p className="text-primary-foreground/80 text-sm">مرحباً بعودتك</p>
          <h1 className="font-display text-2xl mt-1">
            {profile?.display_name || "طالبنا العزيز"} 👋
          </h1>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <StatPill icon={<Flame className="size-5" />} value={profile?.streak_days ?? 0} label="يوم متتالي" />
            <StatPill icon={<Trophy className="size-5" />} value={profile?.total_points ?? 0} label="نقطة" />
            <StatPill icon={<Sparkles className="size-5" />} value={completedCount} label="درس منجز" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-6 pb-24 space-y-5">
        <Card className="p-5 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">رحلتك في الـ 45 يوماً</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} من {TOTAL_LESSONS} درس
              </p>
            </div>
            <div className="text-2xl font-display text-primary">{progressPct}%</div>
          </div>
          <Progress value={progressPct} className="h-3" />
        </Card>

        {nextLesson && (
          <Card className="p-5 shadow-card animate-fade-in">
            <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-2">
              <BookOpen className="size-4" />
              <span>تابع التعلم</span>
            </div>
            <h2 className="font-display text-lg text-foreground mb-1">{nextLesson.lesson.titleAr}</h2>
            <p className="font-en text-xs text-muted-foreground mb-4">
              {nextLesson.mod.titleAr} · {nextLesson.lesson.titleEn}
            </p>
            <Button className="w-full h-11" onClick={() => navigate(`/modules/${nextLesson.mod.id}/${nextLesson.lesson.id}`)}>
              ابدأ الدرس <ChevronLeft className="size-4" />
            </Button>
          </Card>
        )}

        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-foreground">الوحدات الدراسية</h3>
            <button onClick={() => navigate("/lessons")} className="text-primary text-sm flex items-center gap-1">
              الكل <ChevronLeft className="size-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {MODULES.slice(0, 5).map((mod) => (
              <button
                key={mod.id}
                onClick={() => !mod.locked && navigate(`/modules/${mod.id}`)}
                disabled={mod.locked}
                className={cn(
                  "flex-shrink-0 w-40 h-36 rounded-2xl bg-gradient-to-br p-4 text-right relative shadow-card text-white",
                  mod.bg
                )}
              >
                {mod.locked && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <Lock className="size-6 text-white" />
                  </div>
                )}
                <span className="text-3xl block mb-2">{mod.icon}</span>
                <span className="font-bold text-sm block">{mod.titleAr}</span>
                <span className="text-white/70 text-xs">{mod.total} درس</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-black text-foreground mb-3">مفردات سريعة 🃏</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {QUICK_VOCAB.map((w) => (
              <FlipCard key={w.en} word={w} />
            ))}
          </div>
        </section>

        <button
          onClick={() => navigate("/practice")}
          className="w-full bg-gradient-to-l from-purple-700 to-purple-900 rounded-2xl p-4 text-right shadow-card text-white"
        >
          <p className="font-black text-base">🔀 تدرب على الأفعال الشاذة</p>
          <p className="text-white/70 text-sm mt-1">34 فعل شاذ مع بطاقات تفاعلية</p>
        </button>
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
