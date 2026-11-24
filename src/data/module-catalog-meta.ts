/**
 * Локаль-независимые инварианты каталога — единственный кусок каталога,
 * который разрешено импортировать клиентским компонентам (значениями).
 * Дубликаты чисел контролирует контрактный тест (уравнивает с производными
 * значениями полного каталога), поэтому здесь нельзя заводить ничего двуязычного.
 */
export const MODULE_IDS = {
  operatorCall: "operator-call",
  fakeLink: "fake-link",
  hackedAccount: "hacked-account",
  scamOrReal: "scam-or-real",
  deepfakeDetective: "deepfake-detective",
  bilingualDetective: "bilingual-detective",
  rumorCity: "rumor-city",
  communityTrolls: "community-trolls",
} as const;

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS];

export const MODULE_COUNT = 8;
export const STAGE_COUNT = 8;
export const MODULE_MAX_XP = 100; // 4 × 8 + 4 × 12 + 28
export const TOTAL_STAGE_COUNT = 64;
export const TOTAL_MAX_XP = 800;

export const PLAYABLE_MODULE_COUNT = 4;
export const PLAYABLE_STAGE_COUNT = 32;
export const PLAYABLE_MAX_XP = 400;

export const DEMO_ALLOWED_MODULE_IDS = [
  MODULE_IDS.operatorCall,
  MODULE_IDS.fakeLink,
] as const;

export const DEMO_MODULE_COUNT = DEMO_ALLOWED_MODULE_IDS.length;
export const DEMO_STAGE_COUNT = DEMO_MODULE_COUNT * STAGE_COUNT;
export const DEMO_MAX_XP = DEMO_MODULE_COUNT * MODULE_MAX_XP;

export function isDemoAllowedModule(moduleId: string): boolean {
  return (DEMO_ALLOWED_MODULE_IDS as readonly string[]).includes(moduleId);
}
