-- supabase-setup.sql
-- -------------------------------------------------------------------
-- Run this ONCE in your Supabase project: SQL Editor → New query →
-- paste everything → Run. It creates ORBIT's one table and the rules
-- that keep each person's data private.
-- -------------------------------------------------------------------

-- One row per person: their birth details, their people (Connections)
-- and their saved readings, stored as JSON (the same shape as in the
-- browser's localStorage).
create table if not exists public.orbit_data (
  user_id    uuid primary key references auth.users on delete cascade,
  birth      jsonb,
  people     jsonb not null default '[]',
  saved      jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Row level security: the website's public key can only reach rows
-- whose user_id is the logged-in person's own id.
alter table public.orbit_data enable row level security;

create policy "Read my own row"   on public.orbit_data for select using (auth.uid() = user_id);
create policy "Add my own row"    on public.orbit_data for insert with check (auth.uid() = user_id);
create policy "Change my own row" on public.orbit_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete my own row" on public.orbit_data for delete using (auth.uid() = user_id);

-- "Delete my account": removes the logged-in person's login, and
-- with it their row (on delete cascade). It can only ever delete
-- the person who calls it.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
