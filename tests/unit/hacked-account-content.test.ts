import { describe, expect, it } from "vitest";
import { hackedAccountContent } from "@/data/hacked-account";

describe("hacked-account: согласованность RU и RO", () => {
  const { ru, ro } = hackedAccountContent;
  const options = (questions: readonly { id: string; options: readonly { id: string; correct: boolean }[] }[]) =>
    questions.map(question => ({ id: question.id, options: question.options.map(option => ({ id: option.id, correct: option.correct })) }));

  it("диалог и финал совпадают по ID, числу вариантов и правильным ответам", () => {
    expect(options(ro.recoveryDialogue.steps)).toEqual(options(ru.recoveryDialogue.steps));
    expect(options(ro.shadowBattle.questions)).toEqual(options(ru.shadowBattle.questions));
  });

  it.each(["ru", "ro"] as const)("%s: сохраняет правильные ответы диалога и финала", locale => {
    const content = hackedAccountContent[locale];
    const correct = (questions: readonly { id: string; options: readonly { id: string; correct: boolean }[] }[]) =>
      Object.fromEntries(questions.map(question => [question.id, question.options.filter(option => option.correct).map(option => option.id)]));
    expect(correct(content.recoveryDialogue.steps)).toEqual({ first: ["clean"], sessions: ["logout-all"], lock: ["2fa"], friends: ["warn"], audit: ["audit"] });
    expect(correct(content.shadowBattle.questions)).toEqual({ "q-night": ["alien"], "q-friend": ["warn"], "q-pass": ["weak"], "q-call": ["hangup"], "q-boss": ["password", "sessions", "2fa"] });
    expect(content.shadowBattle.questions.find(question => question.id === "q-boss")!.multi).toBe(true);
  });

  it("признаки взлома и оценки паролей одинаковы в обоих языках", () => {
    const signs = (levels: typeof ru.breachSigns.levels | typeof ro.breachSigns.levels) =>
      levels.map(level => ({ id: level.id, items: level.items.map(item => ({ id: item.id, suspicious: item.suspicious })) }));
    expect(signs(ro.breachSigns.levels)).toEqual(signs(ru.breachSigns.levels));
    const passwords = (items: typeof ru.passwordGame.items | typeof ro.passwordGame.items) =>
      items.map(item => ({ id: item.id, password: item.password, verdict: item.verdict }));
    expect(passwords(ro.passwordGame.items)).toEqual(passwords(ru.passwordGame.items));
    expect(ru.breachSigns.levels.map(level => level.items.filter(item => item.suspicious).length)).toEqual([3, 4, 5]);
    expect(ru.theory.cards).toHaveLength(ro.theory.cards.length);
  });
});
