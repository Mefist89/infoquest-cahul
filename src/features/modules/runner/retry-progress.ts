/** First-attempt results survive question and phase retries. No UI or timers here. */
export type RetryFeedback = { correct: boolean; complete: boolean; explanation: string };
export type RetryProgress = {
  questionIds: readonly string[];
  index: number;
  firstAttempts: Readonly<Record<string, boolean>>;
  feedback: RetryFeedback | null;
};

export function createRetryProgress(questionIds: readonly string[], firstAttempts: RetryProgress["firstAttempts"] = {}): RetryProgress {
  return { questionIds: [...questionIds], index: 0, firstAttempts: { ...firstAttempts }, feedback: null };
}

/** A correct partial selection does not finish a multi-answer question. */
export function answerRetryQuestion(progress: RetryProgress, correct: boolean, explanation: string, complete = true): RetryProgress {
  const id = progress.questionIds[progress.index];
  if (id === undefined || progress.feedback) return progress;
  const recordAttempt = (!correct || complete) && !Object.hasOwn(progress.firstAttempts, id);
  return {
    ...progress,
    firstAttempts: recordAttempt ? { ...progress.firstAttempts, [id]: correct } : progress.firstAttempts,
    feedback: { correct, complete: correct && complete, explanation },
  };
}

/** An error or partial answer repeats this question; only a completed answer advances. */
export function continueRetryProgress(progress: RetryProgress): RetryProgress {
  if (!progress.feedback) return progress;
  return { ...progress, index: progress.index + (progress.feedback.complete ? 1 : 0), feedback: null };
}

export function restartRetryPhase(progress: RetryProgress): RetryProgress {
  return createRetryProgress(progress.questionIds, progress.firstAttempts);
}

export function retryProgressScore(progress: RetryProgress, total = progress.questionIds.length) {
  return { correct: Object.values(progress.firstAttempts).filter(Boolean).length, total };
}

/** Lives are checked on Continue, so the last error's explanation stays visible. */
export function continueRetryPhase(progress: RetryProgress, remainingLives: number) {
  if (!progress.feedback) return { progress, outcome: "answering" as const };
  if (remainingLives <= 0) return { progress, outcome: "gameover" as const };
  const next = continueRetryProgress(progress);
  return { progress: next, outcome: next.index >= next.questionIds.length ? "complete" as const : "answering" as const };
}

/** A visual question earns one result after all distinct clues have been found. */
export function findRetryDetail(progress: RetryProgress, found: ReadonlySet<string>, targetId: string, correct: boolean, required: number) {
  if (progress.feedback || found.has(targetId)) return { progress, found, ignored: true };
  if (!correct) return { progress: continueRetryProgress(answerRetryQuestion(progress, false, "")), found, ignored: false };
  const nextFound = new Set(found).add(targetId);
  const next = nextFound.size >= required ? answerRetryQuestion(progress, true, "") : progress;
  return { progress: next, found: nextFound, ignored: false };
}
