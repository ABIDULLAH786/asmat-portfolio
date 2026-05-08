-- Split header brand text from the home-hero display name.
-- Run once in the Supabase SQL editor.

alter table public.site_settings
  add column if not exists brand_name text;

-- Backfill existing row(s) so the header keeps its current text after the
-- column is added; admins can edit it independently afterwards.
update public.site_settings
   set brand_name = hero_name
 where brand_name is null;
