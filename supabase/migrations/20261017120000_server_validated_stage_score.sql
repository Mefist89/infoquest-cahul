-- Серверная проверка игровых результатов этапов.
-- Клиент больше не отправляет доверенный score целиком: финальные счёты
-- игрового этапа описываются парой (p_correct, p_total), а итоговый score
-- вычисляет сервер по единой формуле round(100 * p_correct / p_total).
-- Пассивные этапы (теория и видео) не требуют результата и получают 100.
-- Проверка последовательности этапов, XP и попыток финала остаются прежними.

drop function if exists public.complete_module_stage(text, smallint, integer);

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

comment on function public.complete_module_stage(text, smallint, smallint, smallint) is 'Сохраняет завершение этапа. Для игровых этапов и финала score вычисляется сервером из пары (correct, total); для пассивных этапов score = 100. Доверенный клиентский score не принимается.';
