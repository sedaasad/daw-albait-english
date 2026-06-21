CREATE TABLE public.speech_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NULL REFERENCES public.lessons(id) ON DELETE SET NULL,
  recording_id UUID NULL REFERENCES public.recordings(id) ON DELETE SET NULL,
  audio_path TEXT NULL,
  target_text TEXT NULL,
  transcript TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speech_attempts TO authenticated;
GRANT ALL ON public.speech_attempts TO service_role;

ALTER TABLE public.speech_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own speech attempts"
  ON public.speech_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own speech attempts"
  ON public.speech_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own speech attempts"
  ON public.speech_attempts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all speech attempts"
  ON public.speech_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_speech_attempts_user_created ON public.speech_attempts(user_id, created_at DESC);