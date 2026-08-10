import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, Check, ChevronRight, Clock3, Gift, Languages, Link2Off, Lock, MapPin, Medal, PhoneCall, ScanFace, ShieldAlert, ShieldCheck, Sparkles, UserLock, type LucideIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { MODULE_CATALOG, MODULE_COUNT, MODULE_MAX_XP, STAGE_COUNT, TOTAL_MAX_XP, type ModuleIcon } from "@/data/module-catalog";
import { isAdministrator, isUserRole, ROLE_LABELS, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

type ProfileLocale = "ru" | "ro";
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
    title: "Профиль детектива", description: "Очки, достижения и прогресс по цифровым расследованиям.", back: "На главную", signOut: "Выйти", detective: "Детектив-стажёр",
    xp: "Всего XP", completed: "Пройдено", bestScore: "Лучший результат", shield: "Целостность щита", progressText: "Завершите восемь расследований, чтобы восстановить цифровой щит сообщества.",
    modules: "Прохождение модулей", moduleHint: "Сейчас доступна первая миссия. Остальные откроются позже.", open: "Открыть модуль", locked: "Скоро", score: "Результат", stages: "Этапы", noScore: "—",
    role: "Роль", aiRestricted: "AI-помощник Chrono доступен ученикам, учителям и администраторам. Администратор может изменить вашу роль.",
    statuses: { not_started: "Не начато", in_progress: "В процессе", completed: "Пройдено" },
  },
  ro: {
    title: "Profilul detectivului", description: "Puncte, realizări și progresul investigațiilor digitale.", back: "Pagina principală", signOut: "Ieșire", detective: "Detectiv stagiar",
    xp: "XP total", completed: "Finalizate", bestScore: "Cel mai bun rezultat", shield: "Integritatea scutului", progressText: "Finalizează cele opt investigații pentru a reface scutul digital al comunității.",
    modules: "Progresul modulelor", moduleHint: "Acum este disponibilă prima misiune. Celelalte se vor deschide mai târziu.", open: "Deschide modulul", locked: "În curând", score: "Rezultat", stages: "Etape", noScore: "—",
    role: "Rol", aiRestricted: "Asistentul AI Chrono este disponibil elevilor, profesorilor și administratorilor. Un administrator îți poate schimba rolul.",
    statuses: { not_started: "Neînceput", in_progress: "În desfășurare", completed: "Finalizat" },
  },
};

