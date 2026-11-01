import { describe, expect, it } from "vitest";
import { moduleSeo, publicPageSeo, siteSeo } from "@/data/seo";
import { operatorCallContent } from "@/data/operator-call";
import { fakeLinkContent } from "@/data/fake-link";
import { hackedAccountContent } from "@/data/hacked-account";
import { scamOrRealContent } from "@/data/scam-or-real";
import { jsonLd, moduleStructuredData, publicMetadata } from "@/lib/seo";
import sitemap from "@/app/sitemap";

describe("публичные страницы модулей и SEO", () => {
  const modules = { "operator-call": operatorCallContent, "fake-link": fakeLinkContent, "hacked-account": hackedAccountContent, "scam-or-real": scamOrRealContent };
  for (const [name, entry] of Object.entries({ home: siteSeo, ...publicPageSeo, ...moduleSeo })) {
    it(`${name}: содержит RU и RO с title ≤ 60 и description ≤ 155`, () => {
      for (const locale of ["ru", "ro"] as const) {
        expect(entry).toHaveProperty(locale);
        expect(entry[locale].title.length).toBeGreaterThan(0);
        expect(entry[locale].title.length).toBeLessThanOrEqual(60);
        expect(entry[locale].description.length).toBeGreaterThan(0);
        expect(entry[locale].description.length).toBeLessThanOrEqual(155);
      }
    });
  }
  for (const moduleSlug of Object.keys(moduleSeo) as (keyof typeof moduleSeo)[]) {
    it.each(["ru", "ro"] as const)(`${moduleSlug}: метаданные и разметка %s`, locale => {
      const content = moduleSeo[moduleSlug][locale];
      expect(modules[moduleSlug][locale].guestRules).toHaveLength(3);
      expect(content.phrases).toHaveLength(5);
      const path = `/modules/${moduleSlug}`;
      const metadata = publicMetadata(content, path, locale);
      expect(metadata.title).toBe(content.title);
      expect(metadata.description).toBe(content.description);
      expect(metadata.alternates?.canonical).toMatch(new RegExp(`/${locale}${path}$`));
      expect(metadata.alternates?.languages?.["x-default"]).toMatch(new RegExp(`/ro${path}$`));
      expect(metadata.openGraph).toMatchObject({ title: content.title, url: expect.stringContaining(`/${locale}${path}`), locale: `${locale}_MD` });
      expect(moduleStructuredData(moduleSlug, locale)).toMatchObject({
        "@type": "Course", name: content.title, description: content.description, inLanguage: locale,
        isAccessibleForFree: true, provider: { "@type": "Organization", name: "InfoQuest" },
        offers: { "@type": "Offer", category: "Free" }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
      });
      expect(sitemap().some(entry => entry.url.endsWith(`/${locale}${path}`))).toBe(true);
    });
  }

  it("публикует главную, юридические страницы, Патруль, модули и PDF без приватных страниц", () => {
    const entries = sitemap();
    const expectedPaths = ["", "/privacy", "/terms", "/patrol", ...Object.keys(moduleSeo).map(slug => `/modules/${slug}`)];
    const actual = entries.map(entry => new URL(entry.url).pathname).sort();
    expect(actual).toEqual([
      ...expectedPaths.flatMap(path => ["ru", "ro"].map(locale => `/${locale}${path}`)), "/ghid_ro.pdf", "/ghid_ru.pdf",
    ].sort());
    for (const entry of entries) expect(entry.url).not.toMatch(/\/api|\/admin|\/profile|\/login|\/ai-help/);
  });

  it("безопасно сериализует данные для JSON-LD", () => {
    const data = { name: "</script><script>alert(1)</script>" };
    expect(jsonLd(data)).not.toContain("<");
    expect(JSON.parse(jsonLd(data))).toEqual(data);
  });
});
