import { describe, expect, it } from "vitest";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { operatorCallContent } from "@/data/operator-call";
import { fakeLinkContent } from "@/data/fake-link";
import { hackedAccountContent } from "@/data/hacked-account";
import { scamOrRealContent } from "@/data/scam-or-real";
import { pickNextModule } from "@/features/modules/server/next-module";

describe("следующий модуль", () => {
  it("предлагает следующий незавершённый модуль", () => {
    expect(pickNextModule(MODULE_CATALOG, [], "operator-call")?.moduleId).toBe("fake-link");
  });

  it("пропускает уже пройденные модули", () => {
    const progress = [{ module_id: "fake-link", status: "completed" }];
    expect(pickNextModule(MODULE_CATALOG, progress, "operator-call")?.moduleId).toBe("hacked-account");
  });

  it("выбирает первый непройденный по порядку каталога, даже если он раньше текущего", () => {
    expect(pickNextModule(MODULE_CATALOG, [{ module_id: "operator-call", status: "in_progress" }], "fake-link")?.moduleId).toBe("operator-call");
  });

  it("возвращает null после всех четырёх модулей", () => {
    const progress = MODULE_CATALOG.filter(entry => entry.route !== null)
      .map(entry => ({ module_id: entry.moduleId, status: "completed" }));
    expect(pickNextModule(MODULE_CATALOG, progress, "scam-or-real")).toBeNull();
  });

  it("не возвращает модули без маршрута и исключает текущий даже до сохранения", () => {
    const catalog = [{ moduleId: "current", route: "/current" }, { moduleId: "soon", route: null }];
    expect(pickNextModule(catalog, [], "current")).toBeNull();
  });

  it("в каждом модуле одинаковая структура текста RU/RO", () => {
    for (const content of [operatorCallContent, fakeLinkContent, hackedAccountContent, scamOrRealContent]) {
      expect(Object.keys(content.ru.result)).toEqual(Object.keys(content.ro.result));
      expect(content.ru.result.xp).toContain("{xp}");
      expect(content.ro.result.xp).toContain("{xp}");
      expect(content.ru.result.nextModule).toContain("{title}");
      expect(content.ro.result.nextModule).toContain("{title}");
    }
  });
});
