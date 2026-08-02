-- 1. PROFILES: block privileged column changes by non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved
     OR NEW.current_level IS DISTINCT FROM OLD.current_level
     OR NEW.cefr_level IS DISTINCT FROM OLD.cefr_level
     OR NEW.total_points IS DISTINCT FROM OLD.total_points
     OR NEW.streak_days IS DISTINCT FROM OLD.streak_days
     OR NEW.placement_score IS DISTINCT FROM OLD.placement_score
     OR NEW.placement_completed IS DISTINCT FROM OLD.placement_completed
     OR NEW.placement_strengths IS DISTINCT FROM OLD.placement_strengths
     OR NEW.placement_weaknesses IS DISTINCT FROM OLD.placement_weaknesses
     OR NEW.placement_completed_at IS DISTINCT FROM OLD.placement_completed_at
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns_trg ON public.profiles;
CREATE TRIGGER protect_profile_columns_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- 2. Placement result saving via controlled function
CREATE OR REPLACE FUNCTION public.save_placement_result(
  _cefr cefr_level,
  _score numeric,
  _strengths text[],
  _weaknesses text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _score IS NULL OR _score < 0 OR _score > 100 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  UPDATE public.profiles
     SET cefr_level = _cefr,
         placement_score = _score,
         placement_completed = true,
         placement_strengths = COALESCE(_strengths, '{}'::text[]),
         placement_weaknesses = COALESCE(_weaknesses, '{}'::text[]),
         placement_completed_at = now()
   WHERE id = _uid
     AND placement_completed = false;
END;
$$;

-- 3. QUIZ: hide answer key, grade server-side
DROP POLICY IF EXISTS "Approved users can view quiz questions" ON public.quiz_questions;

CREATE OR REPLACE FUNCTION public.get_lesson_quiz(_lesson_id uuid)
RETURNS TABLE (
  id uuid,
  question_ar text,
  question_en text,
  options jsonb,
  order_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.question_ar, q.question_en, q.options, q.order_index
  FROM public.quiz_questions q
  WHERE q.lesson_id = _lesson_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_approved = true
    )
  ORDER BY q.order_index;
$$;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(_lesson_id uuid, _answers jsonb)
RETURNS TABLE (score integer, total integer, points integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _score integer := 0;
  _total integer := 0;
  _points integer := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _uid AND p.is_approved = true) THEN
    RAISE EXCEPTION 'Account not approved';
  END IF;
  IF _answers IS NULL OR jsonb_typeof(_answers) <> 'object' THEN
    RAISE EXCEPTION 'Invalid answers payload';
  END IF;

  SELECT count(*)::int,
         COALESCE(SUM(
           CASE WHEN (_answers ->> q.id::text) IS NOT NULL
                 AND (_answers ->> q.id::text) ~ '^[0-9]+$'
                 AND (_answers ->> q.id::text)::int = q.correct_index
                THEN 1 ELSE 0 END
         ), 0)::int
    INTO _total, _score
  FROM public.quiz_questions q
  WHERE q.lesson_id = _lesson_id;

  IF _total = 0 THEN
    RAISE EXCEPTION 'No quiz questions for this lesson';
  END IF;

  _points := _score * 10;

  INSERT INTO public.quiz_scores (user_id, lesson_id, score, total)
  VALUES (_uid, _lesson_id, _score, _total);

  IF _points > 0 THEN
    UPDATE public.profiles
       SET total_points = total_points + _points
     WHERE id = _uid;
  END IF;

  RETURN QUERY SELECT _score, _total, _points;
END;
$$;

-- Only the grading function may write scores
DROP POLICY IF EXISTS "Users can insert own scores" ON public.quiz_scores;

-- 4. Lesson content: require authentication instead of anonymous access
DROP POLICY IF EXISTS "levels readable by all" ON public.levels;
CREATE POLICY "levels readable by authenticated" ON public.levels
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "modules readable by all" ON public.modules;
CREATE POLICY "modules readable by authenticated" ON public.modules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lesson_sections readable by all" ON public.lesson_sections;
CREATE POLICY "lesson_sections readable by authenticated" ON public.lesson_sections
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lesson_vocabulary readable by all" ON public.lesson_vocabulary;
CREATE POLICY "lesson_vocabulary readable by authenticated" ON public.lesson_vocabulary
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vocabulary_items readable by all" ON public.vocabulary_items;
CREATE POLICY "vocabulary_items readable by authenticated" ON public.vocabulary_items
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "speaking_tasks readable by all" ON public.speaking_tasks;
CREATE POLICY "speaking_tasks readable by authenticated" ON public.speaking_tasks
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "listening_tasks readable by all" ON public.listening_tasks;
CREATE POLICY "listening_tasks readable by authenticated" ON public.listening_tasks
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "quizzes readable by all" ON public.quizzes;
CREATE POLICY "quizzes readable by authenticated" ON public.quizzes
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.levels, public.modules, public.lesson_sections,
  public.lesson_vocabulary, public.vocabulary_items, public.speaking_tasks,
  public.listening_tasks, public.quizzes FROM anon;

-- 5. Lock down internal SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_columns() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.save_placement_result(cefr_level, numeric, text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_placement_result(cefr_level, numeric, text[], text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.get_lesson_quiz(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_lesson_quiz(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;