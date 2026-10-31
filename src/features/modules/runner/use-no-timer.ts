"use client";

import { useSyncExternalStore } from "react";
import { noTimerStore } from "./no-timer-store";

export function useNoTimer() {
  return useSyncExternalStore(noTimerStore.subscribe, noTimerStore.getSnapshot, noTimerStore.getServerSnapshot);
}
