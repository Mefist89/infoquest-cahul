create index module_progress_module_id_idx
on public.module_progress (module_id);

create index module_stage_progress_module_id_idx
on public.module_stage_progress (module_id);

create index module_stage_progress_stage_catalog_idx
on public.module_stage_progress (stage_index, stage_kind);

create policy "ai_usage_deny_direct_access"
on public.ai_usage_daily
for all
to anon, authenticated
using (false)
with check (false);
