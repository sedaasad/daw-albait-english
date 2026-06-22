# Liquid Glass Redesign Plan — Daw Albait English

A complete UI/UX modernization aligned with Apple's Liquid Glass design language (iOS/iPadOS/macOS 26): translucent layered surfaces, dynamic specular highlights, soft depth, fluid motion, and content-first hierarchy — fully bilingual (Arabic-first RTL) and accessible.

## 1. Current UI Analysis

Stack: React 18 + Vite + Tailwind + shadcn/ui, RTL Arabic, Cairo/Tajawal fonts. Routes: Home, Lessons, ModuleDetail, LessonDetail, Practice, Quiz, Profile, Auth, ForgotPassword, ResetPassword, PlacementTest, PendingApproval, Admin (Home/Lessons/Users).

Strengths
- Semantic token system already in `index.css` (HSL vars, gradients, shadows).
- shadcn primitives wired with Radix → ARIA mostly correct.
- Arabic RTL typography and PageHeader pattern reused across screens.

Weak spots
- Visual language is generic SaaS: flat cards, solid surfaces, indigo/teal gradients — no depth, no material identity.
- `--shadow-card/elegant/glow` exist but aren't layered; cards feel printed-on, not floating.
- Navigation (AppShell bottom tabs) is opaque, breaks the Liquid Glass "floating chrome over content" principle.
- Lesson sections (Dialogue interactive mode, FlipCard, Quiz) use solid backgrounds — no glass differentiation between chrome, content, and feedback layers.
- No motion system: state transitions snap; feedback boxes appear without spring/blur transitions.
- Mixed type scale (display vs body) but no fluid clamp() scale; small tap targets in icon buttons.
- Dark mode tokens defined but never sensory — same flat feel.

## 2. Design Principles (Liquid Glass)

1. **Material over fill** — chrome (nav, headers, sheets, toasts) is translucent glass; content sits on opaque canvas.
2. **Layered depth** — 3 z-layers: Canvas (content) → Glass (chrome/cards) → Lens (modals, popovers).
3. **Light reacts** — every glass surface has a specular highlight border + inner glow that subtly responds to scroll/hover.
4. **Motion is fluid** — spring-based, never linear; surfaces morph (radius, blur) between states.
5. **Content first** — color, type, and imagery dominate; chrome recedes via blur+transparency.
6. **Arabic-first** — type rhythm tuned for Tajawal/Cairo, mirrored geometry, ltr-safe icons.

## 3. Design Tokens

Add to `src/index.css` (HSL + new glass + motion tokens).

```css
:root {
  /* Canvas */
  --background: 30 25% 97%;          /* warm paper */
  --foreground: 222 30% 12%;

  /* Brand */
  --primary: 220 95% 56%;            /* iOS blue, slightly deeper */
  --primary-foreground: 0 0% 100%;
  --accent: 158 70% 45%;             /* teal-green for success/progress */
  --warning: 35 95% 55%;
  --destructive: 358 75% 56%;

  /* Glass system */
  --glass-bg: 0 0% 100% / 0.55;
  --glass-bg-strong: 0 0% 100% / 0.72;
  --glass-bg-tinted: 220 60% 96% / 0.55;
  --glass-border: 0 0% 100% / 0.65;
  --glass-highlight: 0 0% 100% / 0.9;   /* top inner edge */
  --glass-shadow: 220 40% 20% / 0.12;
  --glass-blur: 24px;
  --glass-blur-strong: 40px;
  --glass-saturate: 180%;

  /* Layered shadows (stacked) */
  --shadow-glass-sm: 0 1px 0 0 hsl(var(--glass-highlight)) inset,
                     0 1px 2px hsl(var(--glass-shadow));
  --shadow-glass:    0 1px 0 0 hsl(var(--glass-highlight)) inset,
                     0 8px 24px -8px hsl(var(--glass-shadow)),
                     0 2px 6px -2px hsl(var(--glass-shadow));
  --shadow-lens:     0 1px 0 0 hsl(var(--glass-highlight)) inset,
                     0 24px 60px -20px hsl(var(--glass-shadow)),
                     0 8px 20px -8px hsl(var(--glass-shadow));

  /* Radius — continuous, iOS squircle feel */
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  /* Motion */
  --ease-glass: cubic-bezier(0.32, 0.72, 0, 1);  /* iOS spring approx */
  --ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 180ms;
  --dur: 280ms;
  --dur-slow: 480ms;

  /* Type scale (fluid) */
  --fs-display: clamp(2rem, 4vw + 1rem, 3.25rem);
  --fs-h1: clamp(1.5rem, 2vw + 0.75rem, 2rem);
  --fs-h2: 1.375rem;
  --fs-body: 1rem;
  --fs-small: 0.875rem;
  --fs-caption: 0.75rem;
}

.dark {
  --background: 222 30% 7%;
  --foreground: 30 15% 96%;
  --glass-bg: 222 30% 14% / 0.55;
  --glass-bg-strong: 222 30% 16% / 0.78;
  --glass-bg-tinted: 220 50% 18% / 0.55;
  --glass-border: 0 0% 100% / 0.12;
  --glass-highlight: 0 0% 100% / 0.18;
  --glass-shadow: 0 0% 0% / 0.6;
}
```

