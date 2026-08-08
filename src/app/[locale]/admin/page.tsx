import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, Layers3, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type AdminLocale = "ru" | "ro";
type ModuleStatus = "not_started" | "in_progress" | "completed";
type ModuleBreakdown = {
  module_id: string;
  status: ModuleStatus;
  score: number;
  xp: number;
  completed_stages: number;
};
type AdminUser = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  completed_modules: number;
  in_progress_modules: number;
  completed_stages: number;
  total_stages: number;
  total_xp: number;
  module_breakdown: ModuleBreakdown[];
};

const modules = [
  { id: "operator-call", ru: "Ложный звонок", ro: "Apel fals" },
  { id: "fake-link", ru: "Фальшивая ссылка", ro: "Link fals" },
  { id: "hacked-account", ru: "Взломанный аккаунт", ro: "Cont compromis" },
  { id: "scam-or-real", ru: "Скам или реальность", ro: "Scam sau real" },
  { id: "deepfake-detective", ru: "Детектив дипфейков", ro: "Detectiv deepfake" },
  { id: "bilingual-detective", ru: "Двуязычный детектив", ro: "Detectivul bilingv" },
  { id: "rumors", ru: "Город под осадой слухов", ro: "Orașul sub asediul zvonurilor" },
  { id: "trolls", ru: "Защити сообщество от троллей", ro: "Apără comunitatea de troli" },
] as const;

const copy = {
  ru: {
    title: "Панель администратора",
    description: "Пользователи и прогресс прохождения InfoQuest.",
    back: "В профиль",
    signOut: "Выйти",
    admin: "Администратор",
    users: "Пользователи",
    active: "Начали обучение",
    modulesDone: "Модулей завершено",
    stagesDone: "Этапов завершено",
    structure: "Структура каждого модуля",
    structureHint: "В каждом из восьми модулей предусмотрено восемь обязательных этапов.",
    stages: ["Теория", "Видеообъяснение", "Видеопример", "Игра: выбор", "Игра: анализ", "Игра: проверка", "Игра: решение", "Финальная схватка"],
    list: "Список пользователей",
    listHint: "Данные авторизации и прогресс загружаются из Supabase.",
    registered: "Регистрация",
    lastLogin: "Последний вход",
    never: "Ещё не входил",
    modules: "Модули",
    stagesLabel: "Этапы",
    xp: "XP",
    noUsers: "Пользователей пока нет.",
  },
  ro: {
    title: "Panoul administratorului",
    description: "Utilizatori și progresul parcursului InfoQuest.",
    back: "Înapoi la profil",
    signOut: "Ieșire",
    admin: "Administrator",
    users: "Utilizatori",
    active: "Au început instruirea",
    modulesDone: "Module finalizate",
    stagesDone: "Etape finalizate",
    structure: "Structura fiecărui modul",
    structureHint: "Fiecare dintre cele opt module conține opt etape obligatorii.",
    stages: ["Teorie", "Explicație video", "Exemplu video", "Joc: alegere", "Joc: analiză", "Joc: verificare", "Joc: decizie", "Confruntarea finală"],
    list: "Lista utilizatorilor",
    listHint: "Datele de autentificare și progresul sunt încărcate din Supabase.",
    registered: "Înregistrare",
    lastLogin: "Ultima autentificare",
    never: "Nu s-a autentificat încă",
    modules: "Module",
    stagesLabel: "Etape",
    xp: "XP",
    noUsers: "Nu există încă utilizatori.",
  },
} as const;

