create index if not exists access_blocks_created_by_idx
  on public.access_blocks (created_by);

create index if not exists access_blocks_revoked_by_idx
  on public.access_blocks (revoked_by);;
