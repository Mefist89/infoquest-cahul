import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isProfileSection, renderProfileDashboard } from "../page";

const titles = {
  ru: { missions: "Мои миссии", achievements: "Награды", quests: "Квесты" },
  ro: { missions: "Misiunile mele", achievements: "Recompense", quests: "Quest-uri" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isProfileSection(section) || section === "overview") return {};
  const lang = locale === "ro" ? "ro" : "ru";
  return { title: `${titles[lang][section]} — InfoQuest Dashboard` };
}

export default async function ProfileSectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isProfileSection(section) || section === "overview") notFound();
  return renderProfileDashboard(locale, section);
}
