import { publicPageSeo } from "@/data/seo";
import { publicMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { legalContent, type LegalLocale } from "@/data/legal-content";

type PageProps = { params: Promise<{ locale: string }> };

function getLocale(locale: string): LegalLocale {
  if (locale !== "ro" && locale !== "ru") notFound();
  return locale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = getLocale((await params).locale);
  return publicMetadata(publicPageSeo.privacy[locale], "/privacy", locale);
}

export default async function PrivacyPage({ params }: PageProps) {
  const locale = getLocale((await params).locale);
  return <LegalDocumentPage locale={locale} kind="privacy" document={legalContent[locale].privacy} />;
}
