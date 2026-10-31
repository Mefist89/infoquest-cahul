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
