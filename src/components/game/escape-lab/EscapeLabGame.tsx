"use client";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Lightbulb,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { setSoundEnabled } from "@/features/sound/sound-settings";
import { useSoundEnabled } from "@/features/sound/use-sound-enabled";
import { STREET_STARS, type MissionId } from "./city-map-data";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";
import { Room1HiddenOffice } from "./room1-hidden-office";
import { Room2CircuitPuzzle } from "./room2-circuit-puzzle";
import { Room3VirusAction } from "./room3-virus-action";
import { Room4BossEscape } from "./room4-boss-escape";

const RetroCityCanvas = dynamic(
  () => import("./RetroCityCanvas").then((mod) => mod.RetroCityCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[420px] place-items-center rounded-3xl border-2 border-neon/35 bg-slate-950/90 text-base font-bold text-neon sm:h-[500px]">
        Phaser 3...
      </div>
    ),
  },
);

const DetectivePlatformer = dynamic(
  () => import("./DetectivePlatformer").then((mod) => mod.DetectivePlatformer),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[380px] place-items-center rounded-3xl border-2 border-neon/35 bg-slate-950/90 text-base font-bold text-neon">
        Phaser 3...
      </div>
    ),
  },
);

type BestRecord = { stars: number; seconds: number };

const STORAGE_KEY = "infoquest.escapeLab.best.v1";
const START_POS = { x: 630, y: 475 };

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function EscapeLabGame({ locale }: { locale: EscapeLocale }) {
  const reducedMotion = useReducedMotion();
  const soundEnabled = useSoundEnabled();
  const t = escapeLabCopy[locale];

  const [screen, setScreen] = useState<"start" | "playing" | "victory">("start");
  const [activeMission, setActiveMission] = useState<MissionId | null>(null);
  const [missionPhase, setMissionPhase] = useState<"platformer" | "puzzle">("platformer");
  const [completedMissions, setCompletedMissions] = useState<Set<MissionId>>(() => new Set());
  const [collectedStars, setCollectedStars] = useState<Set<string>>(() => new Set());
  const [cityToast, setCityToast] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintSignal, setHintSignal] = useState(0);
  const [secrets, setSecrets] = useState(0);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(() => ({ ...START_POS }));
  const [bestRecord, setBestRecord] = useState<BestRecord | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BestRecord;
      if (typeof parsed.stars === "number" && typeof parsed.seconds === "number") {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (screen !== "playing") return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  const bossUnlocked =
    completedMissions.has(1) && completedMissions.has(2) && completedMissions.has(3);

  const handlePlayerMove = useCallback((pos: { x: number; y: number }) => {
    setPlayerPos(pos);
  }, []);

  const handleCollectStar = useCallback((starId: string) => {
    setCollectedStars((prev) => {
      if (prev.has(starId)) return prev;
      const next = new Set(prev);
      next.add(starId);
      return next;
    });
  }, []);

  const handleStartMission = useCallback((id: MissionId) => {
    setHintSignal(0);
    setCityToast(null);
    setMissionPhase("platformer");
    setActiveMission(id);
  }, []);

  const handleBossLockedHit = useCallback(() => {
    setCityToast(escapeLabCopy[locale].city.bossLocked);
  }, [locale]);

  function startNewGame() {
    setPlayerPos({ ...START_POS });
    setActiveMission(null);
    setMissionPhase("platformer");
    setCompletedMissions(new Set());
    setCollectedStars(new Set());
    setCityToast(null);
    setSeconds(0);
    setHintsUsed(0);
    setHintSignal(0);
    setSecrets(0);
    setScreen("playing");
  }

  function finishGame() {
    const earnedStars = hintsUsed <= 1 && seconds <= 300 ? 3 : hintsUsed <= 3 ? 2 : 1;
    setActiveMission(null);
    setScreen("victory");
    const nextRecord: BestRecord =
      !bestRecord ||
      earnedStars > bestRecord.stars ||
      (earnedStars === bestRecord.stars && seconds < bestRecord.seconds)
        ? { stars: earnedStars, seconds }
        : bestRecord;
    setBestRecord(nextRecord);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));
    } catch {
      // Ignore storage failures in restricted browsers.
    }
  }

  function completeMission(id: MissionId) {
    const nextCompleted = new Set(completedMissions);
    nextCompleted.add(id);
    setCompletedMissions(nextCompleted);
    setHintSignal(0);

    if (id === 4) {
      finishGame();
      return;
    }

    setActiveMission(null);
    const allThreeDone = nextCompleted.has(1) && nextCompleted.has(2) && nextCompleted.has(3);
    setCityToast(allThreeDone ? t.city.bossUnlockedToast : t.city.missionCompleteToast);
  }

  function triggerHint() {
    setHintsUsed((h) => h + 1);
    setHintSignal((s) => s + 1);
  }

  const finalStars = hintsUsed <= 1 && seconds <= 300 ? 3 : hintsUsed <= 3 ? 2 : 1;
  const totalBonusStars = collectedStars.size + secrets;
  const maxBonusStars = STREET_STARS.length + 1;

  if (screen === "start") {
    return (
      <div className="overflow-hidden rounded-3xl border-2 border-neon/40 bg-[radial-gradient(circle_at_50%_0%,rgba(0,217,255,0.16),rgba(6,14,34,0.96)_65%)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3.5 py-1 font-display text-sm font-black uppercase tracking-wider text-gold">
            <Sparkles className="size-4" aria-hidden="true" />
            {t.badge}
          </span>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/75 px-3.5 text-sm font-bold text-foreground transition hover:border-neon/60"
          >
            {soundEnabled ? (
              <Volume2 className="size-4 text-neon" aria-hidden="true" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            {soundEnabled ? t.soundOn : t.soundOff}
          </button>
        </div>

        <div className="mt-6 text-center">
          <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.roomCards.map((card, idx) => (
            <article
              key={card.title}
              className="rounded-2xl border border-neon/25 bg-slate-950/75 p-4 text-left"
            >
              <span className="inline-grid size-9 place-items-center rounded-xl border border-neon/40 bg-neon/15 font-display text-base font-black text-neon">
                {idx + 1}
              </span>
              <h3 className="mt-3 font-display text-base font-black text-foreground">
                {card.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
            </article>
          ))}
        </div>

        {bestRecord && (
          <div className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-bold text-gold">
            <Trophy className="size-5" aria-hidden="true" />
            <span>
              {t.bestRecord}: {bestRecord.stars}/3 ★ · {formatClock(bestRecord.seconds)}
            </span>
          </div>
        )}

        <div className="mt-7 flex justify-center">
          <motion.button
            type="button"
            onClick={startNewGame}
            whileHover={reducedMotion ? undefined : { scale: 1.04, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className="focus-ring inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-neon px-9 font-display text-lg font-black text-primary-foreground shadow-[0_0_32px_rgba(0,217,255,0.4)]"
          >
            <Play className="size-5 fill-current" aria-hidden="true" />
            {t.startBtn}
          </motion.button>
        </div>
      </div>
    );
  }

  if (screen === "victory") {
    return (
      <motion.div
        initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-3xl border-4 border-success/75 bg-[linear-gradient(155deg,rgba(34,197,94,0.2),rgba(0,217,255,0.12),rgba(8,18,40,0.97))] p-6 text-center shadow-[0_0_50px_rgba(34,197,94,0.25)] sm:p-10"
      >
        <span className="mx-auto grid size-24 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_34px_rgba(255,209,102,0.4)]">
          <Trophy className="size-12" aria-hidden="true" />
        </span>

        <h2 className="mt-5 font-display text-3xl font-black text-success sm:text-4xl">
          {t.victoryTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-base font-semibold text-foreground sm:text-lg">
          {t.victorySubtitle}
        </p>

        <div
          className="mt-5 flex justify-center gap-2"
          aria-label={`${t.starsLabel}: ${finalStars}/3`}
        >
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`size-10 ${
                n <= finalStars
                  ? "fill-gold text-gold drop-shadow-[0_0_12px_rgba(255,209,102,0.5)]"
                  : "text-slate-600"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-slate-950/75 p-3">
            <p className="text-sm text-muted-foreground">{t.timeLabel}</p>
            <p className="mt-1 font-display text-xl font-black text-neon tabular-nums">
              {formatClock(seconds)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-950/75 p-3">
            <p className="text-sm text-muted-foreground">{t.hintsUsedLabel}</p>
            <p className="mt-1 font-display text-xl font-black text-gold">{hintsUsed}</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-950/75 p-3">
            <p className="text-sm text-muted-foreground">{t.secretsLabel}</p>
            <p className="mt-1 font-display text-xl font-black text-success">
              {totalBonusStars}/{maxBonusStars} ★
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={startNewGame}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-7 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.35)]"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t.replayBtn}
          </button>
          <Link
            href={`/${locale}/modules/operator-call`}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl border border-neon/45 bg-neon/10 px-6 text-base font-bold text-neon"
          >
            {t.backToModules}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Game HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neon/35 bg-card/85 p-3.5 backdrop-blur sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {activeMission !== null ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveMission(null);
                  setMissionPhase("platformer");
                  setHintSignal(0);
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-neon/45 bg-neon/10 px-4 text-sm font-black text-neon transition hover:bg-neon/20"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t.city.backToCity}
              </button>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-black ${
                  missionPhase === "platformer"
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-success/60 bg-success/15 text-success"
                }`}
              >
                {t.platformer.phase1Label}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-black ${
                  missionPhase === "puzzle"
                    ? "border-neon bg-neon/20 text-neon"
                    : "border-border bg-slate-950/60 text-muted-foreground"
                }`}
              >
                {t.platformer.phase2Label}
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-neon/40 bg-neon/10 px-3.5 py-2 text-sm font-black text-neon">
                <MapPin className="size-4" aria-hidden="true" />
                {t.city.missionsDone}: {completedMissions.size}/4
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-gold/45 bg-gold/10 px-3.5 py-2 text-sm font-black text-gold">
                <Star className="size-4 fill-gold" aria-hidden="true" />
                {t.city.streetStars}: {collectedStars.size}/{STREET_STARS.length}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-950/75 px-3 py-2 font-mono text-sm font-black text-foreground tabular-nums">
            <Clock className="size-4 text-neon" aria-hidden="true" />
            {formatClock(seconds)}
          </span>
          {activeMission !== null && (
            <button
              type="button"
              onClick={triggerHint}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-gold/55 bg-gold/15 px-3.5 text-sm font-black text-gold transition hover:bg-gold/25"
            >
              <Lightbulb className="size-4" aria-hidden="true" />
              {t.hintBtn}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? t.soundOn : t.soundOff}
            className="focus-ring grid size-11 place-items-center rounded-xl border border-border bg-slate-950/75 text-foreground transition hover:border-neon/60"
          >
            {soundEnabled ? (
              <Volume2 className="size-4 text-neon" aria-hidden="true" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* City Toast Banner */}
      {activeMission === null && cityToast && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-black ${
            bossUnlocked
              ? "border-gold/65 bg-gold/15 text-gold"
              : "border-success/55 bg-success/15 text-success"
          }`}
        >
          <span>{cityToast}</span>
          <button
            type="button"
            onClick={() => setCityToast(null)}
            className="focus-ring rounded-lg px-2 py-1 text-sm font-black opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Free-Roam Retro Top-Down City OR Active Character Mini-Mission */}
      {activeMission === null ? (
        <RetroCityCanvas
          locale={locale}
          completedMissions={completedMissions}
          collectedStars={collectedStars}
          bossUnlocked={bossUnlocked}
          initialPlayerPos={playerPos}
          onPlayerMove={handlePlayerMove}
          onCollectStar={handleCollectStar}
          onStartMission={handleStartMission}
          onBossLockedHit={handleBossLockedHit}
        />
      ) : missionPhase === "platformer" ? (
        <DetectivePlatformer
          key={`plat-${activeMission}`}
          locale={locale}
          missionId={activeMission}
          hintSignal={hintSignal}
          onComplete={() => {
            setHintSignal(0);
            setMissionPhase("puzzle");
          }}
        />
      ) : (
        <>
          {activeMission === 1 && (
            <Room1HiddenOffice
              locale={locale}
              hintSignal={hintSignal}
              onFindSecret={() => setSecrets((s) => Math.min(1, s + 1))}
              onSolved={() => completeMission(1)}
            />
          )}
          {activeMission === 2 && (
            <Room2CircuitPuzzle
              locale={locale}
              hintSignal={hintSignal}
              onSolved={() => completeMission(2)}
            />
          )}
          {activeMission === 3 && (
            <Room3VirusAction
              locale={locale}
              hintSignal={hintSignal}
              onSolved={() => completeMission(3)}
            />
          )}
          {activeMission === 4 && (
            <Room4BossEscape
              locale={locale}
              hintSignal={hintSignal}
              onSolved={() => completeMission(4)}
            />
          )}
        </>
      )}
    </div>
  );
}
