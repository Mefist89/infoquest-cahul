import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ScamOrRealModule } from "@/components/modules/ScamOrRealModule";
import { SiteFooter } from "@/components/SiteFooter";
import { MODULE_IDS } from "@/data/module-catalog-meta";
import { scamOrRealContent, type ScamOrRealLocale } from "@/data/scam-or-real";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { pickNextModule } from "@/features/modules/server/next-module";
import type { ModuleProgress, StageProgress } from "@/features/modules/runner/use-module-runner";
import { isAdministrator, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

function isLocale(locale: string): locale is ScamOrRealLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRo = locale === "ro";
  return {
    title: `${isRo ? "Scam sau ofertă reală?" : "Скам или реальное предложение?"} — InfoQuest`,
    description: isRo ? "Modul interactiv despre escrocherii la cumpărături." : "Интерактивный модуль о мошенничестве при покупках.",
  };
}

export default async function ScamOrRealPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/modules/scam-or-real`)}`);

  const [{ data: stages }, { data: allModuleProgress }, { data: profile }] = await Promise.all([
    supabase.from("module_stage_progress").select("stage_index, status, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.scamOrReal).order("stage_index"),
    supabase.from("module_progress").select("module_id, status, xp, score").eq("user_id", authData.user.id),
    supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle(),
  ]);

  const moduleProgress = allModuleProgress?.find(row => row.module_id === MODULE_IDS.scamOrReal) ?? null;
  const currentModule = MODULE_CATALOG.find(entry => entry.moduleId === MODULE_IDS.scamOrReal)!;
  const next = pickNextModule(MODULE_CATALOG, allModuleProgress ?? [], MODULE_IDS.scamOrReal);
  const nextModule = next ? { title: next.title[locale], href: `/${locale}${next.route}` } : null;

  return (
    <>
      <ScamOrRealModule
        badge={currentModule.badge[locale]}
        nextModule={nextModule}
        content={scamOrRealContent[locale]}
        locale={locale}
        initialStages={(stages as StageProgress[]) || []}
        initialModule={(moduleProgress as ModuleProgress) || null}
        isAdmin={isAdministrator(isUserRole(profile?.role) ? profile.role : null)}
      />
      <SiteFooter lang={locale} />
    </>
  );
}
