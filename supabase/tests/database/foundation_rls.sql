-- Rollback-only integration proof for the GenAct foundation migration.
-- Uses synthetic Auth rows and never calls an external Auth endpoint.
begin;

do $$
begin
  if to_regclass('public.profiles') is null
    or to_regclass('public.activities') is null
    or to_regclass('public.community_feed') is null
    or to_regclass('public.community_likes') is null then
    raise exception 'RED: foundation tables are not installed';
  end if;
end;
$$;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated',
   'foundation-a@example.invalid', '', pg_catalog.now(), '{}', '{}', pg_catalog.now(), pg_catalog.now()),
  ('00000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated',
   'foundation-b@example.invalid', '', pg_catalog.now(), '{}', '{}', pg_catalog.now(), pg_catalog.now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
insert into public.profiles (display_name) values ('Foundation A')
on conflict (id) do update set display_name = excluded.display_name;
insert into public.activities (title, type, difficulty, snapshot)
values ('A private activity', 'sudoku', 'easy', '{"size":4}');
insert into public.community_feed (title, type, snapshot, tags)
values ('A public copy', 'sudoku', '{"size":4}', array['math']);

do $$
declare
  v_activity uuid;
  v_feed uuid;
begin
  select id into v_activity from public.activities where title = 'A private activity';
  select id into v_feed from public.community_feed where title = 'A public copy';
  perform set_config('test.activity_a', v_activity::text, true);
  perform set_config('test.feed_a', v_feed::text, true);
  if v_activity is null or v_feed is null then
    raise exception 'A can create own activity and published copy';
  end if;
end;
$$;

update public.activities set title = 'A updated activity' where title = 'A private activity';
update public.profiles set display_name = 'Foundation A updated';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
insert into public.profiles (display_name) values ('Foundation B')
on conflict (id) do update set display_name = excluded.display_name;
insert into public.activities (title, type, snapshot)
values ('B private activity', 'maze', '{"width":2}');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
do $$
declare
  v_count integer;
  v_activity uuid;
  v_feed uuid;
  v_rows integer;
begin
  select count(*) into v_count from public.activities where title = 'B private activity';
  if v_count <> 0 then raise exception 'A must not read B private activity'; end if;
  select id into v_activity from public.activities where title = 'A updated activity';
  select id into v_feed from public.community_feed where title = 'A public copy';
  if v_activity is null or v_feed is null then raise exception 'A must read own rows'; end if;

  update public.activities set title = 'A changed B row'
    where title = 'B private activity';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'A must not update B activity'; end if;
  delete from public.activities where title = 'B private activity';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'A must not delete B activity'; end if;

  begin
    insert into public.activities (user_id, title, type, snapshot)
    values ('00000000-0000-4000-8000-0000000000b2', 'Spoofed owner', 'maze', '{}');
    raise exception 'expected owner spoof insert rejection';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.activities set user_id = '00000000-0000-4000-8000-0000000000b2'
      where id = v_activity;
    raise exception 'expected owner spoof update rejection';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.activities (title, type, snapshot)
    values ('Invalid type', 'not-a-generator', '{}');
    raise exception 'expected activity type constraint rejection';
  exception when check_violation then null;
  end;

  begin
    insert into public.community_likes (community_id)
    values ('ffffffff-ffff-4fff-8fff-ffffffffffff');
    raise exception 'expected like foreign key rejection';
  exception when foreign_key_violation then null;
  end;

  insert into public.community_likes (community_id) values (v_feed);
  begin
    insert into public.community_likes (community_id) values (v_feed);
    raise exception 'expected duplicate like rejection';
  exception when unique_violation then null;
  end;
  delete from public.community_likes where community_id = v_feed;

  delete from public.activities where id = v_activity;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'A must delete own activity'; end if;
end;
$$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.community_feed where title = 'A public copy';
  if v_count <> 1 then raise exception 'anon must read published feed'; end if;

  begin
    perform id from public.activities;
    raise exception 'expected anonymous private table denial';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.community_feed (title, type, snapshot)
    values ('Anonymous post', 'maze', '{}');
    raise exception 'expected anonymous write denial';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
