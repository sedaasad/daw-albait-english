
# Daw Albait English — تعلم الإنجليزية خلال 45 يوماً

A mobile-first installable PWA for Arabic-speaking beginners learning English over a 45-day program. Full RTL Arabic interface, with English content embedded inside lessons.

## Design system

- **Direction:** RTL (`dir="rtl"`, `lang="ar"`) with Cairo/Tajawal Arabic font + Inter for English snippets
- **Tokens (HSL in `index.css`):**
  - Primary `#1A237E` (deep navy) · Secondary/Accent `#00BCD4` (cyan) · Background `#F0F4FF`
  - Card `#FFFFFF` · Success `#4CAF50` · Warning `#FF9800` · Text `#1C1C1E` / `#6B7280`
  - Gradient `primary → cyan` for hero/streak cards, soft shadow tokens
- All colors via semantic Tailwind tokens — no hard-coded hex in components

## Pages & flow

```text
/                    → Splash / redirect by auth + role
/auth                → Login + Signup tabs
/pending-approval    → Shown when isApproved = false
/home                → Student dashboard (streak, points, today's lesson, progress)
/lessons             → 45-day curriculum grid (locked/unlocked/completed)
/lessons/:day        → Lesson player (text + image + audio + mic recorder)
/lessons/:day/quiz   → Multiple-choice quiz → score saved
/profile             → Avatar, level, stats, logout
/admin               → Admin shell (guarded by has_role)
  ├─ /admin/users    → Approve/reject pending students, list all
  └─ /admin/lessons  → CRUD lessons (day, title_ar, title_en, body, image, audio)
/install             → PWA install instructions
```

Bottom tab bar (mobile): Home · Lessons · Profile. Admin link surfaces only for admins.

## Backend (Lovable Cloud)

**Auth:** Email + password. Signup creates row in `profiles` with `is_approved=false`; user sees pending-approval screen until an admin approves.

**Tables:**
- `profiles` — id (FK auth.users), email, display_name, profile_image, current_level, total_points, streak_days, last_login_date, is_approved, completed_lessons (text[]), created_at
- `user_roles` — id, user_id, role (enum `app_role`: student, admin) — separate table for security
- `lessons` — id, day_number (1–45, unique), title_ar, title_en, description_ar, body_md, image_url, audio_url, is_published, created_at
- `quiz_questions` — id, lesson_id, question_ar, question_en, options (jsonb), correct_index, order_index
- `quiz_scores` — id, user_id, lesson_id, score, total, completed_at
- `recordings` — id, user_id, lesson_id, audio_path, created_at (file in `recordings` storage bucket)

**Security:**
- `has_role(uuid, app_role)` SECURITY DEFINER function
- RLS: users read/update own profile & scores; admins manage lessons and approve users via `has_role(auth.uid(),'admin')`
- Trigger `on_auth_user_created` → inserts profile + default `student` role
- Storage buckets: `lesson-media` (public read), `recordings` (private, owner-only), `avatars` (public read, owner write)

**First admin:** seeded by promoting the first signed-up email (you'll provide it) via a one-off SQL migration.

## Key features

1. **Streak & points:** updated on each lesson completion / daily login (edge function or client logic with server validation)
2. **Lesson player:** Arabic explanation, English example sentences, image, HTML5 audio playback of pronunciation
3. **Quiz:** radio-group MCQ, instant feedback, score persisted, points awarded
4. **Speaking practice:** `MediaRecorder` API → upload to `recordings` bucket → playback own recording
5. **Progress tracking:** unlocked = previous day completed OR all unlocked toggle (admin setting later); completed lessons stored in `completed_lessons`
6. **PWA:** `vite-plugin-pwa` with `devOptions.enabled=false`, iframe/preview registration guard, manifest with navy theme + cyan icon, `/install` page with iOS "Add to Home Screen" instructions

## Build order

1. Design tokens (RTL, fonts, navy/cyan palette in `index.css` + `tailwind.config.ts`)
2. Lovable Cloud setup: tables, roles, RLS, trigger, storage buckets
3. Auth pages + pending-approval gate + auth context
4. App shell: RTL layout, bottom nav, route guards (auth + admin)
5. Student: Home dashboard, Lessons grid, Lesson player, Quiz, Profile
6. Mic recording + upload
7. Admin: user approval table, lesson CRUD
8. Seed 45 placeholder lessons (day 1–45 with title stubs)
9. PWA: manifest, icons, install page, registration guard
10. Polish: empty states, loading skeletons, toasts in Arabic

## Notes / assumptions

- "Lovable AI" features (auto-translation, pronunciation scoring) not included — can be added later
- Push notifications not included (PWA limitation on iOS); announcements deferred per your admin scope choice
- Seeded lessons are titled stubs (e.g. "اليوم 1: الحروف الأبجدية"); admin fills detail through the lesson manager
