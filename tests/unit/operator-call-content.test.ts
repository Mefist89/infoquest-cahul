import { describe, expect, it } from "vitest";
import correctAnswers from "./fixtures/operator-call-correct-answers.json";
import { operatorCallContent } from "@/data/operator-call";

const { ru, ro } = operatorCallContent;

describe("согласованность данных operator-call RU/RO", () => {
  it("сохраняет одинаковые идентификаторы и порядок шагов", () => {
    const structure = (content: typeof ru.ordering | typeof ro.ordering) => content.levels.map(level => ({
      id: level.id, steps: level.steps.map(step => step.id),
    }));
    expect(structure(ro.ordering)).toEqual(structure(ru.ordering));
    expect(ru.ordering.levels[4].steps.map(step => step.id)).toEqual(["s1", "s6", "s5", "s4", "s7"]);
    expect(ro.ordering.levels[4].steps.map(step => step.id)).toEqual(["s1", "s6", "s5", "s4", "s7"]);
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
  ] as const)("сохраняет правильный ответ и три варианта в %s", (locale, correctText) => {
    const question = operatorCallContent[locale].final.phase2.find(item => item.id === "p2_10")!;
    expect(question.id).toBe("p2_10");
    expect(question.options).toHaveLength(3);
    expect(question.answer).toBeGreaterThanOrEqual(0);
    expect(question.answer).toBeLessThan(question.options.length);
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

describe("пункт 19: проверка тарифа без обязательного смартфона", () => {
  it.each([
    ["ru", "В приложении или по официальному номеру оператора"],
    ["ro", "În aplicație sau la numărul oficial al operatorului"],
  ] as const)("%s: принимает приложение или официальный номер", (locale, text) => {
    const question = operatorCallContent[locale].final.phase2.find(item => item.id === "p2_6")!;
    expect(question.options[question.answer]).toBe(text);
  });
});

describe("пункты 14 и 21: согласованные последовательности действий", () => {
  it.each(["ru", "ro"] as const)("%s: сохраняет ID при изменении порядка и удалении шагов", locale => {
    const levels = operatorCallContent[locale].ordering.levels;
    expect(levels[0].steps.map(step => step.id)).toEqual(["s2", "s1", "s3"]);
    expect(levels[3].steps.map(step => step.id)).toEqual(["s1", "s2", "s3", "s5", "s6"]);
    expect(levels[4].steps.map(step => step.id)).toEqual(["s1", "s6", "s5", "s4", "s7"]);
    expect(levels[4].situation).toBeTruthy();
    expect(levels.map(level => level.time)).toEqual([45, 53, 60, 68, 83]);
    levels.forEach(level => expect(new Set(level.steps.map(step => step.id)).size).toBe(level.steps.length));
  });
});

describe("пункт 17: перестановка не меняет смысл правильных ответов", () => {
  for (const locale of ["ru", "ro"] as const) {
    it(locale + ": сохраняет правильные тексты всех вопросов блица и босса", () => {
      const content = operatorCallContent[locale].final;
      const actual = {
        phase2: Object.fromEntries(content.phase2.map(question => [question.id, [question.options[question.answer]]])),
        phase3: Object.fromEntries(content.phase3.map(question => [question.id, question.answers.map(index => question.options[index]).sort()])),
      };
      expect(actual).toEqual(correctAnswers[locale]);
      expect(new Set(content.phase2.map(question => question.answer)).size).toBe(3);
      expect(new Set(content.phase3.filter(question => question.answers.length === 1).map(question => question.answers[0])).size).toBeGreaterThan(1);
    });
  }
});

describe("пункт 3: отдельные обращения к оператору и банку", () => {
  it.each([
    ["ru", "Попросить оператора запретить платные услуги и переводы с баланса.", "Если называл код или данные карты — положи трубку и сам позвони в банк по номеру на обороте карты или с официального сайта."],
    ["ro", "Cereți operatorului să blocheze serviciile cu plată și transferurile din sold.", "Dacă ai spus codul sau datele cardului — închide și sună tu la bancă, la numărul de pe spatele cardului sau de pe site-ul oficial."],
  ] as const)("%s: восстанавливает s6 оператора и сохраняет s5 банка", (locale, operatorText, bankText) => {
    const level = operatorCallContent[locale].ordering.levels[4];
    expect(level.steps).toHaveLength(5);
    expect(level.steps.find(step => step.id === "s6")!.text).toBe(operatorText);
    expect(level.steps.find(step => step.id === "s5")!.text).toBe(bankText);
    expect(level.time).toBe(83);
  });
});
