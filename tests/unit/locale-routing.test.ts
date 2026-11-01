import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("server-only", () => ({}));
const access = vi.hoisted(() => ({ blocked: false }));
vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: async () => ({
    response: NextResponse.next(),
    supabase: { rpc: () => ({ maybeSingle: async () => ({ data: { is_blocked: access.blocked }, error: null }) }) },
  }),
}));

import proxy from "@/proxy";
import { rememberLocale } from "@/lib/locale-cookie";
import { localizedAlternates } from "@/lib/site";
import sitemap from "@/app/sitemap";

afterEach(() => { access.blocked = false; vi.unstubAllGlobals(); });

async function visit(path: string, language = "en", cookie?: string) {
  return proxy(new NextRequest(`https://example.com${path}`, {
    headers: { "accept-language": language, ...(cookie ? { cookie } : {}) },
  }));
}

describe("выбор языка", () => {
  it.each([["en", "ro"], ["ro-MD,ro;q=0.9", "ro"], ["ru-RU,ru;q=0.9", "ru"], ["", "ro"]])(
    "выбирает %s → %s без сохранённого выбора", async (language, locale) => {
      expect((await visit("/", language)).headers.get("location")).toBe(`https://example.com/${locale}`);
    },
  );

  it.each([["ru", "ro"], ["ro", "ru"]])("cookie %s имеет приоритет над браузером %s", async (locale, language) => {
    expect((await visit("/", language, `NEXT_LOCALE=${locale}`)).headers.get("location")).toBe(`https://example.com/${locale}`);
  });

  it("игнорирует неверную cookie и сохраняет явно открытый язык", async () => {
    expect((await visit("/", "en", "NEXT_LOCALE=invalid")).headers.get("location")).toBe("https://example.com/ro");
    const response = await visit("/ru/profile", "ro", "NEXT_LOCALE=ro");
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("ru");
    expect(response.cookies.get("NEXT_LOCALE")?.maxAge).toBe(31536000);
    expect(response.headers.get("link")).toBeNull();
  });

  it.each([["/", "en", "ro"], ["/ru/profile", "ro", "ru"], ["/ro/profile", "ru", "ro"]])(
    "блокировка выбирает язык по пути: %s / %s", async (path, language, locale) => {
      access.blocked = true;
      expect((await visit(path, language)).headers.get("location")).toBe(`https://example.com/${locale}/blocked`);
    },
  );

  it("HTML и sitemap используют румынский x-default", () => {
    expect(localizedAlternates("", "ru").languages["x-default"]).toMatch(/\/ro$/);
    for (const entry of sitemap()) {
      expect(entry.alternates?.languages?.["x-default"]).toBe(entry.alternates?.languages?.ro);
    }
  });
});

describe("сохранение языка после клиентского перехода", () => {
  it("сохраняет обе локали на год для всех путей", () => {
    const browserDocument = { cookie: "" };
    vi.stubGlobal("document", browserDocument);
    vi.stubGlobal("window", { location: { protocol: "https:" } });
    for (const locale of ["ro", "ru"] as const) {
      rememberLocale(locale);
      expect(browserDocument.cookie).toBe(`NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`);
    }
  });

  it("не ломает страницу при запрете cookie и работает без браузера", () => {
    expect(() => rememberLocale("ro")).not.toThrow();
    vi.stubGlobal("window", { location: { protocol: "http:" } });
    vi.stubGlobal("document", { set cookie(_value: string) { throw new Error("Cookies disabled"); } });
    expect(() => rememberLocale("ru")).not.toThrow();
  });
});
