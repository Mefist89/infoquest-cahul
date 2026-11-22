"use client";

import {
  AlarmClock,
  ArrowDown,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Circle,
  Compass,
  CreditCard,
  Eye,
  Fingerprint,
  Globe,
  Info,
  KeyRound,
  LifeBuoy,
  Lightbulb,
  Link2Off,
  LockKeyhole,
  MessageSquareWarning,
  PhoneCall,
  PhoneOff,
  Play,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ActionButton } from "../operator-call/stage-support";

export type TheoryModuleSlug = "operator-call" | "fake-link" | "hacked-account" | "scam-or-real";

export type TheoryCardItem = {
  title: string;
  text: string;
};

export type TheoryBoardContent = {
  lead: string;
  cards: readonly TheoryCardItem[];
  notes?: readonly string[];
  recoveryTitle?: string;
  recovery?: string;
  rule: string;
  audioText?: string;
  audioFile?: string;
};

const MODULE_CARD_ICONS: Record<TheoryModuleSlug, readonly LucideIcon[]> = {
  "operator-call": [AlarmClock, KeyRound, Link2Off, Fingerprint, PhoneOff, PhoneCall],
  "fake-link": [Globe, LockKeyhole, AlarmClock, Eye],
  "hacked-account": [Smartphone, KeyRound, ShieldAlert, MessageSquareWarning, LockKeyhole],
  "scam-or-real": [BadgePercent, CreditCard, Store, AlarmClock, LifeBuoy],
};

const CARD_THEMES = [
  {
    border: "border-rose-400/40 hover:border-rose-400/80",
    glow: "from-rose-500/15 via-transparent to-transparent",
    iconBox: "border-rose-400/45 bg-rose-500/15 text-rose-300",
    stepPill: "border-rose-400/40 bg-rose-500/15 text-rose-200",
    topBar: "from-rose-400 via-amber-400 to-rose-400/40",
  },
  {
    border: "border-amber-400/40 hover:border-amber-400/80",
    glow: "from-amber-400/15 via-transparent to-transparent",
    iconBox: "border-amber-400/45 bg-amber-400/15 text-amber-300",
    stepPill: "border-amber-400/40 bg-amber-400/15 text-amber-200",
    topBar: "from-amber-400 via-yellow-300 to-amber-400/40",
  },
  {
    border: "border-neon/40 hover:border-neon/85",
    glow: "from-neon/15 via-transparent to-transparent",
    iconBox: "border-neon/45 bg-neon/15 text-neon",
    stepPill: "border-neon/40 bg-neon/15 text-neon",
    topBar: "from-neon via-sky-300 to-neon/40",
  },
  {
    border: "border-violet-400/40 hover:border-violet-400/80",
    glow: "from-violet-400/15 via-transparent to-transparent",
    iconBox: "border-violet-400/45 bg-violet-400/15 text-violet-300",
    stepPill: "border-violet-400/40 bg-violet-400/15 text-violet-200",
    topBar: "from-violet-400 via-fuchsia-300 to-violet-400/40",
  },
  {
    border: "border-emerald-400/40 hover:border-emerald-400/80",
    glow: "from-emerald-400/15 via-transparent to-transparent",
    iconBox: "border-emerald-400/45 bg-emerald-400/15 text-emerald-300",
    stepPill: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
    topBar: "from-emerald-400 via-teal-300 to-emerald-400/40",
  },
  {
    border: "border-sky-400/40 hover:border-sky-400/80",
    glow: "from-sky-400/15 via-transparent to-transparent",
    iconBox: "border-sky-400/45 bg-sky-400/15 text-sky-300",
    stepPill: "border-sky-400/40 bg-sky-400/15 text-sky-200",
    topBar: "from-sky-400 via-cyan-300 to-sky-400/40",
  },
] as const;

const NOTE_ICONS: readonly LucideIcon[] = [PhoneCall, ShieldAlert, Info];

