const storageKey = "infoquest.largeText";
const listeners = new Set<() => void>();
let fallback = false;
let storageFailed = false;

export function getLargeTextEnabled() {
  if (typeof window === "undefined") return false;
  if (storageFailed) return fallback;
  try { return window.localStorage.getItem(storageKey) === "true"; } catch { return fallback; }
}

export function setLargeTextEnabled(value: boolean) {
  fallback = value;
  try {
    window.localStorage.setItem(storageKey, String(value));
    storageFailed = false;
  } catch { storageFailed = true; }
  listeners.forEach(listener => listener());
}

export function toggleLargeText() {
  setLargeTextEnabled(!getLargeTextEnabled());
}

function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) {
    storageFailed = false;
    listeners.forEach(listener => listener());
  }
}

export function subscribeLargeText(listener: () => void) {
  if (listeners.size === 0 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
