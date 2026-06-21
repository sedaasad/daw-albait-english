import { useState } from "react";
import { cn } from "@/lib/utils";

export function FlipCard({ word }: { word: { en: string; ar: string; emoji: string } }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className={cn(
        "w-36 h-24 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center gap-1 shadow-card transition-smooth",
        flipped ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
      )}
    >
      <span className="text-2xl">{word.emoji}</span>
      <span className="text-sm font-bold font-en">{flipped ? word.ar : word.en}</span>
      {!flipped && <span className="text-[10px] text-muted-foreground">اضغط للترجمة</span>}
    </button>
  );
}
