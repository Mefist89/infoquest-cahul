import type { ModuleId } from "@/data/module-catalog";
import type { StageResult } from "./use-module-runner";

export type GuestStageEntry = {
  stageIndex: number;
  result?: StageResult | null;
};

const STORAGE_PREFIX = "infoquest.guestProgress.";

function storageKey(moduleId: ModuleId): string {
  return `${STORAGE_PREFIX}${moduleId}`;
}

function isValidEntry(item: unknown): item is GuestStageEntry {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  if (typeof record.stageIndex !== "number" || !Number.isInteger(record.stageIndex) || record.stageIndex < 1 || record.stageIndex > 8) {
    return false;
  }
  if (record.result !== undefined && record.result !== null) {
    if (typeof record.result !== "object") return false;
    const res = record.result as Record<string, unknown>;
    if (typeof res.correct !== "number" || typeof res.total !== "number") return false;
  }
  return true;
}

export function readGuestModuleProgress(moduleId: ModuleId): GuestStageEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(moduleId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const byStage = new Map<number, GuestStageEntry>();
    for (const item of parsed) {
      if (isValidEntry(item)) {
        byStage.set(item.stageIndex, {
          stageIndex: item.stageIndex,
          result: item.result ?? null,
        });
      }
    }
    return Array.from(byStage.values()).sort((a, b) => a.stageIndex - b.stageIndex);
  } catch {
    return [];
  }
}

export function saveGuestStageProgress(moduleId: ModuleId, entry: GuestStageEntry): GuestStageEntry[] {
  const current = readGuestModuleProgress(moduleId);
  const byStage = new Map<number, GuestStageEntry>(current.map((item) => [item.stageIndex, item]));
  byStage.set(entry.stageIndex, {
    stageIndex: entry.stageIndex,
    result: entry.result ?? null,
  });
  const next = Array.from(byStage.values()).sort((a, b) => a.stageIndex - b.stageIndex);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey(moduleId), JSON.stringify(next));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }
  return next;
}

export function clearGuestModuleProgress(moduleId: ModuleId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(moduleId));
  } catch {
    // Ignore storage errors
  }
}
