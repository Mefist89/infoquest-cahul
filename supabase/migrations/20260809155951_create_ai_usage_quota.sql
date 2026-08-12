create table public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  total_requests integer not null default 0 check (total_requests >= 0),
  audio_requests smallint not null default 0 check (audio_requests between 0 and 3),
  active_request_id uuid,
  active_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.ai_usage_daily enable row level security;

create policy "ai_usage_select_own"
on public.ai_usage_daily
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.ai_usage_daily from public, anon, authenticated;
grant select on table public.ai_usage_daily to authenticated;

create or replace function public.acquire_ai_request(
  p_has_audio boolean,
  p_request_id uuid
)
returns table (
  decision text,
  audio_used smallint,
  audio_limit smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_usage_date date := (now() at time zone 'UTC')::date;
  usage_row public.ai_usage_daily%rowtype;
  next_audio_count smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_request_id is null then
    raise exception 'Request identifier required' using errcode = '22023';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date)
  values (current_user_id, current_usage_date)
  on conflict (user_id, usage_date) do nothing;

  select usage.*
  into usage_row
  from public.ai_usage_daily as usage
  where usage.user_id = current_user_id
    and usage.usage_date = current_usage_date
  for update;

  if usage_row.active_request_id is not null
    and usage_row.active_until > now() then
    return query select 'busy'::text, usage_row.audio_requests, 3::smallint;
    return;
  end if;

  if p_has_audio and usage_row.audio_requests >= 3 then
    return query select 'audio_limit'::text, usage_row.audio_requests, 3::smallint;
    return;
  end if;

  next_audio_count := usage_row.audio_requests + case when p_has_audio then 1 else 0 end;

  update public.ai_usage_daily as usage
  set
    total_requests = usage.total_requests + 1,
    audio_requests = next_audio_count,
    active_request_id = p_request_id,
    active_until = now() + interval '3 minutes',
    updated_at = now()
  where usage.user_id = current_user_id
    and usage.usage_date = current_usage_date;

  return query select 'acquired'::text, next_audio_count, 3::smallint;
end;
$$;

create or replace function public.release_ai_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.ai_usage_daily as usage
  set
    active_request_id = null,
    active_until = null,
    updated_at = now()
  where usage.user_id = current_user_id
    and usage.active_request_id = p_request_id;
end;
$$;

revoke execute on function public.acquire_ai_request(boolean, uuid) from public, anon;
revoke execute on function public.release_ai_request(uuid) from public, anon;
grant execute on function public.acquire_ai_request(boolean, uuid) to authenticated;
grant execute on function public.release_ai_request(uuid) to authenticated;

;
