import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Crown, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  is_approved: boolean;
  created_at: string;
  roles: string[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, display_name, is_approved, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const rolesMap = new Map<string, string[]>();
    roles?.forEach((r) => {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });
    setUsers(
      (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesMap.get(p.id) ?? [],
      })) as UserRow[]
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setApproved(id: string, value: boolean) {
    const { error } = await supabase.from("profiles").update({ is_approved: value }).eq("id", id);
    if (error) return toast.error("فشل التحديث");
    toast.success(value ? "تمت الموافقة" : "تم إلغاء الموافقة");

    if (value) {
      // Fire-and-forget notification email
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "approval-notification",
            recipientEmail: users.find((u) => u.id === id)?.email,
            idempotencyKey: `approval-${id}`,
            templateData: {
              name: users.find((u) => u.id === id)?.display_name ?? "",
            },
          },
        })
        .then(({ error: e }) => {
          if (!e) toast.success("تم إرسال إشعار بالبريد");
        });
    }
    load();
  }

  async function makeAdmin(id: string) {
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error && !error.message.includes("duplicate")) return toast.error("فشل التحديث");
    toast.success("تمت ترقيته إلى مدير");
    load();
  }

  async function removeAdmin(id: string) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", id)
      .eq("role", "admin");
    if (error) return toast.error("فشل إزالة صلاحية المدير");
    toast.success("تمت إزالة صلاحية المدير");
    load();
  }

  const pending = users.filter((u) => !u.is_approved);
  const approved = users.filter((u) => u.is_approved);

  return (
    <div dir="rtl">
      <PageHeader title="إدارة الطلاب" back />
      <div className="max-w-md mx-auto px-4 space-y-6 pb-8">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <Section title={`بانتظار الموافقة (${pending.length})`}>
              {pending.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">لا توجد طلبات جديدة</p>
              )}
              {pending.map((u) => (
                <UserItem key={u.id} u={u} onApprove={() => setApproved(u.id, true)} />
              ))}
            </Section>

            <Section title={`الطلاب المعتمدون (${approved.length})`}>
              {approved.map((u) => (
                <UserItem
                  key={u.id}
                  u={u}
                  onRevoke={() => setApproved(u.id, false)}
                  onMakeAdmin={() => makeAdmin(u.id)}
                />
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function UserItem({
  u,
  onApprove,
  onRevoke,
  onMakeAdmin,
}: {
  u: UserRow;
  onApprove?: () => void;
  onRevoke?: () => void;
  onMakeAdmin?: () => void;
}) {
  const isAdmin = u.roles.includes("admin");
  return (
    <Card className="p-3 shadow-card flex items-center gap-3">
      <div className="size-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display">
        {(u.display_name || u.email || "U").slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-1">
          {u.display_name || "بدون اسم"}
          {isAdmin && <Crown className="size-3 text-warning" />}
        </div>
        <div className="text-xs text-muted-foreground font-en truncate" dir="ltr">
          {u.email}
        </div>
      </div>
      {onApprove && (
        <Button size="sm" onClick={onApprove}>
          <Check className="size-4" />
        </Button>
      )}
      {onRevoke && (
        <>
          {!isAdmin && onMakeAdmin && (
            <Button size="sm" variant="outline" onClick={onMakeAdmin}>
              <Crown className="size-4" />
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onRevoke}>
            <X className="size-4" />
          </Button>
        </>
      )}
    </Card>
  );
}
