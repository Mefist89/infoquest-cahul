import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), from: vi.fn(), profile: vi.fn(), rpc: vi.fn(), access: vi.fn(),
  quota: vi.fn(), acquire: vi.fn(), provider: vi.fn(), chat: vi.fn(), analyze: vi.fn(), transcribe: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from, rpc: mocks.rpc }),
}));
vi.mock("@/features/ai-help/server/openai-compatible-provider", () => ({ createAiProvider: mocks.provider }));

import { GET, POST } from "@/app/api/ai/route";

const handlers = { GET, POST };
const ip = "203.0.113.42";
const salt = "test-only-blocklist-salt";
const expectedHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");

function request(method: "GET" | "POST", locale = "ru") {
  const headers = { "x-vercel-forwarded-for": ip, "x-infoquest-locale": locale };
  if (method === "GET") return new Request("https://example.test/api/ai", { headers });
  const body = new FormData();
  body.set("locale", locale);
  body.set("dataConsent", "accepted");
  body.set("mode", "chat");
  body.set("message", "Как проверить сообщение?");
  return new Request("https://example.test/api/ai", { method, headers, body });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("BLOCKLIST_IP_SALT", salt);
  mocks.getUser.mockResolvedValue({ data: { user: { id: "account-one" } }, error: null });
  mocks.access.mockResolvedValue({ data: { is_blocked: false, block_source: null }, error: null });
  mocks.profile.mockResolvedValue({ data: { role: "user" }, error: null });
  mocks.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }) });
  mocks.quota.mockResolvedValue({ data: { audio_used: 0, audio_limit: 2, user_daily_used: 0, user_daily_limit: 5 }, error: null });
  mocks.acquire.mockResolvedValue({ data: { decision: "acquired", audio_used: 0, audio_limit: 2, user_daily_used: 1, user_daily_limit: 5 }, error: null });
  mocks.rpc.mockImplementation((name: string) => {
    if (name === "check_access_status") return { maybeSingle: mocks.access };
    if (name === "get_ai_user_quota_status") return { single: mocks.quota };
    if (name === "acquire_ai_request") return { single: mocks.acquire };
    if (name === "release_ai_request") return Promise.resolve({ error: null });
    throw new Error(`Unexpected RPC: ${name}`);
  });
  mocks.chat.mockResolvedValue("Ответ");
  mocks.provider.mockReturnValue({ chat: mocks.chat, analyzeContent: mocks.analyze, transcribeAudio: mocks.transcribe });
});

function analyzerRequest(withAudio = false) {
  const form = new FormData();
  form.set("locale", "ru");
  form.set("dataConsent", "accepted");
  if (withAudio) {
    const wav = Buffer.alloc(44 + 32_000 * 2);
    wav.write("RIFF", 0); wav.writeUInt32LE(wav.length - 8, 4);
    wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(16_000, 24); wav.writeUInt32LE(32_000, 28);
    wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
    wav.write("data", 36); wav.writeUInt32LE(wav.length - 44, 40);
    for (let offset = 44; offset < wav.length; offset += 2) wav.writeInt16LE(1000, offset);
    form.set("audio", new File([wav], "recording.wav", { type: "audio/wav" }));
  } else form.set("message", "Проверь сообщение");
  return new Request("https://example.test/api/ai", { method: "POST", body: form });
}

function expectSettlement(succeeded: boolean) {
  const acquisitions = mocks.rpc.mock.calls.filter(call => call[0] === "acquire_ai_request");
  const settlements = mocks.rpc.mock.calls.filter(call => call[0] === "release_ai_request");
  expect(acquisitions).toHaveLength(1);
  expect(settlements).toEqual([["release_ai_request", {
    p_request_id: acquisitions[0][1].p_request_id, p_refund: !succeeded,
  }]]);
}

