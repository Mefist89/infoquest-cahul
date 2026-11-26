"use client";

import {
  CheckCircle2,
  DoorOpen,
  KeyRound,
  Lock,
  LockOpen,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { playSound } from "@/features/sound/play-sound";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";

export function Room4BossEscape({
  locale,
  hintSignal,
  onSolved,
}: {
  locale: EscapeLocale;
  hintSignal: number;
  onSolved: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const t = escapeLabCopy[locale].room4;

  const [activeLock, setActiveLock] = useState<1 | 2 | 3 | 4>(1);

  // Lock 1: Key swap puzzle
  const [pieces, setPieces] = useState<number[]>([2, 0, 3, 1]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  // Lock 2: Spot 3 differences
  const [foundDiffs, setFoundDiffs] = useState<Set<string>>(new Set());

  // Lock 3: Laser timing bar
  const [cursor, setCursor] = useState(12);
  const dirRef = useRef(1);
  const [hits, setHits] = useState(0);
  const [laserMsg, setLaserMsg] = useState<string | null>(null);
  const [laserShake, setLaserShake] = useState(0);

  useEffect(() => {
    if (activeLock !== 3) return;
    const speed = 2.6 + hits * 0.55;
    const interval = window.setInterval(() => {
      setCursor((prev) => {
        let next = prev + dirRef.current * speed;
        if (next >= 96) {
          next = 96;
          dirRef.current = -1;
        } else if (next <= 4) {
          next = 4;
          dirRef.current = 1;
        }
        return next;
      });
    }, 28);
    return () => window.clearInterval(interval);
  }, [activeLock, hits]);

  function tapKeyPiece(idx: number) {
    if (activeLock !== 1) return;
    if (selectedPiece === null) {
      setSelectedPiece(idx);
      return;
    }
    if (selectedPiece === idx) {
      setSelectedPiece(null);
      return;
    }
    const next = [...pieces];
    [next[selectedPiece], next[idx]] = [next[idx], next[selectedPiece]];
    setPieces(next);
    setSelectedPiece(null);
    if (next.every((val, i) => val === i)) {
      playSound("correct");
      window.setTimeout(() => setActiveLock(2), reducedMotion ? 150 : 650);
    }
  }

  function tapDiff(id: string) {
    if (activeLock !== 2 || foundDiffs.has(id)) return;
    const next = new Set(foundDiffs).add(id);
    setFoundDiffs(next);
    playSound("correct");
    if (next.size >= 3) {
      window.setTimeout(() => setActiveLock(3), reducedMotion ? 150 : 750);
    }
  }

  function pressStop() {
    if (activeLock !== 3) return;
    if (cursor >= 35 && cursor <= 65) {
      playSound("correct");
      const nextHits = hits + 1;
      setHits(nextHits);
      setLaserMsg(t.hitMsg);
      if (nextHits >= 3) {
        window.setTimeout(() => setActiveLock(4), reducedMotion ? 150 : 700);
      }
    } else {
      playSound("wrong");
      setLaserMsg(t.missMsg);
      setLaserShake((k) => k + 1);
    }
  }

  const unlockedCount = activeLock - 1;
  const activeHint =
    hintSignal > 0
      ? activeLock === 1
        ? t.lock1Hint
        : activeLock === 2
          ? t.lock2Hint
          : activeLock === 3
            ? t.lock3Hint
            : null
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/45 bg-slate-950/80 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-black text-danger sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">{t.goal}</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((lockNum) => {
            const open = unlockedCount >= lockNum;
            return (
              <span
                key={lockNum}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-black ${
                  open
                    ? "border-success bg-success/20 text-success"
                    : activeLock === lockNum
                      ? "border-neon bg-neon/15 text-neon"
                      : "border-border bg-slate-900 text-muted-foreground"
                }`}
              >
                {open ? <LockOpen className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                {lockNum}
              </span>
            );
          })}
        </div>
      </div>

      {activeHint && (
        <div className="rounded-2xl border-2 border-gold/60 bg-gold/15 px-4 py-2.5 text-sm font-bold text-gold">
          💡 {activeHint}
        </div>
      )}

      {activeLock === 1 && (
        <div className="rounded-3xl border-2 border-neon/45 bg-slate-950/90 p-5 sm:p-6">
          <h3 className="font-display text-xl font-black text-neon">{t.lock1Title}</h3>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.lock1Desc}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pieces.map((partIndex, slotIdx) => {
              const isSelected = selectedPiece === slotIdx;
              const inPlace = partIndex === slotIdx;
              return (
                <motion.button
                  key={`${slotIdx}-${partIndex}`}
                  type="button"
                  onClick={() => tapKeyPiece(slotIdx)}
                  whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  className={`focus-ring flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition ${
                    isSelected
                      ? "border-gold bg-gold/20 text-gold shadow-[0_0_22px_rgba(255,209,102,0.35)]"
                      : inPlace
                        ? "border-success/70 bg-success/15 text-success"
                        : "border-border bg-card/80 text-foreground hover:border-neon/60"
                  }`}
                >
                  <KeyRound className="size-8" aria-hidden="true" />
                  <span className="font-display text-sm font-black">{t.lock1Parts[partIndex]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {activeLock === 2 && (
        <div className="rounded-3xl border-2 border-gold/45 bg-slate-950/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-black text-gold">{t.lock2Title}</h3>
            <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-sm font-black text-gold">
              {t.foundDiffs}: {foundDiffs.size}/3
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.lock2Desc}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Original Pass */}
            <div className="rounded-2xl border-2 border-success/50 bg-slate-900/90 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-success">{t.originalCard}</p>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3">
                  <ShieldCheck className="size-8 text-success" aria-hidden="true" />
                  <span className="font-display text-lg font-black text-foreground">INFOQUEST PASS</span>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-3 font-mono text-base font-bold text-foreground">
                  ID: #707 · AGENT NOVA
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-3 text-base font-bold text-neon">
                  VALID: 2026
                </div>
              </div>
            </div>

            {/* Shadow's Fake Pass (Interactive) */}
            <div className="rounded-2xl border-2 border-danger/55 bg-slate-900/90 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-danger">{t.fakeCard}</p>
              <div className="mt-3 space-y-2.5">
                <button
                  type="button"
                  onClick={() => tapDiff("badge")}
                  className={`focus-ring flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition ${
                    foundDiffs.has("badge")
                      ? "border-success bg-success/20 text-success"
                      : "border-danger/40 bg-danger/10 hover:border-gold"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <ShieldAlert className="size-8 text-danger" aria-hidden="true" />
                    <span className="font-display text-lg font-black text-foreground">INFOQUEST PASS</span>
                  </span>
                  {foundDiffs.has("badge") && <CheckCircle2 className="size-6 shrink-0 text-success" aria-hidden="true" />}
                </button>

                <button
                  type="button"
                  onClick={() => tapDiff("num")}
                  className={`focus-ring flex min-h-14 w-full items-center justify-between rounded-xl border-2 p-3 text-left font-mono text-base font-bold transition ${
                    foundDiffs.has("num")
                      ? "border-success bg-success/20 text-success"
                      : "border-border bg-background/60 text-foreground hover:border-gold"
                  }`}
                >
                  <span>ID: #709 · AGENT NOVA</span>
                  {foundDiffs.has("num") && <CheckCircle2 className="size-6 shrink-0 text-success" aria-hidden="true" />}
                </button>

                <button
                  type="button"
                  onClick={() => tapDiff("year")}
                  className={`focus-ring flex min-h-14 w-full items-center justify-between rounded-xl border-2 p-3 text-left text-base font-bold transition ${
                    foundDiffs.has("year")
                      ? "border-success bg-success/20 text-success"
                      : "border-border bg-background/60 text-neon hover:border-gold"
                  }`}
                >
                  <span>VALID: 2020</span>
                  {foundDiffs.has("year") && <CheckCircle2 className="size-6 shrink-0 text-success" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLock === 3 && (
        <motion.div
          key={`laser-${laserShake}`}
          animate={!reducedMotion && laserShake > 0 ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border-2 border-danger/60 bg-slate-950/90 p-5 text-center sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-black text-danger">{t.lock3Title}</h3>
            <span className="rounded-full border border-success/50 bg-success/15 px-3 py-1 text-sm font-black text-success">
              {t.hitsLabel}: {hits}/3
            </span>
          </div>
          <p className="mt-1 text-left text-sm text-muted-foreground sm:text-base">{t.lock3Desc}</p>

          <div className="relative mx-auto mt-6 h-12 w-full max-w-md overflow-hidden rounded-full border-2 border-slate-600 bg-slate-900">
            {/* Green target zone: 35% to 65% */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[35%] w-[30%] border-x-2 border-success bg-success/30 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            />
            {/* Moving laser dot */}
            <div
              aria-hidden="true"
              style={{ left: `${cursor}%`, transform: "translateX(-50%)" }}
              className="absolute top-1/2 h-9 w-4 -translate-y-1/2 rounded-full bg-neon shadow-[0_0_18px_rgba(0,217,255,0.95)]"
            />
          </div>

          {laserMsg && (
            <p role="status" className="mt-3 text-base font-black text-gold">
              {laserMsg}
            </p>
          )}

          <motion.button
            type="button"
            onClick={pressStop}
            whileTap={reducedMotion ? undefined : { scale: 0.93 }}
            className="focus-ring mt-5 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-neon px-10 font-display text-xl font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.45)]"
          >
            <Zap className="size-6 fill-current" aria-hidden="true" />
            {t.stopBtn}
          </motion.button>
        </motion.div>
      )}

      {activeLock === 4 && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="flex flex-col items-center rounded-3xl border-4 border-success bg-success/15 p-8 text-center shadow-[0_0_45px_rgba(34,197,94,0.3)]"
        >
          <DoorOpen className="size-16 text-success" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl font-black text-foreground">
            {t.locksOpened}: 3/3!
          </p>
          <motion.button
            type="button"
            onClick={() => {
              playSound("correct");
              onSolved();
            }}
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            className="focus-ring mt-6 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-success px-8 font-display text-lg font-black text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            <Sparkles className="size-5" aria-hidden="true" />
            {t.escapeBtn}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
