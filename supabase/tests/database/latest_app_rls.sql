-- Rollback-only checks for additive compatibility objects and RLS policies.
-- Synthetic identities and all writes are contained in BEGIN/ROLLBACK.
begin;

do $$
begin
  if to_regclass('public.profile_settings') is null
    or to_regclass('public.activities') is null
    or to_regclass('public.community_feed') is null
    or to_regclass('public.community_likes') is null then
    raise exception 'RED: required tables are not installed';
  end if;
end;
$$;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'db03-a@example.invalid', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated', 'db03-b@example.invalid', '', now(), '{}', '{}', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
insert into public.profiles (id, name, display_name) values ('00000000-0000-4000-8000-0000000000a1', 'DB03 A', 'DB03 A')
  on conflict (id) do update set name = excluded.name;
insert into public.profile_settings (user_id, school, role, preferences)
values ('00000000-0000-4000-8000-0000000000a1', 'A school', 'Docente', '{"defaultPageSize":"A4"}');
insert into public.activities (title, type, difficulty, snapshot)
values ('A bingo draft', 'bingo', 'easy', '{"type":"bingo"}');
insert into public.community_feed (title, type, difficulty, snapshot, source_activity_id)
select 'A public bingo', 'bingo', 'easy', '{"type":"bingo"}', id
from public.activities where title = 'A bingo draft';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
insert into public.profiles (id, name, display_name) values ('00000000-0000-4000-8000-0000000000b2', 'DB03 B', 'DB03 B')
  on conflict (id) do update set name = excluded.name;
insert into public.profile_settings (user_id, school) values ('00000000-0000-4000-8000-0000000000b2', 'B private school');
insert into public.activities (title, type, snapshot)
values ('B mathchain draft', 'mathchain', '{"type":"mathchain"}');

do $$
declare v_rows integer; v_b_activity uuid;
begin
  if (select count(*) from public.profile_settings where school = 'A school') <> 0 then
    raise exception 'B must not read A private settings';
  end if;
  if (select count(*) from public.activities where title = 'A bingo draft') <> 0 then
    raise exception 'B must not read A private activity';
  end if;
  select id into v_b_activity from public.activities where title = 'B mathchain draft';
  update public.profile_settings set school = 'spoofed' where user_id = '00000000-0000-4000-8000-0000000000a1';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'cross-user settings update must affect zero rows'; end if;
  delete from public.profile_settings where user_id = '00000000-0000-4000-8000-0000000000a1';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'cross-user settings delete must affect zero rows'; end if;
  begin
    insert into public.profile_settings (user_id, school)
    values ('00000000-0000-4000-8000-0000000000a1', 'spoofed');
    raise exception 'expected settings owner spoof rejection';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.community_feed (title, type, snapshot, source_activity_id)
    values ('Cross-owner link', 'bingo', '{}', v_b_activity);
    raise exception 'expected cross-owner publication link rejection';
  exception when foreign_key_violation then null;
  end;
  if (select count(*) from public.community_feed where title = 'A public bingo') <> 1 then
    raise exception 'published copy must remain public';
  end if;
  begin
    insert into public.activities (title, type, snapshot)
    values ('Invalid type', 'unknown', '{}');
    raise exception 'expected type constraint rejection';
  exception when check_violation then null;
  end;
end;
$$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  if (select count(*) from public.community_feed where title = 'A public bingo') <> 1 then
    raise exception 'anonymous feed read should remain public';
  end if;
  begin
    perform user_id from public.profile_settings;
    raise exception 'expected anonymous private settings denial';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
