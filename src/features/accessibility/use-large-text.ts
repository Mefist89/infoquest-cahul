"use client";

import { useSyncExternalStore } from "react";

const storageKey = "infoquest.largeText";
const listeners = new Set<() => void>();
let fallback = false;
let storageFailed = false;

function getSnapshot() {
  if (typeof window === "undefined") return false;
  if (storageFailed) return fallback;
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function toggle() {
  fallback = !getSnapshot();
  try {
    window.localStorage.setItem(storageKey, String(fallback));
    storageFailed = false;
  } catch {
    storageFailed = true;
  }
  listeners.forEach(listener => listener());
}

export function useLargeText() {
  return [useSyncExternalStore(subscribe, getSnapshot, () => false), toggle] as const;
}
