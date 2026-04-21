import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, GraduationCap } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/auth", { replace: true });
    else if (profile && !profile.is_approved) navigate("/pending-approval", { replace: true });
    else navigate("/home", { replace: true });
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary text-primary-foreground">
      <div className="size-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-6 shadow-glow animate-scale-in">
        <GraduationCap className="size-10" />
      </div>
      <h1 className="font-display text-3xl mb-2">ضوء البيت</h1>
      <p className="text-primary-foreground/85 mb-8">تعلم الإنجليزية خلال 45 يوماً</p>
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
