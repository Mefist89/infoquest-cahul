export const storageKey = "infoquest.fontScale";

type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export function readFontScale(storage: PreferenceStorage): boolean {
  try { return storage.getItem(storageKey) === "large"; } catch { return false; }
}

export function writeFontScale(storage: PreferenceStorage, enabled: boolean): boolean {
  try {
    storage.setItem(storageKey, enabled ? "large" : "normal");
    return true;
  } catch { return false; }
}

// Runs in the document head before body content can be painted.
export const fontScaleScript = `try{if(localStorage.getItem("infoquest.fontScale")==="large")document.documentElement.setAttribute("data-font-scale","large")}catch{}`;
const listeners = new Set<() => void>();
let fallback = false;
let storageFailed = false;

export function getLargeTextEnabled() {
  if (typeof window === "undefined") return false;
  if (storageFailed) return fallback;
  try { return readFontScale(window.localStorage); } catch { return fallback; }
}

export function setLargeTextEnabled(value: boolean) {
  fallback = value;
  try {
    storageFailed = !writeFontScale(window.localStorage, value);
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
