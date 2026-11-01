import type { RetryFeedback } from "./retry-progress";

export type ClassificationProgress = { index: number; feedback: RetryFeedback | null };

export function answerClassification(progress: ClassificationProgress, correct: boolean, explanation: string): ClassificationProgress {
  if (progress.feedback) return progress;
  return { ...progress, feedback: { correct, complete: correct, explanation } };
}

/** Both verdicts advance only after the learner closes the explanation. */
export function continueClassification(progress: ClassificationProgress): ClassificationProgress {
  if (!progress.feedback) return progress;
  return { index: progress.index + 1, feedback: null };
}
