"use client";

import { useRef, useState } from "react";
import { advanceRetryRound, answerRetryQuestion, createRetryProgress, retryFailedQuestions, retryProgressScore, type RetryProgress } from "./retry-progress";
import type { StageResult } from "./use-module-runner";

export function useRetryQuiz(ids: readonly string[], passCount: number, onComplete: (result: StageResult) => void, saving: boolean) {
  const [progress, setProgress] = useState(() => createRetryProgress(ids));
  const progressRef = useRef(progress);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [retrying, setRetrying] = useState(false);
  const resultsRef = useRef(results);
  const update = (next: RetryProgress) => { progressRef.current = next; setProgress(next); };
  const correctCount = Object.values(results).filter(Boolean).length;
  const finished = progress.index >= progress.questionIds.length;

  function answer(correct: boolean, explanation: string) {
    const current = progressRef.current;
    const id = current.questionIds[current.index];
    if (saving || current.feedback || id === undefined) return false;
    resultsRef.current = { ...resultsRef.current, [id]: correct };
    setResults(resultsRef.current);
    update(answerRetryQuestion(current, correct, explanation));
    return true;
  }

  function advance() {
    if (saving || !progressRef.current.feedback) return;
    const next = advanceRetryRound(progressRef.current);
    update(next);
    if (next.index >= next.questionIds.length && Object.values(resultsRef.current).filter(Boolean).length >= passCount) {
      onComplete(retryProgressScore(next, ids.length));
    }
  }

  function retry() {
    const current = progressRef.current;
    if (saving || current.index < current.questionIds.length) return;
    setRetrying(true);
    update(retryFailedQuestions(current, resultsRef.current));
  }

  return {
    index: ids.indexOf(progress.questionIds[progress.index]),
    roundPosition: progress.index + 1,
    roundTotal: progress.questionIds.length,
    revealed: progress.feedback !== null,
    finished,
    passed: finished && correctCount >= passCount,
    correctCount, retrying, answer, advance, retry,
  };
}
