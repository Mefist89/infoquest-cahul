-- Patrol progress tables and RPC
-- Separate from module progress to avoid breaking existing module_catalog/module_progress.
-- All writes go through server-validated RPC (SECURITY DEFINER).

create table if not exists public.patrol_progress (
  user_id uuid primary key references auth.users on delete cascade,
  completed_npc_ids text[] not null default '{}',
  shadow_pct integer not null default 40,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.patrol_stage_progress (
  user_id uuid not null references auth.users on delete cascade,
  npc_id text not null,
  status text not null check (status in ('not_started','completed')),
  correct boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, npc_id)
);

alter table public.patrol_progress enable row level security;
alter table public.patrol_stage_progress enable row level security;

revoke all on table public.patrol_progress from public, anon, authenticated;
revoke all on table public.patrol_stage_progress from public, anon, authenticated;

create policy "patrol_progress_select_own" on public.patrol_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "patrol_stage_progress_select_own" on public.patrol_stage_progress
  for select to authenticated using (auth.uid() = user_id);

-- Write only via RPC below.

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
  if not exists (select 1 from public.patrol_npcs where id = p_npc_id) then
    raise exception 'Unknown NPC' using errcode = '22023';
  end if;

  -- Upsert stage progress
  insert into public.patrol_stage_progress (user_id, npc_id, status, correct, completed_at)
  values (current_user_id, p_npc_id, 'completed', p_correct, now())
  on conflict (user_id, npc_id) do update set
    status = 'completed',
    correct = excluded.correct,
    completed_at = coalesce(patrol_stage_progress.completed_at, excluded.completed_at);

  -- Update progress
  select shadow_pct - case when $2 then 15 else -20 end
  into shadow_val
  from public.patrol_progress where user_id = current_user_id;

  shadow_val := greatest(0, least(100, shadow_val));

  select count(*)::int
  into completed
  from public.patrol_stage_progress
  where user_id = current_user_id and status = 'completed';

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

  insert into public.patrol_progress (user_id, shadow_pct, completed_count, completed_at, updated_at)
  values (current_user_id, shadow_val, completed, case when shadow_val <= 0 then now() else null end, now())
  on conflict (user_id) do update set
    shadow_pct = excluded.shadow_pct,
    completed_count = excluded.completed_count,
    completed_at = case when excluded.shadow_pct <= 0 then coalesce(patrol_progress.completed_at, excluded.completed_at) else patrol_progress.completed_at end,
    updated_at = now();

  return query select shadow_val, completed, total_val, new_status;
end;
$$;

revoke execute on function public.complete_patrol_npc(text, boolean) from public, anon;
grant execute on function public.complete_patrol_npc(text, boolean) to authenticated;

-- Fetch patrol progress for resume
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

  select shadow_pct, completed_npc_ids
  into shadow_val, completed_arr
  from public.patrol_progress where user_id = current_user_id;

  if shadow_val is null then
    -- First time: initialize with defaults
    shadow_val := 40;
    completed_arr := '{}';
  end if;

  select count(*)::int
  into completed_cnt
  from public.patrol_stage_progress
  where user_id = current_user_id and status = 'completed';

  select count(*)::int
  into total_val
  from public.patrol_npcs;

  if shadow_val <= 0 then stat := 'won';
  elsif shadow_val >= 100 then stat := 'lost';
  else stat := 'playing';
  end if;

  return query select shadow_val, completed_arr, completed_cnt, total_val, stat;
end;
$$;

revoke execute on function public.get_patrol_progress() from public, anon;
grant execute on function public.get_patrol_progress() to authenticated;

-- NPC catalog table (read-only for client)
create table if not exists public.patrol_npcs (
  id text primary key,
  sprite text not null,
  tint integer,
  x integer not null,
  y integer not null,
  name_ru text not null,
  name_ro text not null,
  situation_ru text not null,
  situation_ro text not null,
  options jsonb not null,
  success_ru text not null,
  success_ro text not null,
  fail_ru text not null,
  fail_ro text not null
);

alter table public.patrol_npcs enable row level security;
revoke all on table public.patrol_npcs from public, anon, authenticated;
create policy "patrol_npcs_read_all" on public.patrol_npcs for select to authenticated using (true);

