import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import type { LegalLocale } from "@/data/legal-content";

type PageProps = { params: Promise<{ locale: string }> };

function getLocale(locale: string): LegalLocale {
  if (locale !== "ro" && locale !== "ru") notFound();
  return locale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = getLocale((await params).locale);
  return {
    title: locale === "ro" ? "Politica de confidențialitate — InfoQuest" : "Политика конфиденциальности — InfoQuest",
    description:
      locale === "ro"
        ? "Cum protejează InfoQuest datele și confidențialitatea utilizatorilor."
        : "Как InfoQuest защищает данные и конфиденциальность пользователей.",
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const locale = getLocale((await params).locale);
  return <LegalDocumentPage locale={locale} kind="privacy" />;
}
