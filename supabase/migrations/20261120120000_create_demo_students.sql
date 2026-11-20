create table if not exists public.demo_students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 1 and 60),
  last_name text not null check (char_length(trim(last_name)) between 1 and 60),
  school_class text not null check (char_length(trim(school_class)) between 1 and 24),
  locale text not null default 'ru' check (locale in ('ru', 'ro')),
  created_at timestamptz not null default now()
);

create index if not exists demo_students_created_at_idx
  on public.demo_students (created_at desc);

alter table public.demo_students enable row level security;

revoke all on public.demo_students from public, anon, authenticated;
grant select on public.demo_students to authenticated;

drop policy if exists "demo_students_select_own" on public.demo_students;
create policy "demo_students_select_own"
on public.demo_students for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "demo_students_select_admin" on public.demo_students;
create policy "demo_students_select_admin"
on public.demo_students for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'administrator'
  )
);

create or replace function public.register_demo_student(
  p_first_name text,
  p_last_name text,
  p_school_class text,
  p_locale text default 'ru'
)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  school_class text,
  locale text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  is_anon_user boolean := false;
  clean_first text := trim(coalesce(p_first_name, ''));
  clean_last text := trim(coalesce(p_last_name, ''));
  clean_class text := trim(coalesce(p_school_class, ''));
  clean_locale text := case when p_locale = 'ro' then 'ro' else 'ru' end;
  full_display_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select coalesce(u.is_anonymous, false) into is_anon_user
  from auth.users as u
  where u.id = current_user_id;

  if not is_anon_user and not exists (
    select 1 from public.demo_students as d where d.user_id = current_user_id
  ) then
    raise exception 'Only anonymous demo accounts can register as demo students' using errcode = '42501';
  end if;

  if char_length(clean_first) < 1 or char_length(clean_first) > 60 then
    raise exception 'Invalid first name' using errcode = '22023';
  end if;

  if char_length(clean_last) < 1 or char_length(clean_last) > 60 then
    raise exception 'Invalid last name' using errcode = '22023';
  end if;

  if char_length(clean_class) < 1 or char_length(clean_class) > 24 then
    raise exception 'Invalid school class' using errcode = '22023';
  end if;

  full_display_name := clean_first || ' ' || clean_last;

  insert into public.demo_students (user_id, first_name, last_name, school_class, locale)
  values (current_user_id, clean_first, clean_last, clean_class, clean_locale)
  on conflict (user_id) do update
  set first_name = excluded.first_name,
      last_name = excluded.last_name,
      school_class = excluded.school_class,
      locale = excluded.locale;

  update public.profiles
  set display_name = full_display_name,
      role = 'student',
      updated_at = now()
  where id = current_user_id;

  return query
  select
    d.user_id,
    d.first_name,
    d.last_name,
    d.school_class,
    d.locale
  from public.demo_students as d
  where d.user_id = current_user_id;
end;
$$;

revoke execute on function public.register_demo_student(text, text, text, text) from public, anon;
grant execute on function public.register_demo_student(text, text, text, text) to authenticated;

create or replace function public.get_ai_user_quota_status()
returns table (
  audio_used integer,
  audio_limit integer,
  user_daily_used integer,
  user_daily_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_usage_date date := (now() at time zone 'UTC')::date;
  current_user_role text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.demo_students
    where user_id = current_user_id
  ) then
    raise exception 'Chrono AI is disabled for demo students' using errcode = '42501';
  end if;

  select role into current_user_role
  from public.profiles
  where id = current_user_id and role <> 'blocked';

  if current_user_role is null then
    raise exception 'AI role required' using errcode = '42501';
  end if;

  return query
  select
    coalesce(usage.audio_requests, 0)::integer,
    (case when current_user_role = 'user'
      then limits.user_role_audio_daily_limit else limits.audio_daily_limit end)::integer,
    coalesce(usage.total_requests, 0)::integer,
    case when current_user_role = 'user'
      then limits.user_role_daily_limit else limits.user_daily_limit end
  from public.ai_usage_limits as limits
  left join public.ai_usage_daily as usage
    on usage.user_id = current_user_id
   and usage.usage_date = current_usage_date
  where limits.singleton = true;
end;
$$;

revoke execute on function public.get_ai_user_quota_status() from public, anon;
grant execute on function public.get_ai_user_quota_status() to authenticated;
