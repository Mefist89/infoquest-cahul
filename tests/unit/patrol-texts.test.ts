import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as patrolData from "@/data/patrol";
import * as patrolBankCallData from "@/data/patrol-bank-call";
import * as patrolDeliverySmsData from "@/data/patrol-delivery-sms";
import * as patrolFakeCallData from "@/data/patrol-fake-call";
import * as patrolHackedAccountData from "@/data/patrol-hacked-account";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { PATROL_SAFETY_RULES } from "@/data/safety-phrases";
import { getUniquePatrolModules, isUnsupportedPatrolDevice } from "@/components/game/PatrolGameLoader";
import {
  loadPatrolProgress,
  PATROL_SAVE_ENABLED,
  resetPatrolProgress,
  savePatrolNpcCompletion,
} from "@/features/patrol/progress";

type LocaleBuckets = {
  ru: { path: string; value: string }[];
  ro: { path: string; value: string }[];
};

function collectLocalizedStrings(
  node: unknown,
  currentPath: string,
  buckets: LocaleBuckets,
  activeLocale?: "ru" | "ro",
) {
  if (typeof node === "string") {
    if (activeLocale) {
      buckets[activeLocale].push({ path: currentPath, value: node });
    }
    return;
  }

  if (typeof node === "function") {
    const evaluated = (node as (a: number, b: number) => unknown)(1, 3);
    if (typeof evaluated === "string" && activeLocale) {
      buckets[activeLocale].push({ path: currentPath, value: evaluated });
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      collectLocalizedStrings(item, `${currentPath}[${index}]`, buckets, activeLocale);
    });
    return;
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const nextLocale = key === "ru" || key === "ro" ? key : activeLocale;
      collectLocalizedStrings(value, `${currentPath}.${key}`, buckets, nextLocale);
    }
  }
}

function getAllPatrolLocalizedStrings(): LocaleBuckets {
  const buckets: LocaleBuckets = { ru: [], ro: [] };
  collectLocalizedStrings(patrolData, "patrol", buckets);
  collectLocalizedStrings(patrolBankCallData, "patrol-bank-call", buckets);
  collectLocalizedStrings(patrolFakeCallData, "patrol-fake-call", buckets);
  collectLocalizedStrings(patrolHackedAccountData, "patrol-hacked-account", buckets);
  collectLocalizedStrings(patrolDeliverySmsData, "patrol-delivery-sms", buckets);
  return buckets;
}

describe("тексты 2D-игры «Патруль» (RU / RO)", () => {
  const buckets = getAllPatrolLocalizedStrings();

  it("собирает непустые наборы строк для RU и RO", () => {
    expect(buckets.ru.length).toBeGreaterThan(100);
    expect(buckets.ro.length).toBeGreaterThan(100);
  });

  it("во всех RO-строках игры нет кириллицы", () => {
    const cyrillicRegex = /[А-Яа-яЁё]/u;
    const violations = buckets.ro.filter(({ value }) => cyrillicRegex.test(value));
    expect(violations).toEqual([]);
  });

  it("во всех RU-строках игры нет слов Phaser, SCAN, OK, SHOP, HP", () => {
    const forbiddenRuWords = /\b(Phaser|SCAN|OK|SHOP|HP)\b/i;
    const violations = buckets.ru.filter(({ value }) => forbiddenRuWords.test(value));
    expect(violations).toEqual([]);
  });

  it("в файлах сцен src/components/game не осталось встроенных строк locale === 'ro' ? ... : ...", () => {
    const gameDir = path.resolve(process.cwd(), "src/components/game");
    const files = fs.readdirSync(gameDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    for (const file of files) {
      const source = fs.readFileSync(path.join(gameDir, file), "utf8");
      const withoutComments = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      expect(withoutComments, `${file} contains inline locale ternary`).not.toMatch(/locale\s*===\s*["']ro["']\s*\?/);
      expect(withoutComments, `${file} contains Cyrillic string literals`).not.toMatch(/[А-Яа-яЁё]/u);
    }
  });

  it("каждый житель в PATROL_NPCS привязан к маршруту из MODULE_CATALOG и правилу из safety-phrases.ts", () => {
    const routesByNpc = Object.fromEntries(
      patrolData.PATROL_NPCS.map((npc) => [npc.id, npc.moduleRoute]),
    );
    expect(routesByNpc).toEqual({
      "post-maria": "/modules/fake-link",
      "bank-operator": "/modules/operator-call",
      "school-friend": "/modules/operator-call",
      "shop-seller": "/modules/hacked-account",
    });

    for (const npc of patrolData.PATROL_NPCS) {
      const mod = MODULE_CATALOG.find((item) => item.route === npc.moduleRoute);
      expect(mod).toBeDefined();
      expect(PATROL_SAFETY_RULES.ru[npc.id].length).toBeGreaterThan(10);
      expect(PATROL_SAFETY_RULES.ro[npc.id].length).toBeGreaterThan(10);
    }
  });

  it("мобильная заглушка определяет телефон/узкий экран и отдаёт модули жителей без повторов", () => {
    const makeWindow = (coarse: boolean, fine: boolean, innerWidth: number) =>
      ({
        innerWidth,
        matchMedia: (q: string) => ({
          matches:
            q === "(pointer: coarse)"
              ? coarse
              : q === "(any-pointer: fine)"
                ? fine
                : false,
        }),
      }) as unknown as Window;

    expect(isUnsupportedPatrolDevice(makeWindow(true, false, 1200))).toBe(true);
    expect(isUnsupportedPatrolDevice(makeWindow(false, true, 899))).toBe(true);
    expect(isUnsupportedPatrolDevice(makeWindow(false, true, 900))).toBe(false);
    expect(isUnsupportedPatrolDevice(makeWindow(true, true, 1024))).toBe(false);

    const uniqueMods = getUniquePatrolModules();
    expect(uniqueMods.map((m) => m.route)).toEqual([
      "/modules/fake-link",
      "/modules/operator-call",
      "/modules/hacked-account",
    ]);
  });

  it("сохранение прогресса патруля отключено (PATROL_SAVE_ENABLED = false) и старт идёт с Тени 40 и 0 из 4", async () => {
    expect(PATROL_SAVE_ENABLED).toBe(false);
    await expect(loadPatrolProgress()).resolves.toEqual({
      data: { shadow: 40, resolvedIds: [] },
      error: false,
    });
    await expect(savePatrolNpcCompletion("post-maria", true)).resolves.toEqual({
      error: false,
    });
    await expect(resetPatrolProgress()).resolves.toEqual({
      error: false,
    });
  });
});
