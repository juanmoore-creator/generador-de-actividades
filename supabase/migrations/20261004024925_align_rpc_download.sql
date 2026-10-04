create or replace function public.increment_download(community_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.community_feed set downloads_count = downloads_count + 1 where id = community_id;
$$;

grant execute on function public.increment_download(uuid) to anon, authenticated;
