"use client";

import { useSyncExternalStore } from "react";
import { getSoundEnabled, hasSoundChoice, subscribe } from "./sound-settings";

const serverSnapshot = () => false;

export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, getSoundEnabled, serverSnapshot);
}

export function useSoundChoice() {
  return useSyncExternalStore(subscribe, hasSoundChoice, () => true);
}
