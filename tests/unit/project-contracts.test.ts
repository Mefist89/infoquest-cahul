import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MODULE_CATALOG,
  MODULE_COUNT,
  MODULE_MAX_XP,
  MODULE_STAGES,
  STAGE_COUNT,
  TOTAL_MAX_XP,
  TOTAL_STAGE_COUNT,
} from "@/data/module-catalog";
import { canUseAi, isAdministrator, isUserRole, USER_ROLES } from "@/lib/roles";

describe("единый каталог модулей", () => {
  it("содержит восемь модулей и восемь этапов", () => {
    expect(MODULE_COUNT).toBe(8);
    expect(STAGE_COUNT).toBe(8);
    expect(TOTAL_STAGE_COUNT).toBe(64);
    expect(MODULE_CATALOG).toHaveLength(MODULE_COUNT);
    expect(MODULE_STAGES).toHaveLength(STAGE_COUNT);
  });

  it("имеет уникальные идентификаторы и ровно один доступный модуль", () => {
    expect(new Set(MODULE_CATALOG.map((module) => module.moduleId)).size).toBe(MODULE_COUNT);
    expect(MODULE_CATALOG.filter((module) => module.status === "playable").map((module) => module.moduleId)).toEqual(["operator-call"]);
    expect(MODULE_CATALOG[0].route).toBe("/modules/operator-call");
  });

  it("начисляет 100 XP за модуль и 800 XP за весь проект", () => {
    expect(MODULE_MAX_XP).toBe(100);
    expect(TOTAL_MAX_XP).toBe(800);
    expect(MODULE_STAGES.map((stage) => stage.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("роли и доступ к Chrono", () => {
  it("распознаёт только поддерживаемые роли", () => {
    USER_ROLES.forEach((role) => expect(isUserRole(role)).toBe(true));
    expect(isUserRole("owner")).toBe(false);
    expect(isUserRole(null)).toBe(false);
  });

  it("разрешает AI ученику, учителю и администратору", () => {
    expect(canUseAi("user")).toBe(false);
    expect(canUseAi("student")).toBe(true);
    expect(canUseAi("teacher")).toBe(true);
    expect(canUseAi("administrator")).toBe(true);
    expect(canUseAi("blocked")).toBe(false);
    expect(isAdministrator("teacher")).toBe(false);
    expect(isAdministrator("administrator")).toBe(true);
    expect(isAdministrator("blocked")).toBe(false);
  });
});

describe("контракт клавиатурной доступности первого модуля", () => {
  const source = readFileSync(join(process.cwd(), "src/components/modules/OperatorCallModule.tsx"), "utf8");

  it("не использует кликабельные div, span или p", () => {
    expect(source).not.toMatch(/<(?:div|span|p)\b[^>]*\bonClick=/u);
  });

  it("содержит состояния выбора, live-сообщения и паузу таймеров", () => {
    expect(source).toContain('aria-pressed={isSelected}');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("setPaused");
    expect(source).toContain("setBlitzPaused");
  });
});
