# Asmat Portfolio — Setup

A modern, dynamic portfolio website with a Supabase-backed CMS at `/asmat-cms-edit`.

## 1. Prerequisites

- Node.js 20+ (this project was scaffolded on Node 24)
- A Supabase project (free tier is fine)

## 2. Configure environment variables

Edit `.env.local` (already present with your project's keys):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key is **server-only**. Never import it from a client component.

## 3. Run the SQL migration

1. Open the Supabase Dashboard → **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql` and paste it into a new query → **Run**. This creates all tables, default categories, default social links, storage buckets, and RLS policies.
3. (Optional, recommended) Run `supabase/seed.sql` next — this **replaces** the empty defaults with the user's real portfolio data (31 projects, 16 image galleries, 6 core values, 4 skills, 6 experiences, 7 process steps, 14 social links, 10 categories) and adds 5 extra columns to preserve everything from the JSON exports (`skills.category`, `skills.icon_url`, `experiences.logo_url`, `about_content.bio`, `projects.tags`, `projects.featured`).

⚠ `seed.sql` deletes existing rows in the multi-row tables before inserting — do not run it after you've added content via the admin you want to keep.

Both scripts are idempotent — safe to re-run.

## 4. Create the admin user

In the Supabase Dashboard:

1. **Authentication → Providers → Email** → make sure **Email** is enabled.
2. **Authentication → Providers → Email** → switch off **"Allow new users to sign up"**. (Public sign-ups must be disabled.)
3. **Authentication → Users → Add user → Create new user**:
   - Email: `asmat@gmail.com`
   - Password: `Asm@t786`
   - Auto-confirm user: **on**
4. **Authentication → URL Configuration → Site URL**: set to your deployed URL (or `http://localhost:3000` for development). Add the same URL to **Redirect URLs** so password-reset emails land on `/asmat-cms-edit/reset`.

## 5. Run the app

```bash
npm install   # already done
npm run dev
```

- Public site: <http://localhost:3000>
- Admin login: <http://localhost:3000/asmat-cms-edit/login>

## 6. Things to do in the admin

After signing in, walk through every section once:

- **Site** — upload your logo, choose a size, set hero text, upload a profile image and a resume.
- **About** — write your intro/journey, add core values, add skills (try the master toggle), add experience entries (duration auto-calculates).
- **Projects** — add new categories on-the-fly while editing a project. Each project supports multiple "tabs" (slides), each with multiple images.
- **Process** — add your workflow steps and pick icons from the searchable picker.
- **Contact** — edit email/phone/location and manage three independent social-link zones (contact extras, "Follow My Work", footer).
- **Notes** — upload a file *or* paste an external link (or both).
- **Messages** — every contact-form submission lands here.

## 7. Production build

```bash
npm run build
npm start
```

## 8. Security checklist

- Rotate the service-role key in **Settings → API → Reset service_role key** after sharing it during development.
- Confirm sign-ups are disabled (step 4.2).
- The `/asmat-cms-edit` URL is non-guessable by name only — Supabase Auth (cookies + RLS) is the actual access control.

## 9. Project layout

```
src/
  app/
    (site)/                  ← public pages
    asmat-cms-edit/          ← admin CMS
      login/                 ← sign-in + forgot-password
      reset/                 ← set new password
      about/  contact/  …    ← one folder per CMS section
    api/contact/route.ts     ← contact form endpoint
  components/
    site/                    ← public components (Header, Footer, Cursor, Loader, …)
    admin/                   ← AdminShell, IconPicker
    ui/                      ← Button, Input
  lib/
    supabase/                ← clients + types
    icons.ts                 ← react-icons library router
    queries.ts               ← server data fetchers
    upload.ts                ← Supabase Storage helpers
    utils.ts                 ← cn(), slugify(), durationBetween()
  middleware.ts              ← protects /asmat-cms-edit
supabase/
  schema.sql                 ← run once in the SQL editor
```

## 10. Troubleshooting

- **"new row violates row-level security policy"** while saving from the admin: you're not signed in. Visit `/asmat-cms-edit/login`.
- **Images don't render**: confirm `next.config.ts` `remotePatterns` matches your Supabase host (it auto-derives from `NEXT_PUBLIC_SUPABASE_URL`).
- **Reset link doesn't redirect**: add `http://localhost:3000/asmat-cms-edit/reset` to Authentication → URL Configuration → Redirect URLs.
