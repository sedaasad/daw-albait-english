
-- Promote appsacc118@gmail.com to admin (keep student role too)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM public.profiles WHERE email = 'appsacc118@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Approve both accounts and mark placement complete for admin so they skip the test
UPDATE public.profiles SET is_approved = true
WHERE email IN ('appsacc118@gmail.com', 'hassantamoon87@gmail.com');

UPDATE public.profiles
SET placement_completed = true, cefr_level = 'C1', placement_score = 100
WHERE email = 'appsacc118@gmail.com';
