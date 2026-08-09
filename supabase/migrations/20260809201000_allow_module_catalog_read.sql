create policy "module_catalog_read_all"
on public.module_catalog
for select
to anon, authenticated
using (true);

create policy "module_stage_catalog_read_all"
on public.module_stage_catalog
for select
to anon, authenticated
using (true);

grant select on table public.module_catalog to anon, authenticated;
grant select on table public.module_stage_catalog to anon, authenticated;
