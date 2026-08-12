create table public.module_catalog (
  id text primary key,
  position smallint not null unique check (position between 1 and 8),
  title_ru text not null,
  title_ro text not null,
  is_available boolean not null default false,
  route text,
  max_xp integer not null default 100 check (max_xp > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.module_stage_catalog (
  stage_index smallint primary key,
  stage_kind text not null unique,
  title_ru text not null,
  title_ro text not null,
  max_xp integer not null check (max_xp > 0),
  unique (stage_index, stage_kind)
);

insert into public.module_catalog (id, position, title_ru, title_ro, is_available, route, max_xp)
values
  ('operator-call', 1, 'Фальшивый звонок оператора', 'Apelul fals de la operator', true, '/modules/operator-call', 100),
  ('fake-link', 2, 'Ловушка фальшивой ссылки', 'Capcana linkului fals', false, null, 100),
  ('hacked-account', 3, 'Взломанный аккаунт', 'Contul compromis', false, null, 100),
  ('scam-or-real', 4, 'Скам или реальное предложение?', 'Scam sau ofertă reală?', false, null, 100),
  ('deepfake-detective', 5, 'Детектив дипфейков', 'Deepfake Detective', false, null, 100),
  ('bilingual-detective', 6, 'Двуязычный детектив', 'Detectivul bilingv', false, null, 100),
  ('rumor-city', 7, 'Город под осадой слухов', 'Orașul sub asediul zvonurilor', false, null, 100),
  ('community-trolls', 8, 'Защити сообщество от троллей', 'Apără comunitatea de troli', false, null, 100);

insert into public.module_stage_catalog (stage_index, stage_kind, title_ru, title_ro, max_xp)
values
  (1, 'theory', 'Теория', 'Teorie', 8),
  (2, 'video_explanation', 'Видеообъяснение', 'Explicație video', 8),
  (3, 'video_example', 'Видеопример', 'Exemplu video', 8),
  (4, 'game_1', 'Игра: выбор', 'Joc: alegere', 12),
  (5, 'game_2', 'Игра: анализ', 'Joc: analiză', 12),
  (6, 'game_3', 'Игра: проверка', 'Joc: verificare', 12),
  (7, 'game_4', 'Игра: решение', 'Joc: decizie', 12),
  (8, 'final_battle', 'Финальная схватка', 'Confruntarea finală', 28);

alter table public.module_catalog enable row level security;
alter table public.module_stage_catalog enable row level security;
revoke all on table public.module_catalog from public, anon, authenticated;
revoke all on table public.module_stage_catalog from public, anon, authenticated;

alter table public.module_progress drop constraint if exists module_progress_module_id_check;
alter table public.module_progress
  add constraint module_progress_module_id_fkey
  foreign key (module_id) references public.module_catalog(id);

alter table public.module_stage_progress drop constraint if exists module_stage_progress_module_id_check;
alter table public.module_stage_progress drop constraint if exists module_stage_progress_stage_index_check;
alter table public.module_stage_progress drop constraint if exists module_stage_progress_stage_kind_check;
alter table public.module_stage_progress
  add constraint module_stage_progress_module_id_fkey
  foreign key (module_id) references public.module_catalog(id);
alter table public.module_stage_progress
  add constraint module_stage_progress_stage_fkey
  foreign key (stage_index, stage_kind)
  references public.module_stage_catalog(stage_index, stage_kind);

insert into public.module_progress (user_id, module_id)
select users.id, modules.id
from auth.users as users
cross join public.module_catalog as modules
on conflict (user_id, module_id) do nothing;

insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind)
select users.id, modules.id, stages.stage_index, stages.stage_kind
from auth.users as users
cross join public.module_catalog as modules
cross join public.module_stage_catalog as stages
on conflict (user_id, module_id, stage_index) do nothing;

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
  select new.id, modules.id
  from public.module_catalog as modules
  on conflict (user_id, module_id) do nothing;

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind)
  select new.id, modules.id, stages.stage_index, stages.stage_kind
  from public.module_catalog as modules
  cross join public.module_stage_catalog as stages
  on conflict (user_id, module_id, stage_index) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

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
  expected_stage_count bigint;
  final_stage_index smallint;
  calculated_xp integer;
  calculated_score integer;
  calculated_status text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (select 1 from public.module_catalog where id = p_module_id) then
    raise exception 'Unknown module' using errcode = '22023';
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

  insert into public.module_stage_progress (user_id, module_id, stage_index, stage_kind, status, score, completed_at, updated_at)
  values (current_user_id, p_module_id, p_stage_index, stage_kind_value, 'completed', p_score, now(), now())
  on conflict (user_id, module_id, stage_index)
  do update set
    status = 'completed',
    score = greatest(public.module_stage_progress.score, excluded.score),
    completed_at = coalesce(public.module_stage_progress.completed_at, excluded.completed_at),
    updated_at = now();

  select count(*)::bigint, max(stages.stage_index)
  into expected_stage_count, final_stage_index
  from public.module_stage_catalog as stages;

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
    attempts = greatest(public.module_progress.attempts, excluded.attempts),
    completed_at = case when excluded.status = 'completed' then coalesce(public.module_progress.completed_at, excluded.completed_at) else public.module_progress.completed_at end,
    updated_at = now();

  return query select completed_count, calculated_xp, calculated_status, calculated_score;
end;
$$;

revoke execute on function public.complete_module_stage(text, smallint, integer) from public, anon;
grant execute on function public.complete_module_stage(text, smallint, integer) to authenticated;

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
declare
  catalog_stage_count bigint := (
    select count(*)::bigint
    from public.module_catalog
    cross join public.module_stage_catalog
  );
begin
  if not exists (
    select 1
    from auth.users as admin_user
    where admin_user.id = (select auth.uid())
      and lower(admin_user.email) in ('jeniabortnic@gmail.com', 'pucalmaria@gmail.com')
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
    catalog_stage_count,
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
        order by modules.position
      ) as module_breakdown
    from public.module_progress
    join public.module_catalog as modules on modules.id = module_progress.module_id
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
