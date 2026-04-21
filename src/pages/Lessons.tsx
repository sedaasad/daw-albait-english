import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
}

export default function Lessons() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, day_number, title_ar, title_en")
        .eq("is_published", true)
        .order("day_number", { ascending: true });
      setLessons((data ?? []) as Lesson[]);
      setLoading(false);
    })();
  }, []);

  const completed = new Set(profile?.completed_lessons ?? []);

  return (
    <div dir="rtl">
      <PageHeader title="الدروس" subtitle="منهج 45 يوماً" />

      <div className="max-w-md mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {lessons.map((lesson, idx) => {
              const isCompleted = completed.has(lesson.id);
              const prevDone = idx === 0 || completed.has(lessons[idx - 1].id);
              const isUnlocked = isCompleted || prevDone;
              return (
                <button
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className={cn(
                    "text-right transition-smooth disabled:opacity-50 disabled:cursor-not-allowed",
                    "active:scale-[0.97]"
                  )}
                >
                  <Card
                    className={cn(
                      "p-3 h-28 flex flex-col justify-between shadow-card border-2",
                      isCompleted
                        ? "border-success/30 bg-success/5"
                        : isUnlocked
                        ? "border-secondary/30 bg-card"
                        : "border-border bg-muted/40"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          isCompleted
                            ? "bg-success text-success-foreground"
                            : isUnlocked
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        يوم {lesson.day_number}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : !isUnlocked ? (
                        <Lock className="size-4 text-muted-foreground" />
                      ) : (
                        <Play className="size-4 text-secondary" />
                      )}
                    </div>
                    <div className="text-xs font-medium leading-tight line-clamp-2">
                      {lesson.title_ar}
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
