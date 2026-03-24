# 🍄 Flash Fungi v2.0

Mushroom identification training app built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Architecture

```
flash-fungi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, signup, callback)
│   │   ├── (app)/              # Authenticated app routes
│   │   │   ├── study/          # Study modes (Phase 3)
│   │   │   ├── field-guide/    # Species browser
│   │   │   ├── training/       # Training modules
│   │   │   └── profile/        # User profile
│   │   ├── api/                # API Route Handlers
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Tailwind + design tokens
│   ├── components/
│   │   ├── auth/               # Auth form components
│   │   ├── layout/             # App shell, navigation
│   │   ├── study/              # Flashcard engine (Phase 3)
│   │   └── ui/                 # Reusable UI primitives
│   ├── lib/
│   │   ├── supabase/           # Supabase clients (browser, server, middleware)
│   │   └── env.ts              # Environment variable validation
│   ├── types/
│   │   └── database.ts         # TypeScript types for all tables
│   └── middleware.ts            # Auth session refresh middleware
├── supabase/
│   └── migrations/             # SQL schema + data migrations
├── vercel.json                 # Vercel deployment config
└── .env.example                # Environment variable template
```

## Security Model

| Layer | Approach |
|-------|----------|
| **Auth** | Supabase Auth — emails/passwords never stored in app tables |
| **Passwords** | bcrypt hashed by Supabase Auth, never accessible to app code |
| **Sessions** | JWT tokens in HTTP-only cookies, refreshed via middleware |
| **API Keys** | `NEXT_PUBLIC_*` for browser (anon key), server-only for service role |
| **RLS** | Row Level Security on all tables — users can only access their own data |
| **Admin** | Service role key (bypasses RLS) — only used in server-side code |
| **CSRF** | Handled by Supabase Auth's PKCE flow |
| **Route Protection** | Middleware redirects unauthenticated users, plus server-side checks |

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Vercel account (for deployment)

### 1. Clone and install

```bash
git clone <repo-url>
cd flash-fungi
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from same location
- `SUPABASE_SERVICE_ROLE_KEY` — from same location (keep this SECRET)

### 3. Set up database

Run the SQL migration in Supabase SQL Editor:

1. Open `supabase/migrations/001_initial_schema.sql`
2. Paste into Supabase SQL Editor and run
3. (Optional) If migrating from v1, run `002_migrate_v1_data.sql`

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard → Settings → Environment Variables.

**CRITICAL:** `SUPABASE_SERVICE_ROLE_KEY` must be set as a server-only env var in Vercel (not prefixed with `NEXT_PUBLIC_`).

## Development Phases

| Phase | Status | Focus |
|-------|--------|-------|
| **Phase 0** | ✅ Complete | Project setup, auth, types, layout, Supabase integration |
| **Phase 1** | 🔲 Next | Clean schema migration, seed data, typed API client |
| **Phase 2** | 🔲 | Admin portal (separate app), specimen + field guide management |
| **Phase 3** | 🔲 | Flashcard engine, hint system, study modes, session tracking |
| **Phase 4** | 🔲 | Field guide browser with detail pages, search, photos |
| **Phase 5** | 🔲 | Pipeline v2 (configurable ingestion, admin trigger) |
| **Phase 6** | 🔲 | Spaced repetition, offline caching, PWA, onboarding |

## Design System

The "Living Mycology" theme uses earth-tone colors defined as Tailwind CSS theme tokens in `globals.css`. All colors are available as utility classes:

- `bg-fungi-bg`, `bg-fungi-bg-card`, `bg-fungi-bg-secondary`
- `text-fungi-text`, `text-fungi-text-secondary`, `text-fungi-text-muted`
- `text-fungi-accent`, `bg-fungi-primary`, `bg-fungi-secondary`
- `from-fungi-primary to-fungi-secondary` (gradients)
