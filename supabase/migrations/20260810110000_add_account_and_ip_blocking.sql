alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'student', 'teacher', 'administrator', 'blocked'));

alter table public.profiles
  add column if not exists last_ip_hash text,
  add column if not exists last_ip_seen_at timestamptz;

alter table public.user_role_audit
  drop constraint if exists user_role_audit_previous_role_check,
  drop constraint if exists user_role_audit_new_role_check;

alter table public.user_role_audit
  add constraint user_role_audit_previous_role_check
    check (previous_role in ('user', 'student', 'teacher', 'administrator', 'blocked')),
  add constraint user_role_audit_new_role_check
    check (new_role in ('user', 'student', 'teacher', 'administrator', 'blocked'));

create table public.access_blocks (
  id bigint generated always as identity primary key,
  block_type text not null check (block_type in ('email', 'ip')),
  block_value text not null,
  target_user_id uuid references auth.users(id) on delete cascade,
  reason text,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  revoked_by uuid references auth.users(id) on delete restrict,
  revoked_at timestamptz
);

create unique index access_blocks_active_value_unique
  on public.access_blocks (block_type, block_value)
  where active;

create index access_blocks_target_user_idx
  on public.access_blocks (target_user_id, block_type)
  where active;

alter table public.access_blocks enable row level security;
revoke all on public.access_blocks from public, anon, authenticated;

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  old_role text;
  target_email text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_role not in ('user', 'student', 'teacher', 'administrator', 'blocked') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;

  if p_user_id = current_user_id and p_role <> 'administrator' then
    raise exception 'Administrators cannot remove or block their own role' using errcode = '42501';
  end if;

  select profiles.role, lower(users.email)
  into old_role, target_email
  from public.profiles as profiles
  join auth.users as users on users.id = profiles.id
  where profiles.id = p_user_id
  for update of profiles;

  if old_role is null then
    raise exception 'Unknown user' using errcode = '22023';
  end if;

  if old_role <> p_role then
    update public.profiles
    set role = p_role, updated_at = now()
    where id = p_user_id;

    insert into public.user_role_audit (target_user_id, previous_role, new_role, changed_by)
    values (p_user_id, old_role, p_role, current_user_id);
  end if;

  if p_role = 'blocked' and target_email is not null then
    insert into public.access_blocks (block_type, block_value, target_user_id, reason, created_by)
    values ('email', target_email, p_user_id, 'Account blocked by administrator', current_user_id)
    on conflict (block_type, block_value) where active
    do update set target_user_id = excluded.target_user_id, reason = excluded.reason;
  elsif p_role <> 'blocked' then
    update public.access_blocks
    set active = false, revoked_by = current_user_id, revoked_at = now()
    where active and block_type = 'email' and target_user_id = p_user_id;
  end if;
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

create or replace function public.check_access_status(p_ip_hash text default null)
returns table (is_blocked boolean, block_source text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  current_role text;
begin
  if p_ip_hash is not null and p_ip_hash !~ '^[0-9a-f]{64}$' then
    p_ip_hash := null;
  end if;

  if current_user_id is not null then
    select lower(users.email), profiles.role
    into current_email, current_role
    from auth.users as users
    join public.profiles as profiles on profiles.id = users.id
    where users.id = current_user_id;

    if p_ip_hash is not null then
      update public.profiles
      set last_ip_hash = p_ip_hash, last_ip_seen_at = now()
      where id = current_user_id;
    end if;

    if current_role = 'blocked' then
      return query select true, 'role'::text;
      return;
    end if;

    if current_email is not null and exists (
      select 1 from public.access_blocks
      where active and block_type = 'email' and block_value = current_email
    ) then
      update public.profiles set role = 'blocked', updated_at = now() where id = current_user_id;
      return query select true, 'email'::text;
      return;
    end if;
  end if;

  if p_ip_hash is not null and exists (
    select 1 from public.access_blocks
    where active and block_type = 'ip' and block_value = p_ip_hash
  ) then
    return query select true, 'ip'::text;
    return;
  end if;

  return query select false, null::text;
end;
$$;

revoke execute on function public.check_access_status(text) from public;
grant execute on function public.check_access_status(text) to anon, authenticated;

create or replace function public.set_user_ip_block(p_user_id uuid, p_blocked boolean, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_ip_hash text;
  admin_ip_hash text;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles where id = current_user_id and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_user_id = current_user_id then
    raise exception 'Administrators cannot block their own IP' using errcode = '42501';
  end if;

  select last_ip_hash into target_ip_hash from public.profiles where id = p_user_id;
  select last_ip_hash into admin_ip_hash from public.profiles where id = current_user_id;

  if p_blocked then
    if target_ip_hash is null then
      raise exception 'The user has no recorded IP yet' using errcode = '22023';
    end if;
    if admin_ip_hash is not null and target_ip_hash = admin_ip_hash then
      raise exception 'This IP is shared with the current administrator' using errcode = '42501';
    end if;

    insert into public.access_blocks (block_type, block_value, target_user_id, reason, created_by)
    values ('ip', target_ip_hash, p_user_id, nullif(left(trim(p_reason), 300), ''), current_user_id)
    on conflict (block_type, block_value) where active
    do update set target_user_id = excluded.target_user_id, reason = excluded.reason;
  else
    update public.access_blocks
    set active = false, revoked_by = current_user_id, revoked_at = now()
    where active and block_type = 'ip' and target_user_id = p_user_id;
  end if;
end;
$$;

revoke execute on function public.set_user_ip_block(uuid, boolean, text) from public, anon;
grant execute on function public.set_user_ip_block(uuid, boolean, text) to authenticated;

create or replace function public.get_admin_access_status()
returns table (user_id uuid, last_ip_seen_at timestamptz, ip_blocked boolean)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'administrator'
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    profiles.id,
    profiles.last_ip_seen_at,
    exists (
      select 1 from public.access_blocks
      where access_blocks.active
        and access_blocks.block_type = 'ip'
        and access_blocks.target_user_id = profiles.id
    )
  from public.profiles;
end;
$$;

revoke execute on function public.get_admin_access_status() from public, anon;
grant execute on function public.get_admin_access_status() to authenticated;

create or replace function public.prevent_blocked_progress_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.profiles
    where id = new.user_id
      and (
        role = 'blocked'
        or exists (
          select 1 from public.access_blocks
          where access_blocks.active
            and access_blocks.block_type = 'ip'
            and access_blocks.block_value = public.profiles.last_ip_hash
        )
      )
  ) then
    raise exception 'Account access is blocked' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_blocked_progress_write() from public, anon, authenticated;

drop trigger if exists prevent_blocked_module_progress_write on public.module_progress;
create trigger prevent_blocked_module_progress_write
before insert or update on public.module_progress
for each row execute function public.prevent_blocked_progress_write();

drop trigger if exists prevent_blocked_stage_progress_write on public.module_stage_progress;
create trigger prevent_blocked_stage_progress_write
before insert or update on public.module_stage_progress
for each row execute function public.prevent_blocked_progress_write();
