import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { RouteStateLocale } from "@/components/layout/RouteStatePage";

export function requireRouteLocale(locale: string): RouteStateLocale {
  if (locale !== "ru" && locale !== "ro") notFound();
  return locale;
}

export function routeStateMetadata(locale: string, title: { ru: string; ro: string }, description: { ru: string; ro: string }): Metadata {
  const lang: RouteStateLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${title[lang]} — InfoQuest`, description: description[lang] };
}
