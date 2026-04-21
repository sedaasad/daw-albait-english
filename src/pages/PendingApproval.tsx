import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, LogOut, RefreshCw } from "lucide-react";

export default function PendingApproval() {
  const { signOut, refreshProfile, profile } = useAuth();

  return (
    <div dir="rtl" className="min-h-screen gradient-soft flex items-center justify-center px-5">
      <Card className="max-w-md w-full p-8 text-center shadow-elevated animate-scale-in">
        <div className="size-20 rounded-full gradient-warm mx-auto flex items-center justify-center shadow-glow mb-5">
          <Clock className="size-10 text-warning-foreground" />
        </div>
        <h1 className="font-display text-2xl text-primary mb-2">حسابك قيد المراجعة</h1>
        <p className="text-muted-foreground mb-1">
          مرحباً {profile?.display_name || ""}!
        </p>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          تم استلام طلب تسجيلك بنجاح. سيقوم المعلم بمراجعة حسابك والموافقة عليه قريباً، ثم يمكنك بدء رحلة الـ ٤٥ يوماً.
        </p>
        <div className="space-y-3">
          <Button onClick={refreshProfile} variant="default" className="w-full h-11">
            <RefreshCw className="size-4" />
            تحديث الحالة
          </Button>
          <Button onClick={signOut} variant="outline" className="w-full h-11">
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </Card>
    </div>
  );
}
