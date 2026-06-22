import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  variant?: "default" | "gradient";
}

export function PageHeader({ title, subtitle, back, right, variant = "default" }: Props) {
  const navigate = useNavigate();
  return (
    <header
      dir="rtl"
      className={cn(
        "safe-top px-4 pt-4 pb-5 sticky top-0 z-30",
        variant === "gradient"
          ? "gradient-primary text-primary-foreground rounded-b-3xl shadow-elevated"
          : "glass glass-highlight border-0 border-b border-white/40 rounded-b-3xl",
      )}
    >
      <div className="max-w-md mx-auto flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className={cn(
              "size-10 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90",
              variant === "gradient"
                ? "bg-white/20 hover:bg-white/30 text-primary-foreground"
                : "glass-strong text-foreground hover:bg-foreground/10",
            )}
            aria-label="رجوع"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl leading-tight truncate">{title}</h1>
          {subtitle && (
            <p
              className={cn(
                "text-sm mt-0.5 truncate",
                variant === "gradient" ? "text-primary-foreground/85" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
