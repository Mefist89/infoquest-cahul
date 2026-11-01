import { ModuleLanding, ModuleStructuredData } from "@/components/ModuleLanding";
import { moduleSeo } from "@/data/seo";
import { publicMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OperatorCallModule } from "@/components/modules/OperatorCallModule";
import { SiteFooter } from "@/components/SiteFooter";
import { MODULE_IDS } from "@/data/module-catalog-meta";
import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { MODULE_CATALOG } from "@/data/module-catalog";
import { pickNextModule } from "@/features/modules/server/next-module";
import type { ModuleProgress, StageProgress } from "@/features/modules/runner/use-module-runner";
import { isAdministrator, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

function isLocale(locale: string): locale is OperatorLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ru" ? "ru" : "ro";
  return publicMetadata(moduleSeo["operator-call"][lang], "/modules/operator-call", lang);
}

export default async function OperatorCallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return <ModuleLanding module="operator-call" locale={locale} rules={operatorCallContent[locale].guestRules} />;

  const [{ data: stages }, { data: allModuleProgress }, { data: profile }] = await Promise.all([
    supabase.from("module_stage_progress").select("stage_index, status, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.operatorCall).order("stage_index"),
    supabase.from("module_progress").select("module_id, status, xp, score").eq("user_id", authData.user.id),
    supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle(),
  ]);

  const moduleProgress = allModuleProgress?.find(row => row.module_id === MODULE_IDS.operatorCall) ?? null;
  const currentModule = MODULE_CATALOG.find(entry => entry.moduleId === MODULE_IDS.operatorCall)!;
  const next = pickNextModule(MODULE_CATALOG, allModuleProgress ?? [], MODULE_IDS.operatorCall);
  const nextModule = next ? { title: next.title[locale], href: `/${locale}${next.route}` } : null;

  return (
    <>
      <ModuleStructuredData module="operator-call" locale={locale} />
      <OperatorCallModule
        badge={currentModule.badge[locale]}
        nextModule={nextModule}
        content={operatorCallContent[locale]}
        locale={locale}
        initialStages={(stages ?? []) as StageProgress[]}
        initialModule={moduleProgress as ModuleProgress}
        isAdmin={isAdministrator(isUserRole(profile?.role) ? profile.role : null)}
      />
      <SiteFooter lang={locale} />
    </>
  );
}
