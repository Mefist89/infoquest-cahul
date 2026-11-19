import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MODULE_IDS } from "@/data/module-catalog-meta";
import {
  clearGuestModuleProgress,
  readGuestModuleProgress,
  saveGuestStageProgress,
} from "@/features/modules/runner/guest-progress";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("локальный прогресс гостя для первого модуля", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createMemoryStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("сохраняет, обновляет, сортирует и очищает пройденные этапы гостя", () => {
    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([]);

    saveGuestStageProgress(MODULE_IDS.operatorCall, { stageIndex: 2 });
    saveGuestStageProgress(MODULE_IDS.operatorCall, { stageIndex: 1 });
    saveGuestStageProgress(MODULE_IDS.operatorCall, {
      stageIndex: 4,
      result: { correct: 7, total: 8 },
    });
    saveGuestStageProgress(MODULE_IDS.operatorCall, {
      stageIndex: 4,
      result: { correct: 8, total: 8 },
    });

    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([
      { stageIndex: 1, result: null },
      { stageIndex: 2, result: null },
      { stageIndex: 4, result: { correct: 8, total: 8 } },
    ]);

    clearGuestModuleProgress(MODULE_IDS.operatorCall);
    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([]);
  });

  it("игнорирует повреждённый JSON и некорректные номера этапов", () => {
    window.localStorage.setItem("infoquest.guestProgress.operator-call", "{broken-json");
    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([]);

    window.localStorage.setItem(
      "infoquest.guestProgress.operator-call",
      JSON.stringify([
        { stageIndex: 0 },
        { stageIndex: 99 },
        { stageIndex: 3, result: { correct: 1, total: 1 } },
        "invalid",
      ]),
    );
    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([
      { stageIndex: 3, result: { correct: 1, total: 1 } },
    ]);
  });

  it("не падает, если localStorage недоступен", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("denied");
        },
        removeItem: () => {
          throw new Error("denied");
        },
      },
    });

    expect(readGuestModuleProgress(MODULE_IDS.operatorCall)).toEqual([]);
    expect(saveGuestStageProgress(MODULE_IDS.operatorCall, { stageIndex: 1 })).toEqual([
      { stageIndex: 1, result: null },
    ]);
    expect(() => clearGuestModuleProgress(MODULE_IDS.operatorCall)).not.toThrow();
  });
});
