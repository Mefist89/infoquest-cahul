import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AiHelpChat } from "@/components/ai/AiHelpChat";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    const next = encodeURIComponent(`/${locale}/ai-help`);
    redirect(`/${locale}/login?next=${next}`);
  }

  return <AiHelpChat locale={locale} />;
}
