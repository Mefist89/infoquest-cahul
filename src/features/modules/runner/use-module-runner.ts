"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ModuleId } from "@/data/module-catalog";
import { createClient } from "@/lib/supabase/client";
import { clearGuestModuleProgress, readGuestModuleProgress, saveGuestStageProgress } from "./guest-progress";

export type StageProgress = {
  stage_index: number;
  status: "not_started" | "in_progress" | "completed";
  score: number;
};

export type ModuleProgress = {
  status: "not_started" | "in_progress" | "completed";
  xp: number;
  score: number;
} | null;

export type RunnerNotice = { kind: "success" | "error"; text: string };

/**
 * Серверно-проверяемый результат игрового этапа.
 * Клиент передаёт только пары (correct, total), а итоговый score
 * вычисляет RPC `complete_module_stage` по формуле round(100 * correct / total).
 */
export type StageResult = { correct: number; total: number };

/** Та же формула, что в RPC complete_module_stage — только для отображения. */
export function stageDisplayScore(result: StageResult): number {
  if (result.total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((result.correct / result.total) * 100)));
}

type RunnerMessages = {
  locked: string;
  saved: string;
  saveError: string;
};

export function useModuleRunner({
  moduleId,
  stageCount,
  initialStages,
  initialModule,
  messages,
  isGuest = false,
  guestMaxStage,
}: {
  moduleId: ModuleId;
  stageCount: number;
  initialStages: StageProgress[];
  initialModule: ModuleProgress;
  messages: RunnerMessages;
  isGuest?: boolean;
  guestMaxStage?: number;
}) {
  const initialCompleted = useMemo(
    () => initialStages.filter((stage) => stage.status === "completed").map((stage) => stage.stage_index),
    [initialStages],
  );
  const firstOpenStage = Array.from({ length: stageCount }, (_, index) => index + 1)
    .find((stage) => !initialCompleted.includes(stage)) ?? stageCount;
  const [completedStages, setCompletedStages] = useState(() => new Set(initialCompleted));
  const [currentStage, setCurrentStage] = useState(initialCompleted.length === 0 ? 0 : firstOpenStage);
  const [moduleXp, setModuleXp] = useState(initialModule?.xp ?? 0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<RunnerNotice | null>(null);
  const [failedSave, setFailedSave] = useState<{ stageIndex: number; result?: StageResult | null } | null>(null);
  const syncedGuestRef = useRef(false);

  // Восстановление локального прогресса гостя или перенос его в аккаунт после входа.
  useEffect(() => {
    const stored = readGuestModuleProgress(moduleId);
    if (stored.length === 0) return;

    if (isGuest) {
      const limit = guestMaxStage ?? stageCount;
      const valid = stored.filter((entry) => entry.stageIndex <= limit);
      if (valid.length === 0) return;
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (cancelled) return;
        const completed = new Set(valid.map((entry) => entry.stageIndex));
        setCompletedStages(completed);
        setModuleXp(Math.min(100, Math.round((completed.size / stageCount) * 100)));
        const nextOpen =
          Array.from({ length: limit }, (_, index) => index + 1).find((stage) => !completed.has(stage)) ??
          Math.min(stageCount, limit + 1);
        setCurrentStage(nextOpen);
      });
      return () => {
        cancelled = true;
      };
    }

    if (syncedGuestRef.current) return;
    syncedGuestRef.current = true;

    const alreadyCompleted = new Set(initialCompleted);
    const pending = stored.filter((entry) => !alreadyCompleted.has(entry.stageIndex));
    if (pending.length === 0) {
      clearGuestModuleProgress(moduleId);
      return;
    }

    let cancelled = false;
    void (async () => {
      setSaving(true);
      const supabase = createClient();
      const merged = new Set(alreadyCompleted);
      let latestXp: number | null = null;
      let allOk = true;

      for (const entry of pending) {
        try {
          const { data, error } = await supabase.rpc("complete_module_stage", {
            p_module_id: moduleId,
            p_stage_index: entry.stageIndex,
            p_correct: entry.result ? Math.trunc(entry.result.correct) : undefined,
            p_total: entry.result ? Math.trunc(entry.result.total) : undefined,
          });
          if (error) {
            allOk = false;
            break;
          }
          const rpcResult = Array.isArray(data) ? data[0] : null;
          merged.add(entry.stageIndex);
          if (rpcResult?.module_xp !== undefined) {
            latestXp = Number(rpcResult.module_xp);
          }
        } catch {
          allOk = false;
          break;
        }
      }

      if (cancelled) return;
      if (allOk) {
        clearGuestModuleProgress(moduleId);
      }
      if (merged.size > alreadyCompleted.size) {
        setCompletedStages(merged);
        if (latestXp !== null) setModuleXp(latestXp);
        const nextOpen =
          Array.from({ length: stageCount }, (_, index) => index + 1).find((stage) => !merged.has(stage)) ?? stageCount;
        setCurrentStage(nextOpen);
        setNotice({ kind: "success", text: messages.saved });
      }
      setSaving(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [guestMaxStage, initialCompleted, isGuest, messages.saved, moduleId, stageCount]);

  const unlockedThrough = useMemo(() => {
    const nextIncomplete =
      Array.from({ length: stageCount }, (_, index) => index + 1).find((stage) => !completedStages.has(stage)) ??
      stageCount;
    if (isGuest && guestMaxStage !== undefined) {
      return Math.min(nextIncomplete, guestMaxStage + 1);
    }
    return nextIncomplete;
  }, [completedStages, guestMaxStage, isGuest, stageCount]);

  const completionPercent = Math.round((completedStages.size / stageCount) * 100);

  async function completeStage(stageIndex: number, result?: StageResult | null) {
    if (saving) return false;
    if (isGuest) {
      saveGuestStageProgress(moduleId, { stageIndex, result });
      setCompletedStages((previous) => {
        const next = new Set(previous).add(stageIndex);
        setModuleXp(Math.min(100, Math.round((next.size / stageCount) * 100)));
        return next;
      });
      setNotice({ kind: "success", text: messages.saved });
      setFailedSave(null);
      return true;
    }

    setSaving(true);
    setNotice(null);
    setFailedSave(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("complete_module_stage", {
        p_module_id: moduleId,
        p_stage_index: stageIndex,
        p_correct: result ? Math.trunc(result.correct) : undefined,
        p_total: result ? Math.trunc(result.total) : undefined,
      });
      if (error) {
        setNotice({ kind: "error", text: messages.saveError });
        setFailedSave({ stageIndex, result });
        return false;
      }

      const rpcResult = Array.isArray(data) ? data[0] : null;
      setCompletedStages((previous) => new Set(previous).add(stageIndex));
      setModuleXp((previous) => Number(rpcResult?.module_xp ?? previous));
      setNotice({ kind: "success", text: messages.saved });
      return true;
    } catch {
      setNotice({ kind: "error", text: messages.saveError });
      setFailedSave({ stageIndex, result });
      return false;
    } finally {
      setSaving(false);
    }
  }

  function chooseStage(stage: number) {
    if (stage > 0 && stage > unlockedThrough && !completedStages.has(stage)) {
      setNotice({ kind: "error", text: messages.locked });
      return false;
    }
    setCurrentStage(stage);
    setNotice(null);
    setFailedSave(null);
    return true;
  }

  return {
    chooseStage,
    completeStage,
    canRetrySave: failedSave !== null,
    retrySave: () => failedSave ? completeStage(failedSave.stageIndex, failedSave.result) : Promise.resolve(false),
    completedStages,
    completionPercent,
    currentStage,
    firstOpenStage,
    moduleXp,
    notice,
    openStage: setCurrentStage,
    saving,
    unlockedThrough,
  };
}
