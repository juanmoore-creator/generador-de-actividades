-- Align profiles, activities and community_feed with app frontend requirements
alter table public.profiles
  add column if not exists name text not null default '' check (length(btrim(name)) <= 80),
  add column if not exists school text not null default '' check (length(btrim(school)) <= 120),
  add column if not exists role text not null default 'Docente' check (length(btrim(role)) <= 80),
  add column if not exists preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object');

alter table public.activities
  add column if not exists is_published boolean not null default false;

alter table public.community_feed
  add column if not exists likes_count integer not null default 0 check (likes_count >= 0),
  add column if not exists downloads_count integer not null default 0 check (downloads_count >= 0);
