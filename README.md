# LifeVault

**LifeVault** is a full-stack Personal Life Management Platform — an all-in-one digital life organizer where users securely manage documents, tasks, goals, diary entries, future messages, and emergency profiles from one premium dashboard.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3FCF8E?logo=supabase)

## Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | Sign up, login, forgot password, secure sessions |
| **Dashboard** | Welcome, stats, activity timeline, reminders, productivity |
| **Document Vault** | Upload, view, search, download, delete — 6 categories |
| **Smart To-Do** | Priorities, due dates, recurring tasks, progress tracking |
| **Personal Diary** | Journal entries, mood tracking, calendar view, search |
| **Goal Tracker** | Deadlines, progress bars, categories, achievements |
| **Future Messages** | Letters to future self with auto-unlock & countdown |
| **Emergency Profile** | Medical info, contacts, QR code public page |
| **Analytics** | Task charts, goal progress, mood analytics |
| **Life Timeline** | Chronological view of all important life events |
| **Global Search** | Search across all modules |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **UI:** Glassmorphism design, dark/light mode, responsive layout
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
LifeVault/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, AppLayout, route guards
│   │   └── ui/           # Button, Card, Modal, Input, etc.
│   ├── contexts/         # Auth & Theme providers
│   ├── hooks/            # Supabase queries, timeline, search
│   ├── lib/              # Supabase client, utilities
│   ├── pages/            # All feature pages
│   │   └── auth/         # Login, signup, forgot password
│   └── types/            # TypeScript database types
├── supabase/
│   ├── migrations/       # SQL schema & RLS policies
│   └── seed.sql          # Sample data & demo seed function
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
cd LifeVault
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Add your project URL and anon key from **Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

In the Supabase **SQL Editor**, run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage.sql`
3. `supabase/migrations/003_emergency_public_rpc.sql`
4. `supabase/seed.sql` (optional — adds the demo seed function)

### 4. Configure Auth

In Supabase Dashboard → **Authentication → URL Configuration**:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

Enable **Email** provider under Authentication → Providers.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account, and explore.

### 6. Load Sample Data (Optional)

After signing in, run in Supabase SQL Editor:

```sql
SELECT public.seed_demo_data();
```

Or call from the browser console while logged in:

```javascript
await supabase.rpc('seed_demo_data')
```

## Deployment

### Frontend (Vercel / Netlify)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `npm run build`
5. Output directory: `dist`

### Update Supabase Auth URLs

Add your production URL to Supabase **Authentication → URL Configuration**:

```
https://your-app.vercel.app
https://your-app.vercel.app/**
```

### Supabase Production Checklist

- [ ] All migrations applied
- [ ] Storage bucket `documents` created with RLS policies
- [ ] RLS enabled on all tables
- [ ] Email confirmation settings configured
- [ ] Rate limiting reviewed

## Security

- **Row Level Security (RLS)** on every table — users only access their own data
- **Storage policies** scoped to user folders (`user_id/filename`)
- **Emergency QR** uses a token-based RPC — only user-approved fields are exposed
- **Private diary** protected by RLS (consider client-side encryption for production)
- Never expose `service_role` key in frontend code

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT — free to use for portfolio and internship projects.

---

Built with care for organizing life's most important moments. 🔐
