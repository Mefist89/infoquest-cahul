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
