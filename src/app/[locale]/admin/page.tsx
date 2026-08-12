import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleGauge,
  Compass,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Save,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { MODULE_CATALOG, MODULE_COUNT, MODULE_STAGES, STAGE_COUNT, TOTAL_MAX_XP, TOTAL_STAGE_COUNT } from "@/data/module-catalog";
import { isAdministrator, isUserRole, ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { QuestRow } from "@/lib/types";
import { toggleUserIpBlock, updateUserRole } from "./actions";

type AdminLocale = "ru" | "ro";
export type AdminSection = "overview" | "learning" | "quests" | "users" | "security";
type ModuleStatus = "not_started" | "in_progress" | "completed";
type ModuleBreakdown = { module_id: string; status: ModuleStatus; score: number; xp: number; completed_stages: number };
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
    title: "Обзор системы",
    greeting: "Добро пожаловать в InfoQuest Dashboard",
    description: "Пользователи, учебный прогресс, роли, безопасность и расходы Chrono в одном месте.",
    back: "В профиль",
    home: "На главную",
    signOut: "Выйти",
    admin: "Администратор",
    navigation: "Навигация",
    overview: "Обзор",
    learning: "Обучение",
    quests: "Квесты",
    usersSection: "Пользователи",
    security: "Безопасность",
    users: "Всего пользователей",
    active: "Начали обучение",
    modulesDone: "Модулей завершено",
    stagesDone: "Этапов завершено",
    activity: "Новые пользователи",
    activityHint: "Регистрации за последние шесть месяцев",
    moduleOverview: "Прохождение модулей",
    moduleOverviewHint: "Суммарное число завершённых этапов по каждому модулю",
    roles: "Распределение ролей",
    rolesHint: "Текущий состав аудитории",
    structure: "Учебная структура",
    structureHint: "В каждом из восьми модулей предусмотрено восемь обязательных этапов.",
    questsTitle: "Отдельные игровые квесты",
    questsHint: "Будущие самостоятельные игры, не связанные с обязательными этапами восьми учебных модулей.",
    questsEmpty: "Квестов пока нет. Таблица готова — первый черновик можно добавить после утверждения темы игры.",
    questType: "Тип игры",
    questStatus: "Статус",
    questRoute: "Маршрут",
    list: "Управление пользователями",
    listHint: "Роли, прогресс и блокировки загружаются напрямую из Supabase.",
    registered: "Регистрация",
    lastLogin: "Последний вход",
    never: "Ещё не входил",
    modules: "Модули",
    stagesLabel: "Этапы",
    xp: "XP",
    role: "Роль",
    saveRole: "Сохранить роль",
    aiBudget: "Использование Chrono AI",
    today: "Сегодня",
    month: "Текущий месяц",
    budgetOk: "Лимиты работают нормально.",
    budgetWarning: "Использовано больше установленного порога. Проверьте расходы AI-провайдера.",
    noUsers: "Пользователей пока нет.",
    ipSeen: "Последняя сетевая активность",
    noIp: "Ещё не зафиксирована",
    blockIp: "Заблокировать последний IP",
    unblockIp: "Снять блокировку IP",
    blockedAccount: "Доступ к сайту закрыт",
    completion: "Общий прогресс",
    available: "Доступен",
    soon: "Скоро",
  },
  ro: {
    title: "Prezentarea sistemului",
    greeting: "Bine ai venit în InfoQuest Dashboard",
    description: "Utilizatori, progres educațional, roluri, securitate și consumul Chrono într-un singur loc.",
    back: "Înapoi la profil",
    home: "Pagina principală",
    signOut: "Ieșire",
    admin: "Administrator",
    navigation: "Navigare",
    overview: "Prezentare",
    learning: "Învățare",
    quests: "Quest-uri",
    usersSection: "Utilizatori",
    security: "Securitate",
    users: "Total utilizatori",
    active: "Au început instruirea",
    modulesDone: "Module finalizate",
    stagesDone: "Etape finalizate",
    activity: "Utilizatori noi",
    activityHint: "Înregistrări în ultimele șase luni",
    moduleOverview: "Parcurgerea modulelor",
    moduleOverviewHint: "Numărul total de etape finalizate pentru fiecare modul",
    roles: "Distribuția rolurilor",
    rolesHint: "Structura actuală a audienței",
    structure: "Structura educațională",
    structureHint: "Fiecare dintre cele opt module conține opt etape obligatorii.",
    questsTitle: "Quest-uri de joc separate",
    questsHint: "Jocuri independente viitoare, separate de etapele obligatorii ale celor opt module educaționale.",
    questsEmpty: "Nu există încă quest-uri. Tabelul este pregătit, iar primul draft poate fi adăugat după aprobarea temei jocului.",
    questType: "Tipul jocului",
    questStatus: "Statut",
    questRoute: "Rută",
    list: "Gestionarea utilizatorilor",
    listHint: "Rolurile, progresul și blocările sunt încărcate direct din Supabase.",
    registered: "Înregistrare",
    lastLogin: "Ultima autentificare",
    never: "Nu s-a autentificat încă",
    modules: "Module",
    stagesLabel: "Etape",
    xp: "XP",
    role: "Rol",
    saveRole: "Salvează rolul",
    aiBudget: "Utilizarea Chrono AI",
    today: "Astăzi",
    month: "Luna curentă",
    budgetOk: "Limitele funcționează normal.",
    budgetWarning: "A fost depășit pragul de avertizare. Verifică cheltuielile furnizorului AI.",
    noUsers: "Nu există încă utilizatori.",
    ipSeen: "Ultima activitate de rețea",
    noIp: "Nu a fost înregistrată încă",
    blockIp: "Blochează ultimul IP",
    unblockIp: "Deblochează IP-ul",
    blockedAccount: "Accesul la site este blocat",
    completion: "Progres general",
    available: "Disponibil",
    soon: "În curând",
  },
} as const;

