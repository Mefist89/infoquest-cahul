create table public.module_stage_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (module_id in ('operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective')),
  stage_index smallint not null check (stage_index between 1 and 8),
  stage_kind text not null check (stage_kind in ('theory', 'video_explanation', 'video_example', 'game_1', 'game_2', 'game_3', 'game_4', 'final_battle')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  score integer not null default 0 check (score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id, stage_index)
);

alter table public.module_stage_progress enable row level security;

create policy "stage_progress_select_own" on public.module_stage_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "stage_progress_insert_own" on public.module_stage_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "stage_progress_update_own" on public.module_stage_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.module_stage_progress to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;

  insert into public.module_progress (user_id, module_id)
  select new.id, module_id
  from unnest(array['operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective']) as module_id
  on conflict (user_id, module_id) do nothing;

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind)
  select new.id, modules.module_id, stages.stage_index, stages.stage_kind
  from unnest(array['operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective']) as modules(module_id)
  cross join (values
    (1::smallint, 'theory'),
    (2::smallint, 'video_explanation'),
    (3::smallint, 'video_example'),
    (4::smallint, 'game_1'),
    (5::smallint, 'game_2'),
    (6::smallint, 'game_3'),
    (7::smallint, 'game_4'),
    (8::smallint, 'final_battle')
  ) as stages(stage_index, stage_kind)
  on conflict (user_id, module_id, stage_index) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind)
select users.id, modules.module_id, stages.stage_index, stages.stage_kind
from auth.users as users
cross join unnest(array['operator-call', 'fake-link', 'hacked-account', 'scam-or-real', 'deepfake-detective']) as modules(module_id)
cross join (values
  (1::smallint, 'theory'),
  (2::smallint, 'video_explanation'),
  (3::smallint, 'video_example'),
  (4::smallint, 'game_1'),
  (5::smallint, 'game_2'),
  (6::smallint, 'game_3'),
  (7::smallint, 'game_4'),
  (8::smallint, 'final_battle')
) as stages(stage_index, stage_kind)
on conflict (user_id, module_id, stage_index) do nothing;

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
    from auth.users
    where id = (select auth.uid())
      and lower(email) = 'jeniabortnic@gmail.com'
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

;
