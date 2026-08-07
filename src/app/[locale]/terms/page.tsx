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
    title: locale === "ro" ? "Termeni și condiții — InfoQuest Cahul" : "Условия использования — InfoQuest Cahul",
    description:
      locale === "ro"
        ? "Regulile de utilizare a prototipului educațional InfoQuest Cahul."
        : "Правила использования образовательного прототипа InfoQuest Cahul.",
  };
}

export default async function TermsPage({ params }: PageProps) {
  const locale = getLocale((await params).locale);
  return <LegalDocumentPage locale={locale} kind="terms" />;
}
