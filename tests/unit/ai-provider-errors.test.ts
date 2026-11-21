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

  it("uses max_completion_tokens (2000 analyze / 1500 chat) and optional reasoning_effort", async () => {
    vi.stubEnv("AI_API_KEY", "test-key");
    const analysis = { verdict: "unclear", risk: 0, summary: "ok", signals: [], actions: ["a", "b"], reply: "ok", disclaimer: "ok" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(analysis) } }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: "hi" } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    const provider = createAiProvider()!;
    await provider.analyzeContent("msg", "ru", signal);
    await provider.chat([{ role: "user", content: "hi" }], "ru", signal);

    const analyzeBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    const chatBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(analyzeBody.max_completion_tokens).toBe(2000);
    expect(analyzeBody.max_tokens).toBeUndefined();
    expect(analyzeBody.reasoning_effort).toBeUndefined();
    expect(chatBody.max_completion_tokens).toBe(1500);
    expect(chatBody.max_tokens).toBeUndefined();
    expect(chatBody.reasoning_effort).toBeUndefined();

    vi.stubEnv("AI_REASONING_EFFORT", "low");
    const fetchWithReasoning = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "hi" } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchWithReasoning);
    await createAiProvider()!.chat([{ role: "user", content: "hi" }], "ru", signal);
    const reasoningBody = JSON.parse((fetchWithReasoning.mock.calls[0][1] as RequestInit).body as string);
    expect(reasoningBody.reasoning_effort).toBe("low");
  });

  it("warns on proxy-prefixed model IDs containing '/'", () => {
    vi.stubEnv("AI_API_KEY", "test-key");
    vi.stubEnv("AI_ANALYSIS_MODEL", "openai/gpt-5-mini");
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createAiProvider();
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('openai/gpt-5-mini'));
    errSpy.mockRestore();
  });

  it("logs 'AI output truncated' when finish_reason is 'length' with empty content", async () => {
    vi.stubEnv("AI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ choices: [{ finish_reason: "length", message: { content: "" } }] }), { status: 200 })));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = createAiProvider()!;
    await expect(provider.chat([{ role: "user", content: "test" }], "ru", new AbortController().signal)).rejects.toThrow("AI response did not contain output text");
    expect(errSpy).toHaveBeenCalledWith("AI output truncated");
    errSpy.mockRestore();
  });
});
