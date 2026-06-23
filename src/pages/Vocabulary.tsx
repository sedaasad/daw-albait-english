import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Trash2, BookOpen, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSpeak } from "@/hooks/useSpeak";
import { useDictionary } from "@/components/dictionary/DictionaryProvider";
import { toast } from "sonner";

type SavedWord = {
  saved_at: string;
  word: {
    id: string;
    word: string;
    phonetic: string | null;
    meaning_ar: string;
    cefr_level: string | null;
  };
};

export default function Vocabulary() {
  const { user } = useAuth();
  const { speak, speakingKey } = useSpeak();
  const { lookup } = useDictionary();
  const [items, setItems] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("saved_at, word:dictionary_words(id, word, phonetic, meaning_ar, cefr_level)")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });
    if (error) toast.error("تعذر تحميل قاموسك");
    setItems((data as unknown as SavedWord[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const remove = async (wordId: string) => {
    if (!user) return;
    const prev = items;
    setItems(items.filter((i) => i.word.id !== wordId));
    const { error } = await supabase
      .from("user_vocabulary")
      .delete()
      .eq("user_id", user.id)
      .eq("word_id", wordId);
    if (error) { setItems(prev); toast.error("تعذر الحذف"); }
  };

  const filtered = items.filter((i) =>
    !q.trim() || i.word.word.toLowerCase().includes(q.toLowerCase()) || i.word.meaning_ar.includes(q),
  );

  return (
    <div dir="rtl">
      <PageHeader title="قاموسي" subtitle="الكلمات التي حفظتها" />
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في كلماتك..."
            className="pr-9 rounded-2xl"
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center space-y-2 shadow-card">
            <BookOpen className="size-10 mx-auto text-muted-foreground" />
            <p className="font-display">لا توجد كلمات محفوظة بعد</p>
            <p className="text-sm text-muted-foreground">انقر على أي كلمة إنجليزية لإضافتها هنا.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((it) => (
              <Card key={it.word.id} className="p-4 shadow-card animate-fade-in">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => speak(it.word.word, `vocab-${it.word.id}`)}
                    disabled={speakingKey === `vocab-${it.word.id}`}
                    className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                    aria-label="استماع"
                  >
                    <Volume2 className="size-4" />
                  </button>
                  <button
                    onClick={() => lookup(it.word.word)}
                    className="flex-1 text-right min-w-0"
                  >
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="font-display text-lg">{it.word.word}</span>
                      {it.word.phonetic && (
                        <span className="text-xs text-muted-foreground">/{it.word.phonetic}/</span>
                      )}
                      {it.word.cefr_level && (
                        <Badge variant="secondary" className="text-[10px]">
                          {it.word.cefr_level.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{it.word.meaning_ar}</p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(it.word.id)}
                    aria-label="حذف"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
