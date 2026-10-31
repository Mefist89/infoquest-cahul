export const NO_TIMER_KEY = "infoquest.noTimer";

type PreferenceHost = {
  read: () => string | null;
  write: (value: string) => void;
  listen: (onChange: () => void) => () => void;
};

function browserHost(): PreferenceHost | undefined {
  if (typeof window === "undefined") return undefined;
  return {
    read: () => window.localStorage.getItem(NO_TIMER_KEY),
    write: value => window.localStorage.setItem(NO_TIMER_KEY, value),
    listen: onChange => {
      const handler = (event: StorageEvent) => {
        if (event.key === NO_TIMER_KEY || event.key === null) onChange();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}

export function createNoTimerStore(getHost: () => PreferenceHost | undefined = browserHost) {
  let value = false;
  let initialized = false;
  let stopListening: (() => void) | undefined;
  const listeners = new Set<() => void>();
  function read() {
    const host = getHost();
    if (!host) return;
    try { value = host.read() === "true"; } catch { /* Keep the in-memory preference when storage is unavailable. */ }
    initialized = true;
  }
  function notify() { listeners.forEach(listener => listener()); }
  return {
    getSnapshot() {
      if (!initialized) read();
      return value;
    },
    getServerSnapshot: () => false,
    setValue(next: boolean) {
      if (!initialized) read();
      if (value === next) return;
      value = next;
      initialized = true;
      try { getHost()?.write(String(next)); } catch { /* The setting still works for this page. */ }
      notify();
    },
    subscribe(listener: () => void) {
      if (listeners.size === 0) {
        read();
        stopListening = getHost()?.listen(() => { read(); notify(); });
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) { stopListening?.(); stopListening = undefined; }
      };
    },
  };
}

export const noTimerStore = createNoTimerStore();
