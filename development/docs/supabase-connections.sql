-- supabase-connections.sql
-- -------------------------------------------------------------------
-- Two-way connections. Run this ONCE in Supabase (SQL Editor → New
-- query → paste → Run), after supabase-setup.sql.
--
-- 1. Every account gets a private, random "invite" code. Share links
--    made while logged in carry it.
-- 2. add_me_to(invite_code, my_name): a logged-in person who opens a
--    friend's link can add THEMSELVES to that friend's people. It only
--    ever adds the person asking, with the birth details saved in
--    their own account, so nobody can add someone else or change
--    anything else in the friend's row.
-- -------------------------------------------------------------------

alter table public.orbit_data
  add column if not exists invite text unique default replace(gen_random_uuid()::text, '-', '');

create or replace function public.add_me_to(invite_code text, my_name text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  friend uuid;
  my_birth jsonb;
  entry jsonb;
begin
  if me is null then return false; end if;

  -- Whose link is it? (Not yourself.)
  select user_id into friend from public.orbit_data where invite = invite_code;
  if friend is null or friend = me then return false; end if;

  -- Your own saved birth details (never taken from the request).
  select birth into my_birth from public.orbit_data where user_id = me;
  if my_birth is null then return false; end if;

  entry := jsonb_build_object(
    'id', 'u' || replace(me::text, '-', ''),
    'name', left(coalesce(nullif(trim(my_name), ''), 'A friend'), 40),
    'birth', my_birth - 'name' - 'settingsVersion' - 'isSample',
    'shared', true
  );

  -- Add you to their people (replacing an older copy of you, if any).
  update public.orbit_data
     set people = coalesce(
           (select jsonb_agg(p) from jsonb_array_elements(people) p where p->>'id' <> entry->>'id'),
           '[]'::jsonb) || jsonb_build_array(entry),
         updated_at = now()
   where user_id = friend;
  return true;
end;
$$;

revoke execute on function public.add_me_to(text, text) from public, anon;
grant execute on function public.add_me_to(text, text) to authenticated;
