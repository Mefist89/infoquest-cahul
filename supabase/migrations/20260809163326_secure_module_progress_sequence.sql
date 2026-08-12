drop policy if exists "progress_insert_own" on public.module_progress;
drop policy if exists "progress_update_own" on public.module_progress;
drop policy if exists "stage_progress_insert_own" on public.module_stage_progress;
drop policy if exists "stage_progress_update_own" on public.module_stage_progress;

revoke insert, update on public.module_progress from authenticated;
revoke insert, update on public.module_stage_progress from authenticated;

create or replace function public.complete_module_stage(
  p_module_id text,
  p_stage_index smallint,
  p_score integer default 100
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
  stage_kind_value text;
  completed_count bigint;
  expected_stage_count bigint;
  first_stage_index smallint;
  final_stage_index smallint;
  calculated_xp integer;
  calculated_score integer;
  calculated_status text;
  module_is_available boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
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

  if p_score not between 0 and 100 then
    raise exception 'Invalid stage result' using errcode = '22023';
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

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind, status, score, completed_at, updated_at)
  values (current_user_id, p_module_id, p_stage_index, stage_kind_value, 'completed', p_score, now(), now())
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

revoke execute on function public.complete_module_stage(text, smallint, integer) from public, anon;
grant execute on function public.complete_module_stage(text, smallint, integer) to authenticated;;
