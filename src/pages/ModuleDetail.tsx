import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULES } from "@/data/curriculum";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";

export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { completed } = useCompletedLessons();
  const mod = MODULES.find((m) => m.id === moduleId);

  if (!mod) {
    return (
      <div dir="rtl" className="p-10 text-center text-muted-foreground">
        الوحدة غير موجودة
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className={cn("bg-gradient-to-br text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-elevated", mod.bg)}>
        <button onClick={() => navigate("/lessons")} className="flex items-center gap-2 text-white/80 text-sm mb-3">
          <ArrowRight className="size-4" /> الوحدات
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{mod.icon}</span>
          <div>
            <h1 className="font-display text-xl">{mod.titleAr}</h1>
            <p className="text-white/70 text-sm font-en">{mod.titleEn}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 pb-24 space-y-3">
        {mod.lessons.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center text-muted-foreground">
            <span className="text-4xl block mb-3">🔜</span>
            دروس قادمة قريباً
          </div>
        ) : (
          mod.lessons.map((lesson, idx) => {
            const done = completed.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => navigate(`/modules/${mod.id}/${lesson.id}`)}
                className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-4 text-right"
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm", done ? "bg-success text-white" : "bg-muted text-foreground")}>
                  {done ? "✓" : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-foreground truncate">{lesson.titleAr}</p>
                  <p className="text-xs text-muted-foreground font-en truncate">
                    {lesson.titleEn} · ⏱ {lesson.mins} دقيقة
                  </p>
                </div>
                <ChevronLeft className="size-4 text-muted-foreground" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
