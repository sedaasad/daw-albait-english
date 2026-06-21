import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Loader2, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
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
                <Mail className="size-6 text-primary" />
              </div>
              <h2 className="font-display text-xl text-primary">نسيت كلمة المرور؟</h2>
              <p className="text-sm text-muted-foreground mt-1">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين.
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  تم إرسال الرابط إلى <span className="font-en ltr inline-block">{email}</span>.<br />
                  افحص صندوق الوارد أو مجلد الرسائل غير المرغوب فيها.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    العودة إلى تسجيل الدخول
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  إرسال رابط إعادة التعيين
                </Button>

                <div className="text-center">
                  <Link
                    to="/auth"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    العودة إلى تسجيل الدخول
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
