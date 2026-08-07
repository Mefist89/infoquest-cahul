create or replace function public.get_admin_dashboard()
returns table (
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
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
begin
  if not exists (
    select 1
    from auth.users as admin_user
    where admin_user.id = (select auth.uid())
      and lower(admin_user.email) = 'jeniabortnic@gmail.com'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    users.id,
    users.email::text,
    profiles.display_name,
    profiles.avatar_url,
    users.created_at,
    users.last_sign_in_at,
    coalesce(progress.completed_modules, 0),
    coalesce(progress.in_progress_modules, 0),
    coalesce(stages.completed_stages, 0),
    40::bigint,
    coalesce(progress.total_xp, 0),
    coalesce(progress.module_breakdown, '[]'::jsonb)
  from auth.users as users
  left join public.profiles as profiles on profiles.id = users.id
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
        order by array_position(
          array['operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective'],
          module_progress.module_id
        )
      ) as module_breakdown
    from public.module_progress
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
grant execute on function public.get_admin_dashboard() to authenticated;
