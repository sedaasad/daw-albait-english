import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERBS } from "@/data/curriculum";
import { SpeechToTextPractice } from "@/components/lesson/SpeechToTextPractice";


export default function Practice() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const verb = VERBS[idx];

  return (
    <div dir="rtl">
      <PageHeader title="التمارين" subtitle="الأفعال الشاذة وتمارين تفاعلية" />

      <div className="max-w-md mx-auto px-4 pb-24 space-y-5">
        <SpeechToTextPractice />

        <Card className="p-4 shadow-card">
          <div className="flex justify-between items-center mb-3">

            <h3 className="font-black">🔀 بطاقات الأفعال الشاذة</h3>
            <span className="text-xs text-muted-foreground font-en">
              {idx + 1}/{VERBS.length}
            </span>
          </div>

          <button
            onClick={() => setFlipped((f) => !f)}
            className={cn(
              "w-full h-44 rounded-2xl flex flex-col items-center justify-center gap-3 transition-smooth shadow-card text-white",
              flipped ? "bg-gradient-to-br from-primary to-secondary" : "bg-gradient-to-br from-cyan-500 to-cyan-700"
            )}
          >
            {!flipped ? (
              <>
                <span className="text-white/70 text-sm">التصريف الأول (V1)</span>
                <span className="font-black text-5xl font-en">{verb.v1}</span>
                <span className="text-white/60 text-xs">اضغط لرؤية جميع التصاريف</span>
              </>
            ) : (
              <>
                <div className="flex gap-6 text-center">
                  {([["V1", verb.v1], ["V2", verb.v2], ["V3", verb.v3]] as const).map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs opacity-70">{l}</p>
                      <p className="font-black text-lg font-en">{v}</p>
                    </div>
                  ))}
                </div>
                <span className="font-black text-xl">{verb.ar}</span>
              </>
            )}
          </button>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }}
              disabled={idx === 0}
              className="flex-1 bg-muted text-foreground rounded-xl py-2.5 font-bold text-sm disabled:opacity-30"
            >
              ← السابق
            </button>
            <button
              onClick={() => { setIdx((i) => (i + 1) % VERBS.length); setFlipped(false); }}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-1"
            >
              <RefreshCw className="size-3.5" /> التالي
            </button>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <h3 className="font-black mb-3">قائمة الأفعال</h3>
          <div className="space-y-1.5">
            {VERBS.map((v, i) => (
              <button
                key={v.v1}
                onClick={() => { setIdx(i); setFlipped(false); }}
                className={cn(
                  "w-full flex items-center justify-between py-2 px-3 rounded-xl text-sm transition-smooth",
                  idx === i ? "bg-primary/10 border border-primary/20" : "bg-muted/50 hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2 font-en font-bold">
                  <span>{v.v1}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{v.v2}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{v.v3}</span>
                </span>
                <span className="text-muted-foreground text-xs">{v.ar}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
