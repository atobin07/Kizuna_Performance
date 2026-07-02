# Kizuna Performance 絆

**Elite movement. Built to last.**

Full-stack Next.js 14 platform for Kizuna Performance — an elite personal
training & coaching brand. Combines a public marketing site with an
authenticated fitness coaching app in one monorepo.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (custom brand tokens) + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime) with RLS on every table
- **Payments:** Stripe
- **Email:** Kit (ConvertKit)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts · **Animation:** Framer Motion · **Blog:** MDX (next-mdx-remote)
- **Hosting:** Vercel

## Brand tokens

| Token | Hex | Use |
|-------|-----|-----|
| `sumi` | `#0A0A0A` | Primary black / backgrounds |
| `kin` | `#C4922A` | Gold — primary accent, CTAs, 絆 |
| `aka` | `#8B2E2E` | Iron red — secondary / energy |
| `washi` | `#F4F1EC` | Off-white — light text/surfaces |
| `koke` | `#3D3A35` | Moss — muted text/elements |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase / Stripe / Kit keys
npm run dev
```

Apply the database schema to your Supabase project:

```bash
# via Supabase CLI (or paste into the SQL editor)
supabase db push   # runs supabase/migrations/001_initial_schema.sql
# optional dev data:  supabase/seed.sql
```

## Structure

```
app/
  (marketing)/   Public site — home, about, coaching, book, blog
  (app)/         Authenticated app — dashboard, program, workouts,
                 benchmarks, journal, messages, assessments, coach/*
  api/           analytics/track, webhooks/stripe, contact
  auth/callback  Supabase PKCE callback
  login/         Magic-link auth
components/       marketing/ · app/ · coach/ · ui/ (shadcn)
lib/             supabase/ · analytics · stripe · utils
supabase/        migrations/ · seed.sql
middleware.ts    Route protection + coach-role guard
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — Next.js ESLint
