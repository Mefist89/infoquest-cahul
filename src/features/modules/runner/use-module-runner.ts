"use client";

import { useMemo, useState } from "react";

import type { ModuleId } from "@/data/module-catalog";
import { createClient } from "@/lib/supabase/client";

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
}: {
  moduleId: ModuleId;
  stageCount: number;
  initialStages: StageProgress[];
  initialModule: ModuleProgress;
  messages: RunnerMessages;
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

  const unlockedThrough = useMemo(
    () => Array.from({ length: stageCount }, (_, index) => index + 1)
      .find((stage) => !completedStages.has(stage)) ?? stageCount,
    [completedStages, stageCount],
  );

  const completionPercent = Math.round((completedStages.size / stageCount) * 100);

  async function completeStage(stageIndex: number, score = 100) {
    if (saving) return false;
    setSaving(true);
    setNotice(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("complete_module_stage", {
      p_module_id: moduleId,
      p_stage_index: stageIndex,
      p_score: Math.max(0, Math.min(100, Math.round(score))),
    });
    setSaving(false);

    if (error) {
      setNotice({ kind: "error", text: messages.saveError });
      return false;
    }

    const result = Array.isArray(data) ? data[0] : null;
    setCompletedStages((previous) => new Set(previous).add(stageIndex));
    setModuleXp((previous) => Number(result?.module_xp ?? previous));
    setNotice({ kind: "success", text: messages.saved });
    return true;
  }

  function chooseStage(stage: number) {
    if (stage > 0 && stage > unlockedThrough && !completedStages.has(stage)) {
      setNotice({ kind: "error", text: messages.locked });
      return false;
    }
    setCurrentStage(stage);
    setNotice(null);
    return true;
  }

  return {
    chooseStage,
    completeStage,
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
