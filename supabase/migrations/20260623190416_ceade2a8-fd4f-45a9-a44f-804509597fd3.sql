
CREATE TABLE public.dictionary_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  phonetic TEXT,
  meaning_ar TEXT NOT NULL,
  example_en TEXT,
  example_ar TEXT,
  cefr_level public.cefr_level,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX dictionary_words_word_lower_idx ON public.dictionary_words (lower(word));

GRANT SELECT ON public.dictionary_words TO authenticated;
GRANT ALL ON public.dictionary_words TO service_role;

ALTER TABLE public.dictionary_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read dictionary"
  ON public.dictionary_words FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage dictionary"
  ON public.dictionary_words FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_vocabulary (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.dictionary_words(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_vocabulary TO authenticated;
GRANT ALL ON public.user_vocabulary TO service_role;

ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vocabulary"
  ON public.user_vocabulary FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users save to own vocabulary"
  ON public.user_vocabulary FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove from own vocabulary"
  ON public.user_vocabulary FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
