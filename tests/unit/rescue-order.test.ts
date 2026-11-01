import { describe, expect, it } from "vitest";
import { evaluateRescueOrder } from "@/components/modules/hacked-account/rescue-order-scoring";
import { hackedAccountContent } from "@/data/hacked-account";

const required = ["password", "sessions", "audit", "lock", "friends"];
function permutations(items: string[]): string[][] {
  if (items.length === 0) return [[]];
  return items.flatMap((id, index) => permutations(items.filter((_, position) => position !== index)).map(rest => [id, ...rest]));
}

describe("порядок спасения аккаунта", () => {
  it("для всех 120 перестановок считает точные позиции и сохраняет порог 4/5", () => {
    let accepted = 0;
    for (const order of permutations(required)) {
      const result = evaluateRescueOrder(order, required);
      const correct = order.reduce((count, id, position) => count + Number(required[position] === id), 0);
      expect(result).toEqual({ passed: correct >= 4, correct, total: 5 });
      if (result.passed) accepted++;
    }
    expect(accepted).toBe(1);
  });

  it.each([
    [],
    ["password", "sessions", "audit", "lock"],
    ["password", "sessions", "audit", "lock", "lock"],
    ["password", "sessions", "audit", "lock", "unknown"],
    [...required, "friends"],
  ])("отклоняет неполный или недопустимый набор %j", (...chosen) => {
    expect(evaluateRescueOrder(chosen, required).passed).toBe(false);
  });

  it.each(["ru", "ro"] as const)("%s: диалог и образец порядка совпадают, ID и число шагов сохранены", locale => {
    const content = hackedAccountContent[locale];
    expect(content.rescueOrder.steps.map(step => step.id)).toEqual(required);
    expect(content.recoveryDialogue.steps.map(step => step.id)).toEqual(["first", ...required.slice(1)]);
    expect(evaluateRescueOrder(["password", "audit", "sessions", "friends", "lock"], content.rescueOrder.steps.map(step => step.id))).toEqual({ passed: false, correct: 1, total: 5 });
  });
});
