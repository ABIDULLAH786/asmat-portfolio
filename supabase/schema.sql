-- =====================================================================
-- Asmat Portfolio — Supabase schema
-- Run this in the Supabase SQL editor (one shot).
-- =====================================================================

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =====================================================================
-- 1. Site settings (single row)
-- =====================================================================
create table if not exists public.site_settings (
  id              int primary key default 1,
  logo_url        text,
  logo_size       int default 60 check (logo_size in (60, 80, 100)),
  resume_url      text,
  resume_label    text default 'Download Resume',
  profile_image   text,
  hero_name       text default 'Asmat Muntazir',
  brand_name      text,
  hero_tagline    text default 'Graphic Designer crafting modern, tech-inspired visuals.',
  hero_intro      text default 'I design clean visual identities, illustrations and packaging that turn ideas into brands.',
  portfolio_pagination_enabled boolean default false,
  portfolio_per_page           int default 9 check (portfolio_per_page between 1 and 100),
  updated_at      timestamptz default now(),
  constraint site_settings_singleton check (id = 1)
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Idempotent additions for existing installs
alter table public.site_settings add column if not exists portfolio_pagination_enabled boolean default false;
alter table public.site_settings add column if not exists portfolio_per_page int default 9;
do $$ begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'site_settings' and constraint_name = 'site_settings_per_page_range'
  ) then
    alter table public.site_settings
      add constraint site_settings_per_page_range check (portfolio_per_page between 1 and 100);
  end if;
end $$;

