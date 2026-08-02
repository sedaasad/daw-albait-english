CREATE OR REPLACE FUNCTION public.check_quiz_answer(_question_id uuid, _selected integer)
RETURNS TABLE (correct boolean, explanation_ar text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_approved = true) THEN
    RAISE EXCEPTION 'Account not approved';
  END IF;
  IF _selected IS NULL OR _selected < 0 OR _selected > 20 THEN
    RAISE EXCEPTION 'Invalid answer';
  END IF;

  RETURN QUERY
  SELECT (q.correct_index = _selected), q.explanation_ar
  FROM public.quiz_questions q
  WHERE q.id = _question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.check_quiz_answer(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, integer) TO authenticated;