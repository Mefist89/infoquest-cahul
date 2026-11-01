import { describe, expect, it } from "vitest";
import {
  answerRetryQuestion, continueRetryPhase, continueRetryProgress, createRetryProgress, findRetryDetail, restartRetryPhase, retryProgressScore,
  advanceRetryRound, retryFailedQuestions,
  retainCorrectOrder, toggleOrderSlot,
} from "@/features/modules/runner/retry-progress";

const answer = (correct: boolean) => ({ correct, explanation: "Почему так" });
function respond(progress: ReturnType<typeof createRetryProgress>, correct: boolean, complete = true) {
  const result = answer(correct);
  return answerRetryQuestion(progress, result.correct, result.explanation, complete);
}

describe("повтор вопроса после объяснения", () => {
  it("после ошибки повторяет только текущий вопрос и сохраняет первый результат", () => {
    let progress = createRetryProgress(["level-1", "level-2-phrase-1", "level-2-phrase-2"]);
    progress = continueRetryProgress(respond(progress, true));
    const before = progress;
    progress = respond(progress, false);
    expect(before.firstAttempts).toEqual({ "level-1": true });
    expect(progress.index).toBe(1);
    expect(progress.feedback).toEqual({ correct: false, complete: false, explanation: "Почему так" });
    progress = continueRetryProgress(progress);
    expect(progress.index).toBe(1);
    progress = continueRetryProgress(respond(progress, true));
    expect(progress.index).toBe(2);
    expect(retryProgressScore(progress)).toEqual({ correct: 1, total: 3 });
  });

  it("истечение времени считается первой неудачной попыткой", () => {
    let progress = answerRetryQuestion(createRetryProgress(["a"]), false, "Время вышло");
    progress = continueRetryProgress(progress);
    expect(progress.index).toBe(0);
    progress = continueRetryProgress(respond(progress, true));
    expect(progress.index).toBe(1);
    expect(retryProgressScore(progress)).toEqual({ correct: 0, total: 1 });
  });

  it("не принимает второй ответ и не перелистывает без кнопки продолжения", () => {
    const progress = respond(createRetryProgress(["a", "b"]), true);
    expect(respond(progress, false)).toBe(progress);
    expect(progress.index).toBe(0);
    const next = continueRetryProgress(progress);
    expect(next.index).toBe(1);
    expect(continueRetryProgress(next)).toBe(next);
  });

  it("не меняет завершённую игру и считает каждый вопрос ровно один раз", () => {
    let progress = createRetryProgress(["a", "b"]);
    progress = continueRetryProgress(respond(progress, true));
    progress = continueRetryProgress(respond(progress, true));
    expect(respond(progress, false)).toBe(progress);
    expect(retryProgressScore(progress)).toEqual({ correct: 2, total: 2 });
    expect(retryProgressScore(createRetryProgress(["a", "b"]))).toEqual({ correct: 0, total: 2 });
  });

  it("несколько верных вариантов завершают один вопрос, а ошибка сохраняется в счёте", () => {
    let progress = respond(createRetryProgress(["boss"]), true, false);
    expect(progress.firstAttempts).toEqual({});
    progress = continueRetryProgress(progress);
    expect(progress.index).toBe(0);
    progress = continueRetryProgress(respond(progress, false));
    progress = continueRetryProgress(respond(progress, true));
    expect(retryProgressScore(progress)).toEqual({ correct: 0, total: 1 });
  });

  it("полный верный набор вариантов даёт одно очко", () => {
    let progress = continueRetryProgress(respond(createRetryProgress(["boss"]), true, false));
    progress = continueRetryProgress(respond(progress, true));
    expect(retryProgressScore(progress)).toEqual({ correct: 1, total: 1 });
  });

  it("перезапускает текущую фазу, сохраняя первые попытки и результаты пройденных фаз", () => {
    let progress = createRetryProgress(["phase-2-a", "phase-2-b"], { "phase-1": true });
    progress = continueRetryProgress(respond(progress, true));
    progress = respond(progress, false);
    progress = restartRetryPhase(progress);
    expect(progress.index).toBe(0);
    expect(progress.feedback).toBeNull();
    progress = continueRetryProgress(respond(progress, false));
    progress = continueRetryProgress(respond(progress, true));
    progress = continueRetryProgress(respond(progress, true));
    expect(progress.index).toBe(2);
    expect(retryProgressScore(progress, 3)).toEqual({ correct: 2, total: 3 });
    const boss = createRetryProgress(["phase-3"], progress.firstAttempts);
    expect(retryProgressScore(continueRetryProgress(respond(boss, true)), 4)).toEqual({ correct: 3, total: 4 });
  });
});