const copy = {
  ru: {
    mapBadge: "Карта ловушки",
    studied: "Изучено",
    tapHint: "Иди по стрелкам и нажимай на карточки, чтобы отметить, что запомнил.",
    step: "Шаг",
    markRead: "Понятно",
    marked: "Запомнил!",
    notesTitle: "Важные подсказки",
    recoveryFallbackTitle: "Если это уже случилось",
    goldenRule: "Золотое правило",
    allDone: "Все шаги изучены!",
  },
  ro: {
    mapBadge: "Harta capcanei",
    studied: "Citite",
    tapHint: "Urmează săgețile și apasă pe carduri ca să bifezi ce ai reținut.",
    step: "Pasul",
    markRead: "Am înțeles",
    marked: "Reținut!",
    notesTitle: "Sfaturi importante",
    recoveryFallbackTitle: "Dacă s-a întâmplat deja",
    goldenRule: "Regula de aur",
    allDone: "Toți pașii au fost studiați!",
  },
} as const;

function DownFlowArrow({ active = false }: { active?: boolean }) {
  return (
    <div className="my-2 flex flex-col items-center justify-center" aria-hidden="true">
      <span className={`h-4 w-0.5 rounded-full ${active ? "bg-success/70" : "bg-neon/45"}`} />
      <span
        className={`grid size-8 place-items-center rounded-full border shadow-sm transition-colors ${
          active
            ? "border-success/60 bg-success/15 text-success shadow-[0_0_16px_rgba(34,197,94,0.28)]"
            : "border-neon/45 bg-neon/10 text-neon shadow-[0_0_16px_rgba(0,217,255,0.2)]"
        }`}
      >
        <ArrowDown className="size-4" />
      </span>
      <span className={`h-3 w-0.5 rounded-full ${active ? "bg-success/70" : "bg-neon/45"}`} />
    </div>
  );
}

