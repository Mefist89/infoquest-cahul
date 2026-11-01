type CatalogEntry = { moduleId: string; route: string | null };
type ModuleProgress = { module_id: string; status: string };

/** Catalog order determines which available, unfinished module is offered next. */
export function pickNextModule<T extends CatalogEntry>(catalog: readonly T[], progress: readonly ModuleProgress[], currentModuleId: string): T | null {
  const completed = new Set(progress.filter(row => row.status === "completed").map(row => row.module_id));
  return catalog.find(entry => entry.route !== null && entry.moduleId !== currentModuleId && !completed.has(entry.moduleId)) ?? null;
}
