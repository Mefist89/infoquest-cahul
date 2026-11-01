import { describe, expect, it } from "vitest";
import { evaluateRescueOrder } from "@/features/modules/runner/rescue-order";
import { hackedAccountContent } from "@/data/hacked-account";

const required = ["password", "sessions", "audit", "lock", "friends"];
function permutations(items: string[]): string[][] {
  if (items.length === 0) return [[]];
  return items.flatMap((id, index) => permutations(items.filter((_, position) => position !== index)).map(rest => [id, ...rest]));
}

describe("порядок спасения аккаунта", () => {
  it("засчитывает все 24 порядка с паролем первым, остальные 96 отклоняет", () => {
    let accepted = 0;
    for (const order of permutations(required)) {
      const result = evaluateRescueOrder(order, required);
      const passwordFirst = order[0] === "password";
      expect(result).toEqual({ passed: passwordFirst, correct: passwordFirst ? 5 : 0, total: 5 });
      if (result.passed) accepted++;
    }
    expect(accepted).toBe(24);
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
    expect(evaluateRescueOrder(["password", "audit", "sessions", "friends", "lock"], content.rescueOrder.steps.map(step => step.id))).toEqual({ passed: true, correct: 5, total: 5 });
  });
});
