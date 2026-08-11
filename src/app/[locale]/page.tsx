import type { Metadata } from "next";

import HomePage from "@/components/HomePage";
import { absoluteUrl, localizedAlternates } from "@/lib/site";

const metadataContent = {
  ro: {
    title: "InfoQuest — Scutul comunității digitale",
    description: "Joc educațional bilingv despre siguranță digitală, fraudă, dezinformare și protecția comunității.",
    locale: "ro_MD",
    alternateLocale: "ru_MD",
  },
  ru: {
    title: "InfoQuest — Щит цифрового сообщества",
    description: "Двуязычная образовательная игра о цифровой безопасности, мошенничестве, дезинформации и защите сообщества.",
    locale: "ru_MD",
    alternateLocale: "ro_MD",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "ru";
  const content = metadataContent[lang];

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

export default function Page() {
  return <HomePage />;
}
