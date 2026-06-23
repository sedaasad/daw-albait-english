import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSpeak } from "@/hooks/useSpeak";
import { toast } from "sonner";

type DictWord = {
  id: string;
  word: string;
  phonetic: string | null;
  meaning_ar: string;
  example_en: string | null;
  example_ar: string | null;
  cefr_level: string | null;
};

interface Props {
  word: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function DictionaryModal({ word, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { speak, speakingKey } = useSpeak();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DictWord | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !word) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setData(null);
      setSaved(false);
      const clean = word.trim().toLowerCase().replace(/[^a-z'-]/g, "");
      if (!clean) { setLoading(false); return; }
      const { data: row } = await supabase
        .from("dictionary_words")
        .select("*")
        .ilike("word", clean)
        .maybeSingle();
      if (cancelled) return;
      setData(row as DictWord | null);
      if (row && user) {
        const { data: sv } = await supabase
          .from("user_vocabulary")
          .select("word_id")
          .eq("user_id", user.id)
          .eq("word_id", (row as DictWord).id)
          .maybeSingle();
        if (!cancelled) setSaved(!!sv);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, word, user]);

  const handleSave = async () => {
    if (!user || !data) return;
    setSaving(true);
    if (saved) {
      const { error } = await supabase
        .from("user_vocabulary")
        .delete()
        .eq("user_id", user.id)
        .eq("word_id", data.id);
      if (error) toast.error("تعذر الحذف"); else { setSaved(false); toast.success("تمت إزالة الكلمة"); }
    } else {
      const { error } = await supabase
        .from("user_vocabulary")
        .insert({ user_id: user.id, word_id: data.id });
      if (error) toast.error("تعذر الحفظ"); else { setSaved(true); toast.success("تمت إضافة الكلمة إلى قاموسي"); }
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl glass-strong" dir="rtl">
        <DialogHeader>
          <DialogTitle className="sr-only">قاموس</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-base font-display">"{word}"</p>
            <p className="text-sm text-muted-foreground">لا توجد هذه الكلمة في القاموس بعد.</p>
            {word && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(word, `dict-${word}`)}
                disabled={speakingKey === `dict-${word}`}
              >
                <Volume2 className="size-4 ml-2" /> استماع
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div dir="ltr" className="text-center space-y-1">
              <h2 className="font-display text-3xl">{data.word}</h2>
              {data.phonetic && <p className="text-sm text-muted-foreground">/{data.phonetic}/</p>}
              {data.cefr_level && (
                <Badge variant="secondary" className="mt-1">{data.cefr_level.toUpperCase()}</Badge>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={() => speak(data.word, `dict-${data.id}`)}
                disabled={speakingKey === `dict-${data.id}`}
                className="rounded-full"
              >
                <Volume2 className="size-4 ml-2" />
                {speakingKey === `dict-${data.id}` ? "..." : "استماع"}
              </Button>
              <Button
                variant={saved ? "secondary" : "outline"}
                onClick={handleSave}
                disabled={saving}
                className="rounded-full"
              >
                {saved ? <BookmarkCheck className="size-4 ml-2" /> : <BookmarkPlus className="size-4 ml-2" />}
                {saved ? "محفوظة" : "حفظ"}
              </Button>
            </div>

            <div className="rounded-2xl bg-foreground/5 p-4 space-y-2">
              <p className="text-xs text-muted-foreground">المعنى</p>
              <p className="text-base">{data.meaning_ar}</p>
            </div>

            {(data.example_en || data.example_ar) && (
              <div className="rounded-2xl bg-foreground/5 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">مثال</p>
                {data.example_en && (
                  <div className="flex items-start gap-2" dir="ltr">
                    <button
                      onClick={() => speak(data.example_en!, `ex-${data.id}`)}
                      className="text-primary mt-0.5"
                      aria-label="استماع للمثال"
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <p className="text-sm flex-1">{data.example_en}</p>
                  </div>
                )}
                {data.example_ar && <p className="text-sm text-muted-foreground">{data.example_ar}</p>}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
