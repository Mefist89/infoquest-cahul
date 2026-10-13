-- Publish the second learning module ("fake-link") so progress can be saved.
-- Matches the frontend catalog in src/data/module-catalog.ts (status: "playable",
-- route: "/modules/fake-link"). The secure complete_module_stage RPC rejects
-- stage writes for modules with is_available = false ("Module is not available").
update public.module_catalog
set is_available = true,
    route = '/modules/fake-link',
    updated_at = now()
where id = 'fake-link';
