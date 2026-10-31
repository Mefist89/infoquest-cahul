import { describe, expect, it, vi } from "vitest";
import { createNoTimerStore, NO_TIMER_KEY } from "@/features/modules/runner/no-timer-store";

function browser(initial: string | null = null) {
  let saved = initial;
  const callbacks = new Set<() => void>();
  const host = {
    read: vi.fn(() => saved),
    write: vi.fn((value: string) => { saved = value; }),
    listen: vi.fn((callback: () => void) => {
      callbacks.add(callback);
      return () => { callbacks.delete(callback); };
    }),
  };
  return { host, callbacks, external(value: string | null) { saved = value; callbacks.forEach(callback => callback()); } };
}

describe("настройка режима без таймера", () => {
  it("использует заданный ключ и безопасное серверное значение", () => {
    expect(NO_TIMER_KEY).toBe("infoquest.noTimer");
    const store = createNoTimerStore(() => undefined);
    expect(store.getServerSnapshot()).toBe(false);
    expect(store.getSnapshot()).toBe(false);
  });

  it.each([[null, false], ["false", false], ["true", true], ["invalid", false]] as const)("читает сохранённое значение %s", (stored, expected) => {
    const { host } = browser(stored);
    expect(createNoTimerStore(() => host).getSnapshot()).toBe(expected);
  });

  it("синхронизирует все переключатели и восстанавливает выбор после перезагрузки", () => {
    const { host } = browser();
    const store = createNoTimerStore(() => host);
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe1 = store.subscribe(first);
    const unsubscribe2 = store.subscribe(second);
    store.setValue(true);
    expect(store.getSnapshot()).toBe(true);
    expect(host.write).toHaveBeenCalledWith("true");
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    store.setValue(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(createNoTimerStore(() => host).getSnapshot()).toBe(true);
    unsubscribe1();
    store.setValue(false);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    unsubscribe2();
  });

  it("получает изменения из другой вкладки и удаляет подписку после последнего потребителя", () => {
    const mock = browser("true");
    const store = createNoTimerStore(() => mock.host);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);
    const unsubscribe2 = store.subscribe(() => {});
    expect(mock.callbacks.size).toBe(1);
    mock.external("false");
    expect(store.getSnapshot()).toBe(false);
    mock.external("true");
    expect(store.getSnapshot()).toBe(true);
    mock.external(null);
    expect(store.getSnapshot()).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(3);
    unsubscribe();
    expect(mock.callbacks.size).toBe(1);
    unsubscribe2();
    expect(mock.callbacks.size).toBe(0);
  });

  it("работает в памяти при недоступном localStorage", () => {
    const { host } = browser();
    host.read.mockImplementation(() => { throw new Error("blocked"); });
    host.write.mockImplementation(() => { throw new Error("blocked"); });
    const store = createNoTimerStore(() => host);
    expect(store.getSnapshot()).toBe(false);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);
    expect(() => store.setValue(true)).not.toThrow();
    expect(store.getSnapshot()).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("не кэширует отсутствие браузера при серверном рендеринге", () => {
    const mock = browser("true");
    let available = false;
    const store = createNoTimerStore(() => available ? mock.host : undefined);
    expect(store.getSnapshot()).toBe(false);
    available = true;
    expect(store.getSnapshot()).toBe(true);
    expect(store.getServerSnapshot()).toBe(false);
  });
});
