import { afterEach, describe, expect, it, vi } from "vitest";
import { isRecordingUsable } from "@/components/ai/chat/recording-check";
import { convertToWhisperWav } from "@/components/ai/chat/wav";

afterEach(() => vi.unstubAllGlobals());

describe("recording usability", () => {
  it.each([
    [1, 0.01, false],
    [2, 0.01, true],
    [5, 0.0005, false],
    [2, 0.0015, true],
    [1.999, 0.01, false],
    [2, 0.001499, false],
    [NaN, 0.01, false],
    [2, NaN, false],
    [Infinity, 0.01, false],
  ])("duration %s, RMS %s -> %s", (duration, rms, expected) => {
    expect(isRecordingUsable(duration, rms)).toBe(expected);
  });
});

describe("WAV conversion", () => {
  it("measures the final mixed samples and closes the audio context", async () => {
    const close = vi.fn(async () => {});
    const channels = [new Float32Array(32_000).fill(0.04), new Float32Array(32_000).fill(-0.02)];
    vi.stubGlobal("AudioContext", class {
      close = close;
      decodeAudioData = async () => ({
        duration: 2, sampleRate: 16_000, length: 32_000, numberOfChannels: 2,
        getChannelData: (channel: number) => channels[channel],
      });
    });
    const result = await convertToWhisperWav(new Blob(["audio"]));
    expect(result.duration).toBe(2);
    expect(result.rms).toBeCloseTo(0.01, 6);
    expect(result.blob.type).toBe("audio/wav");
    expect(result.blob.size).toBe(44 + 32_000 * 2);
    expect(close).toHaveBeenCalledOnce();
  });

  it("closes the audio context on decoding failure", async () => {
    const close = vi.fn(async () => {});
    vi.stubGlobal("AudioContext", class {
      close = close;
      decodeAudioData = async () => { throw new Error("decode failed"); };
    });
    await expect(convertToWhisperWav(new Blob(["bad audio"]))).rejects.toThrow("decode failed");
    expect(close).toHaveBeenCalledOnce();
  });
});