Utility classes:

```css
.glass { background: hsl(var(--glass-bg)); backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)); border: 1px solid hsl(var(--glass-border)); box-shadow: var(--shadow-glass); }
.glass-strong { background: hsl(var(--glass-bg-strong)); backdrop-filter: blur(var(--glass-blur-strong)) saturate(var(--glass-saturate)); }
.glass-tinted { background: hsl(var(--glass-bg-tinted)); }
.lens { box-shadow: var(--shadow-lens); border-radius: var(--radius-lg); }
```

Fallback: when `backdrop-filter` unsupported → bump opacity to `0.9` via `@supports not (backdrop-filter: blur(1px))`.

## 4. Color Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| background | warm paper #F7F4EE | near-black #0E1116 | canvas |
| primary | iOS blue #1E6BFF | #4D8EFF | CTAs, links |
| accent | teal #2EBE8A | #3FD6A0 | progress, success |
| warning | amber #F5A524 | #FFB84A | streaks, attention |
| destructive | coral #E5484D | #FF6B70 | errors |
| glass-tinted-primary | blue tint 6% | blue tint 12% | nav chrome |
| glass-tinted-accent | teal tint 6% | teal tint 12% | progress cards |

Lesson-type color coding (chip + accent stroke only, never full fill):
- Vocab → indigo, Dialogue → teal, Grammar → amber, Quiz → coral, Listening → violet.

## 5. Typography

- **Display (Arabic)**: Tajawal 700/800 — page heroes, lesson titles.
- **Body (Arabic)**: Cairo 400/500/600 — UI + content.
- **Display (EN)**: "SF Pro Display" fallback `Inter Display`, optical-size enabled.
- **Body (EN)**: Inter var, `font-feature-settings: 'ss01','cv11'`.
- **Mono (phonetics)**: JetBrains Mono for IPA.

Scale uses tokens above. Line-height: display 1.15, h1/h2 1.25, body 1.6 (Arabic needs taller leading). Letter-spacing: display -0.02em, body 0.

## 6. Component Redesign

### Cards (`ui/card`)
- Base = `.glass` + `rounded-[var(--radius-lg)]`.
- Add `::before` pseudo for top specular gradient (`linear-gradient(180deg, white/40 0%, transparent 40%)`).
- Hover: lift 4px, blur strengthens to `--glass-blur-strong`, transition `var(--dur) var(--ease-glass)`.
- Variants: `solid` (opaque canvas for long-form text), `glass` (default), `tinted` (color-coded by module).

### Buttons
- Primary: gradient fill + inner highlight + soft glow.
- Secondary: `.glass` pill, 1px highlight border, 44×44 min target.
- Ghost/icon: bare until hover → glass capsule appears with spring.
- All buttons: focus-visible ring uses `hsl(var(--primary) / 0.45)` with 2px offset.

### Bottom Navigation (AppShell)
- Floating glass pill 16px from bottom, `safe-bottom`, `.glass-strong`.
- Active tab: solid pill chip on glass with primary tint, label slides in with spring.
- Hides on scroll-down, returns on scroll-up (Liquid Glass auto-hide chrome).

### PageHeader
- Translucent sticky bar `.glass` with bottom 1px highlight; title size scales down on scroll (Apple shrinking title).
- Back button: glass capsule with chevron mirrored for RTL.

### Lesson Sections
- Each section becomes a stacked card group with rounded `--radius-xl` outer container, internal dividers as 1px highlight lines.
- Dialogue Interactive: option chips are glass pills; correct/wrong reveal uses tint overlay + spring scale 0.96 → 1; feedback box slides up from bottom as a lens-layer sheet.
- FlipCard: 3D flip easing replaced with `var(--ease-glass)` + subtle gloss sweep across face mid-flip.
- Quiz: progress bar uses gradient + animated shine; answer reveal uses haptic-like 1.02 pop.

### Forms (Auth/Reset/Forgot)
- Inputs: glass field with inner top highlight, focus ring expands with blur; floating Arabic label.
- Submit: full-width pill primary; error toast uses lens layer.

