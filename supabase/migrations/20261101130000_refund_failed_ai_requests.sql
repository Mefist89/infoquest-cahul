-- Request identifiers are generated inside /api/ai, never exposed to the browser.
-- They authorize settlement in addition to auth.uid(); receipt rows are private.
create table public.ai_request_receipts (
  request_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  has_audio boolean not null,
  succeeded boolean,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ai_request_receipts enable row level security;
revoke all on public.ai_request_receipts from public, anon, authenticated;

create or replace function public.acquire_ai_request(
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
  current_user_role text;
  effective_daily_limit integer;
  effective_audio_limit smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select role into current_user_role
  from public.profiles
  where id = current_user_id and role <> 'blocked';

  if current_user_role is null then
    raise exception 'AI role required' using errcode = '42501';
  end if;

  if p_request_id is null then
    raise exception 'Request identifier required' using errcode = '22023';
  end if;

  select * into limits_row
  from public.ai_usage_limits
  where singleton = true;

  effective_daily_limit := case when current_user_role = 'user'
    then limits_row.user_role_daily_limit else limits_row.user_daily_limit end;
  effective_audio_limit := case when current_user_role = 'user'
    then limits_row.user_role_audio_daily_limit else limits_row.audio_daily_limit end;

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
    return query select 'busy'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if p_has_audio and usage_row.audio_requests >= effective_audio_limit then
    return query select 'audio_limit'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if usage_row.total_requests >= effective_daily_limit then
    return query select 'user_daily_limit'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if monthly_row.total_requests >= limits_row.user_monthly_limit then
    return query select 'user_monthly_limit'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if project_daily_row.total_requests >= limits_row.project_daily_limit then
    return query select 'project_daily_limit'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  if project_monthly_row.total_requests >= limits_row.project_monthly_limit then
    return query select 'project_monthly_limit'::text, usage_row.audio_requests, effective_audio_limit,
      usage_row.total_requests, effective_daily_limit, monthly_row.total_requests, limits_row.user_monthly_limit,
      project_daily_row.total_requests, limits_row.project_daily_limit, project_monthly_row.total_requests, limits_row.project_monthly_limit;
    return;
  end if;

  -- Store the original period and audio flag, never accept refund amounts from callers.
  insert into public.ai_request_receipts (request_id, user_id, usage_date, has_audio)
  values (p_request_id, current_user_id, current_usage_date, p_has_audio);

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

  return query select 'acquired'::text, next_audio_count, effective_audio_limit,
    usage_row.total_requests + 1, effective_daily_limit, monthly_row.total_requests + 1, limits_row.user_monthly_limit,
    project_daily_row.total_requests + 1, limits_row.project_daily_limit, project_monthly_row.total_requests + 1, limits_row.project_monthly_limit;
end;
$$;

revoke execute on function public.acquire_ai_request(boolean, uuid) from public, anon;
grant execute on function public.acquire_ai_request(boolean, uuid) to authenticated;

-- Remove the old overload so one-argument calls resolve to the default below.
drop function public.release_ai_request(uuid);

create or replace function public.release_ai_request(p_request_id uuid, p_refund boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  receipt public.ai_request_receipts%rowtype;
  request_month date;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into receipt
  from public.ai_request_receipts
  where request_id = p_request_id and user_id = current_user_id
  for update;

  -- Preserve release behavior for requests acquired before this migration.
  if not found then
    update public.ai_usage_daily
    set active_request_id = null, active_until = null, updated_at = now()
    where user_id = current_user_id and active_request_id = p_request_id;
    return;
  end if;
  if receipt.finished_at is not null then return; end if;

  request_month := date_trunc('month', receipt.usage_date::timestamp)::date;

  -- Same lock order as acquisition: daily, then monthly. Refund the original
  -- period even when a request finishes after midnight or a month boundary.
  update public.ai_usage_daily as usage
  set total_requests = greatest(0, usage.total_requests - case when coalesce(p_refund, false) then 1 else 0 end),
      audio_requests = greatest(0, usage.audio_requests - case when coalesce(p_refund, false) and receipt.has_audio then 1 else 0 end),
      active_request_id = case when usage.active_request_id = p_request_id then null else usage.active_request_id end,
      active_until = case when usage.active_request_id = p_request_id then null else usage.active_until end,
      updated_at = now()
  where usage.user_id = current_user_id and usage.usage_date = receipt.usage_date;

  if coalesce(p_refund, false) then
    update public.ai_usage_monthly as usage
    set total_requests = greatest(0, usage.total_requests - 1), updated_at = now()
    where usage.user_id = current_user_id and usage.month_start = request_month;

    update public.ai_project_usage
    set total_requests = greatest(0, total_requests - 1), updated_at = now()
    where period_kind = 'day' and period_start = receipt.usage_date;

    update public.ai_project_usage
    set total_requests = greatest(0, total_requests - 1), updated_at = now()
    where period_kind = 'month' and period_start = request_month;
  end if;

  update public.ai_request_receipts
  set succeeded = not coalesce(p_refund, false), finished_at = now()
  where request_id = p_request_id;

  -- The receipt makes the refund idempotent across retries and stale locks.
end;
$$;

revoke execute on function public.release_ai_request(uuid, boolean) from public, anon;
grant execute on function public.release_ai_request(uuid, boolean) to authenticated;