function isLocale(locale: string): locale is AdminLocale {
  return locale === "ru" || locale === "ro";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AdminLocale = locale === "ro" ? "ro" : "ru";
  return { title: `${copy[lang].title} — InfoQuest`, description: copy[lang].description };
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/${locale}/login`);
  if (!isAdminEmail(authData.user.email)) redirect(`/${locale}/profile`);

  const { data, error } = await supabase.rpc("get_admin_dashboard");
  if (error) redirect(`/${locale}/profile`);

  const users = (data ?? []) as AdminUser[];
  const t = copy[locale];
  const activeUsers = users.filter((user) => user.completed_modules > 0 || user.in_progress_modules > 0 || user.completed_stages > 0).length;
  const completedModules = users.reduce((sum, user) => sum + Number(user.completed_modules), 0);
  const completedStages = users.reduce((sum, user) => sum + Number(user.completed_stages), 0);
  const availableStages = users.reduce((sum, user) => sum + Number(user.total_stages), 0);
  const dateFormatter = new Intl.DateTimeFormat(locale === "ro" ? "ro-MD" : "ru-MD", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}/profile`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.back}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
              {(["ro", "ru"] as const).map((language) => (
                <Link key={language} href={`/${language}/admin`} aria-current={locale === language ? "page" : undefined} className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase transition ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{language}</Link>
              ))}
            </nav>
            <SignOutButton locale={locale} label={t.signOut} />
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-neon/30 bg-card/75 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-neon"><ShieldCheck className="size-4" aria-hidden="true" />{t.admin}</p>
              <h1 className="mt-4 text-3xl font-black sm:text-5xl">{t.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              {ADMIN_EMAILS.map((email) => <p key={email} className="rounded-xl border border-border bg-background/35 px-4 py-2 text-sm text-muted-foreground">{email}</p>)}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label={t.users} value={String(users.length)} color="text-neon" />
            <StatCard icon={BarChart3} label={t.active} value={String(activeUsers)} color="text-gold" />
            <StatCard icon={CheckCircle2} label={t.modulesDone} value={`${completedModules} / ${users.length * 8}`} color="text-success" />
            <StatCard icon={Layers3} label={t.stagesDone} value={`${completedStages} / ${availableStages}`} color="text-violet" />
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
          <h2 className="text-xl font-black sm:text-2xl">{t.structure}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.structureHint}</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.stages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-4">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full border font-display text-xs font-black ${index === 7 ? "border-gold/60 text-gold" : "border-neon/40 text-neon"}`}>{index + 1}</span>
                <span className="text-sm font-semibold">{stage}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">{t.list}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.listHint}</p>
          <div className="mt-5 grid gap-4">
            {users.length === 0 && <p className="rounded-2xl border border-border bg-card/70 p-6 text-muted-foreground">{t.noUsers}</p>}
            {users.map((user) => {
              const displayName = user.display_name || user.email?.split("@")[0] || "User";
              const avatarIsSafe = typeof user.avatar_url === "string" && user.avatar_url.startsWith("https://lh3.googleusercontent.com/");
              const moduleMap = new Map((user.module_breakdown ?? []).map((module) => [module.module_id, module]));
              const stagePercent = Math.round((Number(user.completed_stages) / Math.max(Number(user.total_stages), 1)) * 100);

              return (
                <article key={user.user_id} className="overflow-hidden rounded-3xl border border-border bg-card/75 p-5 transition hover:border-neon/35 sm:p-6">
                  <div className="grid gap-6 xl:grid-cols-[minmax(14rem,0.8fr)_minmax(24rem,1.5fr)_auto] xl:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neon/40 bg-background font-black text-neon">
                        {avatarIsSafe ? <Image src={user.avatar_url!} alt="" fill sizes="56px" className="object-cover" /> : displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold">{displayName}</h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{t.registered}: {dateFormatter.format(new Date(user.created_at))}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {modules.map((module) => {
                        const progress = moduleMap.get(module.id);
                        const done = Number(progress?.completed_stages ?? 0);
                        return (
                          <div key={module.id} className="rounded-xl border border-border bg-background/35 p-3" title={module[locale]}>
                            <div className="flex items-center justify-between gap-2 text-xs"><span className="truncate font-semibold">{module[locale]}</span><span className={done === 8 ? "text-success" : "text-muted-foreground"}>{done}/8</span></div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon" style={{ width: `${(done / 8) * 100}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2 xl:min-w-72">
                      <MiniStat label={t.modules} value={`${user.completed_modules}/8`} />
                      <MiniStat label={t.stagesLabel} value={`${user.completed_stages}/64`} />
                      <MiniStat label={t.xp} value={String(user.total_xp)} />
                      <div className="col-span-3 mt-1">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>{t.lastLogin}</span><span>{stagePercent}%</span></div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon" style={{ width: `${stagePercent}%` }} /></div>
                        <p className="mt-2 text-right text-xs text-muted-foreground">{user.last_sign_in_at ? dateFormatter.format(new Date(user.last_sign_in_at)) : t.never}</p>
                      </div>
                    </div>
                  </div>
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
  return <div className="rounded-2xl border border-border bg-background/35 p-5"><Icon className={`size-5 ${color}`} aria-hidden="true" /><p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-black">{value}</p></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background/35 p-3 text-center"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-display font-black text-neon">{value}</p></div>;
}
