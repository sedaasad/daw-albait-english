import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/auth") || location.pathname === "/pending-approval";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className={cn("flex-1", !hideNav && "pb-24")}>{children}</main>
      {!hideNav && (
        <nav
          dir="rtl"
          className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-elevated safe-bottom"
        >
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1 px-2 pt-2">
            <TabLink to="/home" icon={<Home className="size-5" />} label="الرئيسية" />
            <TabLink to="/lessons" icon={<BookOpen className="size-5" />} label="الدروس" />
            <TabLink to="/profile" icon={<User className="size-5" />} label="حسابي" />
            {isAdmin ? (
              <TabLink to="/admin" icon={<Shield className="size-5" />} label="الإدارة" />
            ) : (
              <div />
            )}
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
          "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-smooth",
          isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
