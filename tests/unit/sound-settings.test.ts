import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MockAudio extends EventTarget {
  static instances: MockAudio[] = [];
  volume = 1;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  constructor(public src: string) { super(); MockAudio.instances.push(this); }
}

let saved: Map<string, string>;
let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.resetModules();
  MockAudio.instances = [];
  saved = new Map();
  storage = {
    getItem: vi.fn((key: string) => saved.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { saved.set(key, value); }),
  };
  vi.stubGlobal("Audio", MockAudio);
  vi.stubGlobal("localStorage", storage);
});

afterEach(async () => {
  const { setSoundEnabled } = await import("@/features/sound/sound-settings");
  setSoundEnabled(false);
  vi.unstubAllGlobals();
});

describe("настройка звука модуля 1", () => {
  it("по умолчанию выключена и playSound не создаёт Audio", async () => {
    const settings = await import("@/features/sound/sound-settings");
    const { playSound } = await import("@/components/modules/operator-call/stage-support");
    expect(settings.getSoundEnabled()).toBe(false);
    expect(settings.hasSoundChoice()).toBe(false);
    for (const type of ["correct", "wrong", "timeout"] as const) playSound(type);
    expect(MockAudio.instances).toHaveLength(0);
  });

  it.each(["correct", "wrong", "timeout"] as const)("включённый %s играет с заданной громкостью", async type => {
    const { setSoundEnabled } = await import("@/features/sound/sound-settings");
    const { playSound } = await import("@/components/modules/operator-call/stage-support");
    setSoundEnabled(true);
    playSound(type);
    const audio = MockAudio.instances[0];
    expect(audio.src).toBe(`/audio/${type}.mp3`);
    expect(audio.volume).toBe(type === "timeout" ? 0.2 : 0.4);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("сохраняет оба явных выбора и сообщает всем подписчикам", async () => {
    const settings = await import("@/features/sound/sound-settings");
    const listener = vi.fn();
    const unsubscribe = settings.subscribe(listener);
    settings.setSoundEnabled(false);
    expect(settings.hasSoundChoice()).toBe(true);
    expect(saved.get("infoquest.sound")).toBe("false");
    settings.setSoundEnabled(true);
    expect(settings.getSoundEnabled()).toBe(true);
    expect(saved.get("infoquest.sound")).toBe("true");
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    settings.setSoundEnabled(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it.each(["true", "false"])("восстанавливает сохранённый выбор %s", async value => {
    saved.set("infoquest.sound", value);
    const settings = await import("@/features/sound/sound-settings");
    expect(settings.getSoundEnabled()).toBe(value === "true");
    expect(settings.hasSoundChoice()).toBe(true);
  });

  it("не включает звук при повреждённом значении", async () => {
    saved.set("infoquest.sound", "invalid");
    const settings = await import("@/features/sound/sound-settings");
    expect(settings.getSoundEnabled()).toBe(false);
    expect(settings.hasSoundChoice()).toBe(false);
  });

  it("сразу останавливает эффект при выключении и не накладывает эффекты", async () => {
    const { setSoundEnabled } = await import("@/features/sound/sound-settings");
    const { playSound } = await import("@/components/modules/operator-call/stage-support");
    setSoundEnabled(true);
    playSound("correct");
    playSound("wrong");
    expect(MockAudio.instances[0].pause).toHaveBeenCalledOnce();
    setSoundEnabled(false);
    expect(MockAudio.instances[1].pause).toHaveBeenCalledOnce();
    playSound("timeout");
    expect(MockAudio.instances).toHaveLength(2);
  });

  it("синхронизирует вкладки и останавливает звук при внешнем выключении", async () => {
    const target = new EventTarget();
    vi.stubGlobal("window", target);
    const settings = await import("@/features/sound/sound-settings");
    const { playSound } = await import("@/components/modules/operator-call/stage-support");
    const unsubscribe = settings.subscribe(() => {});
    settings.setSoundEnabled(true);
    playSound("correct");
    saved.set("infoquest.sound", "false");
    target.dispatchEvent(Object.assign(new Event("storage"), { key: "infoquest.sound" }));
    expect(settings.getSoundEnabled()).toBe(false);
    expect(MockAudio.instances[0].pause).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("работает в памяти, когда localStorage недоступен", async () => {
    storage.getItem.mockImplementation(() => { throw new Error("blocked"); });
    storage.setItem.mockImplementation(() => { throw new Error("blocked"); });
    const settings = await import("@/features/sound/sound-settings");
    expect(settings.getSoundEnabled()).toBe(false);
    expect(() => settings.setSoundEnabled(true)).not.toThrow();
    expect(settings.getSoundEnabled()).toBe(true);
    expect(settings.hasSoundChoice()).toBe(true);
  });

  it("переживает отказ браузера в воспроизведении", async () => {
    const { setSoundEnabled } = await import("@/features/sound/sound-settings");
    const { playSound } = await import("@/components/modules/operator-call/stage-support");
    setSoundEnabled(true);
    vi.stubGlobal("Audio", class extends MockAudio {
      constructor(src: string) { super(src); this.play.mockRejectedValue(new Error("autoplay denied")); }
    });
    expect(() => playSound("wrong")).not.toThrow();
    await Promise.resolve();
    expect(MockAudio.instances[0].pause).toHaveBeenCalledOnce();
  });
});
