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

describe("пункт 11: улики в SMS", () => {
  const expected = {
    p1_1: ["fakeLink", "text"], p1_4: ["fakeLink", "text"],
    p1_7: ["text", "fakeLink", "sender"], p1_10: ["text", "fakeLink"],
  };
  for (const locale of ["ru", "ro"] as const) {
    it.each(Object.entries(expected))(locale + ": %s принимает согласованные улики", (id, targets) => {
      const question = operatorCallContent[locale].final.phase1.find(item => item.id === id)!;
      expect(question.correctTargets).toEqual(targets);
      expect(new Set(question.correctTargets).size).toBe(question.correctTargets.length);
    });
  }
});

describe("пункт 12: понятные улики вместо аватара", () => {
  it.each(["ru", "ro"] as const)("%s: аватар и формат номера не дают очки в p1_8", locale => {
    const questions = operatorCallContent[locale].final.phase1;
    const call = questions.find(item => item.id === "p1_8")!;
    expect(call.correctTargets).toEqual(["caller"]);
    expect("caller" in call && call.caller).toContain("WhatsApp");
    expect("number" in call && call.number).toBe("+373 22 000 000");
    expect(questions.find(item => item.id === "p1_9")!.correctTargets).toEqual(["name", "accountType"]);
  });
});

describe("пункт 18: ответы на угрозы босса", () => {
  it.each([
    ["ru", "Положу трубку и сам позвоню в полицию по 112."],
    ["ro", "Închid și sun singur la poliție, la 112."],
  ] as const)("%s: правильный ответ p3_5 завершает разговор", (locale, text) => {
    const question = operatorCallContent[locale].final.phase3.find(item => item.id === "p3_5")!;
    expect(question.answers.map(index => question.options[index])).toContain(text);
  });
  it("p3_10 не принимает согласие выполнить требования мошенника", () => {
    const question = ru.final.phase3.find(item => item.id === "p3_10")!;
    const index = question.options.findIndex(option => option === "Сделаю, как скажете, только не отключайте!");
    expect(index).toBeGreaterThanOrEqual(0);
    expect(question.answers).not.toContain(index);
  });
});

describe("пункт 16: одинаковая сложность босса RU/RO", () => {
  it.each(ru.final.phase3.map(question => question.id))("%s: одинаковые варианты и правильные индексы", id => {
    const original = ru.final.phase3.find(question => question.id === id)!;
    const translated = ro.final.phase3.find(question => question.id === id)!;
    expect(translated).toBeDefined();
    expect(translated.options).toHaveLength(original.options.length);
    expect(translated.answers).toEqual(original.answers);
    expect(new Set(original.answers).size).toBe(original.answers.length);
    original.answers.forEach(index => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(original.options.length);
    });
  });

  it("p3_8, p3_9 и p3_10 требуют оба правильных действия", () => {
    for (const locale of ["ru", "ro"] as const) {
      for (const id of ["p3_8", "p3_9", "p3_10"]) {
        const question = operatorCallContent[locale].final.phase3.find(item => item.id === id)!;
        expect(question.options).toHaveLength(4);
        expect(question.answers).toHaveLength(2);
      }
    }
  });
});
