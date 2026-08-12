create table public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_ru text not null,
  title_ro text not null,
  summary_ru text,
  summary_ro text,
  game_type text not null default 'undecided' check (char_length(trim(game_type)) between 2 and 64),
  status text not null default 'planning' check (status in ('planning', 'draft', 'review', 'published', 'archived')),
  route text,
  cover_image_url text,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or (route is not null and published_at is not null))
);

comment on table public.quests is
  'Independent game quests. This catalog is intentionally separate from the eight educational modules.';
comment on column public.quests.config is
  'Versionable game configuration; its exact shape will be defined when the quest concept is approved.';

create index quests_status_sort_order_idx on public.quests (status, sort_order, created_at);

create or replace function public.set_quest_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_quest_updated_at() from public, anon, authenticated;

create trigger set_quest_updated_at
before update on public.quests
for each row execute function public.set_quest_updated_at();

alter table public.quests enable row level security;
revoke all on table public.quests from public, anon, authenticated;
grant select, insert, update, delete on table public.quests to authenticated;

create policy "quests_administrator_all"
on public.quests
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'administrator'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'administrator'
  )
);
