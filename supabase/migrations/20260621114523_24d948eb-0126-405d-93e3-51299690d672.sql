
DO $$ BEGIN
  CREATE TYPE public.cefr_level AS ENUM ('A1','A2','B1','B2','C1','C2');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cefr_level public.cefr_level,
  ADD COLUMN IF NOT EXISTS placement_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS placement_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS placement_strengths text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS placement_weaknesses text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS placement_completed_at timestamptz;
