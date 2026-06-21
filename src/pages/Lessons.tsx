import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Lock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULES, LEVEL_LABEL, TOTAL_LESSONS, type Level } from "@/data/curriculum";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";

type Filter = Level | "all";

export default function Lessons() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Filter>("all");
  const { completed } = useCompletedLessons();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODULES.filter((m) => {
      const matchesQ = !q || (m.titleAr + " " + m.titleEn).toLowerCase().includes(q);
      const matchesL = level === "all" || m.level === level;
      return matchesQ && matchesL;
    });
  }, [query, level]);

  const doneCount = MODULES.flatMap((m) => m.lessons).filter((l) => completed.has(l.id)).length;
  const pct = TOTAL_LESSONS ? Math.round((doneCount / TOTAL_LESSONS) * 100) : 0;

  return (
    <div dir="rtl">
      <PageHeader title="الوحدات الدراسية" subtitle="منهج ضوء البيت الشامل" />

      <div className="max-w-md mx-auto px-4 pb-24 space-y-5">
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary">تقدّمك</span>
            <span className="text-sm font-en text-muted-foreground">{doneCount}/{TOTAL_LESSONS}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </Card>

        <div className="relative">
          <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن وحدة..." className="pr-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setLevel(f)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-smooth",
                level === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {LEVEL_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((mod) => {
            const modDone = mod.lessons.filter((l) => completed.has(l.id)).length;
            const modPct = mod.lessons.length ? (modDone / mod.lessons.length) * 100 : 0;
            return (
              <button
                key={mod.id}
                onClick={() => !mod.locked && navigate(`/modules/${mod.id}`)}
                disabled={mod.locked}
                className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-4 text-right disabled:opacity-60"
              >
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl flex-shrink-0", mod.bg)}>
                  <span>{mod.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-foreground text-sm">{mod.titleAr}</span>
                    {mod.locked ? <Lock className="size-3.5 text-muted-foreground" /> : <span className="text-xs text-muted-foreground">{mod.total} درس</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-en mb-2 truncate">
                    {mod.titleEn} · {LEVEL_LABEL[mod.level]}
                  </p>
                  <Progress value={modPct} className="h-1.5" />
                </div>
                <ChevronLeft className="size-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