const roleColors: Record<UserRole, string> = {
  user: "bg-slate-400",
  student: "bg-neon",
  teacher: "bg-success",
  administrator: "bg-violet",
  blocked: "bg-danger",
};

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

type Copy = (typeof copy)[AdminLocale];

function DashboardNavLink({ href, icon: Icon, label, active = false }: { href: string; icon: LucideIcon; label: string; active?: boolean }) {
  return <a href={href} className={`focus-ring flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "border border-neon/30 bg-neon/12 text-neon" : "border border-transparent text-muted-foreground hover:bg-card hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}</a>;
}

function StatCard({ icon: Icon, label, value, color, detail }: { icon: LucideIcon; label: string; value: string; color: string; detail: string }) {
  return <article className="group rounded-2xl border border-border/70 bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-neon/30 hover:bg-card/75"><div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-xl bg-background/55 ${color}`}><Icon className="size-5" aria-hidden="true" /></span><span className="rounded-full border border-border bg-background/35 px-2.5 py-1 text-[10px] text-muted-foreground">{detail}</span></div><p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-black">{value}</p></article>;
}

function DashboardPanel({ title, hint, icon: Icon, children }: { title: string; hint: string; icon: LucideIcon; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div></div><div className="mt-6">{children}</div></article>;
}

function SectionHeading({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-neon/25 bg-neon/10 text-neon"><Icon className="size-5" aria-hidden="true" /></span><div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>;
}

function buildMonthlyActivity(users: AdminUser[], locale: AdminLocale) {
  const formatter = new Intl.DateTimeFormat(locale === "ro" ? "ro-MD" : "ru-MD", { month: "short" });
  const now = new Date();
  return Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - offset), 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const value = users.filter((user) => { const created = new Date(user.created_at); return created.getUTCFullYear() === year && created.getUTCMonth() === month; }).length;
    return { label: formatter.format(date).replace(".", ""), value };
  });
}

function ActivityChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <div className="flex h-52 items-end gap-2 sm:gap-4" role="img" aria-label={items.map((item) => `${item.label}: ${item.value}`).join(", ")}>{items.map((item) => <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-foreground">{item.value}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-neon/45 to-neon shadow-[0_0_18px_rgba(0,217,255,0.12)]" style={{ height: `${Math.max(8, (item.value / max) * 145)}px` }} /><span className="max-w-full truncate text-[10px] uppercase text-muted-foreground sm:text-xs">{item.label}</span></div>)}</div>;
}

function RoleChart({ counts, total, locale }: { counts: Record<UserRole, number>; total: number; locale: AdminLocale }) {
  return <div className="grid gap-3">{USER_ROLES.map((role) => { const percent = total > 0 ? Math.round((counts[role] / total) * 100) : 0; return <div key={role}><div className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${roleColors[role]}`} />{ROLE_LABELS[role][locale]}</span><strong>{counts[role]} · {percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${roleColors[role]}`} style={{ width: `${percent}%` }} /></div></div>; })}</div>;
}

function ModuleBar({ label, completed, maximum, percent, available, statusLabel }: { label: string; completed: number; maximum: number; percent: number; available: boolean; statusLabel: string }) {
  return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${available ? "bg-neon" : "bg-muted-foreground/50"}`} /><span className="truncate font-semibold">{label}</span><span className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${available ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{statusLabel}</span></span><strong>{completed}/{maximum}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${available ? "bg-neon" : "bg-muted-foreground/40"}`} style={{ width: `${percent}%` }} /></div></div>;
}