function isLocale(locale: string): locale is ProfileLocale { return locale === "ru" || locale === "ro"; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: ProfileLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${copy[lang].title} — InfoQuest`, description: copy[lang].description };
}

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ ai?: string | string[] }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;

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

  return (
    <main className="circuit-bg relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[34rem] -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-neon transition hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{t.back}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
              {(["ro", "ru"] as const).map((language) => (
                <Link key={language} href={`/${language}/profile`} aria-current={locale === language ? "page" : undefined} className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase transition ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{language}</Link>
              ))}
            </nav>
            {isAdministrator(userRole) && (
              <Link href={`/${locale}/admin`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{locale === "ro" ? "Administrare" : "Админ"}</span>
              </Link>
            )}
            <SignOutButton locale={locale} label={t.signOut} />
          </div>
        </header>

        {query.ai === "restricted" && (
          <div role="alert" className="mt-6 rounded-2xl border border-gold/45 bg-gold/10 px-5 py-4 text-sm text-foreground">
            <strong className="text-gold">{t.role}: {ROLE_LABELS[userRole][locale]}.</strong> {t.aiRestricted}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-3xl border border-neon/30 bg-card/75 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="grid gap-8 border-b border-border/70 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-5">
              <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-neon/50 bg-background text-xl font-black text-neon glow-neon sm:size-24">
                {safeAvatar ? <Image src={safeAvatar} alt="" fill sizes="96px" className="object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">{t.detective}</p>
                <h1 className="mt-2 truncate text-2xl font-black sm:text-4xl">{displayName}</h1>
                <p className="mt-2 truncate text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-2 inline-flex rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-bold text-neon">{t.role}: {ROLE_LABELS[userRole][locale]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
              <Medal className="size-8 text-gold" aria-hidden="true" />
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{t.xp}</p><p className="font-display text-2xl font-black text-gold">{totalXp} / {TOTAL_MAX_XP}</p></div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard icon={Sparkles} label={t.xp} value={String(totalXp)} color="text-gold" />
                <StatCard icon={Check} label={t.completed} value={`${completedCount} / ${MODULE_COUNT}`} color="text-success" />
                <StatCard icon={Award} label={t.bestScore} value={bestScore ? `${bestScore}%` : t.noScore} color="text-violet" />
              </div>
              <div className="mt-6 flex items-center gap-5 rounded-2xl border border-border bg-background/35 p-5">
                <div className="grid size-24 shrink-0 place-items-center rounded-full p-2" style={{ background: `conic-gradient(var(--neon) ${completionPercent}%, color-mix(in oklab, var(--secondary) 85%, transparent) 0)` }}>
                  <div className="grid size-full place-items-center rounded-full bg-card font-display text-xl font-black text-neon">{completionPercent}%</div>
                </div>
                <div><h2 className="text-lg font-bold">{t.shield}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.progressText}</p></div>
              </div>
            </div>
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-neon/25 bg-background/40 p-6 text-center">
              <div className="relative"><div className="absolute inset-0 rounded-full bg-neon/20 blur-2xl" aria-hidden="true" /><ShieldCheck className="relative size-24 text-neon" strokeWidth={1.25} aria-hidden="true" /></div>
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-neon">InfoQuest</p><p className="mt-2 text-sm text-muted-foreground">{completedCount}/{MODULE_COUNT}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">{t.modules}</h2><p className="mt-2 text-sm text-muted-foreground">{t.moduleHint}</p>
          <div className="mt-5 grid gap-4">
            {MODULE_CATALOG.map((module) => {
              const locked = module.status !== "playable";
              const item = byModule.get(module.moduleId) ?? { status: "not_started" as const, score: 0, xp: 0, attempts: 0 };
              const completedStages = Math.min(STAGE_COUNT, completedStagesByModule.get(module.moduleId) ?? 0);
              const moduleXp = Math.max(0, Math.min(MODULE_MAX_XP, item.xp));
              const modulePercent = Math.min(100, Math.round((moduleXp / MODULE_MAX_XP) * 100));
              const Icon = moduleIcons[module.icon];
              const statusStyles = item.status === "completed" ? "border-success/45 bg-success/10 text-success" : item.status === "in_progress" ? "border-gold/45 bg-gold/10 text-gold" : "border-border bg-secondary/55 text-muted-foreground";
              return (
                <article key={module.moduleId} className={`group grid gap-4 rounded-2xl border bg-card/70 p-4 transition sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5 ${locked ? "border-border/60 opacity-65" : "border-neon/30 hover:border-neon/60"}`}>
                  <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full border border-gold/50 font-display text-xs font-bold text-gold">{module.id}</span><span className="grid size-12 place-items-center rounded-2xl bg-background/60" style={{ boxShadow: `0 0 18px color-mix(in oklab, ${module.color} 28%, transparent)` }}><Icon className="size-6" style={{ color: module.color }} aria-hidden="true" /></span></div>
                  <div className="min-w-0">
                    <h3 className="font-bold">{module.title[locale]}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${statusStyles}`}>{item.status === "completed" ? <Check className="size-3" aria-hidden="true" /> : <Clock3 className="size-3" aria-hidden="true" />}{t.statuses[item.status]}</span><span className="text-muted-foreground">{moduleXp} / {MODULE_MAX_XP} XP</span><span className="text-muted-foreground">{t.stages}: {completedStages}/{STAGE_COUNT}</span><span className="text-muted-foreground">{t.score}: {item.attempts ? `${item.score}%` : t.noScore}</span></div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={moduleXp} aria-valuemin={0} aria-valuemax={MODULE_MAX_XP} aria-label={`${module.title[locale]}: ${modulePercent}%`}><div className="h-full rounded-full bg-neon transition-[width] duration-500" style={{ width: `${modulePercent}%` }} /></div>
                  </div>
                  {locked || !module.route ? <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 text-sm font-bold text-muted-foreground"><Lock className="size-4" aria-hidden="true" />{t.locked}</span> : <Link href={`/${locale}${module.route}`} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-4 text-sm font-bold text-neon transition hover:border-neon hover:bg-neon/20">{t.open}<ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></Link>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return <div className="rounded-2xl border border-border bg-background/35 p-4"><Icon className={`size-5 ${color}`} aria-hidden="true" /><p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-black">{value}</p></div>;
}
