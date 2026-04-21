import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, ChevronLeft } from "lucide-react";

export default function AdminHome() {
  const navigate = useNavigate();
  return (
    <div dir="rtl">
      <PageHeader title="لوحة الإدارة" subtitle="إدارة الطلاب والدروس" variant="gradient" />
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-3">
        <AdminCard
          icon={<Users className="size-6 text-secondary" />}
          title="الطلاب"
          desc="الموافقة على التسجيلات الجديدة"
          onClick={() => navigate("/admin/users")}
        />
        <AdminCard
          icon={<BookOpen className="size-6 text-secondary" />}
          title="الدروس"
          desc="إدارة منهج الـ 45 يوماً"
          onClick={() => navigate("/admin/lessons")}
        />
      </div>
    </div>
  );
}

function AdminCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="p-5 shadow-card cursor-pointer transition-smooth hover:shadow-elevated active:scale-[0.99] flex items-center gap-4"
    >
      <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ChevronLeft className="size-4 text-muted-foreground" />
    </Card>
  );
}
