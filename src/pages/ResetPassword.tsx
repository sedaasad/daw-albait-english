import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && newSession) {
        setReady(true);
      }
    });

    async function checkRecovery() {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (mounted) {
            window.history.replaceState({}, document.title, "/reset-password");
            setReady(true);
          }
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session && mounted) {
          setReady(true);
          return;
        }

        toastTimer = setTimeout(() => {
          if (!mounted) return;
          toast.error("لم يتم التعرف على الجلسة. أعد فتح الرابط من البريد.");
        }, 3500);
      } catch {
        if (mounted) toast.error("رابط إعادة التعيين غير صالح أو منتهي الصلاحية");
      }
    }

    checkRecovery();

    return () => {
      mounted = false;
      if (toastTimer) clearTimeout(toastTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("تم تغيير كلمة المرور بنجاح");

      // Determine redirect based on current user's role
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      let target = "/home";
      if (userId) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (roleRow) target = "/admin";
      } else {
        target = "/auth";
      }

      setTimeout(() => navigate(target, { replace: true }), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen gradient-soft flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="size-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-elevated mb-4">
              <GraduationCap className="size-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl text-primary mb-1">ضوء البيت</h1>
            <p className="text-muted-foreground">تعلم الإنجليزية خلال 45 يوماً</p>
          </div>

          <Card className="p-6 shadow-card animate-scale-in">
            <div className="text-center mb-6">
              <div className="size-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                <Lock className="size-6 text-primary" />
              </div>
              <h2 className="font-display text-xl text-primary">تعيين كلمة مرور جديدة</h2>
              <p className="text-sm text-muted-foreground mt-1">
                اختر كلمة مرور قوية وآمنة.
              </p>
            </div>

            {done ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="size-12 text-success mx-auto" />
                <p className="text-muted-foreground">
                  تم تغيير كلمة المرور. يمكنك الآن تسجيل الدخول.
                </p>
                <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                  تسجيل الدخول
                </Button>
              </div>
            ) : !ready ? (
              <div className="text-center py-6">
                <Loader2 className="size-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">جاري التحقق من الرابط...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور الجديدة</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  حفظ كلمة المرور
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
