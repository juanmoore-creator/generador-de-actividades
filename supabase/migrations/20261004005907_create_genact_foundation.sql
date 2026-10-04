-- GenAct's first application schema. Auth owns identity; public profiles contain
-- presentation fields only. Community posts are independent published copies.

create table public.profiles (
  id uuid primary key default auth.uid()
    references auth.users (id) on delete cascade,
  display_name text not null default ''
    check (length(btrim(display_name)) <= 80),
  avatar_url text
    check (avatar_url is null or length(avatar_url) <= 2048),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.activities (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 160),
  type text not null check (type in (
    'wordsearch', 'crossword', 'scramble', 'matching', 'cryptogram', 'cloze',
    'rosco', 'sudoku', 'mathpyramid', 'crossmath', 'maze', 'pixelart'
  )),
  difficulty text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard')),
  folder text not null default 'General'
    check (length(btrim(folder)) between 1 and 80),
  notes text not null default '' check (length(notes) <= 4000),
  is_favorite boolean not null default false,
  snapshot jsonb not null check (pg_catalog.jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.community_feed (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 160),
  type text not null check (type in (
    'wordsearch', 'crossword', 'scramble', 'matching', 'cryptogram', 'cloze',
    'rosco', 'sudoku', 'mathpyramid', 'crossmath', 'maze', 'pixelart'
  )),
  subject text not null default 'General'
    check (length(btrim(subject)) between 1 and 80),
  grade text not null default 'Primaria'
    check (length(btrim(grade)) between 1 and 80),
  description text not null default '' check (length(description) <= 3000),
  tags text[] not null default '{}'
    check (pg_catalog.cardinality(tags) <= 12 and pg_catalog.array_position(tags, null) is null),
  snapshot jsonb not null check (pg_catalog.jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.community_likes (
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  community_id uuid not null
    references public.community_feed (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, community_id)
);

create index activities_owner_created_idx
  on public.activities (user_id, created_at desc);
create index activities_owner_folder_created_idx
  on public.activities (user_id, folder, created_at desc);
create index community_feed_created_idx
  on public.community_feed (created_at desc);
create index community_feed_author_created_idx
  on public.community_feed (author_id, created_at desc);
create index community_feed_subject_created_idx
  on public.community_feed (subject, created_at desc);
create index community_likes_community_idx
  on public.community_likes (community_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();
create trigger community_feed_set_updated_at
  before update on public.community_feed
  for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.community_feed enable row level security;
alter table public.community_likes enable row level security;

revoke all on table public.profiles, public.activities,
  public.community_feed, public.community_likes from public, anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.activities to authenticated;
grant select on table public.community_feed to anon, authenticated;
grant insert, update, delete on table public.community_feed to authenticated;
grant select, insert, delete on table public.community_likes to authenticated;

create policy profiles_public_read
  on public.profiles for select to anon, authenticated
  using (true);
create policy profiles_insert_self
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) is not null and id = (select auth.uid()));
create policy profiles_update_self
  on public.profiles for update to authenticated
  using ((select auth.uid()) is not null and id = (select auth.uid()))
  with check ((select auth.uid()) is not null and id = (select auth.uid()));

create policy activities_select_owner
  on public.activities for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy activities_insert_owner
  on public.activities for insert to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy activities_update_owner
  on public.activities for update to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy activities_delete_owner
  on public.activities for delete to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy community_feed_public_read
  on public.community_feed for select to anon, authenticated
  using (true);
create policy community_feed_insert_author
  on public.community_feed for insert to authenticated
  with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
create policy community_feed_update_author
  on public.community_feed for update to authenticated
  using ((select auth.uid()) is not null and author_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
create policy community_feed_delete_author
  on public.community_feed for delete to authenticated
  using ((select auth.uid()) is not null and author_id = (select auth.uid()));

create policy community_likes_select_self
  on public.community_likes for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy community_likes_insert_self
  on public.community_likes for insert to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy community_likes_delete_self
  on public.community_likes for delete to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
