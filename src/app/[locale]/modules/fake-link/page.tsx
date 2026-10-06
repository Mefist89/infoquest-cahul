import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { FakeLinkModule } from "@/components/modules/FakeLinkModule";
import { SiteFooter } from "@/components/SiteFooter";
import { MODULE_IDS } from "@/data/module-catalog";
import type { FakeLinkLocale } from "@/data/fake-link";
import type { ModuleProgress, StageProgress } from "@/features/modules/runner/use-module-runner";
import { isAdministrator, isUserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

function isLocale(locale: string): locale is FakeLinkLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRo = locale === "ro";
  return {
    title: `${isRo ? "Capcana linkului fals" : "Ловушка фальшивой ссылки"} — InfoQuest`,
    description: isRo ? "Modul interactiv despre phishing." : "Интерактивный модуль о фишинге.",
  };
}

export default async function FakeLinkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/modules/fake-link`)}`);

  const [{ data: stages }, { data: moduleProgress }, { data: profile }] = await Promise.all([
    supabase.from("module_stage_progress").select("stage_index, status, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.fakeLink).order("stage_index"),
    supabase.from("module_progress").select("status, xp, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.fakeLink).maybeSingle(),
    supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle(),
  ]);

  return (
    <>
      <FakeLinkModule 
        locale={locale} 
        initialStages={(stages as StageProgress[]) || []} 
        initialModule={(moduleProgress as ModuleProgress) || null} 
        isAdmin={isAdministrator(isUserRole(profile?.role) ? profile.role : null)} 
      />
      <SiteFooter lang={locale} />
    </>
  );
}
