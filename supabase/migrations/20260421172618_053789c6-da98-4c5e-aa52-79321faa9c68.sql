
-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('student', 'admin');
CREATE TYPE public.user_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  profile_image TEXT,
  current_level public.user_level NOT NULL DEFAULT 'beginner',
  total_points INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_login_date TIMESTAMPTZ,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  completed_lessons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER ROLES
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================
-- LESSONS
-- =====================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 45),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  description_ar TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  audio_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QUIZ QUESTIONS
-- =====================================================
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL DEFAULT '',
  options JSONB NOT NULL,            -- ["opt1","opt2",...]
  correct_index INT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QUIZ SCORES
-- =====================================================
CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RECORDINGS
-- =====================================================
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile + student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- lessons
CREATE POLICY "Approved users can view published lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_approved = true)
  );
CREATE POLICY "Admins can view all lessons" ON public.lessons
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quiz_questions
CREATE POLICY "Approved users can view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_approved = true)
  );
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quiz_scores
CREATE POLICY "Users can view own scores" ON public.quiz_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.quiz_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.quiz_scores
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- recordings
CREATE POLICY "Users can view own recordings" ON public.recordings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recordings" ON public.recordings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recordings" ON public.recordings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all recordings" ON public.recordings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('lesson-media', 'lesson-media', true),
  ('avatars', 'avatars', true),
  ('recordings', 'recordings', false);

-- lesson-media: public read, admin write
CREATE POLICY "Public can view lesson media" ON storage.objects
  FOR SELECT USING (bucket_id = 'lesson-media');
CREATE POLICY "Admins can upload lesson media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lesson media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lesson media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-media' AND public.has_role(auth.uid(), 'admin'));

-- avatars: public read, owner write (folder = user id)
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- recordings: private, owner-only
CREATE POLICY "Users can view own recordings files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own recordings files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own recordings files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all recordings files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'recordings' AND public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SEED 45 LESSONS (placeholder titles)
-- =====================================================
INSERT INTO public.lessons (day_number, title_ar, title_en, description_ar)
SELECT
  d,
  'اليوم ' || d || ' — درس تجريبي',
  'Day ' || d || ' — Sample Lesson',
  'سيتم إضافة محتوى هذا الدرس لاحقاً من قبل المعلم.'
FROM generate_series(1, 45) AS d;
