import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OperatorCallModule } from "@/components/modules/OperatorCallModule";
import { SiteFooter } from "@/components/SiteFooter";
import { MODULE_IDS } from "@/data/module-catalog";
import type { OperatorLocale } from "@/data/operator-call";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function isLocale(locale: string): locale is OperatorLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRo = locale === "ro";
  return {
    title: `${isRo ? "Apelul fals de la operator" : "Фальшивый звонок оператора"} — InfoQuest`,
    description: isRo ? "Modul interactiv despre recunoașterea fraudelor telefonice." : "Интерактивный модуль о распознавании телефонного мошенничества.",
  };
}

export default async function OperatorCallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/modules/operator-call`)}`);

  const [{ data: stages }, { data: moduleProgress }] = await Promise.all([
    supabase.from("module_stage_progress").select("stage_index, status, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.operatorCall).order("stage_index"),
    supabase.from("module_progress").select("status, xp, score").eq("user_id", authData.user.id).eq("module_id", MODULE_IDS.operatorCall).maybeSingle(),
  ]);

  return (
    <>
      <OperatorCallModule
        locale={locale}
        initialStages={(stages ?? []) as Array<{ stage_index: number; status: "not_started" | "in_progress" | "completed"; score: number }>}
        initialModule={moduleProgress as { status: "not_started" | "in_progress" | "completed"; xp: number; score: number } | null}
        isAdmin={isAdminEmail(authData.user.email)}
      />
      <SiteFooter lang={locale} />
    </>
  );
}
