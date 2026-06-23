
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_day_number_check;
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_day_number_key;
ALTER TABLE public.lessons ALTER COLUMN day_number DROP NOT NULL;
