import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Search, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";
import { toast } from "sonner";

interface Lesson {
  id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
}

type Filter = "all" | "todo" | "done";

const WEEK_SIZE = 7;

export default function Lessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { completed, toggle } = useCompletedLessons();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, day_number, title_ar, title_en, description_ar")
        .eq("is_published", true)
        .order("day_number", { ascending: true });
      if (error) toast.error("تعذّر تحميل الدروس");
      setLessons((data ?? []) as Lesson[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (filter === "done" && !completed.has(l.id)) return false;
      if (filter === "todo" && completed.has(l.id)) return false;
      if (!q) return true;
      return (
        l.title_ar.toLowerCase().includes(q) ||
        l.title_en.toLowerCase().includes(q) ||
        String(l.day_number).includes(q)
      );
    });
  }, [lessons, filter, query, completed]);

  const groupedByWeek = useMemo(() => {
    const groups = new Map<number, Lesson[]>();
    for (const l of filtered) {
      const week = Math.ceil(l.day_number / WEEK_SIZE);
      if (!groups.has(week)) groups.set(week, []);
      groups.get(week)!.push(l);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const total = lessons.length;
  const doneCount = lessons.filter((l) => completed.has(l.id)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div dir="rtl">
      <PageHeader title="مكتبة الدروس" subtitle="منهج 45 يوماً" />

      <div className="max-w-md mx-auto px-4 pb-24 space-y-5">
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary">تقدّمك</span>
            <span className="text-sm font-en text-muted-foreground">
              {doneCount}/{total}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            أكملت {pct}% من المنهج
          </p>
        </Card>

        <div className="relative">
          <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن درس أو يوم..."
            className="pr-9"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="todo">غير مكتملة</TabsTrigger>
            <TabsTrigger value="done">مكتملة</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            لا توجد دروس مطابقة
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedByWeek.map(([week, items]) => (
              <section key={week} className="space-y-2">
                <h2 className="text-sm font-bold text-primary px-1">
                  الأسبوع {week}
                </h2>
                <div className="space-y-2">
                  {items.map((lesson) => {
                    const isDone = completed.has(lesson.id);
                    return (
                      <Card
                        key={lesson.id}
                        className={cn(
                          "p-3 shadow-card border-2 transition-smooth flex items-center gap-3",
                          isDone
                            ? "border-success/40 bg-success/5"
                            : "border-transparent"
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(lesson.id);
                            toast.success(
                              isDone ? "تم إلغاء الإكمال" : "أحسنت! تم إكمال الدرس"
                            );
                          }}
                          aria-label={isDone ? "إلغاء الإكمال" : "تمييز كمكتمل"}
                          className="shrink-0 transition-smooth active:scale-90"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-7 text-success" />
                          ) : (
                            <Circle className="size-7 text-muted-foreground/60" />
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/lessons/${lesson.id}`)}
                          className="flex-1 text-right min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                isDone
                                  ? "bg-success/15 text-success"
                                  : "bg-secondary/15 text-secondary"
                              )}
                            >
                              يوم {lesson.day_number}
                            </span>
                            <span className="text-[10px] font-en text-muted-foreground truncate">
                              {lesson.title_en}
                            </span>
                          </div>
                          <div className="text-sm font-semibold truncate">
                            {lesson.title_ar}
                          </div>
                          {lesson.description_ar && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {lesson.description_ar}
                            </div>
                          )}
                        </button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => navigate(`/lessons/${lesson.id}`)}
                          aria-label="فتح الدرس"
                          className="shrink-0"
                        >
                          <Play className="size-4 text-primary" />
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
