# AEGIS

A SOC 2 assessment platform for AI agent security engagements. Aegis tracks
security engagements, logs findings mapped to SOC 2 Common Criteria controls,
and generates auditor-facing PDF reports.

Built with Next.js 14, TypeScript, Supabase (Postgres + Auth), Tailwind CSS,
and shadcn/ui.

## Features

- **Engagements** – create and track client engagements with an
  `in_progress` / `complete` status.
- **Findings** – log findings per engagement with a severity
  (`critical` / `high` / `medium` / `low`), the affected agent, an
  `open` / `remediated` status, and a mapped SOC 2 control.
- **SOC 2 control mapping** – each finding maps to one of six Common Criteria
  controls:

  | Control | Description |
  |---------|-------------|
  | CC6.1 | Logical Access Controls |
  | CC6.3 | Access Privilege Management |
  | CC6.7 | Data Transmission Protection |
  | CC6.8 | Malicious Software Prevention |
  | CC7.1 | Vulnerability Management |
  | CC7.2 | Security Incident Monitoring |

- **Reports** – generate a report from an engagement's findings, including an
  executive summary, severity breakdown, per-finding detail, and a SOC 2
  control-coverage matrix. Export to PDF (client-side via `html2pdf.js`) and
  mark as `final`.
- **Dashboard** – live counts of total/active engagements and total/open
  findings.
- **Auth & tenancy** – Supabase email/password auth with SSR cookie sessions.
  Every table has row-level security, so users only ever see their own
  engagements, findings, and reports.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Database | Supabase Postgres with row-level security |
| Auth | Supabase Auth via `@supabase/ssr` |
| UI | Tailwind CSS, shadcn/ui (Radix primitives), lucide-react |
| PDF export | `html2pdf.js` |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are in your Supabase dashboard under **Project Settings → API**.

### 3. Apply the database schema

Run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
against your project, either through the Supabase SQL editor or with the CLI:

```bash
supabase db push
```

This creates the `engagements`, `findings`, and `reports` tables and their RLS
policies.

### 4. Create a user

Aegis has no sign-up page. Create a user in the Supabase dashboard under
**Authentication → Users**, then sign in at `/login`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx                      # Public landing page
│   ├── login/                        # Sign-in form
│   └── (protected)/dashboard/        # Auth-gated app
│       ├── page.tsx                  # Dashboard stats
│       ├── engagements/              # List / create engagements
│       │   └── [id]/
│       │       ├── page.tsx          # Engagement detail
│       │       └── findings/         # Findings for an engagement
│       └── reports/[reportId]/       # Report view + PDF export
├── components/
│   ├── sidebar.tsx
│   └── ui/                           # shadcn/ui components
├── lib/supabase/                     # Browser, server, and middleware clients
├── middleware.ts                     # Session refresh + route protection
└── types/
supabase/migrations/                  # Database schema
```

## Data model

```
engagements (user_id → auth.users)
└── findings (engagement_id)
└── reports  (engagement_id)
```

Access is enforced in Postgres: `engagements` rows are visible only to their
`user_id`, and `findings` / `reports` rows are visible only through an
engagement the user owns.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Deployment

The app is set up for Vercel. Add the two `NEXT_PUBLIC_SUPABASE_*` environment
variables in the Vercel project settings and deploy:

```bash
vercel --prod
```

## License

MIT — see [LICENSE](LICENSE).