-- =====================================================================
-- 2. About content (single row)
-- =====================================================================
create table if not exists public.about_content (
  id           int primary key default 1,
  intro        text default 'I''m a graphic designer with 1+ year of experience building modern, clean and tech-inspired identities.',
  journey      text default 'My journey began with a love for typography and bold colour. Today I help brands and individuals tell stories through design.',
  show_skill_bars boolean default true,
  updated_at   timestamptz default now(),
  constraint about_content_singleton check (id = 1)
);
insert into public.about_content (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- 3. Core values
-- =====================================================================
create table if not exists public.core_values (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  icon         text,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- =====================================================================
-- 4. Skills
-- =====================================================================
create table if not exists public.skills (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  percentage   int not null default 50 check (percentage between 0 and 100),
  show_bar     boolean default true,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- =====================================================================
-- 5. Experience
-- =====================================================================
create table if not exists public.experiences (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  role         text not null,
  description  text,
  start_date   date not null,
  end_date     date, -- null = present
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- =====================================================================
-- 6. Categories (portfolio)
-- =====================================================================
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  slug         text not null unique,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- Only seed default categories on a fresh install. Once any category exists
-- (e.g. after seed.sql has replaced them with user's real list), this is a
-- no-op so re-running schema.sql is safe.
insert into public.categories (name, slug, sort_order)
select * from (values
  ('Art & Illustration',          'art-illustration',          1),
  ('Visual Identity Design',      'visual-identity',           2),
  ('Marketing & Advertising Design', 'marketing-advertising', 3),
  ('Publication Design',          'publication',               4),
  ('Packaging Design',            'packaging',                 5),
  ('Environmental Design',        'environmental',             6)
) as t(name, slug, sort_order)
where not exists (select 1 from public.categories);

-- =====================================================================
-- 7. Projects + slides
-- =====================================================================
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  cover_image   text,
  source_url    text,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
-- Idempotent: existing installs get the column added too
alter table public.projects add column if not exists source_url text;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

create table if not exists public.project_slides (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  title         text,
  description   text,
  images        text[] default '{}'::text[],
  sort_order    int default 0,
  created_at    timestamptz default now()
);
create index if not exists idx_project_slides_project on public.project_slides(project_id);

-- =====================================================================
-- 8. Process steps
-- =====================================================================
create table if not exists public.process_steps (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  icon          text,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- =====================================================================
-- 9. Contact info (single row)
-- =====================================================================
create table if not exists public.contact_info (
  id           int primary key default 1,
  email        text default 'asmat@gmail.com',
  phone        text,
  location     text default 'Pakistan',
  blurb        text default 'Available for freelance work and collaborations.',
  updated_at   timestamptz default now(),
  constraint contact_info_singleton check (id = 1)
);
insert into public.contact_info (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- 10. Social links (one table, three zones)
--     zone in ('contact', 'follow_work', 'footer')
-- =====================================================================
create table if not exists public.social_links (
  id           uuid primary key default gen_random_uuid(),
  zone         text not null check (zone in ('contact', 'follow_work', 'footer')),
  label        text not null,
  url          text not null,
  icon         text not null, -- react-icons string e.g. "FaLinkedin"
  sort_order   int default 0,
  created_at   timestamptz default now()
);
create index if not exists idx_social_links_zone on public.social_links(zone);

-- Seed default footer + follow-my-work icons (idempotent on label+zone)
do $$
begin
  if not exists (select 1 from public.social_links where zone = 'follow_work' limit 1) then
    insert into public.social_links (zone, label, url, icon, sort_order) values
      ('follow_work', 'LinkedIn',  'https://www.linkedin.com/',  'FaLinkedinIn', 1),
      ('follow_work', 'Behance',   'https://www.behance.net/',   'FaBehance',    2),
      ('follow_work', 'Dribbble',  'https://dribbble.com/',      'FaDribbble',   3),
      ('follow_work', 'Instagram', 'https://www.instagram.com/', 'FaInstagram',  4),
      ('follow_work', 'Facebook',  'https://www.facebook.com/',  'FaFacebookF',  5),
      ('follow_work', 'TikTok',    'https://www.tiktok.com/',    'FaTiktok',     6);
  end if;
  if not exists (select 1 from public.social_links where zone = 'footer' limit 1) then
    insert into public.social_links (zone, label, url, icon, sort_order) values
      ('footer', 'LinkedIn',  'https://www.linkedin.com/',  'FaLinkedinIn', 1),
      ('footer', 'Instagram', 'https://www.instagram.com/', 'FaInstagram',  2),
      ('footer', 'Facebook',  'https://www.facebook.com/',  'FaFacebookF',  3),
      ('footer', 'Behance',   'https://www.behance.net/',   'FaBehance',    4),
      ('footer', 'Dribbble',  'https://dribbble.com/',      'FaDribbble',   5);
  end if;
end $$;

-- =====================================================================
-- 11. Notes
-- =====================================================================
create table if not exists public.notes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  thumbnail_url text,
  file_url      text,
  external_link text,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint notes_has_resource check (file_url is not null or external_link is not null)
);
drop trigger if exists trg_notes_updated on public.notes;
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 12. Contact messages
-- =====================================================================
create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  subject       text,
  message       text not null,
  is_read       boolean default false,
  created_at    timestamptz default now()
);
create index if not exists idx_contact_messages_created on public.contact_messages(created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.site_settings    enable row level security;
alter table public.about_content    enable row level security;
alter table public.core_values      enable row level security;
alter table public.skills           enable row level security;
alter table public.experiences      enable row level security;
alter table public.categories       enable row level security;
alter table public.projects         enable row level security;
alter table public.project_slides   enable row level security;
alter table public.process_steps    enable row level security;
alter table public.contact_info     enable row level security;
alter table public.social_links     enable row level security;
alter table public.notes            enable row level security;
alter table public.contact_messages enable row level security;

-- Public read on every content table
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'site_settings','about_content','core_values','skills','experiences',
      'categories','projects','project_slides','process_steps','contact_info',
      'social_links','notes'
    ])
  loop
    execute format(
      'drop policy if exists "public read %I" on public.%I; ' ||
      'create policy "public read %I" on public.%I for select using (true);',
      t, t, t, t
    );
  end loop;
end $$;

-- Contact messages: anonymous can INSERT (form submissions); only auth can read.
drop policy if exists "anon insert messages" on public.contact_messages;
create policy "anon insert messages" on public.contact_messages
  for insert with check (true);
drop policy if exists "auth read messages" on public.contact_messages;
create policy "auth read messages" on public.contact_messages
  for select using (auth.role() = 'authenticated');
drop policy if exists "auth update messages" on public.contact_messages;
create policy "auth update messages" on public.contact_messages
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "auth delete messages" on public.contact_messages;
create policy "auth delete messages" on public.contact_messages
  for delete using (auth.role() = 'authenticated');

-- All writes for the rest: authenticated only
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'site_settings','about_content','core_values','skills','experiences',
      'categories','projects','project_slides','process_steps','contact_info',
      'social_links','notes'
    ])
  loop
    execute format('drop policy if exists "auth write %I" on public.%I;', t, t);
    execute format(
      'create policy "auth write %I" on public.%I ' ||
      'for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t, t
    );
  end loop;
end $$;

-- =====================================================================
-- Storage buckets (run in SQL editor as well)
-- =====================================================================
insert into storage.buckets (id, name, public) values
  ('logos',     'logos',     true),
  ('profiles',  'profiles',  true),
  ('projects',  'projects',  true),
  ('resumes',   'resumes',   true),
  ('notes',     'notes',     true),
  ('thumbnails','thumbnails',true)
on conflict (id) do nothing;

-- Storage policies: public read, authenticated write/delete
do $$
declare b text;
begin
  for b in select unnest(array['logos','profiles','projects','resumes','notes','thumbnails'])
  loop
    execute format(
      'drop policy if exists "%I public read" on storage.objects;',
      b || '_read'
    );
    execute format(
      'create policy "%I public read" on storage.objects for select using (bucket_id = %L);',
      b || '_read', b
    );
    execute format(
      'drop policy if exists "%I auth write" on storage.objects;',
      b || '_write'
    );
    execute format(
      'create policy "%I auth write" on storage.objects for insert with check (bucket_id = %L and auth.role() = ''authenticated'');',
      b || '_write', b
    );
    execute format(
      'drop policy if exists "%I auth update" on storage.objects;',
      b || '_update'
    );
    execute format(
      'create policy "%I auth update" on storage.objects for update using (bucket_id = %L and auth.role() = ''authenticated'');',
      b || '_update', b
    );
    execute format(
      'drop policy if exists "%I auth delete" on storage.objects;',
      b || '_delete'
    );
    execute format(
      'create policy "%I auth delete" on storage.objects for delete using (bucket_id = %L and auth.role() = ''authenticated'');',
      b || '_delete', b
    );
  end loop;
end $$;

-- =====================================================================
-- Done.
-- After running:
--   1. In the Supabase Dashboard → Authentication → Users, create user
--      asmat@gmail.com with password Asm@t786 (or use Auth → Add user).
--   2. In Authentication → Providers → Email, DISABLE "Allow new users to sign up".
--   3. Copy the SUPABASE_URL, anon key and service_role key into .env.local.
-- =====================================================================
