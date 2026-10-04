-- Add only the fields required by the current app; retain the deployed foundation's privacy boundaries.

create table public.profile_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  school text not null default '' check (length(school) <= 120),
  role text not null default 'Docente' check (length(role) between 1 and 80),
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_settings enable row level security;
grant select, insert, update, delete on public.profile_settings to authenticated;
create policy profile_settings_select_self on public.profile_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy profile_settings_insert_self on public.profile_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profile_settings_update_self on public.profile_settings
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy profile_settings_delete_self on public.profile_settings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- The latest app's activity catalog has two generator types absent from the first migration.
alter table public.activities drop constraint activities_type_check;
alter table public.activities add constraint activities_type_check check (type in (
  'wordsearch', 'crossword', 'scramble', 'matching', 'cryptogram', 'cloze',
  'rosco', 'bingo', 'sudoku', 'mathpyramid', 'crossmath', 'mathchain', 'maze', 'pixelart'
));
alter table public.community_feed drop constraint community_feed_type_check;
alter table public.community_feed add constraint community_feed_type_check check (type in (
  'wordsearch', 'crossword', 'scramble', 'matching', 'cryptogram', 'cloze',
  'rosco', 'bingo', 'sudoku', 'mathpyramid', 'crossmath', 'mathchain', 'maze', 'pixelart'
));

alter table public.community_feed
  add column difficulty text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard')),
  add column source_activity_id uuid;

-- Keep publication payload as an independent public copy, while making its owner-side
-- published state recoverable. The composite FK prevents linking another owner's draft.
create unique index activities_owner_id_id_uidx on public.activities (user_id, id);
alter table public.community_feed
  add constraint community_feed_source_activity_owner_fkey
  foreign key (author_id, source_activity_id)
  references public.activities (user_id, id) on delete cascade;
create unique index community_feed_author_source_activity_uidx
  on public.community_feed (author_id, source_activity_id)
  where source_activity_id is not null;
