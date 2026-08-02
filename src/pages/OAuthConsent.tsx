import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Loader2, ShieldCheck } from "lucide-react";

type AuthorizationDetails = {
  client?: { name?: string; client_name?: string; redirect_uri?: string; client_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

const SCOPE_LABELS: Record<string, string> = {
  openid: "التعرّف على هويتك",
  email: "مشاركة بريدك الإلكتروني",
  profile: "مشاركة ملفك الشخصي الأساسي",
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("رابط التصريح غير صالح (authorization_id مفقود).");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      if (!active) return;
      setEmail(sess.session.user.email ?? null);

      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("لم يُرجع سيرفر التصريح رابط إعادة توجيه.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "تطبيق خارجي";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <div dir="rtl" className="min-h-screen gradient-soft flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-elevated mb-4">
            <GraduationCap className="size-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl text-primary">ضوء البيت</h1>
        </div>

        <Card className="p-6 shadow-card">
          {error ? (
            <div className="space-y-3 text-center">
              <h2 className="font-display text-lg">تعذّر تحميل طلب التصريح</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/home")}>
                العودة للتطبيق
              </Button>
            </div>
          ) : !details ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              جارٍ التحميل…
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="size-12 rounded-xl bg-primary/10 mx-auto flex items-center justify-center">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
                <h2 className="font-display text-lg">ربط {clientName} بحسابك</h2>
                <p className="text-sm text-muted-foreground">
                  هذا يسمح لـ {clientName} باستخدام أدوات هذا التطبيق باسمك.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 p-4 text-sm space-y-2">
                {email && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">الحساب</span>
                    <span dir="ltr" className="font-en">{email}</span>
                  </div>
                )}
                {details.client?.redirect_uri && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">عنوان الإرجاع</span>
                    <span dir="ltr" className="font-en truncate max-w-[60%]">{details.client.redirect_uri}</span>
                  </div>
                )}
              </div>

              {scopes.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {scopes.map((scope) => (
                    <li key={scope} className="text-muted-foreground">
                      • {SCOPE_LABELS[scope] ?? `صلاحية إضافية مطلوبة: ${scope}`}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted-foreground">
                هذا لا يتجاوز صلاحيات التطبيق أو سياسات الحماية في قاعدة البيانات.
              </p>

              <div className="space-y-2">
                <Button className="w-full h-12" disabled={busy} onClick={() => decide(true)}>
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  الموافقة والربط
                </Button>
                <Button variant="outline" className="w-full h-12" disabled={busy} onClick={() => decide(false)}>
                  إلغاء الربط
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
