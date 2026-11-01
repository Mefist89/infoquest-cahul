const SOUND_KEY = "infoquest.sound";
let choice: boolean | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function readChoice() {
  try {
    if (typeof globalThis.localStorage === "undefined") return;
    const saved = globalThis.localStorage.getItem(SOUND_KEY);
    choice = saved === "true" ? true : saved === "false" ? false : null;
    initialized = true;
  } catch { /* Keep the in-memory choice when storage is unavailable. */ }
}

export function getSoundEnabled() {
  if (!initialized) readChoice();
  return choice === true;
}

export function hasSoundChoice() {
  if (!initialized) readChoice();
  return choice !== null;
}

export function setSoundEnabled(value: boolean) {
  choice = value;
  initialized = true;
  try { globalThis.localStorage?.setItem(SOUND_KEY, String(value)); } catch { /* The choice still works for this page. */ }
  // Notify even for another explicit mute so manually started phrases stop too.
  listeners.forEach(listener => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== SOUND_KEY && event.key !== null) return;
  readChoice();
  listeners.forEach(listener => listener());
}

export function subscribe(listener: () => void) {
  if (listeners.size === 0 && typeof window !== "undefined") {
    if (!initialized) readChoice();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
