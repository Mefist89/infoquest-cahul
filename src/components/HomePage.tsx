"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  Gift,
  Languages,
  Link2Off,
  Lock,
  MapPin,
  PhoneCall,
  ScanFace,
  ShieldAlert,
  UserLock,
  type LucideIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { HomeHeader } from "@/components/home/HomeHeader";
import { strings, type Lang } from "@/data/home-data";
import { CASE_SLIDES as caseSlides, MODULE_CATALOG as missions, MODULE_COUNT, MODULE_MAX_XP, TOTAL_MAX_XP, type ModuleDefinition as Mission, type ModuleId } from "@/data/module-catalog";
import { isUserRole, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";
import { ProjectMaterials } from "@/components/ProjectMaterials";
import { SiteFooter } from "@/components/SiteFooter";
import {
  AiAssistantSection,
  AudienceSection,
  FaqSection,
  HowItWorks,
  MiniChallenge,
  ProgressAndBadges,
  SkillsSection,
} from "@/components/home/HomeLearningSections";

const icons: Record<Mission["icon"], LucideIcon> = {
  "user-lock": UserLock,
  "phone-call": PhoneCall,
  gift: Gift,
  "scan-face": ScanFace,
  languages: Languages,
  "map-pin": MapPin,
  "shield-alert": ShieldAlert,
  "link-2-off": Link2Off,
};

type ProgressStatus = "not_started" | "in_progress" | "completed";
type ModuleProgress = { status: ProgressStatus; xp: number };
type HeaderProgress = {
  isAuthenticated: boolean;
  loading: boolean;
  xp: number;
  rewards: number;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
  modules: Partial<Record<ModuleId, ModuleProgress>>;
};

const emptyProgress: HeaderProgress = {
  isAuthenticated: false,
  loading: true,
  xp: 0,
  rewards: 0,
  displayName: null,
  avatarUrl: null,
  role: null,
  modules: {},
};

function MissionCard({ mission, lang, onClick, dimmed = false }: { mission: Mission; lang: Lang; onClick: () => void; dimmed?: boolean }) {
  const Icon = icons[mission.icon];
  const t = strings[lang];
  const locked = mission.status === "soon";

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      data-mission-id={mission.id}
      className={`focus-ring group flex w-full items-center gap-3 rounded-2xl border-2 bg-card/85 p-3 text-left backdrop-blur transition-all duration-300 ${
        locked ? "cursor-not-allowed border-dashed" : "hover:-translate-y-1 hover:bg-card"
      } ${
        dimmed ? "opacity-30" : locked ? "opacity-65" : "opacity-100"
      }`}
      style={{
        borderColor: `color-mix(in oklab, ${mission.color} ${locked ? "48%" : "100%"}, transparent)`,
        boxShadow: locked ? "none" : `0 0 15px color-mix(in oklab, ${mission.color} 27%, transparent)`,
      }}
      aria-label={`${mission.title[lang]} — ${locked ? t.soon : t.playable}`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/70 font-display text-sm font-bold text-gold">
        {mission.id}
      </span>
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-background/60"
        style={{ boxShadow: `0 0 14px color-mix(in oklab, ${mission.color} 45%, transparent)` }}
      >
        <Icon className="size-6" style={{ color: mission.color }} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">{mission.title[lang]}</span>
        <span className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${locked ? "rounded-full bg-secondary px-2 py-0.5 text-foreground/75" : "text-neon"}`}>
          {locked && <Lock className="size-3" aria-hidden="true" />}
          {locked ? t.soon : `${t.playable} · ${t.openMission}`}
        </span>
      </span>
      {!locked && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-neon/30 bg-neon/10 text-neon transition group-hover:translate-x-1 group-hover:border-neon/70 group-hover:bg-neon/20" aria-hidden="true">
          <ArrowRight className="size-4" />
        </span>
      )}
    </button>
  );
}

function ShieldProgress({ lang, progress }: { lang: Lang; progress: HeaderProgress }) {
  const percent = Math.min(100, Math.round((progress.xp / TOTAL_MAX_XP) * 100));

  return (
    <div className="relative mx-auto w-full max-w-sm text-center">
      <div className="relative">
        <div className="absolute inset-8 -z-10 rounded-full bg-neon/25 blur-3xl animate-shield-pulse" aria-hidden="true" />
        <Image
          src="/patrol-shield.png"
          alt={strings[lang].storyTitle}
          width={1024}
          height={1024}
          priority
          className="mx-auto w-full opacity-100 transition-[filter] duration-700"
          style={{
            filter: `drop-shadow(0 0 ${18 + percent * 0.22}px color-mix(in oklab, var(--neon) ${25 + percent * 0.35}%, transparent))`,
          }}
        />
      </div>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{strings[lang].shieldProgress}</p>
      <div className="mx-auto mt-2 flex max-w-56 gap-1" role="progressbar" aria-valuenow={progress.xp} aria-valuemin={0} aria-valuemax={TOTAL_MAX_XP} aria-label={strings[lang].shieldProgress}>
        {missions.map((module) => {
          const moduleXp = progress.modules[module.moduleId]?.xp ?? 0;
          const modulePercent = Math.min(100, Math.round((moduleXp / MODULE_MAX_XP) * 100));

          return (
            <span key={module.moduleId} className="h-2 flex-1 overflow-hidden rounded-full bg-secondary" title={`${module.title[lang]}: ${modulePercent}%`}>
              <span className="block h-full rounded-full bg-neon transition-[width] duration-700" style={{ width: `${modulePercent}%` }} />
            </span>
          );
        })}
      </div>
      <p className="mt-2 font-display text-lg text-neon text-glow">{progress.loading ? "…" : `${percent}%`}</p>
    </div>
  );
}

function CaseSlider({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const slide = caseSlides[active];
  const mission = missions[active];
  const Icon = icons[mission.icon];
  const t = strings[lang];

  function selectSlide(index: number) {
    setActive(index);
    setAnnouncement(`${index + 1}/${MODULE_COUNT}: ${missions[index].title[lang]}`);
  }

  function move(direction: number) {
    selectSlide((active + direction + caseSlides.length) % caseSlides.length);
  }

  return (
    <section
      className="home-content-width relative mx-auto mt-12"
      aria-roledescription="carousel"
      aria-label={t.storyTitle}
    >
      <div className="overflow-hidden rounded-3xl border border-neon/30 bg-card/75 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <span className="grid size-10 place-items-center rounded-xl border border-neon/35 bg-neon/10 text-neon"><ShieldAlert className="size-5" aria-hidden="true" /></span>
          <div><h2 className="text-lg font-bold text-neon">{t.storyTitle}</h2><p className="text-xs text-muted-foreground">{lang === "ro" ? `${MODULE_COUNT} dosare ale rețelei Umbra` : `${MODULE_COUNT} дел сети Тени`}</p></div>
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
        <div key={slide.id} className="animate-in fade-in slide-in-from-right-4 grid min-h-64 gap-5 p-5 duration-500 sm:grid-cols-[120px_1fr] sm:items-center sm:p-7">
          <div className="flex items-center gap-3 sm:flex-col sm:justify-center">
            <span className="grid size-16 place-items-center rounded-2xl border bg-background/60 sm:size-20" style={{ borderColor: `color-mix(in oklab, ${mission.color} 55%, transparent)`, boxShadow: `0 0 24px color-mix(in oklab, ${mission.color} 25%, transparent)` }}><Icon className="size-8 sm:size-10" style={{ color: mission.color }} aria-hidden="true" /></span>
            <span className="font-display text-sm font-black text-gold">{String(active + 1).padStart(2, "0")} / {String(MODULE_COUNT).padStart(2, "0")}</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === "ro" ? `Dosarul ${active + 1}` : `Дело ${active + 1}`}</p>
            <h3 className="mt-2 text-xl font-black text-foreground sm:text-2xl">{mission.title[lang]}</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{slide.description[lang]}</p>
            <p className="mt-3 rounded-xl border border-neon/20 bg-neon/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground"><strong className="text-neon">{lang === "ro" ? "Obiectiv: " : "Цель: "}</strong>{slide.objective[lang]}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-5 py-4 sm:px-6">
          <button type="button" onClick={() => move(-1)} aria-label={lang === "ro" ? "Dosarul anterior" : "Предыдущее дело"} className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-neon/50 hover:text-neon"><ChevronLeft className="size-5" aria-hidden="true" /></button>
          <div className="order-last grid w-full grid-cols-4 justify-items-center gap-1 sm:order-none sm:flex sm:w-auto sm:flex-1 sm:flex-wrap sm:justify-center" role="tablist" aria-label={lang === "ro" ? "Alege dosarul" : "Выберите дело"}>
            {caseSlides.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={active === index} aria-label={`${index + 1}`} onClick={() => selectSlide(index)} className="focus-ring grid size-11 place-items-center rounded-xl hover:bg-neon/10"><span aria-hidden="true" className={`h-2 rounded-full motion-safe:transition-all ${active === index ? "w-7 bg-neon" : "w-2 bg-secondary"}`} /></button>)}
          </div>
          <button type="button" onClick={() => move(1)} aria-label={lang === "ro" ? "Dosarul următor" : "Следующее дело"} className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-neon/50 hover:text-neon"><ChevronRight className="size-5" aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const routeLang: Lang = params.locale === "ro" ? "ro" : "ru";
  const lang = routeLang;
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionFilter, setMissionFilter] = useState<ModuleId | null>(null);
  const [headerProgress, setHeaderProgress] = useState<HeaderProgress>(emptyProgress);
  const t = strings[lang];
  const leftMissions = useMemo(() => missions.filter((mission) => mission.side === "left"), []);
  const rightMissions = useMemo(() => missions.filter((mission) => mission.side === "right"), []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadHeaderProgress() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!active) return;

      if (!user) {
        setHeaderProgress({ ...emptyProgress, loading: false });
        return;
      }

      const [{ data: progressData }, { data: profile }] = await Promise.all([
        supabase.from("module_progress").select("module_id, status, xp").eq("user_id", user.id),
        supabase.from("profiles").select("display_name, avatar_url, role").eq("id", user.id).maybeSingle(),
      ]);

      if (!active) return;
      const catalogIds = new Set<string>(missions.map((module) => module.moduleId));
      const progressRows = (progressData ?? []).filter((item) => catalogIds.has(item.module_id));
      const moduleProgress = Object.fromEntries(
        progressRows.map((item) => [
          item.module_id,
          {
            status: item.status as ProgressStatus,
            xp: Math.max(0, Math.min(MODULE_MAX_XP, Number(item.xp ?? 0))),
          },
        ]),
      ) as Partial<Record<ModuleId, ModuleProgress>>;
      const metadata = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
      const displayName = profile?.display_name || metadata.full_name || metadata.name || user.email?.split("@")[0] || null;
      const candidateAvatar = profile?.avatar_url || metadata.avatar_url;
      const avatarUrl = typeof candidateAvatar === "string" && candidateAvatar.startsWith("https://lh3.googleusercontent.com/") ? candidateAvatar : null;
      setHeaderProgress({
        isAuthenticated: true,
        loading: false,
        xp: Object.values(moduleProgress).reduce((sum, item) => sum + item.xp, 0),
        rewards: progressRows.filter((item) => item.status === "completed").length,
        displayName,
        avatarUrl,
        role: isUserRole(profile?.role) ? profile.role : "user",
        modules: moduleProgress,
      });
    }

    void loadHeaderProgress();
    return () => {
      active = false;
    };
  }, []);

  const setLang = (nextLang: Lang) => {
    if (nextLang === lang) return;
    window.localStorage.setItem("infoquest.lang", nextLang);
    router.push(`/${nextLang}`);
  };

  return (
    <>
      <HomeHeader lang={lang} setLang={setLang} progress={headerProgress} />
      <main id="top" className="circuit-bg overflow-hidden">
        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div className="relative z-10 min-w-0 text-center lg:text-left">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight min-[360px]:text-5xl sm:text-6xl"><span className="text-white">Info</span><span className="text-[#00D9FF] text-glow">Quest</span></h1>
            <p className="mx-auto mt-2 max-w-full text-balance font-display text-xs uppercase tracking-[0.12em] text-neon min-[360px]:text-sm sm:text-lg sm:tracking-[0.25em] lg:mx-0">{t.tagline}</p>
            <p className="mx-auto mt-4 block w-fit max-w-full text-balance rounded-3xl border border-gold/50 px-4 py-2 text-xs font-semibold text-gold sm:rounded-full sm:px-5 sm:text-sm lg:mx-0">{t.motto}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={headerProgress.isAuthenticated ? `/${lang}/profile` : `/${lang}/login`}
              className="focus-ring group inline-flex min-h-12 items-center gap-3 rounded-xl bg-neon px-6 text-sm font-extrabold text-primary-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--neon)_38%,transparent)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_color-mix(in_oklab,var(--neon)_55%,transparent)]"
            >
              {t.startInvestigation}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <div className="flex flex-col items-center gap-2">
            {headerProgress.role === "blocked" ? (
              <span aria-disabled="true" className="inline-flex min-h-12 cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-secondary/70 px-6 text-sm font-extrabold text-muted-foreground opacity-75">
                <Lock className="size-5" aria-hidden="true" />
                <span>{t.aiHelp}</span>
              </span>
            ) : (
              <Link
                href={headerProgress.isAuthenticated ? `/${lang}/ai-help` : `/${lang}/login?next=${encodeURIComponent(`/${lang}/ai-help`)}`}
                className="focus-ring group inline-flex min-h-12 items-center gap-3 rounded-xl bg-success px-6 text-sm font-extrabold text-slate-950 shadow-[0_0_28px_color-mix(in_oklab,var(--success)_32%,transparent)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_color-mix(in_oklab,var(--success)_50%,transparent)]"
              >
                <Bot className="size-5" aria-hidden="true" />
                {t.aiHelp}
              </Link>
            )}
            {!headerProgress.isAuthenticated && <p className="max-w-64 text-center text-xs text-muted-foreground">{t.aiGuestHint}</p>}
            {headerProgress.role === "blocked" && <p className="max-w-64 text-center text-xs text-muted-foreground">{t.aiRestricted}</p>}
            </div>
            </div>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground lg:mx-0">{lang === "ru" ? "Расследуй цифровые происшествия, находи доказательства и учись защищать себя и друзей в интернете." : "Investighează incidente digitale, găsește dovezi și învață să te protejezi pe tine și pe prieteni pe internet."}</p>
          </div>
          <div className="relative mx-auto w-full min-w-0 max-w-xl overflow-hidden rounded-[2rem] border border-neon/20 bg-[radial-gradient(circle_at_50%_60%,rgba(0,217,255,0.18),transparent_58%)]"><div className="absolute inset-12 rounded-full bg-neon/15 blur-3xl" aria-hidden="true" /><Image src="/patrol-shield.png" alt={t.storyTitle} width={1024} height={1024} priority className="relative h-auto w-full opacity-100 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" /></div>
        </section>

        <HowItWorks lang={lang} />

        <section id="missions" aria-label="Mission map" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
          <h2 className="home-title">{lang === "ru" ? "Выбери своё первое дело" : "Alege primul tău dosar"}</h2>
          <div className="mb-7 mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label={lang === "ru" ? "Фильтр дел" : "Filtru dosare"}>
            <button type="button" aria-pressed={missionFilter === null} onClick={() => setMissionFilter(null)} className={`focus-ring min-h-11 min-w-11 rounded-full border px-4 text-sm font-bold transition ${missionFilter === null ? "border-neon bg-neon/15 text-neon" : "border-border bg-card/60 text-muted-foreground hover:border-neon/45"}`}>{lang === "ru" ? "Все" : "Toate"}</button>
            {missions.map((mission) => <button key={mission.moduleId} type="button" aria-pressed={missionFilter === mission.moduleId} onClick={() => setMissionFilter(mission.moduleId === missionFilter ? null : mission.moduleId)} className={`focus-ring min-h-11 min-w-11 rounded-full border px-4 text-sm font-bold transition ${missionFilter === mission.moduleId ? "border-neon bg-neon/15 text-neon" : "border-border bg-card/60 text-muted-foreground hover:border-neon/45"}`}>{mission.category[lang]}</button>)}
          </div>
          <div className="hidden grid-cols-[1fr_minmax(280px,380px)_1fr] items-center gap-6 lg:grid">
            <div className="space-y-4">
              {leftMissions.map((mission) => (
                <MissionCard key={mission.moduleId} mission={mission} lang={lang} dimmed={missionFilter !== null && missionFilter !== mission.moduleId} onClick={() => mission.route ? router.push(`/${lang}${mission.route}`) : setSelectedMission(mission)} />
              ))}
            </div>
            <div className="relative">
              <svg aria-hidden="true" viewBox="0 0 200 400" className="pointer-events-none absolute inset-0 size-full">
                <path
                  d="M10 40 C 60 90, 140 90, 190 40 M10 140 C 60 190, 140 190, 190 140 M10 260 C 60 300, 140 300, 190 260 M10 360 C 70 320, 130 320, 190 360"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2"
                  strokeDasharray="6 12"
                  strokeLinecap="round"
                  className="animate-dash-run opacity-70"
                />
              </svg>
              <ShieldProgress lang={lang} progress={headerProgress} />
            </div>
            <div className="space-y-4">
              {rightMissions.map((mission) => (
                <MissionCard key={mission.moduleId} mission={mission} lang={lang} dimmed={missionFilter !== null && missionFilter !== mission.moduleId} onClick={() => mission.route ? router.push(`/${lang}${mission.route}`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            <ShieldProgress lang={lang} progress={headerProgress} />
            <div className="mt-8 space-y-3">
              {missions.map((mission) => (
                <MissionCard key={mission.moduleId} mission={mission} lang={lang} dimmed={missionFilter !== null && missionFilter !== mission.moduleId} onClick={() => mission.route ? router.push(`/${lang}${mission.route}`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>
        </section>

        <MiniChallenge lang={lang} />
        <CaseSlider lang={lang} />
        <SkillsSection lang={lang} />
        <ProgressAndBadges lang={lang} progress={headerProgress} missions={missions} />
        <AudienceSection lang={lang} />
        <section id="materials" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
          <ProjectMaterials lang={lang} />
        </section>
        <AiAssistantSection lang={lang} isGuest={!headerProgress.isAuthenticated} restricted={headerProgress.role === "blocked"} href={headerProgress.isAuthenticated ? `/${lang}/ai-help` : `/${lang}/login?next=${encodeURIComponent(`/${lang}/ai-help`)}`} />
      </main>

      <SiteFooter lang={lang} beforeLegal={<FaqSection lang={lang} />} />

      {selectedMission && (
        <Modal title={selectedMission.title[lang]} onClose={() => setSelectedMission(null)} closeLabel={t.close}>
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-neon/30 bg-card font-display text-lg text-neon">
              {selectedMission.id}
            </span>
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedMission.teaser[lang]}</p>
              <p className="mt-4 rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground">
                {selectedMission.status === "playable" ? t.missionReady : t.missionSoon}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
