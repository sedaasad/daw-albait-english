import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Trophy, Sparkles, LogOut, Mail, Award, BookMarked, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const initials = (profile?.display_name || profile?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div dir="rtl">
      <PageHeader title="حسابي" />
      <div className="max-w-md mx-auto px-4 space-y-5">
        <Card className="p-6 text-center shadow-card animate-fade-in">
          <Avatar className="size-20 mx-auto mb-3 shadow-elevated">
            <AvatarImage src={profile?.profile_image ?? undefined} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-display text-xl">{profile?.display_name || "طالب"}</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Mail className="size-3" />
            <span className="font-en" dir="ltr">{user?.email}</span>
          </div>
          <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-secondary/15 text-secondary">
            <Award className="inline size-3 ml-1" />
            المستوى: {LEVEL_LABEL[profile?.current_level ?? "beginner"]}
          </span>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Flame className="size-5 text-warning" />} value={profile?.streak_days ?? 0} label="يوم متتالي" />
          <StatCard icon={<Trophy className="size-5 text-secondary" />} value={profile?.total_points ?? 0} label="نقطة" />
          <StatCard icon={<Sparkles className="size-5 text-success" />} value={profile?.completed_lessons.length ?? 0} label="درس" />
        </div>

        <Button variant="outline" className="w-full h-11" onClick={signOut}>
          <LogOut className="size-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Card className="p-3 text-center shadow-card">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="font-display text-xl">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}
