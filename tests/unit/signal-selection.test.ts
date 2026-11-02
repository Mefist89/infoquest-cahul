import { describe, expect, it } from "vitest";
import { createSignalProgress, evaluateSignalSelection, recordSignalClick, retrySignalProgress } from "@/features/modules/runner/signal-selection";
import { fakeLinkContent } from "@/data/fake-link";
import { scamOrRealContent } from "@/data/scam-or-real";

const signals = ["a", "b", "c", "d", "e", "f"];
const normal = ["login", "language", "copyright"];

describe("поиск подозрительных деталей среди обычных", () => {
  const click = (progress: ReturnType<typeof createSignalProgress>, id: string) => recordSignalClick(progress, id, signals, normal);
  const findAll = () => signals.reduce(click, createSignalProgress());

  it("нажатие на все зоны не даёт победу", () => {
    const progress = [...signals, ...normal].reduce(click, createSignalProgress());
    expect(evaluateSignalSelection(progress, signals)).toEqual({ correct: 6, total: 6, trapClicks: 3, passed: false });
  });

  it("для победы нужны все сигналы, а не четыре или пять", () => {
    for (const count of [0, 4, 5]) {
      const progress = signals.slice(0, count).reduce(click, createSignalProgress());
      expect(evaluateSignalSelection(progress, signals).passed).toBe(false);
    }
    expect(evaluateSignalSelection(findAll(), signals).passed).toBe(true);
  });

  it.each([0, 1, 2, 3])("после %i кликов по ловушке сохраняет находки и проверяет предел двух ошибок", count => {
    let progress = findAll();
    for (let index = 0; index < count; index++) progress = click(progress, normal[0]);
    expect(progress.found.size).toBe(6);
    expect(progress.trapClicks).toBe(count);
    expect(evaluateSignalSelection(progress, signals).passed).toBe(count <= 2);
  });

  it("повторные клики по найденному сигналу не отменяют находку и не прибавляют очки", () => {
    const progress = findAll();
    expect(click(progress, "a")).toBe(progress);
    expect(click(progress, "unknown")).toBe(progress);
    expect(evaluateSignalSelection(progress, signals).correct).toBe(6);
  });

  it("ловушка показывает объяснение, следующая находка скрывает его; повтор сохраняет найденное", () => {
    const first = click(createSignalProgress(), "a");
    const trap = click(first, normal[0]);
    expect(trap.lastTrap).toBe(normal[0]);
    expect(trap.found).toBe(first.found);
    expect([...trap.trapIds]).toEqual([normal[0]]);
    const next = click(trap, "b");
    expect(next.lastTrap).toBeNull();
    const retry = retrySignalProgress(next);
    expect([...retry.found]).toEqual(["a", "b"]);
    expect(retry.trapClicks).toBe(0);
    expect(retry.trapIds.size).toBe(0);
  });

  for (const [name, content] of [
    ["сайт", { ru: fakeLinkContent.ru.findSignals, ro: fakeLinkContent.ro.findSignals }],
    ["сделка", { ru: scamOrRealContent.ru.dealSignals, ro: scamOrRealContent.ro.dealSignals }],
  ] as const) {
    it(`${name}: RU и RO содержат одинаковые шесть сигналов и три обычные детали`, () => {
      for (const locale of ["ru", "ro"] as const) {
        expect(content[locale].signals).toHaveLength(6);
        expect(content[locale].normalDetails).toHaveLength(3);
        const all = [...content[locale].signals, ...content[locale].normalDetails];
        expect(new Set(all.map(item => item.id)).size).toBe(9);
        for (const item of all) { expect(item.title).not.toBe(""); expect(item.explain).not.toBe(""); }
      }
      expect(content.ru.signals.map(item => item.id)).toEqual(content.ro.signals.map(item => item.id));
      expect(content.ru.normalDetails.map(item => item.id)).toEqual(content.ro.normalDetails.map(item => item.id));
    });
  }
});
