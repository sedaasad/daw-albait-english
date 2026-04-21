import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  body_md: string;
  image_url: string | null;
  audio_url: string | null;
  is_published: boolean;
}

export default function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Lesson | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("day_number", { ascending: true });
    setLessons((data ?? []) as Lesson[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublished(l: Lesson) {
    await supabase.from("lessons").update({ is_published: !l.is_published }).eq("id", l.id);
    load();
  }

  return (
    <div dir="rtl">
      <PageHeader title="إدارة الدروس" subtitle="منهج الـ 45 يوماً" back />
      <div className="max-w-md mx-auto px-4 space-y-2 pb-8">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          lessons.map((l) => (
            <Card key={l.id} className="p-3 shadow-card flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display text-sm">
                {l.day_number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{l.title_ar}</div>
                <div className="text-xs font-en text-muted-foreground truncate" dir="ltr">
                  {l.title_en || "—"}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => togglePublished(l)} aria-label="نشر">
                {l.is_published ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4 text-muted-foreground" />}
              </Button>
              <Button size="icon" variant="outline" onClick={() => setEditing(l)} aria-label="تعديل">
                <Pencil className="size-4" />
              </Button>
            </Card>
          ))
        )}
      </div>

      <LessonEditor
        lesson={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
  );
}

function LessonEditor({
  lesson,
  onClose,
  onSaved,
}: {
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(lesson);
  }, [lesson]);

  if (!form) return null;

  async function save() {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase
      .from("lessons")
      .update({
        title_ar: form.title_ar,
        title_en: form.title_en,
        description_ar: form.description_ar,
        body_md: form.body_md,
        image_url: form.image_url,
        audio_url: form.audio_url,
      })
      .eq("id", form.id);
    setSaving(false);
    if (error) return toast.error("فشل الحفظ");
    toast.success("تم الحفظ");
    onSaved();
  }

  return (
    <Dialog open={!!lesson} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>اليوم {form.day_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="العنوان (عربي)">
            <Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} />
          </Field>
          <Field label="العنوان (إنجليزي)">
            <Input
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              dir="ltr"
              className="font-en text-left"
            />
          </Field>
          <Field label="الوصف">
            <Textarea
              value={form.description_ar}
              onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              rows={2}
            />
          </Field>
          <Field label="المحتوى">
            <Textarea
              value={form.body_md}
              onChange={(e) => setForm({ ...form, body_md: e.target.value })}
              rows={6}
            />
          </Field>
          <Field label="رابط الصورة">
            <Input
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
              dir="ltr"
              className="font-en text-left"
            />
          </Field>
          <Field label="رابط الصوت">
            <Input
              value={form.audio_url ?? ""}
              onChange={(e) => setForm({ ...form, audio_url: e.target.value || null })}
              dir="ltr"
              className="font-en text-left"
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              إلغاء
            </Button>
            <Button className="flex-1" onClick={save} disabled={saving}>
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
