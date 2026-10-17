import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CircleGauge,
  Compass,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { MODULE_CATALOG, MODULE_COUNT, MODULE_STAGES, STAGE_COUNT, TOTAL_MAX_XP, TOTAL_STAGE_COUNT } from "@/data/module-catalog";
import { ROLE_LABELS, USER_ROLES, isAdministrator, isUserRole, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { QuestRow } from "@/lib/types";
import { QuestCard } from "./dashboard/quest-card";
import { UserCard } from "./dashboard/user-card";
import { ActivityChart, AiBudgetPanel, ModuleBar, RoleChart, buildMonthlyActivity } from "./dashboard/charts";
import { DashboardNavLink, DashboardPanel, SectionHeading, StatCard } from "./dashboard/ui";
import { copy, roleColors } from "./dashboard/copy";
import type { AdminAccessStatus, AdminLocale, AdminSection, AdminUser, AiBudgetStatus } from "./dashboard/types";

function isLocale(locale: string): locale is AdminLocale {
  return locale === "ru" || locale === "ro";
}

export function isAdminSection(section: string): section is AdminSection {
  return ["overview", "learning", "quests", "users", "security"].includes(section);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AdminLocale = locale === "ro" ? "ro" : "ru";
  return { title: `Dashboard — InfoQuest`, description: copy[lang].description };
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderAdminDashboard(locale, "overview");
}

export async function renderAdminDashboard(locale: string, section: AdminSection) {
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login`);
  const { data: adminProfile } = await supabase.from("profiles").select("role, display_name, avatar_url").eq("id", authData.user.id).maybeSingle();
  if (!isAdministrator(isUserRole(adminProfile?.role) ? adminProfile.role : null)) redirect(`/${locale}/profile`);

  const [{ data, error }, { data: budgetData }, { data: accessData }, { data: questData }] = await Promise.all([
    supabase.rpc("get_admin_dashboard"),
    supabase.rpc("get_ai_budget_status"),
    supabase.rpc("get_admin_access_status"),
    supabase.from("quests").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
  ]);
  if (error) redirect(`/${locale}/profile`);

  const users = (data ?? []) as AdminUser[];
  const budget = (Array.isArray(budgetData) ? budgetData[0] : null) as AiBudgetStatus | null;
  const accessByUser = new Map(((accessData ?? []) as AdminAccessStatus[]).map((item) => [item.user_id, item]));
  const quests = (questData ?? []) as QuestRow[];
  const t = copy[locale];
  const activeUsers = users.filter((user) => user.completed_modules > 0 || user.in_progress_modules > 0 || user.completed_stages > 0).length;
  const completedModules = users.reduce((sum, user) => sum + Number(user.completed_modules), 0);
  const completedStages = users.reduce((sum, user) => sum + Number(user.completed_stages), 0);
  const availableStages = users.length * TOTAL_STAGE_COUNT;
  const totalXp = users.reduce((sum, user) => sum + Number(user.total_xp), 0);
  const totalAvailableXp = users.length * TOTAL_MAX_XP;
  const completionPercent = totalAvailableXp > 0 ? Math.round((totalXp / totalAvailableXp) * 100) : 0;
  const roleCounts = Object.fromEntries(USER_ROLES.map((role) => [role, users.filter((user) => user.user_role === role).length])) as Record<UserRole, number>;
  const dateFormatter = new Intl.DateTimeFormat(locale === "ro" ? "ro-MD" : "ru-MD", { dateStyle: "medium", timeStyle: "short" });
  const activity = buildMonthlyActivity(users, locale);
  const moduleTotals = MODULE_CATALOG.map((module) => ({
    module,
    completed: users.reduce((sum, user) => sum + Number(user.module_breakdown?.find((item) => item.module_id === module.moduleId)?.completed_stages ?? 0), 0),
    maximum: users.length * STAGE_COUNT,
  }));
  const adminName = adminProfile?.display_name || authData.user.user_metadata.full_name || authData.user.email?.split("@")[0] || t.admin;
  const adminAvatar = adminProfile?.avatar_url || authData.user.user_metadata.avatar_url;
  const avatarIsSafe = typeof adminAvatar === "string" && adminAvatar.startsWith("https://lh3.googleusercontent.com/");
  const sectionPath = section === "overview" ? "" : `/${section}`;
  const sectionLabel = section === "overview" ? t.overview : section === "learning" ? t.learning : section === "quests" ? t.quests : section === "users" ? t.usersSection : t.security;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(2,8,23,0.98),rgba(7,20,48,0.96))]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-slate-950/80 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:p-5">
          <div className="flex items-center gap-3 lg:block">
            <Link href={`/${locale}`} className="focus-ring flex min-w-0 items-center gap-3 rounded-xl">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-neon/40 bg-neon/10 text-neon shadow-[0_0_22px_rgba(0,217,255,0.16)]"><ShieldCheck className="size-6" aria-hidden="true" /></span>
              <span className="min-w-0"><span className="block font-display text-lg font-black">INFO<span className="text-neon">QUEST</span></span><span className="block truncate text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Control center</span></span>
            </Link>

            <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:mt-7 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-card/45 lg:p-3">
              <div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-neon/35 bg-background font-bold text-neon">
                {avatarIsSafe ? <Image src={adminAvatar} alt="" fill sizes="44px" className="object-cover" /> : adminName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden min-w-0 lg:block"><p className="truncate text-sm font-bold">{adminName}</p><p className="truncate text-[11px] text-neon">{t.admin}</p></div>
            </div>
          </div>

          <p className="mt-7 hidden px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground lg:block">{t.navigation}</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible" aria-label={t.navigation}>
            <DashboardNavLink href={`/${locale}/admin`} icon={LayoutDashboard} label={t.overview} active={section === "overview"} />
            <DashboardNavLink href={`/${locale}/admin/learning`} icon={GraduationCap} label={t.learning} active={section === "learning"} />
            <DashboardNavLink href={`/${locale}/admin/quests`} icon={Compass} label={t.quests} active={section === "quests"} />
            <DashboardNavLink href={`/${locale}/admin/users`} icon={Users} label={t.usersSection} active={section === "users"} />
            <DashboardNavLink href={`/${locale}/admin/security`} icon={LockKeyhole} label={t.security} active={section === "security"} />
          </nav>

          <div className="mt-5 hidden border-t border-border/60 pt-5 lg:grid lg:gap-2">
            <Link href={`/${locale}/profile`} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-card hover:text-neon"><ArrowLeft className="size-4" aria-hidden="true" />{t.back}</Link>
            <Link href={`/${locale}`} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-card hover:text-neon"><CircleGauge className="size-4" aria-hidden="true" />{t.home}</Link>
          </div>

          <div className="mt-5 hidden lg:mt-auto lg:block lg:pt-5">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/45 p-2">
              <nav className="flex rounded-xl bg-background/55 p-1" aria-label="Language">
                {(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/admin${sectionPath}`} aria-current={locale === language ? "page" : undefined} className={`focus-ring rounded-lg px-2.5 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}
              </nav>
              <SignOutButton locale={locale} label={t.signOut} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6 xl:p-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/55 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-neon/10 text-neon"><BarChart3 className="size-5" aria-hidden="true" /></span><div><p className="text-xs text-muted-foreground">InfoQuest Dashboard</p><p className="font-bold">{sectionLabel}</p></div></div>
            <div className="flex items-center gap-2 lg:hidden">
              <Link href={`/${locale}/profile`} className="focus-ring grid size-10 place-items-center rounded-xl border border-border text-muted-foreground" aria-label={t.back}><UserCog className="size-4" aria-hidden="true" /></Link>
              <nav className="flex rounded-xl border border-border bg-background/45 p-1" aria-label="Language">{(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/admin${sectionPath}`} className={`focus-ring rounded-lg px-2.5 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}</nav>
              <SignOutButton locale={locale} label={t.signOut} />
            </div>
          </header>

          {section === "overview" && <section id="overview" className="scroll-mt-6 pt-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-neon"><Sparkles className="size-3.5" aria-hidden="true" />{t.title}</p>
            <h1 className="mt-4 max-w-4xl text-3xl font-black sm:text-4xl xl:text-5xl">{t.greeting}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.description}</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label={t.users} value={String(users.length)} color="text-neon" detail={`${roleCounts.student} ${ROLE_LABELS.student[locale].toLowerCase()}`} />
              <StatCard icon={Activity} label={t.active} value={String(activeUsers)} color="text-gold" detail={`${users.length ? Math.round((activeUsers / users.length) * 100) : 0}%`} />
              <StatCard icon={CheckCircle2} label={t.modulesDone} value={String(completedModules)} color="text-success" detail={`${completedModules}/${users.length * MODULE_COUNT}`} />
              <StatCard icon={Layers3} label={t.stagesDone} value={String(completedStages)} color="text-violet" detail={`${completedStages}/${availableStages}`} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
              <DashboardPanel title={t.activity} hint={t.activityHint} icon={BarChart3}>
                <ActivityChart items={activity} />
              </DashboardPanel>
              <DashboardPanel title={t.roles} hint={t.rolesHint} icon={Users}>
                <RoleChart counts={roleCounts} total={users.length} locale={locale} />
              </DashboardPanel>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
              <DashboardPanel title={t.moduleOverview} hint={t.moduleOverviewHint} icon={GraduationCap}>
                <div className="grid gap-4">
                  {moduleTotals.map(({ module, completed, maximum }) => {
                    const percent = maximum > 0 ? Math.round((completed / maximum) * 100) : 0;
                    return <ModuleBar key={module.moduleId} label={module.shortTitle[locale]} completed={completed} maximum={maximum} percent={percent} available={module.status === "playable"} statusLabel={module.status === "playable" ? t.available : t.soon} />;
                  })}
                </div>
              </DashboardPanel>

              <div className="grid gap-5">
                <DashboardPanel title={t.completion} hint={`${totalXp}/${totalAvailableXp} XP`} icon={CircleGauge}>
                  <div className="flex items-center gap-5">
                    <div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--neon) ${completionPercent}%, color-mix(in oklab, var(--secondary) 85%, transparent) 0)` }}>
                      <div className="grid size-20 place-items-center rounded-full bg-card"><span className="font-display text-xl font-black text-neon">{completionPercent}%</span></div>
                    </div>
                    <div><p className="text-sm text-muted-foreground">{t.stagesDone}</p><p className="mt-2 font-display text-2xl font-black">{completedStages}/{availableStages}</p></div>
                  </div>
                </DashboardPanel>
              </div>
            </div>

            {budget && <AiBudgetPanel budget={budget} locale={locale} />}
          </section>}

          {section === "learning" && <section id="learning" className="scroll-mt-6 py-10">
            <SectionHeading title={t.structure} description={t.structureHint} icon={GraduationCap} />
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {MODULE_STAGES.map((stage) => <li key={stage.kind} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/55 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl border font-display text-xs font-black ${stage.index === STAGE_COUNT ? "border-gold/60 bg-gold/10 text-gold" : "border-neon/40 bg-neon/10 text-neon"}`}>{stage.index}</span><div><p className="text-sm font-semibold">{stage.title[locale]}</p><p className="mt-1 text-xs text-muted-foreground">+{stage.xp} XP</p></div></li>)}
            </ol>
          </section>}

          {section === "quests" && <section id="quests" className="scroll-mt-6 py-10">
            <SectionHeading title={t.questsTitle} description={t.questsHint} icon={Compass} />
            {quests.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-neon/35 bg-card/45 p-6 sm:p-8">
                <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-neon/10 text-neon"><Compass className="size-6" aria-hidden="true" /></span><div><h3 className="font-black">{t.quests}</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t.questsEmpty}</p></div></div>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {quests.map((quest) => <QuestCard key={quest.id} quest={quest} locale={locale} t={t} />)}
              </div>
            )}
          </section>}

          {section === "users" && <section id="users" className="scroll-mt-6 py-10">
            <SectionHeading title={t.list} description={t.listHint} icon={UserCog} />
            <div className="mt-5 grid gap-4">
              {users.length === 0 && <p className="rounded-2xl border border-border bg-card/70 p-6 text-muted-foreground">{t.noUsers}</p>}
              {users.map((user) => <UserCard key={user.user_id} user={user} locale={locale} t={t} access={accessByUser.get(user.user_id)} currentAdminId={authData.user.id} dateFormatter={dateFormatter} />)}
            </div>
          </section>}

          {section === "security" && <section id="security" className="scroll-mt-6 py-10">
            <SectionHeading title={t.security} description={t.listHint} icon={LockKeyhole} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {USER_ROLES.map((role) => <div key={role} className="rounded-2xl border border-border/70 bg-card/55 p-4"><div className={`size-2.5 rounded-full ${roleColors[role]}`} /><p className="mt-4 text-xs text-muted-foreground">{ROLE_LABELS[role][locale]}</p><p className="mt-1 font-display text-2xl font-black">{roleCounts[role]}</p></div>)}
            </div>
          </section>}
        </div>
      </div>
    </main>
  );
}
