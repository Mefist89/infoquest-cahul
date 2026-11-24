-- Исправление ошибки 42702 ("column reference user_id is ambiguous") в register_demo_student
-- и усиление проверки демо-режима по auth.users.is_anonymous в RPC.

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
#variable_conflict use_column
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

create or replace function public.complete_module_stage(
  p_module_id text,
  p_stage_index smallint,
  p_correct smallint default null,
  p_total smallint default null
)
returns table (
  completed_stages bigint,
  module_xp integer,
  module_status text,
  module_score integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  is_demo_account boolean := false;
  stage_kind_value text;
  completed_count bigint;
  expected_stage_count bigint;
  first_stage_index smallint;
  final_stage_index smallint;
  calculated_xp integer;
  calculated_score integer;
  calculated_status text;
  module_is_available boolean;
  stage_score smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select (
    exists (
      select 1
      from public.demo_students as d
      where d.user_id = current_user_id
    )
    or exists (
      select 1
      from auth.users as u
      where u.id = current_user_id and coalesce(u.is_anonymous, false)
    )
  ) into is_demo_account;

  if is_demo_account and p_module_id not in ('operator-call', 'fake-link') then
    raise exception 'Module is not available in demo mode' using errcode = '42501';
  end if;

  select modules.is_available
  into module_is_available
  from public.module_catalog as modules
  where modules.id = p_module_id;

  if module_is_available is null then
    raise exception 'Unknown module' using errcode = '22023';
  end if;

  if not module_is_available then
    raise exception 'Module is not available' using errcode = '42501';
  end if;

  select stages.stage_kind
  into stage_kind_value
  from public.module_stage_catalog as stages
  where stages.stage_index = p_stage_index;

  if stage_kind_value is null then
    raise exception 'Unknown module stage' using errcode = '22023';
  end if;

  select min(stages.stage_index), max(stages.stage_index), count(*)::bigint
  into first_stage_index, final_stage_index, expected_stage_count
  from public.module_stage_catalog as stages;

  if p_stage_index > first_stage_index and not exists (
    select 1
    from public.module_stage_progress as previous_stage
    where previous_stage.user_id = current_user_id
      and previous_stage.module_id = p_module_id
      and previous_stage.stage_index = p_stage_index - 1
      and previous_stage.status = 'completed'
  ) then
    raise exception 'Complete the previous stage first' using errcode = '42501';
  end if;

  if (p_correct is null and p_total is not null)
    or (p_correct is not null and p_total is null)
    or (p_total is not null and p_total < 1)
    or (p_total is not null and p_total > 1000)
    or (p_correct is not null and p_correct < 0)
    or (p_correct is not null and p_correct > p_total) then
    raise exception 'Invalid stage result' using errcode = '22023';
  end if;

  if p_correct is null then
    if stage_kind_value not in ('theory', 'video_explanation', 'video_example') then
      raise exception 'Game stage result required' using errcode = '22023';
    end if;
    stage_score := 100;
  else
    stage_score := round((p_correct::numeric * 100.0 / p_total::numeric))::smallint;
  end if;

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind, status, score, completed_at, updated_at)
  values (current_user_id, p_module_id, p_stage_index, stage_kind_value, 'completed', stage_score, now(), now())
  on conflict (user_id, module_id, stage_index)
  do update set
    status = 'completed',
    score = greatest(public.module_stage_progress.score, excluded.score),
    completed_at = coalesce(public.module_stage_progress.completed_at, excluded.completed_at),
    updated_at = now();

  select
    count(*) filter (where progress.status = 'completed')::bigint,
    coalesce(sum(stages.max_xp * progress.score / 100.0) filter (where progress.status = 'completed'), 0)::integer,
    coalesce(avg(progress.score) filter (where progress.status = 'completed'), 0)::integer
  into completed_count, calculated_xp, calculated_score
  from public.module_stage_progress as progress
  join public.module_stage_catalog as stages on stages.stage_index = progress.stage_index
  where progress.user_id = current_user_id
    and progress.module_id = p_module_id;

  calculated_status := case when completed_count = expected_stage_count then 'completed' else 'in_progress' end;

  insert into public.module_progress (user_id, module_id, status, score, xp, attempts, completed_at, updated_at)
  values (
    current_user_id,
    p_module_id,
    calculated_status,
    calculated_score,
    calculated_xp,
    case when p_stage_index = final_stage_index then 1 else 0 end,
    case when calculated_status = 'completed' then now() else null end,
    now()
  )
  on conflict (user_id, module_id)
  do update set
    status = excluded.status,
    score = greatest(public.module_progress.score, excluded.score),
    xp = greatest(public.module_progress.xp, excluded.xp),
    attempts = public.module_progress.attempts + excluded.attempts,
    completed_at = case when excluded.status = 'completed' then coalesce(public.module_progress.completed_at, excluded.completed_at) else public.module_progress.completed_at end,
    updated_at = now();

  return query select completed_count, calculated_xp, calculated_status, calculated_score;
end;
$$;

revoke execute on function public.complete_module_stage(text, smallint, smallint, smallint) from public, anon;
grant execute on function public.complete_module_stage(text, smallint, smallint, smallint) to authenticated;

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
  ) or exists (
    select 1 from auth.users
    where id = current_user_id and coalesce(is_anonymous, false)
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
