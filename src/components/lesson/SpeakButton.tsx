import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/hooks/useSpeak";

export function SpeakButton({ text, size = "sm", className }: { text: string; size?: "sm" | "md"; className?: string }) {
  const { speak, speakingKey } = useSpeak();
  const isOn = speakingKey === text;
  const dim = size === "md" ? "w-9 h-9" : "w-7 h-7";
  const icon = size === "md" ? 16 : 14;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label={`استمع إلى ${text}`}
      className={cn(
        dim,
        "rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-smooth flex-shrink-0",
        isOn && "bg-primary text-primary-foreground animate-pulse",
        className,
      )}
    >
      {isOn ? <Loader2 size={icon} className="animate-spin" /> : <Volume2 size={icon} />}
    </button>
  );
}
