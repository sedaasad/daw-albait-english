CREATE OR REPLACE FUNCTION public.mark_lesson_complete(_lesson_id text)
RETURNS text[]
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result text[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _lesson_id IS NULL OR length(_lesson_id) = 0 OR length(_lesson_id) > 200 THEN RAISE EXCEPTION 'Invalid lesson'; END IF;
  PERFORM set_config('app.bypass_profile_protection', 'on', true);
  UPDATE public.profiles
     SET completed_lessons = CASE WHEN _lesson_id = ANY(completed_lessons) THEN completed_lessons ELSE array_append(completed_lessons, _lesson_id) END
   WHERE id = auth.uid()
  RETURNING completed_lessons INTO result;
  RETURN COALESCE(result, '{}');
END $$;
REVOKE ALL ON FUNCTION public.mark_lesson_complete(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_lesson_complete(text) TO authenticated;