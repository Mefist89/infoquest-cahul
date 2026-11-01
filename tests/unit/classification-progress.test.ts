import { describe, expect, it } from "vitest";
import { answerClassification, continueClassification, type ClassificationProgress } from "@/features/modules/runner/classification-progress";
import { operatorCallContent } from "@/data/operator-call";

describe("классификация: ответ → объяснение → Дальше", () => {
  it.each([true, false])("ответ %s остаётся на той же карточке до продолжения", correct => {
    const initial: ClassificationProgress = { index: 0, feedback: null };
    const reviewed = answerClassification(initial, correct, "Объяснение");
    expect(reviewed.index).toBe(0);
    expect(reviewed.feedback).toMatchObject({ correct, explanation: "Объяснение" });
    expect(answerClassification(reviewed, !correct, "Повторный клик")).toBe(reviewed);
    expect(continueClassification(reviewed)).toEqual({ index: 1, feedback: null });
    expect(initial).toEqual({ index: 0, feedback: null });
  });

  it("без ответа продолжение не пропускает карточку", () => {
    const progress: ClassificationProgress = { index: 4, feedback: null };
    expect(continueClassification(progress)).toBe(progress);
  });

  it("последняя ошибка тоже показывает объяснение до завершения", () => {
    const last = answerClassification({ index: 14, feedback: null }, false, "Последнее объяснение");
    expect(last.index).toBeLessThan(15);
    expect(last.feedback?.explanation).toBe("Последнее объяснение");
    expect(continueClassification(last)).toEqual({ index: 15, feedback: null });
  });

  it("все 15 карточек имеют объяснения RU/RO и сохраняют ID и ответы", () => {
    const expected = ["danger", "danger", "safe", "danger", "safe", "safe", "danger", "safe", "danger", "danger", "safe", "danger", "danger", "safe", "danger"];
    for (const locale of ["ru", "ro"] as const) {
      const items = operatorCallContent[locale].classify.items;
      expect(items).toHaveLength(15);
      expect(items.map(item => item.id)).toEqual(Array.from({ length: 15 }, (_, index) => `c${index + 1}`));
      expect(items.map(item => item.answer)).toEqual(expected);
      for (const item of items) expect(item.explain.trim().length).toBeGreaterThan(20);
    }
  });
});
