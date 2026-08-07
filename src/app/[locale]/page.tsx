"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CircleUserRound,
  Download,
  Gift,
  Languages,
  Link2Off,
  LogIn,
  Lock,
  MapPin,
  Medal,
  PhoneCall,
  PlayCircle,
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
import { missions, strings, teamMembers, type Lang, type Mission } from "@/data/home-data";
import { createClient } from "@/lib/supabase/client";

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

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`${wide ? "max-w-3xl" : "max-w-lg"} w-full rounded-3xl border border-neon/35 bg-popover p-6 shadow-[0_0_60px_rgba(0,214,255,0.14)]`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-neon/60 hover:text-neon"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

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

function MissionCard({ mission, lang, onClick }: { mission: Mission; lang: Lang; onClick: () => void }) {
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

function BottomCard({ label, icon, onClick, children }: { label: string; icon?: ReactNode; onClick: () => void; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neon/40 bg-card/60 p-4 text-center transition hover:border-neon hover:bg-card"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children ?? icon}
    </button>
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
                <MissionCard key={mission.id} mission={mission} lang={lang} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
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
                <MissionCard key={mission.id} mission={mission} lang={lang} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            <ShieldProgress lang={lang} />
            <div className="mt-8 space-y-3">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} lang={lang} onClick={() => mission.id === 1 ? router.push(`/${lang}/modules/operator-call`) : setSelectedMission(mission)} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-neon/30 bg-card/70 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-neon">{t.storyTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{t.story}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.story2}</p>
          </div>
        </section>

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

      <footer className="relative border-t border-neon/15 bg-slate-950/35">
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-7 text-center">
            <h2 className="text-lg font-bold text-neon">{t.projectMaterials}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.projectMaterialsHint}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BottomCard label={t.teamLogo} onClick={() => setOpenBlock("logo")}>
              <Image
                src="/patrol-shield.png"
                alt={t.teamLogo}
                width={80}
                height={80}
                className="size-20 rounded-xl object-cover ring-2 ring-neon/70"
              />
            </BottomCard>
            <BottomCard label={t.qrCode} onClick={() => setOpenBlock("qr")}>
              <span className="grid size-[88px] place-items-center rounded-lg bg-white p-2">
                <QRCodeSVG value={siteUrl} size={72} bgColor="#ffffff" fgColor="#071328" />
              </span>
            </BottomCard>
            <BottomCard label={t.projectTeam} icon={<Users className="size-12 text-neon" aria-hidden="true" />} onClick={() => setOpenBlock("team")} />
            <BottomCard label={t.demo} icon={<PlayCircle className="size-12 text-gold" aria-hidden="true" />} onClick={() => setOpenBlock("demo")} />
          </div>

          <div className="mt-16 border-t border-neon/10 pt-8 text-center text-xs text-muted-foreground">
            <div className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
              <span className="font-semibold text-foreground/80">{t.footerHackathon}</span>
              <span className="hidden text-neon/30 sm:inline">•</span>
              <span className="font-semibold text-neon/80">{t.footerAi}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
              <span>{t.footerCopyright}</span>
              <div className="flex gap-4">
                <Link href={`/${lang}/privacy`} className="transition hover:text-neon">{t.footerPrivacy}</Link>
                <Link href={`/${lang}/terms`} className="transition hover:text-neon">{t.footerTerms}</Link>
              </div>
            </div>
          </div>
        </section>
      </footer>

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

      {openBlock && (
        <Modal
          title={openBlock === "logo" ? t.teamLogo : openBlock === "qr" ? t.qrCode : openBlock === "team" ? t.projectTeam : t.demo}
          onClose={() => setOpenBlock(null)}
          wide={openBlock === "demo"}
        >
          {openBlock === "logo" && (
            <div className="overflow-hidden rounded-2xl border border-neon/35 bg-slate-950">
              <Image
                src="/patrol-shield.png"
                alt={t.teamLogo}
                width={1024}
                height={1024}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          )}

          {openBlock === "qr" && (
            <div className="flex flex-col items-center gap-4">
              <span className="grid size-[272px] place-items-center rounded-2xl bg-white p-4">
                <QRCodeSVG id="infoquest-qr-large" value={siteUrl} size={240} bgColor="#ffffff" fgColor="#071328" />
              </span>
              <p className="text-sm text-muted-foreground">{t.qrHint}</p>
              <button type="button" onClick={downloadQr} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-semibold text-primary-foreground">
                <Download className="size-4" aria-hidden="true" /> SVG
              </button>
            </div>
          )}

          {openBlock === "team" && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t.teamHint}</p>
              <ul className="space-y-2">
                {teamMembers[lang].map((member) => (
                  <li key={member} className="rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground">{member}</li>
                ))}
              </ul>
            </div>
          )}

          {openBlock === "demo" && (
            <div className="overflow-hidden rounded-2xl border border-gold/40 bg-slate-950">
              <video
                key={lang}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
                aria-label={t.demo}
              >
                <source src={lang === "ro" ? "/promo_ro.mp4" : "/promo.mp4"} type="video/mp4" />
                {t.demoHint}
              </video>
              <p className="px-4 py-3 text-center text-sm text-muted-foreground">{t.demoHint}</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
