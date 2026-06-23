
-- ============ LEVELS ============
CREATE TABLE public.levels (
  code text PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_ar text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.levels TO anon, authenticated;
GRANT ALL ON public.levels TO service_role;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "levels readable by all" ON public.levels FOR SELECT USING (true);
CREATE POLICY "levels admin write" ON public.levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ MODULES ============
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_code text NOT NULL REFERENCES public.levels(code) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_ar text,
  icon text,
  bg_gradient text,
  order_index integer NOT NULL DEFAULT 0,
  est_hours numeric,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules readable by all" ON public.modules FOR SELECT USING (true);
CREATE POLICY "modules admin write" ON public.modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Extend LESSONS ============
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS order_index integer,
  ADD COLUMN IF NOT EXISTS cefr_level public.cefr_level,
  ADD COLUMN IF NOT EXISTS duration_min integer,
  ADD COLUMN IF NOT EXISTS learning_outcomes_ar text[],
  ADD COLUMN IF NOT EXISTS intro_ar text,
  ADD COLUMN IF NOT EXISTS intro_en text,
  ADD COLUMN IF NOT EXISTS ai_tips_ar text;
CREATE UNIQUE INDEX IF NOT EXISTS lessons_module_slug_idx ON public.lessons(module_id, slug) WHERE module_id IS NOT NULL;

-- ============ LESSON SECTIONS ============
CREATE TABLE public.lesson_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('intro','objectives','vocabulary','grammar','listening','speaking','ai_tips','quiz','pronunciation')),
  order_index integer NOT NULL DEFAULT 0,
  title_ar text,
  title_en text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_sections TO anon, authenticated;
GRANT ALL ON public.lesson_sections TO service_role;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_sections readable by all" ON public.lesson_sections FOR SELECT USING (true);
CREATE POLICY "lesson_sections admin write" ON public.lesson_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX lesson_sections_lesson_idx ON public.lesson_sections(lesson_id, order_index);

-- ============ VOCABULARY ITEMS ============
CREATE TABLE public.vocabulary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_en text NOT NULL,
  phonetic text,
  meaning_ar text NOT NULL,
  example_en text,
  example_ar text,
  cefr_level public.cefr_level,
  audio_url text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vocabulary_items TO anon, authenticated;
GRANT ALL ON public.vocabulary_items TO service_role;
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocabulary_items readable by all" ON public.vocabulary_items FOR SELECT USING (true);
CREATE POLICY "vocabulary_items admin write" ON public.vocabulary_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX vocabulary_items_word_idx ON public.vocabulary_items(lower(word_en));

-- ============ LESSON ↔ VOCABULARY LINK ============
CREATE TABLE public.lesson_vocabulary (
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES public.vocabulary_items(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, vocabulary_id)
);
GRANT SELECT ON public.lesson_vocabulary TO anon, authenticated;
GRANT ALL ON public.lesson_vocabulary TO service_role;
ALTER TABLE public.lesson_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_vocabulary readable by all" ON public.lesson_vocabulary FOR SELECT USING (true);
CREATE POLICY "lesson_vocabulary admin write" ON public.lesson_vocabulary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SPEAKING TASKS ============
CREATE TABLE public.speaking_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt_ar text NOT NULL,
  target_text text NOT NULL,
  phonetic text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.speaking_tasks TO anon, authenticated;
GRANT ALL ON public.speaking_tasks TO service_role;
ALTER TABLE public.speaking_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "speaking_tasks readable by all" ON public.speaking_tasks FOR SELECT USING (true);
CREATE POLICY "speaking_tasks admin write" ON public.speaking_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ LISTENING TASKS ============
CREATE TABLE public.listening_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt_ar text NOT NULL,
  audio_text text NOT NULL,
  comprehension_question_ar text,
  options jsonb,
  correct_index integer,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listening_tasks TO anon, authenticated;
GRANT ALL ON public.listening_tasks TO service_role;
ALTER TABLE public.listening_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listening_tasks readable by all" ON public.listening_tasks FOR SELECT USING (true);
CREATE POLICY "listening_tasks admin write" ON public.listening_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ QUIZZES ============
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  pass_score_percent integer NOT NULL DEFAULT 70,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quizzes TO anon, authenticated;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes readable by all" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "quizzes admin write" ON public.quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Extend quiz_questions to optionally attach to a quiz ============
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS explanation_ar text;
