import { ModuleLanding, ModuleStructuredData } from "@/components/ModuleLanding";
import { moduleSeo } from "@/data/seo";
import { publicMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HackedAccountModule } from "@/components/modules/HackedAccountModule";
import { SiteFooter } from "@/components/SiteFooter";
import { MODULE_IDS } from "@/data/module-catalog-meta";
import { hackedAccountContent, type HackedAccountLocale } from "@/data/hacked-account";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { pickNextModule } from "@/features/modules/server/next-module";
import type { ModuleProgress, StageProgress } from "@/features/modules/runner/use-module-runner";
import { isAdministrator, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

function isLocale(locale: string): locale is HackedAccountLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ru" ? "ru" : "ro";
  return publicMetadata(moduleSeo["hacked-account"][lang], "/modules/hacked-account", lang);
}

export default async function HackedAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return <ModuleLanding module="hacked-account" locale={locale} rules={hackedAccountContent[locale].guestRules} />;

  const [{ data: stages }, { data: allModuleProgress }, { data: profile }] = await Promise.all([
    supabase.from("module_stage_progress").select("stage_index, status, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.hackedAccount).order("stage_index"),
    supabase.from("module_progress").select("module_id, status, xp, score").eq("user_id", authData.user.id),
    supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle(),
  ]);

  const moduleProgress = allModuleProgress?.find(row => row.module_id === MODULE_IDS.hackedAccount) ?? null;
  const currentModule = MODULE_CATALOG.find(entry => entry.moduleId === MODULE_IDS.hackedAccount)!;
  const next = pickNextModule(MODULE_CATALOG, allModuleProgress ?? [], MODULE_IDS.hackedAccount);
  const nextModule = next ? { title: next.title[locale], href: `/${locale}${next.route}` } : null;

  return (
    <>
      <ModuleStructuredData module="hacked-account" locale={locale} />
      <HackedAccountModule
        badge={currentModule.badge[locale]}
        nextModule={nextModule}
        content={hackedAccountContent[locale]}
        locale={locale}
        initialStages={(stages as StageProgress[]) || []}
        initialModule={(moduleProgress as ModuleProgress) || null}
        isAdmin={isAdministrator(isUserRole(profile?.role) ? profile.role : null)}
      />
      <SiteFooter lang={locale} />
    </>
  );
}
