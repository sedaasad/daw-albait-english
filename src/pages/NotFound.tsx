import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gradient-soft px-5">
      <div className="font-display text-6xl text-primary mb-2">404</div>
      <p className="text-muted-foreground mb-6">الصفحة غير موجودة</p>
      <Button onClick={() => navigate("/")}>
        <Home className="size-4" />
        العودة للرئيسية
      </Button>
    </div>
  );
};

export default NotFound;
