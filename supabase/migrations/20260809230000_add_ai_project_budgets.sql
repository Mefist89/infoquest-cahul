create table public.ai_usage_monthly (
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null,
  total_requests integer not null default 0 check (total_requests >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, month_start)
);

create table public.ai_project_usage (
  period_kind text not null check (period_kind in ('day', 'month')),
  period_start date not null,
  total_requests integer not null default 0 check (total_requests >= 0),
  updated_at timestamptz not null default now(),
  primary key (period_kind, period_start)
);

create table public.ai_usage_limits (
  singleton boolean primary key default true check (singleton),
  audio_daily_limit smallint not null default 3 check (audio_daily_limit between 1 and 3),
  user_daily_limit integer not null default 20 check (user_daily_limit > 0),
  user_monthly_limit integer not null default 300 check (user_monthly_limit > 0),
  project_daily_limit integer not null default 100 check (project_daily_limit > 0),
  project_monthly_limit integer not null default 2000 check (project_monthly_limit > 0),
  warning_percent smallint not null default 80 check (warning_percent between 1 and 100),
  updated_at timestamptz not null default now()
);

insert into public.ai_usage_limits (singleton) values (true)
on conflict (singleton) do nothing;

alter table public.ai_usage_monthly enable row level security;
alter table public.ai_project_usage enable row level security;
alter table public.ai_usage_limits enable row level security;

revoke all on public.ai_usage_monthly from public, anon, authenticated;
revoke all on public.ai_project_usage from public, anon, authenticated;
revoke all on public.ai_usage_limits from public, anon, authenticated;

drop function if exists public.acquire_ai_request(boolean, uuid);

create function public.acquire_ai_request(
  p_has_audio boolean,
  p_request_id uuid
)
returns table (
  decision text,
  audio_used smallint,
  audio_limit smallint,
  user_daily_used integer,
  user_daily_limit integer,
  user_monthly_used integer,
  user_monthly_limit integer,
  project_daily_used integer,
  project_daily_limit integer,
  project_monthly_used integer,
  project_monthly_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_usage_date date := (now() at time zone 'UTC')::date;
  current_month_start date := date_trunc('month', now() at time zone 'UTC')::date;
  usage_row public.ai_usage_daily%rowtype;
  monthly_row public.ai_usage_monthly%rowtype;
  project_daily_row public.ai_project_usage%rowtype;
  project_monthly_row public.ai_project_usage%rowtype;
  limits_row public.ai_usage_limits%rowtype;
  next_audio_count smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id
      and role in ('student', 'teacher', 'administrator')
  ) then
    raise exception 'AI role required' using errcode = '42501';
  end if;

  if p_request_id is null then
    raise exception 'Request identifier required' using errcode = '22023';
  end if;

  select * into limits_row
  from public.ai_usage_limits
  where singleton = true;

  insert into public.ai_usage_daily (user_id, usage_date)
  values (current_user_id, current_usage_date)
  on conflict (user_id, usage_date) do nothing;

  insert into public.ai_usage_monthly (user_id, month_start)
  values (current_user_id, current_month_start)
  on conflict (user_id, month_start) do nothing;

  insert into public.ai_project_usage (period_kind, period_start)
  values ('day', current_usage_date), ('month', current_month_start)
  on conflict (period_kind, period_start) do nothing;

  select usage.* into usage_row
  from public.ai_usage_daily as usage
  where usage.user_id = current_user_id and usage.usage_date = current_usage_date
  for update;

  select usage.* into monthly_row
  from public.ai_usage_monthly as usage
  where usage.user_id = current_user_id and usage.month_start = current_month_start
  for update;

  select usage.* into project_daily_row
  from public.ai_project_usage as usage
  where usage.period_kind = 'day' and usage.period_start = current_usage_date
  for update;

  select usage.* into project_monthly_row
  from public.ai_project_usage as usage
  where usage.period_kind = 'month' and usage.period_start = current_month_start
  for update;

  if usage_row.active_request_id is not null and usage_row.active_until > now() then
    return query select 'busy'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if p_has_audio and usage_row.audio_requests >= limits_row.audio_daily_limit then
    return query select 'audio_limit'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if usage_row.total_requests >= limits_row.user_daily_limit then
    return query select 'user_daily_limit'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if monthly_row.total_requests >= limits_row.user_monthly_limit then
    return query select 'user_monthly_limit'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if project_daily_row.total_requests >= limits_row.project_daily_limit then
    return query select 'project_daily_limit'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if project_monthly_row.total_requests >= limits_row.project_monthly_limit then
    return query select 'project_monthly_limit'::text, usage_row.audio_requests, limits_row.audio_daily_limit,
      usage_row.total_requests, limits_row.user_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  next_audio_count := usage_row.audio_requests + case when p_has_audio then 1 else 0 end;

  update public.ai_usage_daily
  set total_requests = total_requests + 1,
      audio_requests = next_audio_count,
      active_request_id = p_request_id,
      active_until = now() + interval '1 minute',
      updated_at = now()
  where user_id = current_user_id and usage_date = current_usage_date;

  update public.ai_usage_monthly
  set total_requests = total_requests + 1, updated_at = now()
  where user_id = current_user_id and month_start = current_month_start;

  update public.ai_project_usage
  set total_requests = total_requests + 1, updated_at = now()
  where (period_kind = 'day' and period_start = current_usage_date)
     or (period_kind = 'month' and period_start = current_month_start);

  return query select 'acquired'::text, next_audio_count, limits_row.audio_daily_limit,
    usage_row.total_requests + 1, limits_row.user_daily_limit, monthly_row.total_requests + 1, limits_row.user_monthly_limit,
    project_daily_row.total_requests + 1, limits_row.project_daily_limit, project_monthly_row.total_requests + 1, limits_row.project_monthly_limit;
end;
$$;

revoke execute on function public.acquire_ai_request(boolean, uuid) from public, anon;
grant execute on function public.acquire_ai_request(boolean, uuid) to authenticated;

create or replace function public.get_ai_budget_status()
returns table (
  daily_used integer,
  daily_limit integer,
  monthly_used integer,
  monthly_limit integer,
  warning_percent smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_usage_date date := (now() at time zone 'UTC')::date;
  current_month_start date := date_trunc('month', now() at time zone 'UTC')::date;
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    coalesce((select total_requests from public.ai_project_usage where period_kind = 'day' and period_start = current_usage_date), 0),
    limits.project_daily_limit,
    coalesce((select total_requests from public.ai_project_usage where period_kind = 'month' and period_start = current_month_start), 0),
    limits.project_monthly_limit,
    limits.warning_percent
  from public.ai_usage_limits as limits
  where limits.singleton = true;
end;
$$;

revoke execute on function public.get_ai_budget_status() from public, anon;
grant execute on function public.get_ai_budget_status() to authenticated;
