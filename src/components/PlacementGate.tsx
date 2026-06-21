import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const EXEMPT_PATHS = ["/placement-test", "/auth", "/pending-approval", "/"];

/**
 * Redirects authenticated users who have not completed placement to /placement-test.
 * Admin users are exempt.
 */
export function PlacementGate({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading || !user || !profile || isAdmin) return <>{children}</>;
  if (EXEMPT_PATHS.includes(location.pathname)) return <>{children}</>;
  if (location.pathname.startsWith("/admin")) return <>{children}</>;

  if (!profile.placement_completed) {
    return <Navigate to="/placement-test" replace />;
  }
  return <>{children}</>;
}
