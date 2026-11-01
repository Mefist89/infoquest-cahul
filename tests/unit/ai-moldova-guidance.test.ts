import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createAiProvider } from "@/features/ai-help/server/openai-compatible-provider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each([
  ["ru", "analyze"], ["ro", "analyze"], ["ru", "chat"], ["ro", "chat"],
] as const)("%s/%s: отправляет контекст Молдовы в системном промпте", async (locale, mode) => {
  vi.stubEnv("AI_API_KEY", "test-key");
  vi.stubEnv("AI_API_BASE_URL", "https://ai.example.test/v1");
  const analysis = { verdict: "unclear", risk: 0, summary: "test", signals: [], actions: ["test", "test"], reply: "test", disclaimer: "test" };
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: mode === "analyze" ? JSON.stringify(analysis) : "test" } }] }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  const provider = createAiProvider()!;
  const signal = new AbortController().signal;
  if (mode === "analyze") await provider.analyzeContent("test", locale, signal);
  else await provider.chat([{ role: "user", content: "test" }], locale, signal);

  expect(fetchMock).toHaveBeenCalledOnce();
  const request = fetchMock.mock.calls[0][1] as RequestInit;
  const payload = JSON.parse(request.body as string);
  const system = payload.messages[0];
  expect(system.role).toBe("system");
  expect(system.content).toContain(locale === "ru" ? "Russian" : "Romanian");
  expect(system.content).toContain("Users live in the Republic of Moldova.");
  expect(system.content).toContain("emergency number 112 (police)");
  expect(system.content).toContain("bank's phone number printed on the back of the card");
  expect(system.content).toContain("Never invent phone numbers, websites or organizations.");
  expect(system.content).toContain("If the user already sent money or card data");
});
