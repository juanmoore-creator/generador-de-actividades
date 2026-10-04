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

create trigger community_likes_count
  after insert or delete on public.community_likes
  for each row execute function public.sync_likes_count();