function AiBudgetPanel({ budget, locale }: { budget: AiBudgetStatus; locale: AdminLocale }) {
  const t = copy[locale];
  const dailyPercent = Math.min(100, Math.round((budget.daily_used / budget.daily_limit) * 100));
  const monthlyPercent = Math.min(100, Math.round((budget.monthly_used / budget.monthly_limit) * 100));
  const warning = dailyPercent >= budget.warning_percent || monthlyPercent >= budget.warning_percent;
  return <section className={`mt-5 rounded-2xl border p-5 sm:p-6 ${warning ? "border-gold/50 bg-gold/8" : "border-border/70 bg-card/55"}`}><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${warning ? "bg-gold/10 text-gold" : "bg-success/10 text-success"}`}><Bot className="size-5" aria-hidden="true" /></span><div><h2 className="font-black">{t.aiBudget}</h2><p role="status" className={`mt-1 flex items-center gap-1.5 text-xs ${warning ? "text-gold" : "text-muted-foreground"}`}>{warning && <AlertTriangle className="size-3.5" aria-hidden="true" />}{warning ? t.budgetWarning : t.budgetOk}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><BudgetBar label={t.today} used={budget.daily_used} limit={budget.daily_limit} percent={dailyPercent} warning={warning && dailyPercent >= budget.warning_percent} /><BudgetBar label={t.month} used={budget.monthly_used} limit={budget.monthly_limit} percent={monthlyPercent} warning={warning && monthlyPercent >= budget.warning_percent} /></div></section>;
}

function UserCard({ user, locale, t, access, currentAdminId, dateFormatter }: { user: AdminUser; locale: AdminLocale; t: Copy; access?: AdminAccessStatus; currentAdminId: string; dateFormatter: Intl.DateTimeFormat }) {
  const displayName = user.display_name || user.email?.split("@")[0] || "User";
  const avatarIsSafe = typeof user.avatar_url === "string" && user.avatar_url.startsWith("https://lh3.googleusercontent.com/");
  const moduleMap = new Map((user.module_breakdown ?? []).map((module) => [module.module_id, module]));
  const stagePercent = Math.round((Number(user.completed_stages) / TOTAL_STAGE_COUNT) * 100);
  const accountBlocked = user.user_role === "blocked";

  return <article className={`overflow-hidden rounded-2xl border bg-card/55 p-5 transition ${accountBlocked || access?.ip_blocked ? "border-danger/55 shadow-[0_0_30px_rgba(239,68,68,0.07)]" : "border-border/70 hover:border-neon/30"}`}><div className="grid gap-6 2xl:grid-cols-[minmax(15rem,0.8fr)_minmax(28rem,1.6fr)_minmax(18rem,0.7fr)] 2xl:items-center"><div className="flex min-w-0 items-start gap-4"><div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neon/40 bg-background font-black text-neon">{avatarIsSafe ? <Image src={user.avatar_url!} alt="" fill sizes="56px" className="object-cover" /> : displayName.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{displayName}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full border border-border bg-background/45 px-2.5 py-1 text-[10px] text-muted-foreground">{ROLE_LABELS[user.user_role][locale]}</span>{accountBlocked && <span className="inline-flex items-center gap-1 rounded-full border border-danger/40 bg-danger/10 px-2.5 py-1 text-[10px] font-bold text-danger"><Ban className="size-3" aria-hidden="true" />{t.blockedAccount}</span>}</div><p className="mt-3 text-[10px] text-muted-foreground">{t.registered}: {dateFormatter.format(new Date(user.created_at))}</p></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{MODULE_CATALOG.map((module) => { const progress = moduleMap.get(module.moduleId); const done = Number(progress?.completed_stages ?? 0); return <div key={module.moduleId} className="rounded-xl border border-border/70 bg-background/35 p-3" title={module.title[locale]}><div className="flex items-center justify-between gap-2 text-xs"><span className="truncate font-semibold">{module.shortTitle[locale]}</span><span className={done === STAGE_COUNT ? "text-success" : "text-muted-foreground"}>{done}/{STAGE_COUNT}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon" style={{ width: `${(done / STAGE_COUNT) * 100}%` }} /></div></div>; })}</div><div className="grid gap-3 sm:grid-cols-[1fr_auto] 2xl:block"><div className="grid grid-cols-3 gap-2"><MiniStat label={t.modules} value={`${user.completed_modules}/${MODULE_COUNT}`} /><MiniStat label={t.stagesLabel} value={`${user.completed_stages}/${TOTAL_STAGE_COUNT}`} /><MiniStat label={t.xp} value={String(user.total_xp)} /></div><div className="mt-3"><div className="flex justify-between text-[10px] text-muted-foreground"><span>{t.lastLogin}</span><span>{stagePercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon" style={{ width: `${stagePercent}%` }} /></div><p className="mt-2 text-right text-[10px] text-muted-foreground">{user.last_sign_in_at ? dateFormatter.format(new Date(user.last_sign_in_at)) : t.never}</p></div></div></div><div className="mt-5 grid gap-3 border-t border-border/60 pt-4 md:grid-cols-2"><form action={updateUserRole} className="flex items-center gap-2"><input type="hidden" name="userId" value={user.user_id} /><input type="hidden" name="locale" value={locale} /><label htmlFor={`role-${user.user_id}`} className="sr-only">{t.role}</label><select id={`role-${user.user_id}`} name="role" defaultValue={user.user_role} className="focus-ring min-h-10 min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 text-xs font-semibold text-foreground">{USER_ROLES.map((role) => <option key={role} value={role} disabled={user.user_id === currentAdminId && role !== "administrator"}>{ROLE_LABELS[role][locale]}</option>)}</select><button type="submit" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-3 text-xs font-bold text-neon" aria-label={`${t.saveRole}: ${displayName}`}><Save className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{t.saveRole}</span></button></form><div><p className="mb-2 text-[10px] text-muted-foreground">{t.ipSeen}: {access?.last_ip_seen_at ? dateFormatter.format(new Date(access.last_ip_seen_at)) : t.noIp}</p><form action={toggleUserIpBlock}><input type="hidden" name="userId" value={user.user_id} /><input type="hidden" name="locale" value={locale} /><input type="hidden" name="blocked" value={access?.ip_blocked ? "false" : "true"} /><button type="submit" disabled={user.user_id === currentAdminId || (!access?.last_ip_seen_at && !access?.ip_blocked)} className={`focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${access?.ip_blocked ? "border-success/45 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}>{access?.ip_blocked ? <ShieldCheck className="size-4" aria-hidden="true" /> : <ShieldOff className="size-4" aria-hidden="true" />}{access?.ip_blocked ? t.unblockIp : t.blockIp}</button></form></div></div></article>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/70 bg-background/35 p-3 text-center"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-display font-black text-neon">{value}</p></div>;
}

function QuestCard({ quest, locale, t }: { quest: QuestRow; locale: AdminLocale; t: Copy }) {
  const title = locale === "ro" ? quest.title_ro : quest.title_ru;
  const summary = locale === "ro" ? quest.summary_ro : quest.summary_ru;
  const statusLabels: Record<string, { ru: string; ro: string }> = {
    planning: { ru: "Идея", ro: "Idee" },
    draft: { ru: "Черновик", ro: "Draft" },
    review: { ru: "Проверка", ro: "Verificare" },
    published: { ru: "Опубликован", ro: "Publicat" },
    archived: { ru: "Архив", ro: "Arhivă" },
  };
  const status = statusLabels[quest.status]?.[locale] ?? quest.status;

  return <article className="rounded-2xl border border-border/70 bg-card/55 p-5"><div className="flex items-start justify-between gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet"><Compass className="size-5" aria-hidden="true" /></span><span className="rounded-full border border-violet/35 bg-violet/10 px-2.5 py-1 text-[10px] font-bold uppercase text-violet">{status}</span></div><h3 className="mt-4 text-lg font-black">{title}</h3>{summary && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>}<dl className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-xs sm:grid-cols-3"><div><dt className="text-muted-foreground">{t.questType}</dt><dd className="mt-1 font-bold">{quest.game_type}</dd></div><div><dt className="text-muted-foreground">{t.questStatus}</dt><dd className="mt-1 font-bold">{status}</dd></div><div><dt className="text-muted-foreground">{t.questRoute}</dt><dd className="mt-1 truncate font-bold">{quest.route ?? "—"}</dd></div></dl></article>;
}

function BudgetBar({ label, used, limit, percent, warning }: { label: string; used: number; limit: number; percent: number; warning: boolean }) {
  return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><strong className={warning ? "text-gold" : "text-foreground"}>{used}/{limit} · {percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}><div className={`h-full rounded-full transition-[width] duration-500 ${warning ? "bg-gold" : "bg-success"}`} style={{ width: `${percent}%` }} /></div></div>;
}
