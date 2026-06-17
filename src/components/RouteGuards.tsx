import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

// Auth gates temporarily disabled — all routes are open for development.
export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
