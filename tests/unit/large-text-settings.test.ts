import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

let storage: Map<string, string>;
let events: EventTarget;

beforeEach(() => {
  vi.resetModules();
  storage = new Map();
  events = new EventTarget();
  vi.stubGlobal("window", {
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("крупный текст для всего сайта", () => {
  it("подписи интерфейса не используют text-xs или мелкие фиксированные px-размеры", () => {
    const root = join(process.cwd(), "src");
    for (const path of readdirSync(root, { recursive: true })) {
      if (typeof path !== "string" || !path.endsWith(".tsx")) continue;
      const source = readFileSync(join(root, path), "utf8");
      expect(source, path).not.toMatch(/\btext-xs\b|text-\[(?:9|10|11|12)px\]/);
    }
  });
  it("выключен по умолчанию, сохраняет выбор и восстанавливает его после перезагрузки", async () => {
    let settings = await import("@/features/accessibility/large-text-settings");
    expect(settings.getLargeTextEnabled()).toBe(false);
    settings.toggleLargeText();
    expect(storage.get("infoquest.largeText")).toBe("true");
    vi.resetModules();
    settings = await import("@/features/accessibility/large-text-settings");
    expect(settings.getLargeTextEnabled()).toBe(true);
    settings.toggleLargeText();
    expect(storage.get("infoquest.largeText")).toBe("false");
  });

  it("синхронизирует кнопки и изменения в другой вкладке; отписка работает", async () => {
    const settings = await import("@/features/accessibility/large-text-settings");
    const listener = vi.fn();
    const unsubscribe = settings.subscribeLargeText(listener);
    settings.setLargeTextEnabled(true);
    expect(listener).toHaveBeenCalledTimes(1);
    storage.set("infoquest.largeText", "false");
    events.dispatchEvent(Object.assign(new Event("storage"), { key: "infoquest.largeText" }));
    expect(settings.getLargeTextEnabled()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    settings.toggleLargeText();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("работает в памяти, если localStorage недоступен", async () => {
    window.localStorage.getItem = () => { throw new Error("disabled"); };
    window.localStorage.setItem = () => { throw new Error("disabled"); };
    const settings = await import("@/features/accessibility/large-text-settings");
    expect(settings.getLargeTextEnabled()).toBe(false);
    expect(() => settings.toggleLargeText()).not.toThrow();
    expect(settings.getLargeTextEnabled()).toBe(true);
    settings.toggleLargeText();
    expect(settings.getLargeTextEnabled()).toBe(false);
  });
});