### Modals / Sheets / Toaster
- All adopt `.glass-strong` + `.lens` shadow + `--radius-xl`.
- Sheet entry: spring slide + blur fade-in 12px → 0.

### StatCard (Profile)
- Glass tile with large numeric (Tajawal 700), tinted icon disc behind it, subtle progress ring.

### Empty/Loading
- Skeletons use shimmering gradient over `.glass` instead of solid gray.

## 7. Navigation Redesign

- **Mobile**: floating bottom glass pill (Home / Lessons / Practice / Profile + admin slot). RTL-aware order. Hides on scroll.
- **Tablet/Desktop**: collapsible glass sidebar with continuous-radius items; pinned PageHeader on top.
- **Breadcrumb in nested lesson/module**: tiny glass chip with chevron back, replaces extra header rows.
- **Contextual action bar**: per-lesson actions (mark complete, replay audio, toggle interactive) live in a glass action bar floating above the bottom nav.
- **Route transitions**: shared-element morph for module → lesson (card expands into page), 320ms spring.

## 8. Motion System

- Library: keep zero-runtime where possible (CSS transitions + `@keyframes`); add Framer Motion only for shared-layout transitions.
- Standard durations: enter 280ms, exit 200ms, micro 180ms.
- Easing: `--ease-glass` for surfaces, `--ease-emphasized` for content reveals.
- Reduce-motion: `@media (prefers-reduced-motion)` disables blur transitions, swaps morph for fade.

## 9. Accessibility

- Contrast: every glass surface validated against worst-case content beneath (test with photo backgrounds). Text on glass requires `text-foreground` with min 4.5:1; achieved by raising `--glass-bg-strong` opacity to 0.78+ when text sits on chrome.
- Focus: 2px `--primary` ring + 2px offset on all interactive glass elements; never rely on color alone.
- Tap targets: min 44×44; icon buttons get `min-h-11 min-w-11`, `aria-label` mandatory.
- RTL: mirror chevrons, progress, flip animations; verify `dir="rtl"` propagation through Radix portals.
- Reduced transparency: `@media (prefers-reduced-transparency)` → fall back to `--glass-bg-strong` at 0.95 with no blur.
- Reduced motion: disable spring morph, shrinking title, scroll-hide nav.
- Screen reader: live regions on quiz feedback (`aria-live="polite"`), dialogue turn announcements; `lang="en"` wrappers on English keywords inside Arabic copy.
- Color independence: success/error always pair icon + text, not just tint.
- Single `<main>` per route via AppShell `<Outlet />`; one H1 per page.
- Form labels: every input gets a visible Arabic label or `aria-label`; error text linked via `aria-describedby`.

## 10. Rollout Phases

1. **Tokens & utilities** — extend `index.css`, `tailwind.config.ts` (add `glass`, `lens`, radii, easings, fluid type).
2. **Primitives** — Card, Button, Input, Dialog, Sheet, Toaster, Tabs.
3. **Chrome** — AppShell bottom nav, PageHeader, NavLink.
4. **Surfaces** — Home, Lessons, ModuleDetail, Profile.
5. **Lesson experience** — Sections (Dialogue interactive, FlipCard, Quiz), LessonDetail.
6. **Auth flows** — Auth, ForgotPassword, ResetPassword, PendingApproval, PlacementTest.
7. **Admin** — AdminHome/Lessons/Users (lighter glass, denser layout).
8. **Motion polish + a11y audit** — reduced-motion/transparency fallbacks, contrast tests, RTL verification, keyboard pass.
9. **QA** — Playwright visual snapshots on Home / Lesson / Quiz in light + dark, mobile + desktop.

## 11. Risks

- `backdrop-filter` perf on low-end Android — gate strong blur behind `@supports` and viewport size.
- Contrast on photographic backgrounds — enforce `glass-strong` for any surface containing body text.
- RTL regressions in Radix portals — re-test every dialog/popover after token changes.
- Bundle size if Framer Motion is added broadly — restrict to route + shared-element transitions.

## 12. Deliverables When Built

- Updated `src/index.css`, `tailwind.config.ts`.
- New `src/components/ui/glass.tsx` wrapper + variants in Card/Button/Sheet/Dialog.
- Refactored `AppShell`, `PageHeader`, `NavLink`.
- Updated lesson components: `Sections.tsx`, `FlipCard.tsx`, `Quiz.tsx`.
- A11y test additions in `src/pages/__tests__`.
- Storybook-free visual QA via Playwright screenshots under `/tmp/browser/`.
