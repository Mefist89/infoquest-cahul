import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Compass,
  Gift,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  Link2Off,
  Lock,
  MapPin,
  Medal,
  PhoneCall,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserLock,
  type LucideIcon,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  MODULE_CATALOG,
  MODULE_COUNT,
  MODULE_MAX_XP,
  STAGE_COUNT,
  TOTAL_MAX_XP,
  TOTAL_STAGE_COUNT,
  type ModuleIcon,
} from "@/data/module-catalog";
import { canUseAi, isAdministrator, isUserRole, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

type ProfileLocale = "ru" | "ro";
export type ProfileSection = "overview" | "missions" | "achievements" | "quests";
type ProgressStatus = "not_started" | "in_progress" | "completed";
type ProgressRow = { module_id: string; status: ProgressStatus; score: number; xp: number; attempts: number };
type StageProgressRow = { module_id: string; status: ProgressStatus };

const moduleIcons: Record<ModuleIcon, LucideIcon> = {
  "phone-call": PhoneCall,
  "link-2-off": Link2Off,
  "user-lock": UserLock,
  gift: Gift,
  "scan-face": ScanFace,
  languages: Languages,
  "map-pin": MapPin,
  "shield-alert": ShieldAlert,
};

const copy = {
  ru: {
    title: "Dashboard детектива",
    description: "Очки, достижения и прогресс по цифровым расследованиям.",
    back: "На главную",
    signOut: "Выйти",
    detective: "Детектив-стажёр",
    greeting: "С возвращением",
    greetingText: "Продолжайте расследование и укрепляйте цифровой щит сообщества.",
    navigation: "Навигация",
    overview: "Обзор",
    missions: "Мои миссии",
    achievements: "Награды",
    quests: "Квесты",
    aiHelp: "Chrono AI",
    xp: "Всего XP",
    completed: "Пройдено",
    bestScore: "Лучший результат",
    stagesDone: "Этапов завершено",
    shield: "Целостность щита",
    progressText: "Завершите восемь расследований, чтобы восстановить цифровой щит сообщества.",
    continue: "Продолжить расследование",
    currentMission: "Текущая миссия",
    currentMissionHint: "Первое цифровое дело уже доступно",
    modules: "Прохождение модулей",
    moduleHint: "Сейчас доступна первая миссия. Остальные откроются позже.",
    open: "Открыть модуль",
    locked: "Скоро",
    score: "Результат",
    stages: "Этапы",
    noScore: "—",
    role: "Роль",
    badges: "Коллекция наград",
    badgesHint: "Каждое завершённое расследование открывает отдельный бейдж.",
    earned: "Получено",
    notEarned: "Не получено",
    questsTitle: "Отдельные игровые квесты",
    questsHint: "Здесь появятся дополнительные игры, которые не влияют на обязательный прогресс восьми учебных миссий.",
    questsEmpty: "Первый квест ещё разрабатывается. Когда он будет готов, он появится на этой странице.",
    questsSoon: "Скоро",
    aiRestricted: "AI-помощник Chrono доступен ученикам, учителям и администраторам. Администратор может изменить вашу роль.",
    statuses: { not_started: "Не начато", in_progress: "В процессе", completed: "Пройдено" },
  },
  ro: {
    title: "Dashboard-ul detectivului",
    description: "Puncte, realizări și progresul investigațiilor digitale.",
    back: "Pagina principală",
    signOut: "Ieșire",
    detective: "Detectiv stagiar",
    greeting: "Bine ai revenit",
    greetingText: "Continuă investigația și întărește scutul digital al comunității.",
    navigation: "Navigare",
    overview: "Prezentare",
    missions: "Misiunile mele",
    achievements: "Recompense",
    quests: "Quest-uri",
    aiHelp: "Chrono AI",
    xp: "XP total",
    completed: "Finalizate",
    bestScore: "Cel mai bun rezultat",
    stagesDone: "Etape finalizate",
    shield: "Integritatea scutului",
    progressText: "Finalizează cele opt investigații pentru a reface scutul digital al comunității.",
    continue: "Continuă investigația",
    currentMission: "Misiunea curentă",
    currentMissionHint: "Primul dosar digital este deja disponibil",
    modules: "Progresul modulelor",
    moduleHint: "Acum este disponibilă prima misiune. Celelalte se vor deschide mai târziu.",
    open: "Deschide modulul",
    locked: "În curând",
    score: "Rezultat",
    stages: "Etape",
    noScore: "—",
    role: "Rol",
    badges: "Colecția de recompense",
    badgesHint: "Fiecare investigație finalizată deblochează o insignă separată.",
    earned: "Obținută",
    notEarned: "Neobținută",
    questsTitle: "Quest-uri de joc separate",
    questsHint: "Aici vor apărea jocuri suplimentare care nu influențează progresul obligatoriu al celor opt misiuni educaționale.",
    questsEmpty: "Primul quest este încă în dezvoltare. Când va fi gata, va apărea pe această pagină.",
    questsSoon: "În curând",
    aiRestricted: "Asistentul AI Chrono este disponibil elevilor, profesorilor și administratorilor. Un administrator îți poate schimba rolul.",
    statuses: { not_started: "Neînceput", in_progress: "În desfășurare", completed: "Finalizat" },
  },
} as const;

function isLocale(locale: string): locale is ProfileLocale {
  return locale === "ru" || locale === "ro";
}

export function isProfileSection(section: string): section is ProfileSection {
  return ["overview", "missions", "achievements", "quests"].includes(section);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: ProfileLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${copy[lang].title} — InfoQuest`, description: copy[lang].description };
}

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ ai?: string | string[] }> }) {
  const { locale } = await params;
  return renderProfileDashboard(locale, "overview", await searchParams);
}

export async function renderProfileDashboard(locale: string, section: ProfileSection, query: { ai?: string | string[] } = {}) {
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login`);

  const user = authData.user;
  const [{ data: profile }, { data: progressData }, { data: stageProgressData }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, role").eq("id", user.id).maybeSingle(),
    supabase.from("module_progress").select("module_id, status, score, xp, attempts").eq("user_id", user.id),
    supabase.from("module_stage_progress").select("module_id, status").eq("user_id", user.id),
  ]);

  const progress = (progressData ?? []) as ProgressRow[];
  const stageProgress = (stageProgressData ?? []) as StageProgressRow[];
  const byModule = new Map(progress.map((item) => [item.module_id, item]));
  const moduleIds = new Set<string>(MODULE_CATALOG.map((module) => module.moduleId));
  const relevantProgress = progress.filter((item) => moduleIds.has(item.module_id));
  const completedStagesByModule = new Map<string, number>();
  stageProgress.forEach((item) => {
    if (moduleIds.has(item.module_id) && item.status === "completed") {
      completedStagesByModule.set(item.module_id, (completedStagesByModule.get(item.module_id) ?? 0) + 1);
    }
  });

  const completedCount = relevantProgress.filter((item) => item.status === "completed").length;
  const completedStageCount = Array.from(completedStagesByModule.values()).reduce((sum, count) => sum + count, 0);
  const totalXp = relevantProgress.reduce((sum, item) => sum + Math.max(0, Math.min(MODULE_MAX_XP, item.xp)), 0);
  const bestScore = relevantProgress.reduce((best, item) => Math.max(best, item.score), 0);
  const completionPercent = Math.min(100, Math.round((totalXp / TOTAL_MAX_XP) * 100));
  const metadata = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
  const displayName = profile?.display_name || metadata.full_name || metadata.name || user.email?.split("@")[0] || "Detective";
  const avatarUrl = profile?.avatar_url || metadata.avatar_url;
  const safeAvatar = typeof avatarUrl === "string" && avatarUrl.startsWith("https://lh3.googleusercontent.com/") ? avatarUrl : null;
  const userRole: UserRole = isUserRole(profile?.role) ? profile.role : "user";
  const initials = displayName.trim().slice(0, 2).toUpperCase();
  const t = copy[locale];
  const currentModule = MODULE_CATALOG[0];
  const currentProgress = byModule.get(currentModule.moduleId) ?? { status: "not_started" as const, score: 0, xp: 0, attempts: 0 };
  const currentStages = completedStagesByModule.get(currentModule.moduleId) ?? 0;
  const CurrentModuleIcon = moduleIcons[currentModule.icon];
  const sectionPath = section === "overview" ? "" : `/${section}`;
  const sectionLabel = section === "overview" ? t.overview : section === "missions" ? t.missions : section === "achievements" ? t.achievements : t.quests;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(2,8,23,0.98),rgba(7,20,48,0.96))]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-slate-950/80 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:p-5">
          <Link href={`/${locale}`} className="focus-ring flex items-center gap-3 rounded-xl">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-neon/40 bg-neon/10 text-neon shadow-[0_0_22px_rgba(0,217,255,0.16)]"><ShieldCheck className="size-6" aria-hidden="true" /></span>
            <span><span className="block font-display text-lg font-black">INFO<span className="text-neon">QUEST</span></span><span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Detective center</span></span>
          </Link>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/45 p-3">
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-neon/35 bg-background font-bold text-neon">
              {safeAvatar ? <Image src={safeAvatar} alt="" fill sizes="48px" className="object-cover" /> : initials}
            </div>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{displayName}</p><p className="truncate text-[11px] text-neon">{ROLE_LABELS[userRole][locale]}</p></div>
          </div>

          <p className="mt-7 hidden px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground lg:block">{t.navigation}</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible" aria-label={t.navigation}>
            <DashboardNavLink href={`/${locale}/profile`} icon={LayoutDashboard} label={t.overview} active={section === "overview"} />
            <DashboardNavLink href={`/${locale}/profile/missions`} icon={GraduationCap} label={t.missions} active={section === "missions"} />
            <DashboardNavLink href={`/${locale}/profile/achievements`} icon={Trophy} label={t.achievements} active={section === "achievements"} />
            <DashboardNavLink href={`/${locale}/profile/quests`} icon={Compass} label={t.quests} active={section === "quests"} />
            {canUseAi(userRole) && <DashboardNavLink href={`/${locale}/ai-help`} icon={Bot} label={t.aiHelp} />}
          </nav>

          <div className="mt-5 hidden border-t border-border/60 pt-5 lg:grid lg:gap-2">
            <Link href={`/${locale}`} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-card hover:text-neon"><Home className="size-4" aria-hidden="true" />{t.back}</Link>
            {isAdministrator(userRole) && <Link href={`/${locale}/admin`} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-card hover:text-neon"><ShieldCheck className="size-4" aria-hidden="true" />{locale === "ro" ? "Administrare" : "Админ-панель"}</Link>}
          </div>

          <div className="mt-5 hidden lg:mt-auto lg:block lg:pt-5">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/45 p-2">
              <LanguageNav locale={locale} sectionPath={sectionPath} />
              <SignOutButton locale={locale} label={t.signOut} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6 xl:p-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/55 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-neon/10 text-neon"><BarChart3 className="size-5" aria-hidden="true" /></span><div><p className="text-xs text-muted-foreground">InfoQuest Dashboard</p><p className="font-bold">{sectionLabel}</p></div></div>
            <div className="flex items-center gap-2 lg:hidden"><Link href={`/${locale}`} className="focus-ring grid size-10 place-items-center rounded-xl border border-border text-muted-foreground" aria-label={t.back}><ArrowLeft className="size-4" aria-hidden="true" /></Link><LanguageNav locale={locale} sectionPath={sectionPath} /><SignOutButton locale={locale} label={t.signOut} /></div>
          </header>

          {query.ai === "restricted" && <div role="alert" className="mt-6 rounded-2xl border border-gold/45 bg-gold/10 px-5 py-4 text-sm text-foreground"><strong className="text-gold">{t.role}: {ROLE_LABELS[userRole][locale]}.</strong> {t.aiRestricted}</div>}

          {section === "overview" && <section id="overview" className="scroll-mt-6 pt-8 pb-10">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-neon">{t.detective}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl xl:text-5xl">{t.greeting}, {displayName}</h1><p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{t.greetingText}</p></div>
              <Link href={`/${locale}${currentModule.route}`} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground shadow-[0_0_25px_rgba(0,217,255,0.2)] transition hover:-translate-y-0.5"><PhoneCall className="size-4" aria-hidden="true" />{t.continue}<ChevronRight className="size-4" aria-hidden="true" /></Link>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Sparkles} label={t.xp} value={`${totalXp}/${TOTAL_MAX_XP}`} color="text-gold" />
              <StatCard icon={Check} label={t.completed} value={`${completedCount}/${MODULE_COUNT}`} color="text-success" />
              <StatCard icon={CircleGauge} label={t.stagesDone} value={`${completedStageCount}/${TOTAL_STAGE_COUNT}`} color="text-neon" />
              <StatCard icon={Award} label={t.bestScore} value={bestScore ? `${bestScore}%` : t.noScore} color="text-violet" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <DashboardPanel title={t.shield} hint={t.progressText} icon={ShieldCheck}>
                <div className="flex items-center gap-5"><ProgressDonut percent={completionPercent} /><div><p className="text-xs uppercase tracking-wider text-muted-foreground">{t.xp}</p><p className="mt-1 font-display text-2xl font-black text-gold">{totalXp}</p><p className="mt-3 text-xs text-muted-foreground">{t.stages}: {completedStageCount}/{TOTAL_STAGE_COUNT}</p></div></div>
              </DashboardPanel>
              <DashboardPanel title={t.currentMission} hint={t.currentMissionHint} icon={CurrentModuleIcon}>
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-gold/50 font-display text-xs font-black text-gold">01</span><h2 className="font-black">{currentModule.title[locale]}</h2></div><div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{t.stages}: {currentStages}/{STAGE_COUNT}</span><span>{currentProgress.xp}/{MODULE_MAX_XP} XP</span><span>{t.score}: {currentProgress.attempts ? `${currentProgress.score}%` : t.noScore}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={currentModule.title[locale]} aria-valuenow={currentStages} aria-valuemin={0} aria-valuemax={STAGE_COUNT}><div className="h-full rounded-full bg-neon" style={{ width: `${(currentStages / STAGE_COUNT) * 100}%` }} /></div></div><Link href={`/${locale}${currentModule.route}`} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-4 text-sm font-bold text-neon">{t.open}<ChevronRight className="size-4" aria-hidden="true" /></Link></div>
              </DashboardPanel>
            </div>
          </section>}

          {section === "missions" && <section id="missions" className="scroll-mt-6 py-10">
            <SectionHeading title={t.modules} description={t.moduleHint} icon={GraduationCap} />
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {MODULE_CATALOG.map((module) => {
                const locked = module.status !== "playable";
                const item = byModule.get(module.moduleId) ?? { status: "not_started" as const, score: 0, xp: 0, attempts: 0 };
                const completedStages = Math.min(STAGE_COUNT, completedStagesByModule.get(module.moduleId) ?? 0);
                const moduleXp = Math.max(0, Math.min(MODULE_MAX_XP, item.xp));
                const Icon = moduleIcons[module.icon];
                const statusStyles = item.status === "completed" ? "border-success/45 bg-success/10 text-success" : item.status === "in_progress" ? "border-gold/45 bg-gold/10 text-gold" : "border-border bg-secondary/55 text-muted-foreground";
                return <article key={module.moduleId} className={`group rounded-2xl border bg-card/55 p-5 transition ${locked ? "border-border/60" : "border-neon/30 hover:-translate-y-0.5 hover:border-neon/60"}`}><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-background/60"><Icon className="size-6" style={{ color: module.color }} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{module.title[locale]}</h3><span className="font-display text-xs text-gold">0{module.id}</span></div><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${statusStyles}`}>{item.status === "completed" ? <Check className="size-3" aria-hidden="true" /> : <Clock3 className="size-3" aria-hidden="true" />}{t.statuses[item.status]}</span><span className="py-1 text-muted-foreground">{completedStages}/{STAGE_COUNT} · {moduleXp}/{MODULE_MAX_XP} XP</span></div></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${locked ? "bg-muted-foreground/35" : "bg-neon"}`} style={{ width: `${(moduleXp / MODULE_MAX_XP) * 100}%` }} /></div><div className="mt-4 flex justify-end">{locked || !module.route ? <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-secondary/45 px-3 text-xs font-bold text-muted-foreground"><Lock className="size-3.5" aria-hidden="true" />{t.locked}</span> : <Link href={`/${locale}${module.route}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-xs font-bold text-neon">{t.open}<ChevronRight className="size-3.5" aria-hidden="true" /></Link>}</div></article>;
              })}
            </div>
          </section>}

          {section === "achievements" && <section id="achievements" className="scroll-mt-6 py-10">
            <SectionHeading title={t.badges} description={t.badgesHint} icon={Trophy} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {MODULE_CATALOG.map((module) => {
                const earned = byModule.get(module.moduleId)?.status === "completed";
                return <article key={module.moduleId} className={`rounded-2xl border p-4 ${earned ? "border-gold/45 bg-gold/10" : "border-border/65 bg-card/45"}`}><div className="flex items-start gap-3"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${earned ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"}`}><Medal className="size-5" aria-hidden="true" /></span><div><h3 className={`text-sm font-bold ${earned ? "text-foreground" : "text-muted-foreground"}`}>{module.badge[locale]}</h3><p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${earned ? "text-gold" : "text-muted-foreground"}`}>{earned ? t.earned : t.notEarned}</p></div></div></article>;
              })}
            </div>
          </section>}

          {section === "quests" && <section id="quests" className="scroll-mt-6 py-10">
            <SectionHeading title={t.questsTitle} description={t.questsHint} icon={Compass} />
            <div className="mt-5 rounded-3xl border border-dashed border-neon/35 bg-card/45 p-8 text-center sm:p-12">
              <span className="mx-auto grid size-20 place-items-center rounded-3xl border border-neon/30 bg-neon/10 text-neon shadow-[0_0_28px_rgba(0,217,255,0.12)]"><Compass className="size-10" aria-hidden="true" /></span>
              <span className="mt-6 inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-gold">{t.questsSoon}</span>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.questsEmpty}</p>
            </div>
          </section>}
        </div>
      </div>
    </main>
  );
}

function LanguageNav({ locale, sectionPath }: { locale: ProfileLocale; sectionPath: string }) {
  return <nav className="flex rounded-xl bg-background/55 p-1" aria-label="Language">{(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/profile${sectionPath}`} aria-current={locale === language ? "page" : undefined} className={`focus-ring rounded-lg px-2.5 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}</nav>;
}

function DashboardNavLink({ href, icon: Icon, label, active = false }: { href: string; icon: LucideIcon; label: string; active?: boolean }) {
  return <Link href={href} className={`focus-ring flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${active ? "border-neon/30 bg-neon/10 text-neon" : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}</Link>;
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-neon/30"><span className={`grid size-11 place-items-center rounded-xl bg-background/55 ${color}`}><Icon className="size-5" aria-hidden="true" /></span><p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-black">{value}</p></article>;
}

function DashboardPanel({ title, hint, icon: Icon, children }: { title: string; hint: string; icon: LucideIcon; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p></div></div><div className="mt-6">{children}</div></article>;
}

function SectionHeading({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-neon/25 bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>;
}

function ProgressDonut({ percent }: { percent: number }) {
  return <div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--neon) ${percent}%, color-mix(in oklab, var(--secondary) 85%, transparent) 0)` }} role="img" aria-label={`${percent}%`}><div className="grid size-20 place-items-center rounded-full bg-card"><span className="font-display text-xl font-black text-neon">{percent}%</span></div></div>;
}
