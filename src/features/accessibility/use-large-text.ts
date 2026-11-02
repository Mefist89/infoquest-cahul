"use client";

import { useSyncExternalStore } from "react";
import { getLargeTextEnabled, subscribeLargeText, toggleLargeText } from "./large-text-settings";

export function useLargeText() {
  return [useSyncExternalStore(subscribeLargeText, getLargeTextEnabled, () => false), toggleLargeText] as const;
}
