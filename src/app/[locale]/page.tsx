import type { Metadata } from "next";

import { siteSeo } from "@/data/seo";
import HomePage from "@/components/HomePage";
import { jsonLd } from "@/lib/seo";
import { absoluteUrl, localizedAlternates } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "ru";
  const content = siteSeo[lang];

  return {
    title: { absolute: content.title },
    description: content.description,
    alternates: localizedAlternates("", lang),
    openGraph: {
      type: "website",
      url: absoluteUrl(`/${lang}`),
      title: content.title,
      description: content.description,
      siteName: "InfoQuest",
      locale: content.locale,
      alternateLocale: content.alternateLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "ru" ? "ru" : "ro";
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
      "@context": "https://schema.org", "@type": "Organization", name: "InfoQuest",
      url: absoluteUrl(`/${lang}`), description: siteSeo[lang].description, inLanguage: lang,
    }) }} />
    <HomePage />
  </>;
}
