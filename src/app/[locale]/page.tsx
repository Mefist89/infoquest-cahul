"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Download,
  Gift,
  Languages,
  Link2Off,
  LogIn,
  Lock,
  MapPin,
  Medal,
  Pause,
  PhoneCall,
  PlayCircle,
  Play,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserLock,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { caseSlides, missions, strings, teamMembers, type Lang, type Mission } from "@/data/home-data";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";
import { SiteFooter } from "@/components/SiteFooter";

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

type BottomBlock = "logo" | "qr" | "team" | "demo";
type HeaderProgress = { isAuthenticated: boolean; loading: boolean; xp: number; rewards: number; displayName: string | null; avatarUrl: string | null };

function Header({ lang, setLang, progress }: { lang: Lang; setLang: (lang: Lang) => void; progress: HeaderProgress }) {
  const t = strings[lang];
  const xpPercent = Math.min(100, Math.round((progress.xp / 500) * 100));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <a href="#top" className="focus-ring flex min-w-0 items-center gap-2 rounded-lg" aria-label="InfoQuest">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-neon/50 bg-card glow-neon">
            <ShieldCheck className="size-5 text-neon" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block whitespace-nowrap font-display text-[10px] font-bold tracking-wider sm:text-base">
              <span className="text-white">INFO</span><span className="text-[#00D9FF]">QUEST</span>
            </span>
            <span className="hidden text-xs text-neon sm:block">{t.tagline}</span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden min-w-40 sm:block">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-gold" aria-hidden="true" /> {t.xp}
              </span>
              <span className="font-semibold text-foreground">{progress.xp}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={progress.xp} aria-valuemin={0} aria-valuemax={500} aria-label="XP">
              <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <Link href={progress.isAuthenticated ? `/${lang}/profile` : `/${lang}/login`} className="focus-ring flex items-center gap-1 rounded-full border border-border bg-card/70 px-2.5 py-2 text-xs text-muted-foreground transition hover:border-gold/60 sm:px-3" aria-label={lang === "ru" ? "Награды" : "Recompense"}>
            <Medal className="size-3.5 text-gold" aria-hidden="true" />
            <strong className="text-foreground">{progress.rewards}</strong>/8
          </Link>

          {progress.loading ? (
            <span className="size-10 shrink-0 animate-pulse rounded-full border border-border bg-card/70" aria-label={lang === "ru" ? "Загрузка профиля" : "Se încarcă profilul"} />
          ) : progress.isAuthenticated ? (
            <>
              <Link
                href={`/${lang}/profile`}
                aria-label={lang === "ru" ? "Профиль" : "Profil"}
                className="focus-ring inline-flex min-h-10 min-w-10 shrink-0 items-center gap-2 rounded-full border border-neon/35 bg-neon/10 p-1 pr-2 text-neon transition hover:border-neon hover:bg-neon/20 sm:pr-3"
              >
                <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-background/70">
                  {progress.avatarUrl ? (
                    <Image src={progress.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                  ) : (
                    <CircleUserRound className="size-5" aria-hidden="true" />
                  )}
                </span>
                {progress.displayName && <span className="hidden max-w-36 truncate text-sm font-semibold text-foreground md:inline">{progress.displayName}</span>}
              </Link>
              <SignOutButton locale={lang} label={lang === "ru" ? "Выйти" : "Ieșire"} />
            </>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20 sm:px-4 sm:text-sm"
            >
              <LogIn className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{lang === "ru" ? "Войти" : "Autentificare"}</span>
            </Link>
          )}

          <div className="flex rounded-full border border-border bg-card/70 p-1" role="group" aria-label="Language">
            {(["ro", "ru"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLang(item)}
                aria-pressed={lang === item}
                className={`focus-ring min-h-9 rounded-full px-3 text-xs font-bold uppercase transition sm:text-sm ${
                  lang === item ? "bg-neon text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function MissionCard({ mission, lang, isAuthenticated, onClick }: { mission: Mission; lang: Lang; isAuthenticated: boolean; onClick: () => void }) {
  const Icon = icons[mission.icon];
  const t = strings[lang];
  const locked = !isAuthenticated && mission.status === "soon";

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      data-mission-id={mission.id}
      className={`focus-ring group flex w-full items-center gap-3 rounded-2xl border-2 bg-card/85 p-3 text-left backdrop-blur transition-all duration-300 ${
        locked ? "cursor-not-allowed border-dashed opacity-65" : "opacity-100 hover:-translate-y-1 hover:bg-card"
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

function ShieldProgress({ lang }: { lang: Lang }) {
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
          className="mx-auto w-full drop-shadow-[0_0_35px_color-mix(in_oklab,var(--neon)_45%,transparent)]"
        />
      </div>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{strings[lang].shieldProgress}</p>
      <div className="mx-auto mt-2 flex max-w-56 gap-1" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={8} aria-label={strings[lang].shieldProgress}>
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-2 flex-1 rounded-full bg-secondary" />
        ))}
      </div>
      <p className="mt-2 font-display text-lg text-neon text-glow">0%</p>
    </div>
  );
}

function CaseSlider({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = caseSlides[active];
  const mission = missions[active];
  const Icon = icons[mission.icon];
  const t = strings[lang];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % caseSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function move(direction: number) {
    setActive((index) => (index + direction + caseSlides.length) % caseSlides.length);
  }

  return (
    <section
      className="relative mx-auto max-w-3xl px-4"
      aria-roledescription="carousel"
      aria-label={t.storyTitle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <div className="overflow-hidden rounded-3xl border border-neon/30 bg-card/75 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <span className="grid size-10 place-items-center rounded-xl border border-neon/35 bg-neon/10 text-neon"><ShieldAlert className="size-5" aria-hidden="true" /></span>
          <div><h2 className="text-lg font-bold text-neon">{t.storyTitle}</h2><p className="text-xs text-muted-foreground">{lang === "ro" ? "8 dosare ale rețelei Umbra" : "8 дел сети Тени"}</p></div>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? (lang === "ro" ? "Pornește rotația" : "Запустить слайдер") : (lang === "ro" ? "Oprește rotația" : "Остановить слайдер")} className="focus-ring ml-auto grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-neon/50 hover:text-neon">
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
          </button>
        </div>

        <div key={slide.id} className="animate-in fade-in slide-in-from-right-4 grid min-h-64 gap-5 p-5 duration-500 sm:grid-cols-[120px_1fr] sm:items-center sm:p-7" aria-live="polite">
          <div className="flex items-center gap-3 sm:flex-col sm:justify-center">
            <span className="grid size-16 place-items-center rounded-2xl border bg-background/60 sm:size-20" style={{ borderColor: `color-mix(in oklab, ${mission.color} 55%, transparent)`, boxShadow: `0 0 24px color-mix(in oklab, ${mission.color} 25%, transparent)` }}><Icon className="size-8 sm:size-10" style={{ color: mission.color }} aria-hidden="true" /></span>
            <span className="font-display text-sm font-black text-gold">{String(active + 1).padStart(2, "0")} / 08</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === "ro" ? `Dosarul ${active + 1}` : `Дело ${active + 1}`}</p>
            <h3 className="mt-2 text-xl font-black text-foreground sm:text-2xl">{mission.title[lang]}</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{slide.description[lang]}</p>
            <p className="mt-3 rounded-xl border border-neon/20 bg-neon/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground"><strong className="text-neon">{lang === "ro" ? "Obiectiv: " : "Цель: "}</strong>{slide.objective[lang]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/70 px-5 py-4 sm:px-6">
          <button type="button" onClick={() => move(-1)} aria-label={lang === "ro" ? "Dosarul anterior" : "Предыдущее дело"} className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-neon/50 hover:text-neon"><ChevronLeft className="size-5" aria-hidden="true" /></button>
          <div className="flex flex-1 justify-center gap-1.5" role="tablist" aria-label={lang === "ro" ? "Alege dosarul" : "Выберите дело"}>
            {caseSlides.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={active === index} aria-label={`${index + 1}`} onClick={() => setActive(index)} className={`focus-ring h-2 rounded-full transition-all ${active === index ? "w-7 bg-neon" : "w-2 bg-secondary hover:bg-muted-foreground"}`} />)}
          </div>
          <button type="button" onClick={() => move(1)} aria-label={lang === "ro" ? "Dosarul următor" : "Следующее дело"} className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-neon/50 hover:text-neon"><ChevronRight className="size-5" aria-hidden="true" /></button>
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
  const [openBlock, setOpenBlock] = useState<BottomBlock | null>(null);
  const [siteUrl, setSiteUrl] = useState("http://localhost:3000");
  const [headerProgress, setHeaderProgress] = useState<HeaderProgress>({ isAuthenticated: false, loading: true, xp: 0, rewards: 0, displayName: null, avatarUrl: null });
  const t = strings[lang];
  const leftMissions = useMemo(() => missions.filter((mission) => mission.side === "left"), []);
  const rightMissions = useMemo(() => missions.filter((mission) => mission.side === "right"), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSiteUrl(window.location.origin);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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
        setHeaderProgress({ isAuthenticated: false, loading: false, xp: 0, rewards: 0, displayName: null, avatarUrl: null });
        return;
      }

      const [{ data: progressData }, { data: profile }] = await Promise.all([
        supabase.from("module_progress").select("status, xp").eq("user_id", user.id),
        supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
      ]);

      if (!active) return;
      const progressRows = progressData ?? [];
      const metadata = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
      const displayName = profile?.display_name || metadata.full_name || metadata.name || user.email?.split("@")[0] || null;
      const candidateAvatar = profile?.avatar_url || metadata.avatar_url;
      const avatarUrl = typeof candidateAvatar === "string" && candidateAvatar.startsWith("https://lh3.googleusercontent.com/") ? candidateAvatar : null;
      setHeaderProgress({
        isAuthenticated: true,
        loading: false,
        xp: progressRows.reduce((sum, item) => sum + Number(item.xp ?? 0), 0),
        rewards: progressRows.filter((item) => item.status === "completed").length,
        displayName,
        avatarUrl,
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

  const downloadQr = () => {
    const svg = document.getElementById("infoquest-qr-large");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "infoquest-qr.svg";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <>
      <Header lang={lang} setLang={setLang} progress={headerProgress} />
      <main id="top" className="circuit-bg overflow-hidden">
        <section className="relative mx-auto max-w-6xl px-4 pt-10 text-center sm:pt-12">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">
            <span className="text-white">Info</span><span className="text-[#00D9FF] text-glow">Quest</span>
          </h1>
          <p className="mt-2 font-display text-sm uppercase tracking-[0.25em] text-neon sm:text-base">{t.tagline}</p>
          <p className="mx-auto mt-4 inline-block rounded-full border border-gold/50 px-5 py-2 text-sm font-semibold text-gold">{t.motto}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/login`}
              className="focus-ring group inline-flex min-h-12 items-center gap-3 rounded-xl bg-neon px-6 text-sm font-extrabold text-primary-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--neon)_38%,transparent)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_color-mix(in_oklab,var(--neon)_55%,transparent)]"
            >
              {t.startInvestigation}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href={`/${lang}/ai-help`}
              className="focus-ring group inline-flex min-h-12 items-center gap-3 rounded-xl bg-success px-6 text-sm font-extrabold text-slate-950 shadow-[0_0_28px_color-mix(in_oklab,var(--success)_32%,transparent)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_color-mix(in_oklab,var(--success)_50%,transparent)]"
            >
              <Bot className="size-5" aria-hidden="true" />
              {t.aiHelp}
            </Link>
          </div>
        </section>

        <section id="missions" aria-label="Mission map" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
          <div className="hidden grid-cols-[1fr_minmax(280px,380px)_1fr] items-center gap-6 lg:grid">
            <div className="space-y-4">
              {leftMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} lang={lang} isAuthenticated={headerProgress.isAuthenticated} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
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
              <ShieldProgress lang={lang} />
            </div>
            <div className="space-y-4">
              {rightMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} lang={lang} isAuthenticated={headerProgress.isAuthenticated} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            <ShieldProgress lang={lang} />
            <div className="mt-8 space-y-3">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} lang={lang} isAuthenticated={headerProgress.isAuthenticated} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>
        </section>

        <CaseSlider lang={lang} />

        <section className="relative mx-auto mt-10 max-w-3xl px-4" aria-label={t.badges}>
          <h2 className="text-lg font-bold text-gold">{t.badges}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {t.badgeNames.map((badge) => (
              <div key={badge} className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 opacity-70">
                <Medal className="size-8 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">{badge}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:col-span-2">
              <ShieldCheck className="size-8 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm">
                <strong className="block font-semibold text-foreground">{t.finalBadge}</strong>
                <span className="text-muted-foreground">{t.finalBadgeHint}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto mt-10 max-w-3xl px-4 text-center">
          <p className="text-sm text-foreground">{t.heroLead}</p>
          <p className="mt-1 text-sm text-gold">{t.heroSub}</p>
        </section>

      </main>

      <SiteFooter lang={lang} />

      {selectedMission && (
        <Modal title={selectedMission.title[lang]} onClose={() => setSelectedMission(null)}>
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
