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
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  return query
  select
    coalesce(usage.audio_requests, 0)::integer,
    limits.audio_daily_limit,
    coalesce(usage.total_requests, 0)::integer,
    limits.user_daily_limit
  from public.ai_usage_limits as limits
  left join public.ai_usage_daily as usage
    on usage.user_id = current_user_id
   and usage.usage_date = current_usage_date
  where limits.singleton = true;
end;
$$;

revoke execute on function public.get_ai_user_quota_status() from public, anon;
grant execute on function public.get_ai_user_quota_status() to authenticated;
