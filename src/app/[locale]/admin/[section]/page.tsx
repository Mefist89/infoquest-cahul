import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isAdminSection, renderAdminDashboard } from "../page";

const titles = {
  ru: { learning: "Обучение", quests: "Квесты", users: "Пользователи", security: "Безопасность" },
  ro: { learning: "Învățare", quests: "Quest-uri", users: "Utilizatori", security: "Securitate" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isAdminSection(section) || section === "overview") return {};
  const lang = locale === "ro" ? "ro" : "ru";
  return { title: `${titles[lang][section]} — InfoQuest Dashboard` };
}

export default async function AdminSectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isAdminSection(section) || section === "overview") notFound();
  return renderAdminDashboard(locale, section);
}
