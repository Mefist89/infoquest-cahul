import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, Check, ChevronRight, Clock3, Gift, Link2Off, Medal, PhoneCall, ScanFace, ShieldCheck, Sparkles, UserLock, type LucideIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type ProfileLocale = "ru" | "ro";
type ProgressStatus = "not_started" | "in_progress" | "completed";
type ProgressRow = { module_id: string; status: ProgressStatus; score: number; xp: number; attempts: number };

const modules = [
  { id: "operator-call", icon: PhoneCall, color: "var(--neon)", title: { ru: "Фальшивый звонок оператора", ro: "Apelul fals de la operator" } },
  { id: "fake-link", icon: Link2Off, color: "var(--gold)", title: { ru: "Ловушка фальшивой ссылки", ro: "Capcana linkului fals" } },
  { id: "hacked-account", icon: UserLock, color: "var(--danger)", title: { ru: "Взломанный аккаунт", ro: "Contul compromis" } },
  { id: "scam-or-real", icon: Gift, color: "var(--gold)", title: { ru: "Скам или реальное предложение?", ro: "Scam sau ofertă reală?" } },
  { id: "deepfake-detective", icon: ScanFace, color: "var(--violet)", title: { ru: "Детектив дипфейков", ro: "Detectivul deepfake" } },
] satisfies Array<{ id: string; icon: LucideIcon; color: string; title: Record<ProfileLocale, string> }>;

const copy = {
  ru: {
    title: "Профиль детектива", description: "Очки, достижения и прогресс по цифровым расследованиям.", back: "На главную", signOut: "Выйти", detective: "Детектив-стажёр",
    xp: "Всего XP", completed: "Пройдено", bestScore: "Лучший результат", shield: "Целостность щита", progressText: "Завершите пять расследований, чтобы восстановить цифровой щит сообщества.",
    modules: "Прохождение модулей", moduleHint: "Каждая миссия приносит до 100 XP.", open: "К карте миссий", score: "Результат", noScore: "—",
    statuses: { not_started: "Не начато", in_progress: "В процессе", completed: "Пройдено" },
  },
  ro: {
    title: "Profilul detectivului", description: "Puncte, realizări și progresul investigațiilor digitale.", back: "Pagina principală", signOut: "Ieșire", detective: "Detectiv stagiar",
    xp: "XP total", completed: "Finalizate", bestScore: "Cel mai bun rezultat", shield: "Integritatea scutului", progressText: "Finalizează cele cinci investigații pentru a reface scutul digital al comunității.",
    modules: "Progresul modulelor", moduleHint: "Fiecare misiune oferă până la 100 XP.", open: "Harta misiunilor", score: "Rezultat", noScore: "—",
    statuses: { not_started: "Neînceput", in_progress: "În desfășurare", completed: "Finalizat" },
  },
};

function isLocale(locale: string): locale is ProfileLocale { return locale === "ru" || locale === "ro"; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: ProfileLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${copy[lang].title} — InfoQuest`, description: copy[lang].description };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login`);

  const user = authData.user;
  const [{ data: profile }, { data: progressData }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("module_progress").select("module_id, status, score, xp, attempts").eq("user_id", user.id),
  ]);

  const progress = (progressData ?? []) as ProgressRow[];
  const byModule = new Map(progress.map((item) => [item.module_id, item]));
  const completedCount = progress.filter((item) => item.status === "completed").length;
  const totalXp = progress.reduce((sum, item) => sum + item.xp, 0);
  const bestScore = progress.reduce((best, item) => Math.max(best, item.score), 0);
  const completionPercent = Math.round((completedCount / modules.length) * 100);
  const metadata = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
  const displayName = profile?.display_name || metadata.full_name || metadata.name || user.email?.split("@")[0] || "Detective";
  const avatarUrl = profile?.avatar_url || metadata.avatar_url;
  const safeAvatar = typeof avatarUrl === "string" && avatarUrl.startsWith("https://lh3.googleusercontent.com/") ? avatarUrl : null;
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
            {isAdminEmail(user.email) && (
              <Link href={`/${locale}/admin`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{locale === "ro" ? "Administrare" : "Админ"}</span>
              </Link>
            )}
            <SignOutButton locale={locale} label={t.signOut} />
          </div>
        </header>

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
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
              <Medal className="size-8 text-gold" aria-hidden="true" />
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{t.xp}</p><p className="font-display text-2xl font-black text-gold">{totalXp} / 500</p></div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard icon={Sparkles} label={t.xp} value={String(totalXp)} color="text-gold" />
                <StatCard icon={Check} label={t.completed} value={`${completedCount} / ${modules.length}`} color="text-success" />
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
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-neon">InfoQuest</p><p className="mt-2 text-sm text-muted-foreground">{completedCount}/{modules.length}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">{t.modules}</h2><p className="mt-2 text-sm text-muted-foreground">{t.moduleHint}</p>
          <div className="mt-5 grid gap-4">
            {modules.map((module, index) => {
              const item = byModule.get(module.id) ?? { status: "not_started" as const, score: 0, xp: 0, attempts: 0 };
              const Icon = module.icon;
              const statusStyles = item.status === "completed" ? "border-success/45 bg-success/10 text-success" : item.status === "in_progress" ? "border-gold/45 bg-gold/10 text-gold" : "border-border bg-secondary/55 text-muted-foreground";
              return (
                <article key={module.id} className="group grid gap-4 rounded-2xl border border-border bg-card/70 p-4 transition hover:border-neon/40 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
                  <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full border border-gold/50 font-display text-xs font-bold text-gold">{index + 1}</span><span className="grid size-12 place-items-center rounded-2xl bg-background/60" style={{ boxShadow: `0 0 18px color-mix(in oklab, ${module.color} 28%, transparent)` }}><Icon className="size-6" style={{ color: module.color }} aria-hidden="true" /></span></div>
                  <div className="min-w-0"><h3 className="font-bold">{module.title[locale]}</h3><div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${statusStyles}`}>{item.status === "completed" ? <Check className="size-3" aria-hidden="true" /> : <Clock3 className="size-3" aria-hidden="true" />}{t.statuses[item.status]}</span><span className="text-muted-foreground">{item.xp} XP</span><span className="text-muted-foreground">{t.score}: {item.attempts ? `${item.score}%` : t.noScore}</span></div></div>
                  <Link href={`/${locale}#missions`} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-4 text-sm font-bold text-neon transition hover:border-neon hover:bg-neon/20">{t.open}<ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></Link>
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
