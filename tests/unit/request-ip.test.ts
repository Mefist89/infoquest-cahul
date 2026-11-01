import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { requestIp, hashIp } from "@/lib/request-ip";

afterEach(() => vi.unstubAllEnvs());

describe("requestIp", () => {
  it("берёт первый адрес Vercel, игнорируя остальные заголовки", () => {
    expect(requestIp(new Headers({
      "x-vercel-forwarded-for": " 203.0.113.42, 192.0.2.1",
      "x-forwarded-for": "192.0.2.2", "x-real-ip": "192.0.2.3",
    }))).toBe("203.0.113.42");
  });

  it("без Vercel берёт первый адрес x-forwarded-for, затем x-real-ip", () => {
    expect(requestIp(new Headers({ "x-forwarded-for": "203.0.113.42, 192.0.2.1", "x-real-ip": "192.0.2.2" }))).toBe("203.0.113.42");
    expect(requestIp(new Headers({ "x-real-ip": "203.0.113.42, 192.0.2.1" }))).toBe("203.0.113.42");
  });

  it("нормализует IPv6 и возвращает null без адреса", () => {
    expect(requestIp(new Headers({ "x-real-ip": " 2001:DB8::1 " }))).toBe("2001:db8::1");
    expect(requestIp(new Headers())).toBeNull();
  });
});

describe("hashIp", () => {
  it("без BLOCKLIST_IP_SALT возвращает null", async () => {
    vi.stubEnv("BLOCKLIST_IP_SALT", undefined);
    expect(await hashIp("203.0.113.42")).toBeNull();
    vi.stubEnv("BLOCKLIST_IP_SALT", "");
    expect(await hashIp("203.0.113.42")).toBeNull();
  });

  it("с солью возвращает 64 hex-символа и совместим с прежним SHA-256 salt:ip", async () => {
    vi.stubEnv("BLOCKLIST_IP_SALT", "test-only-salt");
    const hash = await hashIp("203.0.113.42");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(createHash("sha256").update("test-only-salt:203.0.113.42").digest("hex"));
    expect(await hashIp(null)).toBeNull();
  });
});
