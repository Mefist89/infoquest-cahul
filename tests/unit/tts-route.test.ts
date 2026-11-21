import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  profile: vi.fn(),
  demoStudent: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from }),
}));

import { POST } from "@/app/api/tts/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("https://example.test/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ELEVENLABS_API_KEY", "test-el-key");
  mocks.getUser.mockResolvedValue({ data: { user: { id: "user-tts-1" } }, error: null });
  mocks.profile.mockResolvedValue({ data: { role: "student" }, error: null });
  mocks.demoStudent.mockResolvedValue({ data: null, error: null });
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({ eq: () => ({ maybeSingle: table === "demo_students" ? mocks.demoStudent : mocks.profile }) }),
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/tts (ElevenLabs)", () => {
  it("returns 503 when ELEVENLABS_API_KEY is not configured", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const res = await POST(makeRequest({ text: "Привет", locale: "ru" }));
    expect(res.status).toBe(503);
  });

  it("returns 401 for unauthenticated users", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeRequest({ text: "Привет", locale: "ru" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for demo students", async () => {
    mocks.demoStudent.mockResolvedValue({ data: { id: "demo-1" }, error: null });
    const res = await POST(makeRequest({ text: "Привет", locale: "ru" }));
    expect(res.status).toBe(403);
  });

  it("streams audio/mpeg from ElevenLabs for authenticated users", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(makeRequest({ text: "Привет, детектив!", locale: "ru" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("https://api.elevenlabs.io/v1/text-to-speech/");
    expect((init.headers as Record<string, string>)["xi-api-key"]).toBe("test-el-key");
  });
});
