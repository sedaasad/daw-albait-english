import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Preserve a same-origin return path (used by the OAuth consent flow).
  const rawNext = searchParams.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${next || "/"}`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب بنجاح، بانتظار موافقة المعلم");
        navigate("/pending-approval");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("مرحباً بعودتك!");
        if (next) {
          window.location.href = next;
          return;
        }
        navigate("/home");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      const ar = msg.includes("Invalid login")
        ? "بيانات الدخول غير صحيحة"
        : msg.includes("already registered")
        ? "هذا البريد مسجّل مسبقاً"
        : msg.includes("Password should be")
        ? "كلمة المرور قصيرة جداً (6 أحرف على الأقل)"
        : msg;
      toast.error(ar);
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
            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="signup" className="m-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="اسمك الكامل"
                      required={mode === "signup"}
                    />
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="font-en text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
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

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {mode === "login" ? "دخول" : "إنشاء الحساب"}
                </Button>

                {mode === "login" && (
                  <div className="text-center">
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                )}
              </form>
            </Tabs>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            بإنشائك حساباً، فأنت توافق على شروط الاستخدام.
          </p>
        </div>
      </div>
    </div>
  );
}
