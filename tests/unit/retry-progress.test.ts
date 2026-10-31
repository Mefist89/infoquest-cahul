import { describe, expect, it } from "vitest";
import {
  answerRetryQuestion, continueRetryProgress, createRetryProgress, restartRetryPhase, retryProgressScore,
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
