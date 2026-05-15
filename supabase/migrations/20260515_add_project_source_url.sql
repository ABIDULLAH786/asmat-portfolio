-- Add a source_url column to projects so the admin can attach a public link
-- to where the project lives (Dribbble / Behance / Instagram / etc.).
-- Nullable + idempotent — projects without an upstream profile leave it blank.

alter table public.projects
  add column if not exists source_url text;
