-- Fix patrol progress RPCs:
-- 1. Qualify table columns and use #variable_conflict use_column to avoid ambiguity with RETURNS TABLE columns.
-- 2. Remove non-existent completed_count column from patrol_progress insert/update.
-- 3. Default shadow_pct to 40 when patrol_progress row does not exist yet.
-- 4. Maintain completed_npc_ids without duplicates via array_append.
-- 5. Add reset_patrol_progress() for authenticated users.

create or replace function public.complete_patrol_npc(
  p_npc_id text,
  p_correct boolean
) returns table (
  shadow_pct integer,
  completed_count integer,
  total_count integer,
  status text
) language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  shadow_val integer;
  completed integer;
  total_val integer;
  new_status text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  -- Validate NPC exists
  if not exists (select 1 from public.patrol_npcs as pn where pn.id = p_npc_id) then
    raise exception 'Unknown NPC' using errcode = '22023';
  end if;

  -- Upsert stage progress
  insert into public.patrol_stage_progress as psp (user_id, npc_id, status, correct, completed_at)
  values (current_user_id, p_npc_id, 'completed', p_correct, now())
  on conflict (user_id, npc_id) do update set
    status = 'completed',
    correct = excluded.correct,
    completed_at = coalesce(psp.completed_at, excluded.completed_at);

  -- Read current shadow_pct (start at 40 if row does not exist yet)
  select pp.shadow_pct
  into shadow_val
  from public.patrol_progress as pp
  where pp.user_id = current_user_id;

  shadow_val := coalesce(shadow_val, 40) - case when p_correct then 15 else -20 end;
  shadow_val := greatest(0, least(100, shadow_val));

  select count(*)::int
  into completed
  from public.patrol_stage_progress as psp
  where psp.user_id = current_user_id and psp.status = 'completed';

  select count(*)::int
  into total_val
  from public.patrol_npcs;

  if shadow_val <= 0 then
    new_status := 'won';
  elsif shadow_val >= 100 then
    new_status := 'lost';
  else
    new_status := 'playing';
  end if;

  insert into public.patrol_progress as pp (user_id, completed_npc_ids, shadow_pct, completed_at, updated_at)
  values (
    current_user_id,
    array[p_npc_id],
    shadow_val,
    case when shadow_val <= 0 then now() else null end,
    now()
  )
  on conflict (user_id) do update set
    completed_npc_ids = case
      when p_npc_id = any(pp.completed_npc_ids) then pp.completed_npc_ids
      else array_append(pp.completed_npc_ids, p_npc_id)
    end,
    shadow_pct = excluded.shadow_pct,
    completed_at = case
      when excluded.shadow_pct <= 0 then coalesce(pp.completed_at, excluded.completed_at)
      else pp.completed_at
    end,
    updated_at = now();

  return query select shadow_val, completed, total_val, new_status;
end;
$$;

revoke execute on function public.complete_patrol_npc(text, boolean) from public, anon;
grant execute on function public.complete_patrol_npc(text, boolean) to authenticated;

create or replace function public.get_patrol_progress()
returns table (
  shadow_pct integer,
  completed_npc_ids text[],
  completed_count integer,
  total_count integer,
  status text
) language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  shadow_val integer;
  completed_arr text[];
  completed_cnt integer;
  total_val integer;
  stat text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select pp.shadow_pct, pp.completed_npc_ids
  into shadow_val, completed_arr
  from public.patrol_progress as pp
  where pp.user_id = current_user_id;

  if shadow_val is null then
    shadow_val := 40;
    completed_arr := '{}';
  else
    completed_arr := coalesce(completed_arr, '{}');
  end if;

  select count(*)::int
  into completed_cnt
  from public.patrol_stage_progress as psp
  where psp.user_id = current_user_id and psp.status = 'completed';

  select count(*)::int
  into total_val
  from public.patrol_npcs;

  if shadow_val <= 0 then
    stat := 'won';
  elsif shadow_val >= 100 then
    stat := 'lost';
  else
    stat := 'playing';
  end if;

  return query select shadow_val, completed_arr, completed_cnt, total_val, stat;
end;
$$;

revoke execute on function public.get_patrol_progress() from public, anon;
grant execute on function public.get_patrol_progress() to authenticated;

create or replace function public.reset_patrol_progress()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from public.patrol_stage_progress as psp
  where psp.user_id = current_user_id;

  delete from public.patrol_progress as pp
  where pp.user_id = current_user_id;
end;
$$;

revoke execute on function public.reset_patrol_progress() from public, anon;
grant execute on function public.reset_patrol_progress() to authenticated;
