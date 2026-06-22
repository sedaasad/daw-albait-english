import { useMemo, useState } from "react";
import { Check, X, MessageSquare, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RuleData, FormulaData, DialogueData, VocabData } from "@/data/curriculum";
import { SpeakButton } from "./SpeakButton";

export function RuleSection({ d }: { d: RuleData }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-en text-2xl font-black">
          {d.letter}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">يعادل بالعربي</p>
          <p className="font-black text-foreground text-lg">{d.arabic}</p>
        </div>
        <SpeakButton text={`The letter ${d.letter}`} size="md" />
      </div>
      <p className="text-sm text-foreground bg-muted rounded-xl p-3 mb-3">{d.rule}</p>
      <div className="space-y-2">
        {d.examples.map((ex, i) => (
          <div key={i} className="flex items-center justify-between gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SpeakButton text={ex.en} />
              <span className="font-black text-primary text-sm font-en truncate">{ex.en}</span>
            </div>
            <span className="text-sm text-muted-foreground">{ex.ar}</span>
          </div>
        ))}
      </div>
      {d.special && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-800 whitespace-pre-line">{d.special}</p>
        </div>
      )}
    </div>
  );
}

export function FormulaSection({ d }: { d: FormulaData }) {
  return (
    <div>
      <div className="bg-gradient-to-l from-primary to-secondary text-primary-foreground rounded-2xl p-4 mb-3 text-center">
        <p className="font-black text-base mb-1">{d.formula}</p>
        <p className="text-xs opacity-80 font-en">{d.formulaEn}</p>
      </div>
      {d.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {d.tags.map((t, i) => (
            <span key={i} className="bg-secondary/15 text-secondary text-xs px-2.5 py-1 rounded-full font-bold">{t}</span>
          ))}
        </div>
      )}
      {(["positive", "negative", "question"] as const).map((type) => {
        const items = d[type];
        if (!items) return null;
        const label = type === "positive" ? "✅ الإثبات" : type === "negative" ? "❌ النفي" : "❓ السؤال";
        return (
          <div key={type} className="mb-3">
            <p className="text-xs font-black text-muted-foreground mb-2">{label}</p>
            <div className="space-y-2">
              {items.map((ex, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-sm text-foreground mb-1">{ex.ar}</p>
                  <div className="flex items-center gap-2">
                    <SpeakButton text={ex.en} />
                    <p className="text-sm font-bold text-primary font-en flex-1">{ex.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {d.note && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 whitespace-pre-line">
          {d.note}
        </div>
      )}
    </div>
  );
}

export function DialogueSection({ d }: { d: DialogueData }) {
  return (
    <div className="space-y-2">
      {d.exchanges.map((ex, i) => {
        const isPrimary = ex.sp === 0;
        return (
          <div key={i} className={cn("flex", isPrimary ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2",
                isPrimary ? "bg-primary text-primary-foreground" : ex.sp === 2 ? "bg-secondary text-secondary-foreground" : "bg-muted"
              )}
            >
              <div className="flex items-start gap-2">
                <SpeakButton
                  text={ex.en}
                  className={cn(
                    (isPrimary || ex.sp === 2) && "bg-white/20 text-white hover:bg-white/30"
                  )}
                />
                <p className="text-sm font-en font-bold flex-1">{ex.en}</p>
              </div>
              <p className={cn("text-xs mt-1", isPrimary || ex.sp === 2 ? "opacity-70" : "text-muted-foreground")}>{ex.ar}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VocabSection({ d }: { d: VocabData }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {d.words.map((w, i) => (
        <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SpeakButton text={w.en} />
            <p className="font-black text-primary text-sm font-en">{w.en}</p>
          </div>
          <p className="text-xs text-muted-foreground">{w.ar}</p>
        </div>
      ))}
    </div>
  );
}
