export const PATROL_SAVE_ENABLED = false;
export const PATROL_SHADOW_START = 40;

export type PatrolProgressSnapshot = {
  shadow: number;
  resolvedIds: string[];
};

export async function loadPatrolProgress(): Promise<{
  data: PatrolProgressSnapshot;
  error: boolean;
}> {
  if (!PATROL_SAVE_ENABLED) {
    return {
      data: { shadow: PATROL_SHADOW_START, resolvedIds: [] },
      error: false,
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_patrol_progress");
  if (error) {
    console.error("Failed to load patrol progress:", error);
    return {
      data: { shadow: PATROL_SHADOW_START, resolvedIds: [] },
      error: true,
    };
  }

  const result = data?.[0];
  return {
    data: {
      shadow: result?.shadow_pct ?? PATROL_SHADOW_START,
      resolvedIds: result?.completed_npc_ids ?? [],
    },
    error: false,
  };
}

export async function savePatrolNpcCompletion(
  npcId: string,
  correct: boolean,
): Promise<{ error: boolean }> {
  if (!PATROL_SAVE_ENABLED) {
    return { error: false };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_patrol_npc", {
    p_npc_id: npcId,
    p_correct: correct,
  });
  if (error) {
    console.error("Failed to save patrol progress:", error);
    return { error: true };
  }
  return { error: false };
}

export async function resetPatrolProgress(): Promise<{ error: boolean }> {
  if (!PATROL_SAVE_ENABLED) {
    return { error: false };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.rpc("reset_patrol_progress");
  if (error) {
    console.error("Failed to reset patrol progress:", error);
    return { error: true };
  }
  return { error: false };
}
