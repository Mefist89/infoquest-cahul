import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Ban, BarChart3, CheckCircle2, Layers3, Save, ShieldCheck, ShieldOff, Users, WalletCards, type LucideIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { MODULE_CATALOG, MODULE_COUNT, MODULE_STAGES, STAGE_COUNT, TOTAL_STAGE_COUNT } from "@/data/module-catalog";
import { isAdministrator, isUserRole, ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { toggleUserIpBlock, updateUserRole } from "./actions";

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
  user_role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
  completed_modules: number;
  in_progress_modules: number;
  completed_stages: number;
  total_stages: number;
  total_xp: number;
  module_breakdown: ModuleBreakdown[];
};
type AiBudgetStatus = { daily_used: number; daily_limit: number; monthly_used: number; monthly_limit: number; warning_percent: number };
type AdminAccessStatus = { user_id: string; last_ip_seen_at: string | null; ip_blocked: boolean };

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
    list: "Список пользователей",
    listHint: "Данные авторизации и прогресс загружаются из Supabase.",
    registered: "Регистрация",
    lastLogin: "Последний вход",
    never: "Ещё не входил",
    modules: "Модули",
    stagesLabel: "Этапы",
    xp: "XP",
    role: "Роль",
    saveRole: "Сохранить",
    aiBudget: "Бюджет запросов Chrono",
    today: "Сегодня",
    month: "Текущий месяц",
    budgetOk: "Лимиты работают нормально.",
    budgetWarning: "Использовано больше установленного порога. Проверьте историю расходов BotHub.",
    noUsers: "Пользователей пока нет.",
    ipSeen: "Последний сетевой адрес",
    noIp: "Ещё не зафиксирован",
    blockIp: "Заблокировать последний IP",
    unblockIp: "Снять блокировку IP",
    blockedAccount: "Доступ к сайту закрыт",
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
    list: "Lista utilizatorilor",
    listHint: "Datele de autentificare și progresul sunt încărcate din Supabase.",
    registered: "Înregistrare",
    lastLogin: "Ultima autentificare",
    never: "Nu s-a autentificat încă",
    modules: "Module",
    stagesLabel: "Etape",
    xp: "XP",
    role: "Rol",
    saveRole: "Salvează",
    aiBudget: "Bugetul solicitărilor Chrono",
    today: "Astăzi",
    month: "Luna curentă",
    budgetOk: "Limitele funcționează normal.",
    budgetWarning: "A fost depășit pragul de avertizare. Verifică istoricul cheltuielilor BotHub.",
    noUsers: "Nu există încă utilizatori.",
    ipSeen: "Ultima adresă de rețea",
    noIp: "Nu a fost înregistrată încă",
    blockIp: "Blochează ultimul IP",
    unblockIp: "Deblochează IP-ul",
    blockedAccount: "Accesul la site este blocat",
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
  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (!isAdministrator(isUserRole(adminProfile?.role) ? adminProfile.role : null)) redirect(`/${locale}/profile`);

  const [{ data, error }, { data: budgetData }, { data: accessData }] = await Promise.all([
    supabase.rpc("get_admin_dashboard"),
    supabase.rpc("get_ai_budget_status"),
    supabase.rpc("get_admin_access_status"),
  ]);
  if (error) redirect(`/${locale}/profile`);

  const users = (data ?? []) as AdminUser[];
  const budget = (Array.isArray(budgetData) ? budgetData[0] : null) as AiBudgetStatus | null;
  const accessByUser = new Map(((accessData ?? []) as AdminAccessStatus[]).map((item) => [item.user_id, item]));
  const t = copy[locale];
  const activeUsers = users.filter((user) => user.completed_modules > 0 || user.in_progress_modules > 0 || user.completed_stages > 0).length;
  const completedModules = users.reduce((sum, user) => sum + Number(user.completed_modules), 0);
  const completedStages = users.reduce((sum, user) => sum + Number(user.completed_stages), 0);
  const availableStages = users.length * TOTAL_STAGE_COUNT;
  const roleCounts = Object.fromEntries(USER_ROLES.map((role) => [role, users.filter((user) => user.user_role === role).length])) as Record<UserRole, number>;
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
            <div className="flex flex-wrap gap-2 sm:max-w-md sm:justify-end">
              {USER_ROLES.map((role) => <span key={role} className="rounded-full border border-border bg-background/35 px-3 py-1.5 text-xs text-muted-foreground">{ROLE_LABELS[role][locale]}: <strong className="text-foreground">{roleCounts[role]}</strong></span>)}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label={t.users} value={String(users.length)} color="text-neon" />
            <StatCard icon={BarChart3} label={t.active} value={String(activeUsers)} color="text-gold" />
            <StatCard icon={CheckCircle2} label={t.modulesDone} value={`${completedModules} / ${users.length * MODULE_COUNT}`} color="text-success" />
            <StatCard icon={Layers3} label={t.stagesDone} value={`${completedStages} / ${availableStages}`} color="text-violet" />
          </div>

          {budget && (() => {
            const dailyPercent = Math.min(100, Math.round((budget.daily_used / budget.daily_limit) * 100));
            const monthlyPercent = Math.min(100, Math.round((budget.monthly_used / budget.monthly_limit) * 100));
            const warning = dailyPercent >= budget.warning_percent || monthlyPercent >= budget.warning_percent;
            return (
              <div className={`mt-5 rounded-2xl border p-5 ${warning ? "border-gold/50 bg-gold/10" : "border-neon/25 bg-background/35"}`}>
                <div className="flex items-center gap-3"><WalletCards className={warning ? "size-5 text-gold" : "size-5 text-neon"} aria-hidden="true" /><h2 className="font-bold">{t.aiBudget}</h2></div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <BudgetBar label={t.today} used={budget.daily_used} limit={budget.daily_limit} percent={dailyPercent} warning={warning && dailyPercent >= budget.warning_percent} />
                  <BudgetBar label={t.month} used={budget.monthly_used} limit={budget.monthly_limit} percent={monthlyPercent} warning={warning && monthlyPercent >= budget.warning_percent} />
                </div>
                <p role="status" className={`mt-4 flex items-center gap-2 text-xs ${warning ? "text-gold" : "text-muted-foreground"}`}>{warning && <AlertTriangle className="size-4" aria-hidden="true" />}{warning ? t.budgetWarning : t.budgetOk}</p>
              </div>
            );
          })()}
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
          <h2 className="text-xl font-black sm:text-2xl">{t.structure}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.structureHint}</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MODULE_STAGES.map((stage) => (
              <li key={stage.kind} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-4">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full border font-display text-xs font-black ${stage.index === STAGE_COUNT ? "border-gold/60 text-gold" : "border-neon/40 text-neon"}`}>{stage.index}</span>
                <span className="text-sm font-semibold">{stage.title[locale]}</span>
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
              const stagePercent = Math.round((Number(user.completed_stages) / TOTAL_STAGE_COUNT) * 100);
              const access = accessByUser.get(user.user_id);
              const accountBlocked = user.user_role === "blocked";

              return (
                <article key={user.user_id} className={`overflow-hidden rounded-3xl border bg-card/75 p-5 transition sm:p-6 ${accountBlocked || access?.ip_blocked ? "border-danger/55 shadow-[0_0_35px_rgba(239,68,68,0.08)]" : "border-border hover:border-neon/35"}`}>
                  <div className="grid gap-6 xl:grid-cols-[minmax(14rem,0.8fr)_minmax(24rem,1.5fr)_auto] xl:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neon/40 bg-background font-black text-neon">
                        {avatarIsSafe ? <Image src={user.avatar_url!} alt="" fill sizes="56px" className="object-cover" /> : displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold">{displayName}</h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{t.registered}: {dateFormatter.format(new Date(user.created_at))}</p>
                        {accountBlocked && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger"><Ban className="size-3.5" aria-hidden="true" />{t.blockedAccount}</p>}
                        <form action={updateUserRole} className="mt-3 flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.user_id} />
                          <input type="hidden" name="locale" value={locale} />
                          <label htmlFor={`role-${user.user_id}`} className="sr-only">{t.role}</label>
                          <select id={`role-${user.user_id}`} name="role" defaultValue={user.user_role} className="focus-ring min-h-10 min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 text-xs font-semibold text-foreground">
                            {USER_ROLES.map((role) => <option key={role} value={role} disabled={user.user_id === authData.user.id && role !== "administrator"}>{ROLE_LABELS[role][locale]}</option>)}
                          </select>
                          <button type="submit" className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-neon/35 bg-neon/10 text-neon transition hover:border-neon hover:bg-neon/20" aria-label={`${t.saveRole}: ${displayName}`} title={t.saveRole}><Save className="size-4" aria-hidden="true" /></button>
                        </form>
                        <div className="mt-3 border-t border-border/70 pt-3">
                          <p className="text-[11px] text-muted-foreground">{t.ipSeen}: {access?.last_ip_seen_at ? dateFormatter.format(new Date(access.last_ip_seen_at)) : t.noIp}</p>
                          <form action={toggleUserIpBlock} className="mt-2">
                            <input type="hidden" name="userId" value={user.user_id} />
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="blocked" value={access?.ip_blocked ? "false" : "true"} />
                            <button type="submit" disabled={user.user_id === authData.user.id || (!access?.last_ip_seen_at && !access?.ip_blocked)} className={`focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${access?.ip_blocked ? "border-success/45 bg-success/10 text-success hover:border-success" : "border-danger/40 bg-danger/10 text-danger hover:border-danger"}`}>
                              {access?.ip_blocked ? <ShieldCheck className="size-4" aria-hidden="true" /> : <ShieldOff className="size-4" aria-hidden="true" />}
                              {access?.ip_blocked ? t.unblockIp : t.blockIp}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {MODULE_CATALOG.map((module) => {
                        const progress = moduleMap.get(module.moduleId);
                        const done = Number(progress?.completed_stages ?? 0);
                        return (
                          <div key={module.moduleId} className="rounded-xl border border-border bg-background/35 p-3" title={module.title[locale]}>
                            <div className="flex items-center justify-between gap-2 text-xs"><span className="truncate font-semibold">{module.shortTitle[locale]}</span><span className={done === STAGE_COUNT ? "text-success" : "text-muted-foreground"}>{done}/{STAGE_COUNT}</span></div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon" style={{ width: `${(done / STAGE_COUNT) * 100}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2 xl:min-w-72">
                      <MiniStat label={t.modules} value={`${user.completed_modules}/${MODULE_COUNT}`} />
                      <MiniStat label={t.stagesLabel} value={`${user.completed_stages}/${TOTAL_STAGE_COUNT}`} />
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

function BudgetBar({ label, used, limit, percent, warning }: { label: string; used: number; limit: number; percent: number; warning: boolean }) {
  return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><strong className={warning ? "text-gold" : "text-foreground"}>{used}/{limit} · {percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}><div className={`h-full rounded-full transition-[width] duration-500 ${warning ? "bg-gold" : "bg-neon"}`} style={{ width: `${percent}%` }} /></div></div>;
}
