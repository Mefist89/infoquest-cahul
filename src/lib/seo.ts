import type { Metadata } from "next";
import { moduleSeo, siteSeo, type SeoLocale, type SeoModule } from "@/data/seo";
import { absoluteUrl, localizedAlternates } from "./site";

export function publicMetadata(content: { title: string; description: string }, path: string, locale: SeoLocale): Metadata {
  const title = content.title;
  return {
    title,
    description: content.description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: "website", title, description: content.description,
      url: absoluteUrl(`/${locale}${path}`), siteName: "InfoQuest",
      locale: siteSeo[locale].locale, alternateLocale: siteSeo[locale].alternateLocale,
    },
    twitter: { card: "summary_large_image", title, description: content.description },
  };
}

export function moduleStructuredData(module: SeoModule, locale: SeoLocale) {
  const content = moduleSeo[module][locale];
  return {
    "@context": "https://schema.org", "@type": "Course",
    name: content.title, description: content.description, inLanguage: locale,
    url: absoluteUrl(`/${locale}/modules/${module}`),
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "InfoQuest", url: absoluteUrl() },
    offers: { "@type": "Offer", category: "Free" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  };
}

export function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
