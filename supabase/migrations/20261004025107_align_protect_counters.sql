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
      new.likes_count = coalesce(old.likes_count, 0);
      new.downloads_count = coalesce(old.downloads_count, 0);
    end if;
  end if;
  return new;
end;
$$;

create trigger community_protect_counters
  before insert or update on public.community_feed
  for each row execute function public.protect_counters();
