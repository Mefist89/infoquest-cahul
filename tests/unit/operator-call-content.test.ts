import { describe, expect, it } from "vitest";
import { operatorCallContent } from "@/data/operator-call";

const { ru, ro } = operatorCallContent;

describe("согласованность данных operator-call RU/RO", () => {
  it("сохраняет одинаковые идентификаторы и порядок шагов", () => {
    const structure = (content: typeof ru.ordering | typeof ro.ordering) => content.levels.map(level => ({
      id: level.id, steps: level.steps.map(step => step.id),
    }));
    expect(structure(ro.ordering)).toEqual(structure(ru.ordering));
    expect(ru.ordering.levels[4].steps[4].id).toBe("s5");
    expect(ro.ordering.levels[4].steps[4].id).toBe("s5");
  });

  it.each(ru.final.phase2.map(question => question.id))("согласует число вариантов и правильный ответ блица %s", id => {
    const source = ru.final.phase2.find(question => question.id === id)!;
    const translated = ro.final.phase2.find(question => question.id === id);
    expect(translated).toBeDefined();
    expect(translated!.options).toHaveLength(source.options.length);
    expect(translated!.answer).toBe(source.answer);
    expect(source.answer).toBeGreaterThanOrEqual(0);
    expect(source.answer).toBeLessThan(source.options.length);
  });
});

describe("пункт 19: безопасная реакция на незнакомый звонок", () => {
  it.each([
    ["ru", "Ничего — положу трубку и сам позвоню на официальный номер"],
    ["ro", "Nimic — închid și sun eu la numărul oficial"],
  ] as const)("сохраняет правильный индекс и три варианта в %s", (locale, correctText) => {
    const question = operatorCallContent[locale].final.phase2.find(item => item.id === "p2_10")!;
    expect(question.id).toBe("p2_10");
    expect(question.options).toHaveLength(3);
    expect(question.answer).toBe(1);
    expect(question.options[question.answer]).toBe(correctText);
  });
});