describe("Chrono: списание только за полученный ответ", () => {
  it("фиксирует списание за успешный ответ чата", async () => {
    expect((await POST(request("POST"))).status).toBe(200);
    expectSettlement(true);
  });

  it.each(["error", "timeout", "empty"])("возвращает попытку при сбое чата: %s", async failure => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (failure === "empty") mocks.chat.mockResolvedValue("  ");
    else mocks.chat.mockRejectedValue(Object.assign(new Error("provider failed"), { name: failure === "timeout" ? "AbortError" : "Error" }));
    const response = await POST(request("POST"));
    expect(response.status).toBe(failure === "timeout" ? 504 : 502);
    expect(await response.json()).toMatchObject({ dailyRemaining: 5 });
    expectSettlement(false);
  });

  it.each([429, 500, 502, 503, 504, 400, 413, 415, 422])("классифицирует HTTP %s провайдера для возврата", async status => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.chat.mockRejectedValue(Object.assign(new Error("provider rejected request"), { status }));
    const response = await POST(request("POST"));
    expect(response.status).toBe(502);
    const refund = status === 429 || status >= 500;
    expectSettlement(!refund);
    expect(await response.json()).toMatchObject({ dailyRemaining: refund ? 5 : 4 });
  });

  it.each(["", "Алло", "throw"])("принимает или возвращает аудиопопытку по результату расшифровки: %s", async transcript => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (transcript === "throw") mocks.transcribe.mockRejectedValue(new Error("transcription failed"));
    else mocks.transcribe.mockResolvedValue(transcript);
    mocks.analyze.mockResolvedValue({ reply: "Проверьте источник", summary: "Подозрительный звонок" });
    mocks.acquire.mockResolvedValue({ data: { decision: "acquired", audio_used: 1, audio_limit: 2, user_daily_used: 1, user_daily_limit: 5 }, error: null });
    const response = await POST(analyzerRequest(true));
    expect(response.status).toBe(transcript === "throw" ? 502 : transcript ? 200 : 422);
    expectSettlement(transcript === "Алло");
    expect(await response.json()).toMatchObject({ dailyRemaining: transcript === "Алло" ? 4 : 5, audioRemaining: transcript === "Алло" ? 1 : 2 });
    if (transcript !== "Алло") expect(mocks.analyze).not.toHaveBeenCalled();
  });

  it.each(["error", "empty"])("возвращает попытку при сбое анализа: %s", async failure => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (failure === "empty") mocks.analyze.mockResolvedValue({ reply: "", summary: "" });
    else mocks.analyze.mockRejectedValue(new Error("analysis failed"));
    expect((await POST(analyzerRequest())).status).toBe(502);
    expectSettlement(false);
  });

  it("отказ в квоте не вызывает возврат и AI", async () => {
    mocks.acquire.mockResolvedValue({ data: { decision: "user_daily_limit", user_daily_limit: 5 }, error: null });
    expect((await POST(request("POST"))).status).toBe(429);
    expect(mocks.chat).not.toHaveBeenCalled();
    expect(mocks.rpc.mock.calls.filter(call => call[0] === "release_ai_request")).toHaveLength(0);
  });

  it("неверный формат файла отклоняется до списания и возврата", async () => {
    const body = await analyzerRequest().formData();
    body.set("audio", new File(["not audio"], "invalid.wav", { type: "audio/wav" }));
    const response = await POST(new Request("https://example.test/api/ai", { method: "POST", body }));
    expect(response.status).toBe(415);
    expect(mocks.acquire).not.toHaveBeenCalled();
    expect(mocks.rpc.mock.calls.filter(call => call[0] === "release_ai_request")).toHaveLength(0);
  });

  it("ошибка завершения не скрывает полученный ответ", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const rpc = mocks.rpc.getMockImplementation()!;
    mocks.rpc.mockImplementation((name, ...args) => name === "release_ai_request"
      ? Promise.reject(new Error("database unavailable")) : rpc(name, ...args));
    expect((await POST(request("POST"))).status).toBe(200);
    expect(log).toHaveBeenCalledWith("Chrono quota settlement failed", "database unavailable");
    expectSettlement(true);
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe.each(["GET", "POST"] as const)("Chrono %s: проверка доступа", method => {
  it.each(["ip", "email", "role"])("блокировка %s даёт 403 без квот, разбора формы и AI", async source => {
    mocks.access.mockResolvedValue({ data: { is_blocked: true, block_source: source }, error: null });
    const req = request(method, "ro");
    const parse = vi.spyOn(req, "formData");
    const response = await handlers[method](req);
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Accesul la InfoQuest pentru acest cont este restricționat.", code: "access_blocked" });
    expect(mocks.rpc.mock.calls.map(call => call[0])).toEqual(["check_access_status"]);
    expect(mocks.rpc).toHaveBeenCalledWith("check_access_status", { p_ip_hash: expectedHash });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
    expect(mocks.provider).not.toHaveBeenCalled();
  });

  it.each(["error", "empty", "throw"])("сбой проверки %s не прерывает работу Chrono", async failure => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    if (failure === "throw") mocks.access.mockRejectedValue(new Error("unavailable"));
    else mocks.access.mockResolvedValue({ data: null, error: failure === "error" ? { message: "unavailable" } : null });
    const response = await handlers[method](request(method));
    expect(response.status).toBe(200);
    expect(mocks.rpc.mock.calls[0][0]).toBe("check_access_status");
    if (failure !== "empty") expect(log).toHaveBeenCalled();
    if (method === "POST") expect(mocks.chat).toHaveBeenCalledOnce();
    else expect(mocks.quota).toHaveBeenCalledOnce();
  });

  it("блокировка возвращает заданный русский текст", async () => {
    mocks.access.mockResolvedValue({ data: { is_blocked: true, block_source: "ip" }, error: null });
    const response = await handlers[method](request(method, "ru"));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Доступ к InfoQuest для этого аккаунта ограничен.", code: "access_blocked" });
  });

  it("новый аккаунт с тем же заблокированным IP тоже получает 403", async () => {
    mocks.access.mockResolvedValue({ data: { is_blocked: true, block_source: "ip" }, error: null });
    for (const id of ["account-one", "new-account"]) {
      mocks.getUser.mockResolvedValue({ data: { user: { id } }, error: null });
      expect((await handlers[method](request(method))).status).toBe(403);
    }
    expect(mocks.rpc.mock.calls).toEqual([
      ["check_access_status", { p_ip_hash: expectedHash }],
      ["check_access_status", { p_ip_hash: expectedHash }],
    ]);
    expect(mocks.provider).not.toHaveBeenCalled();
  });

  it.each(["user", "student", "teacher", "administrator"])("незаблокированный %s проходит после проверки доступа", async role => {
    mocks.profile.mockResolvedValue({ data: { role }, error: null });
    const response = await handlers[method](request(method));
    expect(response.status).toBe(200);
    expect(mocks.access.mock.invocationCallOrder[0]).toBeLessThan(mocks.profile.mock.invocationCallOrder[0]);
    expect(mocks.rpc.mock.calls[0][0]).toBe("check_access_status");
    if (method === "POST") {
      expect(mocks.chat).toHaveBeenCalledOnce();
      expect(mocks.acquire).toHaveBeenCalledOnce();
      expect(mocks.rpc.mock.calls.at(-1)?.[0]).toBe("release_ai_request");
    } else {
      expect(mocks.quota).toHaveBeenCalledOnce();
      expect(mocks.provider).not.toHaveBeenCalled();
    }
  });

  it("гость получает 401 без обращения к AI", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await handlers[method](request(method))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.provider).not.toHaveBeenCalled();
  });
});

