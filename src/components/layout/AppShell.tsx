import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, Dumbbell, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/auth") || location.pathname === "/pending-approval";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className={cn("flex-1", !hideNav && "pb-28")}>{children}</main>
      {!hideNav && (
        <nav
          dir="rtl"
          className="fixed bottom-3 inset-x-3 z-40 safe-bottom"
        >
          <div
            className={cn(
              "max-w-md mx-auto glass-strong glass-highlight rounded-[1.75rem] grid gap-1 px-2 py-2",
              isAdmin ? "grid-cols-5" : "grid-cols-4",
            )}
          >
            <TabLink to="/home" icon={<Home className="size-5" />} label="الرئيسية" />
            <TabLink to="/lessons" icon={<BookOpen className="size-5" />} label="الدروس" />
            <TabLink to="/practice" icon={<Dumbbell className="size-5" />} label="التمارين" />
            <TabLink to="/profile" icon={<User className="size-5" />} label="حسابي" />
            {isAdmin && <TabLink to="/admin" icon={<Shield className="size-5" />} label="الإدارة" />}
          </div>
        </nav>
      )}
    </div>
  );
}

function TabLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95",
          isActive
            ? "text-primary bg-primary/10 shadow-card"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
