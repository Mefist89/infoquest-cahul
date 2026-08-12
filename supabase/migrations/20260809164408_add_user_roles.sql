alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'student', 'teacher', 'administrator'));

update public.profiles as profiles
set role = 'administrator', updated_at = now()
from auth.users as users
where users.id = profiles.id
  and lower(users.email) in ('jeniabortnic@gmail.com', 'pucalmaria@gmail.com');

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, updated_at) on public.profiles to authenticated;

create table if not exists public.user_role_audit (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  previous_role text not null,
  new_role text not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_at timestamptz not null default now(),
  check (previous_role in ('user', 'student', 'teacher', 'administrator')),
  check (new_role in ('user', 'student', 'teacher', 'administrator'))
);

alter table public.user_role_audit enable row level security;
revoke all on public.user_role_audit from public, anon, authenticated;

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  old_role text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_role not in ('user', 'student', 'teacher', 'administrator') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;

  if p_user_id = current_user_id and p_role <> 'administrator' then
    raise exception 'Administrators cannot remove their own role' using errcode = '42501';
  end if;

  select role into old_role
  from public.profiles
  where id = p_user_id
  for update;

  if old_role is null then
    raise exception 'Unknown user' using errcode = '22023';
  end if;

  if old_role = p_role then
    return;
  end if;

  update public.profiles
  set role = p_role, updated_at = now()
  where id = p_user_id;

  insert into public.user_role_audit (target_user_id, previous_role, new_role, changed_by)
  values (p_user_id, old_role, p_role, current_user_id);
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

drop function if exists public.get_admin_dashboard();

create function public.get_admin_dashboard()
returns table (
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  user_role text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  completed_modules bigint,
  in_progress_modules bigint,
  completed_stages bigint,
  total_stages bigint,
  total_xp bigint,
  module_breakdown jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  catalog_stage_count bigint := (
    select count(*)::bigint
    from public.module_catalog
    cross join public.module_stage_catalog
  );
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    users.id,
    users.email::text,
    profiles.display_name,
    profiles.avatar_url,
    profiles.role,
    users.created_at,
    users.last_sign_in_at,
    coalesce(progress.completed_modules, 0),
    coalesce(progress.in_progress_modules, 0),
    coalesce(stages.completed_stages, 0),
    catalog_stage_count,
    coalesce(progress.total_xp, 0),
    coalesce(progress.module_breakdown, '[]'::jsonb)
  from auth.users as users
  join public.profiles as profiles on profiles.id = users.id
  left join lateral (
    select
      count(*) filter (where module_progress.status = 'completed')::bigint as completed_modules,
      count(*) filter (where module_progress.status = 'in_progress')::bigint as in_progress_modules,
      coalesce(sum(module_progress.xp), 0)::bigint as total_xp,
      jsonb_agg(
        jsonb_build_object(
          'module_id', module_progress.module_id,
          'status', module_progress.status,
          'score', module_progress.score,
          'xp', module_progress.xp,
          'completed_stages', (
            select count(*)
            from public.module_stage_progress
            where module_stage_progress.user_id = users.id
              and module_stage_progress.module_id = module_progress.module_id
              and module_stage_progress.status = 'completed'
          )
        )
        order by modules.position
      ) as module_breakdown
    from public.module_progress
    join public.module_catalog as modules on modules.id = module_progress.module_id
    where module_progress.user_id = users.id
  ) as progress on true
  left join lateral (
    select count(*) filter (where module_stage_progress.status = 'completed')::bigint as completed_stages
    from public.module_stage_progress
    where module_stage_progress.user_id = users.id
  ) as stages on true
  order by users.created_at desc;
end;
$$;

revoke execute on function public.get_admin_dashboard() from public, anon;
grant execute on function public.get_admin_dashboard() to authenticated;;