describe("финал: объяснение и визуальные улики", () => {
  it("последняя жизнь на последнем вопросе не пропускает объяснение и не даёт победу", () => {
    let progress = continueRetryProgress(respond(createRetryProgress(["q1", "q2"]), true));
    progress = respond(progress, false);
    expect(progress.feedback?.explanation).toBe("Почему так");
    expect(progress.index).toBe(1);
    const result = continueRetryPhase(progress, 0);
    expect(result.outcome).toBe("gameover");
    expect(result.progress).toBe(progress);
    expect(restartRetryPhase(result.progress).index).toBe(0);
  });

  it("ошибка при оставшихся жизнях повторяет вопрос, верный последний ответ завершает фазу", () => {
    let progress = respond(createRetryProgress(["q"]), false);
    let result = continueRetryPhase(progress, 2);
    expect(result.outcome).toBe("answering");
    expect(result.progress.index).toBe(0);
    progress = respond(result.progress, true);
    result = continueRetryPhase(progress, 2);
    expect(result.outcome).toBe("complete");
    expect(retryProgressScore(result.progress)).toEqual({ correct: 0, total: 1 });
  });

  it("повторный клик по найденной улике ничего не прибавляет", () => {
    const progress = createRetryProgress(["visual"]);
    const first = findRetryDetail(progress, new Set(), "name", true, 2);
    const duplicate = findRetryDetail(first.progress, first.found, "name", true, 2);
    expect(duplicate.ignored).toBe(true);
    expect(duplicate.found.size).toBe(1);
    expect(duplicate.progress).toBe(first.progress);
    expect(duplicate.progress.feedback).toBeNull();
    const complete = findRetryDetail(duplicate.progress, duplicate.found, "number", true, 2);
    expect(complete.progress.feedback?.complete).toBe(true);
    expect(retryProgressScore(complete.progress)).toEqual({ correct: 1, total: 1 });
    expect(findRetryDetail(complete.progress, complete.found, "number", true, 2).ignored).toBe(true);
  });

  it("ошибка до нахождения всех улик исключает вопрос из верных первых попыток", () => {
    const failed = findRetryDetail(createRetryProgress(["visual"]), new Set(), "wrong", false, 1);
    const corrected = findRetryDetail(failed.progress, failed.found, "number", true, 1);
    expect(retryProgressScore(corrected.progress)).toEqual({ correct: 0, total: 1 });
    expect(failed.found.size).toBe(0);
  });

  it("серия повторов улики не завершает вопрос и не накручивает результат", () => {
    let result = findRetryDetail(createRetryProgress(["visual", "next"]), new Set(), "name", true, 2);
    for (let click = 0; click < 100; click += 1) {
      const duplicate = findRetryDetail(result.progress, result.found, "name", true, 2);
      expect(duplicate.ignored).toBe(true);
      expect(duplicate.progress).toBe(result.progress);
      result = duplicate;
    }
    expect(result.found.size).toBe(1);
    expect(result.progress.index).toBe(0);
    expect(retryProgressScore(result.progress)).toEqual({ correct: 0, total: 2 });
    const complete = findRetryDetail(result.progress, result.found, "number", true, 2);
    expect(retryProgressScore(complete.progress)).toEqual({ correct: 1, total: 2 });
    expect(findRetryDetail(complete.progress, complete.found, "number", true, 2).ignored).toBe(true);
  });
});

describe("повтор только ошибочных вопросов", () => {
  it("сохраняет верные ответы, повторяет только две ошибки из шести и не завышает XP", () => {
    const ids = ["a", "b", "c", "d", "e", "f"];
    let progress = createRetryProgress(ids);
    const results: Record<string, boolean> = {};
    for (const id of ids) {
      results[id] = id !== "b" && id !== "e";
      progress = advanceRetryRound(answerRetryQuestion(progress, results[id], "объяснение"));
    }
    expect(progress.index).toBe(6);
    progress = retryFailedQuestions(progress, results);
    expect(progress.questionIds).toEqual(["b", "e"]);
    expect(progress.firstAttempts).toEqual(results);
    results.b = true;
    progress = advanceRetryRound(answerRetryQuestion(progress, true, "исправлено"));
    progress = advanceRetryRound(answerRetryQuestion(progress, false, "ещё ошибка"));
    progress = retryFailedQuestions(progress, results);
    expect(progress.questionIds).toEqual(["e"]);
    progress = advanceRetryRound(answerRetryQuestion(progress, true, "исправлено"));
    expect(retryProgressScore(progress, ids.length)).toEqual({ correct: 4, total: 6 });
  });

  it("включает в повтор ещё не заданные вопросы, исключая пройденные", () => {
    const progress = answerRetryQuestion(createRetryProgress(["a", "b", "c"]), false, "почему");
    const next = retryFailedQuestions(progress, { a: false, b: true });
    expect(next.questionIds).toEqual(["a", "c"]);
    expect(next.feedback).toBeNull();
    expect(advanceRetryRound(next)).toBe(next);
  });
});

describe("повтор неверного окончания порядка шагов", () => {
  it("сохраняет только верное начало и не закрепляет правильный шаг после ошибки", () => {
    const required = ["a", "b", "c", "d", "e"];
    const retry = retainCorrectOrder(["a", "d", "c", "e", "b"], required);
    expect(retry.slots).toEqual(["a", null, null, null, null]);
    expect([...retry.locked]).toEqual([0]);
    expect(toggleOrderSlot(retry.slots, retry.locked, "a")).toBe(retry.slots);
    let slots = toggleOrderSlot(retry.slots, retry.locked, "b");
    slots = toggleOrderSlot(slots, retry.locked, "e");
    expect(slots).toEqual(["a", "b", "e", null, null]);
    slots = toggleOrderSlot(slots, retry.locked, "b");
    expect(slots).toEqual(["a", null, "e", null, null]);
    slots = toggleOrderSlot(slots, retry.locked, "b");
    slots = toggleOrderSlot(slots, retry.locked, "c");
    slots = toggleOrderSlot(slots, retry.locked, "d");
    expect(slots).toEqual(["a", "b", "e", "c", "d"]);
    expect(toggleOrderSlot(slots, retry.locked, "other")).toBe(slots);
  });

  it.each([
    [["e", "b", "c", "d", "a"], 0],
    [["a", "b", "d", "c", "e"], 2],
    [["a", "b", "c", "d", "e"], 5],
  ] as const)("длина сохранённого начала для %s равна %s", (chosen, length) => {
    const result = retainCorrectOrder(chosen, ["a", "b", "c", "d", "e"]);
    expect(result.locked.size).toBe(length);
    expect(result.slots.slice(length).every(id => id === null)).toBe(true);
    expect(result.slots.slice(0, length)).toEqual(chosen.slice(0, length));
  });
});
