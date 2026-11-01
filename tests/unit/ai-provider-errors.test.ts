import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AiProviderHttpError, createAiProvider } from "@/features/ai-help/server/openai-compatible-provider";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("HTTP errors from AI providers", () => {
  it.each([429, 500, 400, 413, 415, 422])("preserves HTTP %s even for a non-JSON error body", async status => {
    vi.stubEnv("AI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("provider error", { status })));
    const provider = createAiProvider()!;
    const signal = new AbortController().signal;
    const error = new AiProviderHttpError(status);
    await expect(provider.chat([{ role: "user", content: "test" }], "ru", signal)).rejects.toEqual(error);
    await expect(provider.analyzeContent("test", "ru", signal)).rejects.toEqual(error);
    await expect(provider.transcribeAudio(new File(["audio"], "test.wav"), "ru", signal)).rejects.toEqual(error);
  });
});
