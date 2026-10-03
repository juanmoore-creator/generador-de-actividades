-- =============================================================================
-- GenAct · esquema inicial (Supabase / PostgreSQL)
-- Perfiles docentes, fichas guardadas, biblioteca comunitaria y "me gusta".
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  school text not null default '',
  role text not null default 'Docente',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse (usa el nombre enviado en signUp).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Fichas guardadas (privadas de cada docente)
-- -----------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  difficulty text not null default 'medium',
  folder text not null default 'General',
  notes text not null default '',
  is_favorite boolean not null default false,
  is_published boolean not null default false,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_idx on public.activities (user_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- Biblioteca comunitaria (pública)
-- -----------------------------------------------------------------------------
create table if not exists public.community_feed (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  difficulty text not null default 'medium',
  subject text not null default 'General',
  grade text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  snapshot jsonb not null,
  likes_count integer not null default 0,
  downloads_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_created_idx on public.community_feed (created_at desc);
create index if not exists community_type_idx on public.community_feed (type);

create table if not exists public.community_likes (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  community_id uuid not null references public.community_feed(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

-- Mantiene likes_count sincronizado.
create or replace function public.sync_likes_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_feed set likes_count = likes_count + 1 where id = new.community_id;
  elsif tg_op = 'DELETE' then
    update public.community_feed set likes_count = greatest(likes_count - 1, 0) where id = old.community_id;
  end if;
  return null;
end;
$$;

drop trigger if exists community_likes_count on public.community_likes;
create trigger community_likes_count
  after insert or delete on public.community_likes
  for each row execute function public.sync_likes_count();

-- Contador de descargas (cualquiera puede sumar, nadie puede editar el resto).
create or replace function public.increment_download(community_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.community_feed set downloads_count = downloads_count + 1 where id = community_id;
$$;

grant execute on function public.increment_download(uuid) to anon, authenticated;

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists activities_touch on public.activities;
create trigger activities_touch before update on public.activities for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Seguridad a nivel de fila
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.community_feed enable row level security;
alter table public.community_likes enable row level security;

-- Perfiles: el nombre y la escuela se muestran como autor en la comunidad.
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Fichas guardadas: sólo su dueño.
create policy "ver mis fichas" on public.activities for select using ((select auth.uid()) = user_id);
create policy "crear mis fichas" on public.activities for insert with check ((select auth.uid()) = user_id);
create policy "editar mis fichas" on public.activities for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "borrar mis fichas" on public.activities for delete using ((select auth.uid()) = user_id);

-- Comunidad: lectura pública; cada docente gestiona lo que publicó.
create policy "leer comunidad" on public.community_feed for select using (true);
create policy "publicar en comunidad" on public.community_feed for insert with check ((select auth.uid()) = author_id);
create policy "editar mi publicación" on public.community_feed for update using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy "retirar mi publicación" on public.community_feed for delete using ((select auth.uid()) = author_id);

-- Me gusta: cada docente ve y gestiona los suyos.
create policy "ver mis me gusta" on public.community_likes for select using ((select auth.uid()) = user_id);
create policy "dar me gusta" on public.community_likes for insert with check ((select auth.uid()) = user_id);
create policy "quitar me gusta" on public.community_likes for delete using ((select auth.uid()) = user_id);

-- Los contadores sólo cambian vía triggers/funciones (que corren como dueño de la tabla):
-- si un cliente intenta editarlos directamente, se conservan los valores anteriores.
create or replace function public.protect_counters()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.likes_count = 0;
      new.downloads_count = 0;
    else
      new.likes_count = old.likes_count;
      new.downloads_count = old.downloads_count;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists community_protect_counters on public.community_feed;
create trigger community_protect_counters
  before insert or update on public.community_feed
  for each row execute function public.protect_counters();