function RowSnakeConnector({ toCenter, active }: { toCenter: boolean; active: boolean }) {
  const strokeColor = active ? "#22c55e" : "#00d9ff";
  const targetX = toCenter ? 300 : 150;
  const pathD = `M 450 2 C 450 30, ${targetX} 18, ${targetX} 44`;

  return (
    <>
      <div className="md:hidden">
        <DownFlowArrow active={active} />
      </div>
      <div className="my-1 hidden md:block" aria-hidden="true">
        <svg viewBox="0 0 600 54" className="mx-auto h-12 w-full max-w-3xl overflow-visible" fill="none">
          <path
            d={pathD}
            stroke={strokeColor}
            strokeOpacity={active ? "0.85" : "0.55"}
            strokeWidth="3"
            strokeDasharray="7 6"
            strokeLinecap="round"
          />
          <circle cx="450" cy="4" r="4.5" fill={strokeColor} />
          <path
            d={`M ${targetX - 7} 36 L ${targetX} 46 L ${targetX + 7} 36`}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}

function TheoryStepCard({
  card,
  index,
  icon: Icon,
  isRead,
  onToggle,
  locale,
}: {
  card: TheoryCardItem;
  index: number;
  icon: LucideIcon;
  isRead: boolean;
  onToggle: () => void;
  locale: "ru" | "ro";
}) {
  const t = copy[locale];
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isRead}
      className={`focus-ring group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 bg-background/55 p-5 text-left shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 sm:p-6 ${
        isRead
          ? "border-success/70 bg-success/[0.07] shadow-[0_0_28px_rgba(34,197,94,0.16)]"
          : `${theme.border} hover:bg-background/75`
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${
          isRead ? "from-success via-emerald-300 to-success/50" : theme.topBar
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${
          isRead ? "from-success/12 via-transparent to-transparent" : theme.glow
        }`}
      />

      <span className="relative flex w-full items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${
              isRead ? "border-success/50 bg-success/15 text-success" : theme.iconBox
            }`}
          >
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-display text-sm font-black tracking-wider ${
              isRead ? "border-success/45 bg-success/15 text-success" : theme.stepPill
            }`}
          >
            {t.step} 0{index + 1}
          </span>
        </span>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition ${
            isRead
              ? "border-success/55 bg-success/20 text-success"
              : "border-border/80 bg-card/70 text-muted-foreground group-hover:border-neon/50 group-hover:text-foreground"
          }`}
        >
          {isRead ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : (
            <Circle className="size-4" aria-hidden="true" />
          )}
          {isRead ? t.marked : t.markRead}
        </span>
      </span>

      <span className="relative mt-4 block font-display text-lg font-black leading-snug text-foreground sm:text-xl">
        {card.title}
      </span>
      <span className="relative mt-2 block text-sm leading-relaxed text-foreground/80 sm:text-base">
        {card.text}
      </span>
    </button>
  );
}

export function TheoryBoard({
  moduleSlug,
  locale,
  content,
  button,
  saving,
  onComplete,
}: {
  moduleSlug: TheoryModuleSlug;
  locale: "ru" | "ro";
  content: TheoryBoardContent;
  button: string;
  saving: boolean;
  onComplete: () => void;
}) {
  const t = copy[locale];
  const [readCards, setReadCards] = useState<Record<number, boolean>>({});
  const [playingMp3, setPlayingMp3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (content.audioFile) {
      audioRef.current = new Audio(content.audioFile);
      audioRef.current.onended = () => setPlayingMp3(false);
    } else {
      audioRef.current = null;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [content.audioFile]);

  function toggleMp3() {
    if (!audioRef.current) return;
    if (playingMp3) {
      audioRef.current.pause();
      setPlayingMp3(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlayingMp3(true);
    }
  }

  function toggleRead(index: number) {
    setReadCards((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  const icons = MODULE_CARD_ICONS[moduleSlug];
  const readCount = content.cards.reduce((sum, _, idx) => sum + (readCards[idx] ? 1 : 0), 0);
  const allRead = readCount === content.cards.length && content.cards.length > 0;

  const rows: number[][] = [];
  for (let i = 0; i < content.cards.length; i += 2) {
    rows.push(i + 1 < content.cards.length ? [i, i + 1] : [i]);
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.12),rgba(11,26,58,0.88))] p-5 shadow-[0_12px_36px_rgba(0,217,255,0.08)] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-neon/15 blur-2xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon/45 bg-neon/15 px-3.5 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
            <Compass className="size-4" aria-hidden="true" />
            {t.mapBadge}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-sm font-bold transition ${
              allRead
                ? "border-success/60 bg-success/20 text-success shadow-[0_0_18px_rgba(34,197,94,0.22)]"
                : "border-gold/45 bg-gold/15 text-gold"
            }`}
          >
            {allRead ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            {allRead ? t.allDone : `${t.studied}: ${readCount}/${content.cards.length}`}
          </span>
        </div>

        <p className="relative mt-4 text-base font-medium leading-relaxed text-foreground sm:text-lg">
          {content.lead}
        </p>

        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t.tapHint}</p>
          {content.audioText && content.audioFile && (
            <button
              type="button"
              onClick={toggleMp3}
              className="focus-ring group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-2xl border-2 border-neon/45 bg-slate-900/90 px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-neon hover:bg-slate-800"
            >
              {playingMp3 ? (
                <Volume2 className="size-5 animate-pulse text-neon" aria-hidden="true" />
              ) : (
                <Play className="size-5 text-neon transition-transform group-hover:scale-110" aria-hidden="true" />
              )}
              <span>{content.audioText}</span>
            </button>
          )}
        </div>
      </div>

      <DownFlowArrow active={Boolean(readCards[0])} />

      <div>
        {rows.map((row, rowIndex) => {
          const isPair = row.length === 2;
          const nextRow = rows[rowIndex + 1];
          const pairLeftRead = Boolean(readCards[row[0]]);
          const rowEndRead = Boolean(readCards[row[row.length - 1]]);

          return (
            <div key={row[0]}>
              {isPair ? (
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
                  <TheoryStepCard
                    card={content.cards[row[0]]}
                    index={row[0]}
                    icon={icons[row[0]] ?? Sparkles}
                    isRead={Boolean(readCards[row[0]])}
                    onToggle={() => toggleRead(row[0])}
                    locale={locale}
                  />

                  <div className="flex items-center justify-center" aria-hidden="true">
                    <div className="md:hidden">
                      <DownFlowArrow active={pairLeftRead} />
                    </div>
                    <div className="hidden items-center px-1.5 md:flex">
                      <span className={`h-0.5 w-3 rounded-full ${pairLeftRead ? "bg-success/75" : "bg-neon/45"}`} />
                      <span
                        className={`grid size-9 place-items-center rounded-full border transition-colors ${
                          pairLeftRead
                            ? "border-success/65 bg-success/15 text-success shadow-[0_0_16px_rgba(34,197,94,0.28)]"
                            : "border-neon/45 bg-neon/10 text-neon shadow-[0_0_16px_rgba(0,217,255,0.2)]"
                        }`}
                      >
                        <ArrowRight className="size-4" />
                      </span>
                      <span className={`h-0.5 w-3 rounded-full ${pairLeftRead ? "bg-success/75" : "bg-neon/45"}`} />
                    </div>
                  </div>

                  <TheoryStepCard
                    card={content.cards[row[1]]}
                    index={row[1]}
                    icon={icons[row[1]] ?? Sparkles}
                    isRead={Boolean(readCards[row[1]])}
                    onToggle={() => toggleRead(row[1])}
                    locale={locale}
                  />
                </div>
              ) : (
                <div className="mx-auto max-w-xl">
                  <TheoryStepCard
                    card={content.cards[row[0]]}
                    index={row[0]}
                    icon={icons[row[0]] ?? Sparkles}
                    isRead={Boolean(readCards[row[0]])}
                    onToggle={() => toggleRead(row[0])}
                    locale={locale}
                  />
                </div>
              )}

              {nextRow && <RowSnakeConnector toCenter={nextRow.length === 1} active={rowEndRead} />}
            </div>
          );
        })}
      </div>

      {content.notes && content.notes.length > 0 && (
        <>
          <DownFlowArrow active={allRead} />
          <div className="rounded-3xl border-2 border-gold/40 bg-gold/[0.06] p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-gold/45 bg-gold/15 text-gold">
                <Lightbulb className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-black text-gold sm:text-xl">{t.notesTitle}</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {content.notes.map((note, idx) => {
                const NoteIcon = NOTE_ICONS[idx % NOTE_ICONS.length];
                return (
                  <article
                    key={note}
                    className={`flex items-start gap-3 rounded-2xl border border-gold/25 bg-background/55 p-4 text-sm leading-relaxed text-foreground sm:text-base ${
                      content.notes && content.notes.length % 2 === 1 && idx === content.notes.length - 1
                        ? "sm:col-span-2"
                        : ""
                    }`}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                      <NoteIcon className="size-4" aria-hidden="true" />
                    </span>
                    <p>{note}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </>
      )}

      {content.recovery && (
        <>
          <DownFlowArrow active={allRead} />
          <article className="rounded-3xl border-2 border-amber-400/45 bg-amber-500/[0.08] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-amber-400/50 bg-amber-400/15 text-amber-300">
                <LifeBuoy className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-black text-amber-200 sm:text-xl">
                {content.recoveryTitle ?? t.recoveryFallbackTitle}
              </h3>
            </div>
            <p className="mt-3 text-base leading-relaxed text-foreground">{content.recovery}</p>
          </article>
        </>
      )}

      <DownFlowArrow active={allRead} />

      <div className="relative overflow-hidden rounded-3xl border-2 border-neon/65 bg-[linear-gradient(135deg,rgba(0,217,255,0.16),rgba(34,197,94,0.12),rgba(6,18,46,0.92))] p-6 shadow-[0_0_38px_rgba(0,217,255,0.16)] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full bg-success/15 blur-2xl"
        />
        <span className="relative inline-flex items-center gap-2 rounded-full border border-neon/50 bg-neon/15 px-3.5 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
          <ShieldCheck className="size-4" aria-hidden="true" />
          {t.goldenRule}
        </span>
        <p className="relative mt-4 text-lg font-bold leading-relaxed text-foreground sm:text-xl">{content.rule}</p>
      </div>

      <ActionButton disabled={saving} onClick={onComplete}>
        {button}
      </ActionButton>
    </div>
  );
}
