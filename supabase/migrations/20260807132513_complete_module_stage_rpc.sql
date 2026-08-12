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
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  stage_kind_value text;
  completed_count bigint;
  calculated_xp integer;
  calculated_score integer;
  calculated_status text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_module_id not in ('operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective') then
    raise exception 'Unknown module';
  end if;

  if p_stage_index not between 1 and 8 or p_score not between 0 and 100 then
    raise exception 'Invalid stage result';
  end if;

  stage_kind_value := (array['theory', 'video_explanation', 'video_example', 'game_1', 'game_2', 'game_3', 'game_4', 'final_battle'])[p_stage_index];

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind, status, score, completed_at, updated_at)
  values (current_user_id, p_module_id, p_stage_index, stage_kind_value, 'completed', p_score, now(), now())
  on conflict (user_id, module_id, stage_index)
  do update set
    status = 'completed',
    score = greatest(public.module_stage_progress.score, excluded.score),
    completed_at = coalesce(public.module_stage_progress.completed_at, excluded.completed_at),
    updated_at = now();

  select
    count(*) filter (where stage_progress.status = 'completed')::bigint,
    coalesce(sum(
      case stage_progress.stage_index
        when 1 then 8
        when 2 then 8
        when 3 then 8
        when 4 then 12
        when 5 then 12
        when 6 then 12
        when 7 then 12
        when 8 then 28
      end * stage_progress.score / 100.0
    ) filter (where stage_progress.status = 'completed'), 0)::integer,
    coalesce(avg(stage_progress.score) filter (where stage_progress.status = 'completed'), 0)::integer
  into completed_count, calculated_xp, calculated_score
  from public.module_stage_progress as stage_progress
  where stage_progress.user_id = current_user_id
    and stage_progress.module_id = p_module_id;

  calculated_status := case when completed_count = 8 then 'completed' else 'in_progress' end;

  insert into public.module_progress (user_id, module_id, status, score, xp, attempts, completed_at, updated_at)
  values (
    current_user_id,
    p_module_id,
    calculated_status,
    calculated_score,
    calculated_xp,
    case when p_stage_index = 8 then 1 else 0 end,
    case when completed_count = 8 then now() else null end,
    now()
  )
  on conflict (user_id, module_id)
  do update set
    status = excluded.status,
    score = greatest(public.module_progress.score, excluded.score),
    xp = greatest(public.module_progress.xp, excluded.xp),
    attempts = greatest(public.module_progress.attempts, excluded.attempts),
    completed_at = case when excluded.status = 'completed' then coalesce(public.module_progress.completed_at, excluded.completed_at) else public.module_progress.completed_at end,
    updated_at = now();

  return query select completed_count, calculated_xp, calculated_status, calculated_score;
end;
$$;

revoke execute on function public.complete_module_stage(text, smallint, integer) from public, anon;
grant execute on function public.complete_module_stage(text, smallint, integer) to authenticated;

;
