create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (module_id in (
    'operator-call',
    'fake-link',
    'hacked-account',
    'scam-or-real',
    'deepfake-detective'
  )),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  score integer not null default 0 check (score between 0 and 100),
  xp integer not null default 0 check (xp between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.profiles enable row level security;
alter table public.module_progress enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "progress_select_own"
on public.module_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "progress_insert_own"
on public.module_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "progress_update_own"
on public.module_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.module_progress to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.module_progress (user_id, module_id)
  select new.id, module_id
  from unnest(array[
    'operator-call',
    'fake-link',
    'hacked-account',
    'scam-or-real',
    'deepfake-detective'
  ]) as module_id
  on conflict (user_id, module_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

insert into public.module_progress (user_id, module_id)
select users.id, modules.module_id
from auth.users as users
cross join unnest(array[
  'operator-call',
  'fake-link',
  'hacked-account',
  'scam-or-real',
  'deepfake-detective'
]) as modules(module_id)
on conflict (user_id, module_id) do nothing;;