-- Seed NPCs (will be run once)
insert into public.patrol_npcs (id, sprite, tint, x, y, name_ru, name_ro, situation_ru, situation_ro, options, success_ru, success_ro, fail_ru, fail_ro)
values
  ('post-maria', 'npc-female', null, 350, 700,
   'Мария', 'Maria',
   'Мария получила SMS: «Посылка задержана. Оплати 20 леев: posta-md-livrare.top». Что ей делать?',
   'Maria a primit SMS: «Coletul e reținut. Plătește 20 de lei: posta-md-livrare.top». Ce să facă?',
   '[{"text":{"ru":"Удалить SMS и проверить трек на posta.md","ro":"Șterge SMS-ul și verifică trackingul pe posta.md"},"correct":true},{"text":{"ru":"Оплатить по ссылке, чтобы не потерять посылку","ro":"Plătește prin link, ca să nu piardă coletul"},"correct":false}]',
   'Верно! Почта не просит оплату по ссылкам из SMS.', 'Corect! Poșta nu cere plăți prin linkuri din SMS.',
   'Мимо! Ссылка ведёт мошенникам — трек проверяют только на официальном сайте.', 'Greșit! Linkul duce la escroci — trackingul se verifică doar pe site-ul oficial.'),
  ('bank-operator', 'npc-male', null, 1250, 500,
   'Звонок из банка', 'Apel de la bancă',
   '«Это служба безопасности. Карта заблокирована! Назовите код из SMS». Твои действия?',
   '«Sunt de la securitatea băncii. Cardul e blocat! Spuneți codul din SMS». Ce faci?',
   '[{"text":{"ru":"Положу трубку и перезвоню в банк по номеру на карте","ro":"Închid și sun înapoi la bancă la numărul de pe card"},"correct":true},{"text":{"ru":"Продиктую код — сотрудник же представился","ro":"Dictez codul — angajatul s-a prezentat"},"correct":false}]',
   'Верно! Банк никогда не просит коды по телефону.', 'Corect! Banca nu cere niciodată coduri la telefon.',
   'Мимо! Код из SMS — ключ от денег. Клади трубку и перезванивай сам.', 'Greșit! Codul din SMS e cheia banilor. Închizi și suni tu înapoi.'),
  ('school-friend', 'npc-female', 16750824, 350, 500,
   'Друг', 'Prietenul',
   'Друг с нового аккаунта просит: «Срочно переведи 500 леев, завтра верну!» Что ответишь?',
   'Prietenul de pe cont nou cere: «Transferă urgent 500 de lei, mâine îți întorc!» Ce răspunzi?',
   '[{"text":{"ru":"Позвоню другу на известный номер и проверю","ro":"Îl sun pe prieten la numărul cunoscut și verific"},"correct":true},{"text":{"ru":"Переведу — друг же просит срочно","ro":"Transfer — prietenul cere urgent"},"correct":false}]',
   'Верно! Денежные просьбы проверяют вторым каналом связи.', 'Corect! Cererile de bani se verifică printr-un al doilea canal.',
   'Мимо! Аккаунт друга могли взломать — всегда проверяй.', 'Greșit! Contul prietenului putea fi spart — verifică mereu.'),
  ('shop-seller', 'npc-male', 14274559, 1250, 700,
   'Продавец', 'Vânzătorul',
   'Продавец: «Телефон за полцены! Переводи предоплату, а то уйдёт другому!» Твой ход?',
   'Vânzătorul: «Telefon la jumătate de preț! Transferă avansul, altfel îl ia altul!» Ce faci?',
   '[{"text":{"ru":"Проверю продавца и встречусь лично","ro":"Verific vânzătorul și mă întâlnesc personal"},"correct":true},{"text":{"ru":"Переведу предоплату, пока не упустил","ro":"Transfer avansul, până nu-l pierd"},"correct":false}]',
   'Верно! Спешка и предоплата — метки скама.', 'Corect! Graba și avansul — marca scamului.',
   'Мимо! Предоплата незнакомцу исчезает вместе с продавцом.', 'Greșit! Avansul unui străin dispare odată cu vânzătorul.')
on conflict (id) do nothing;