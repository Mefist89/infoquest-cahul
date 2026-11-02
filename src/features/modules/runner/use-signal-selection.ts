"use client";

import { useRef, useState } from "react";
import { createSignalProgress, evaluateSignalSelection, recordSignalClick, retrySignalProgress } from "./signal-selection";
import { playSound } from "@/features/sound/play-sound";
import type { StageResult } from "./use-module-runner";

export function useSignalSelection(signalIds: readonly string[], normalIds: readonly string[], saving: boolean, onComplete: (result: StageResult) => void) {
  const [progress, setProgress] = useState(createSignalProgress);
  const progressRef = useRef(progress);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const result = evaluateSignalSelection(progress, signalIds);

  function toggle(id: string) {
    if (saving || submittedRef.current || (!signalIds.includes(id) && !normalIds.includes(id))) return;
    const next = recordSignalClick(progressRef.current, id, signalIds, normalIds);
    progressRef.current = next;
    setProgress(next);
    if (normalIds.includes(id)) playSound("wrong");
  }

  function submit() {
    if (saving || submittedRef.current || (progressRef.current.found.size === 0 && progressRef.current.trapClicks === 0)) return;
    submittedRef.current = true;
    setSubmitted(true);
    const score = evaluateSignalSelection(progressRef.current, signalIds);
    if (score.passed) onComplete({ correct: score.correct, total: score.total });
  }

  function retry() {
    if (saving) return;
    progressRef.current = retrySignalProgress(progressRef.current);
    setProgress(progressRef.current);
    submittedRef.current = false;
    setSubmitted(false);
  }

  return { selected: progress.found, trapIds: progress.trapIds, lastTrap: progress.lastTrap, submitted, passed: submitted && result.passed, result, toggle, submit, retry };
}
