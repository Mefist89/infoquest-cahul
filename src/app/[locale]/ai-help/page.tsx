import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AiHelpChat } from "@/components/ai/AiHelpChat";

type AiLocale = "ro" | "ru";

function isLocale(locale: string): locale is AiLocale {
  return locale === "ro" || locale === "ru";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AiLocale = locale === "ru" ? "ru" : "ro";
  return {
    title: lang === "ro" ? "Ajutor online AI — InfoQuest" : "Онлайн-помощник AI — InfoQuest",
    description: lang === "ro" ? "Discută cu Chrono despre siguranța digitală." : "Поговорите с Chrono о цифровой безопасности.",
  };
}

export default async function AiHelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AiHelpChat locale={locale} />;
}
