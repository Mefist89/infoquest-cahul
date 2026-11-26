"use client";

import {
  ArrowRight,
  Bug,
  Flame,
  Heart,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { playSound } from "@/features/sound/play-sound";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";

type TargetKind = "virus" | "star" | "friendly";

type FallingTarget = {
  id: number;
  kind: TargetKind;
  x: number; // 12..88 %
  y: number; // 0..100 %
  speed: number;
};

type PopEffect = {
  id: number;
  x: number;
  y: number;
  text: string;
  tone: "neon" | "gold" | "danger";
};

export function Room3VirusAction({
  locale,
  hintSignal,
  onSolved,
}: {
  locale: EscapeLocale;
  hintSignal: number;
  onSolved: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const t = escapeLabCopy[locale].room3;

  const [phase, setPhase] = useState<"idle" | "playing" | "lost" | "won">("idle");
  const [paused, setPaused] = useState(false);
  const [hp, setHp] = useState(3);
  const [charge, setCharge] = useState(0);
  const [combo, setCombo] = useState(0);
  const [targets, setTargets] = useState<FallingTarget[]>([]);
  const [pops, setPops] = useState<PopEffect[]>([]);
  const nextIdRef = useRef(1);
  const spawnTickRef = useRef(0);

  function addPop(x: number, y: number, text: string, tone: PopEffect["tone"]) {
    const popId = nextIdRef.current++;
    setPops((prev) => [...prev.slice(-6), { id: popId, x, y, text, tone }]);
    window.setTimeout(() => {
      setPops((prev) => prev.filter((item) => item.id !== popId));
    }, 650);
  }

  function startRun() {
    setHp(3);
    setCharge(0);
    setCombo(0);
    setTargets([]);
    setPops([]);
    setPaused(false);
    spawnTickRef.current = 0;
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "playing" || paused) return;

    const interval = window.setInterval(() => {
      spawnTickRef.current += 1;

      setTargets((prev) => {
        const moved: FallingTarget[] = [];
        let damageTaken = 0;
        let friendlyCharge = 0;

        for (const item of prev) {
          const nextY = item.y + item.speed;
          if (nextY >= 90) {
            if (item.kind === "virus") {
              damageTaken += 1;
            } else if (item.kind === "friendly") {
              friendlyCharge += 5;
            }
          } else {
            moved.push({ ...item, y: nextY });
          }
        }

        if (damageTaken > 0) {
          playSound("wrong");
          setCombo(0);
          setHp((currentHp) => {
            const nextHp = Math.max(0, currentHp - damageTaken);
            if (nextHp <= 0) setPhase("lost");
            return nextHp;
          });
        }

        if (friendlyCharge > 0) {
          setCharge((current) => {
            const next = Math.min(100, current + friendlyCharge);
            if (next >= 100) {
              playSound("correct");
              setPhase("won");
            }
            return next;
          });
        }

        if (spawnTickRef.current % 11 === 1 && moved.length < 7) {
          const roll = Math.random();
          const kind: TargetKind = roll < 0.66 ? "virus" : roll < 0.84 ? "star" : "friendly";
          const speed = kind === "star" ? 2.5 : kind === "virus" ? 1.85 + Math.random() * 0.75 : 1.75;
          moved.push({
            id: nextIdRef.current++,
            kind,
            x: 12 + Math.floor(Math.random() * 76),
            y: 4,
            speed,
          });
        }

        return moved;
      });
    }, 80);

    return () => window.clearInterval(interval);
  }, [phase, paused]);

  function hitTarget(target: FallingTarget) {
    if (phase !== "playing" || paused) return;
    setTargets((prev) => prev.filter((item) => item.id !== target.id));

    if (target.kind === "virus") {
      playSound("correct");
      setCombo((c) => c + 1);
      addPop(target.x, target.y, t.virusHit, "neon");
      setCharge((current) => {
        const next = Math.min(100, current + 10);
        if (next >= 100) setPhase("won");
        return next;
      });
    } else if (target.kind === "star") {
      playSound("correct");
      setCombo((c) => c + 1);
      addPop(target.x, target.y, t.starHit, "gold");
      setCharge((current) => {
        const next = Math.min(100, current + 18);
        if (next >= 100) setPhase("won");
        return next;
      });
    } else {
      playSound("wrong");
      setCombo(0);
      addPop(target.x, target.y, t.friendlyHit, "danger");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon/35 bg-slate-950/75 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-black text-neon sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">{t.goal}</p>
        </div>
        {phase === "playing" && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-neon/45 bg-neon/10 px-3.5 text-sm font-bold text-neon"
          >
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            {paused ? t.resume : t.pause}
          </button>
        )}
      </div>

      {hintSignal > 0 && (
        <div className="rounded-2xl border-2 border-gold/60 bg-gold/15 px-4 py-2.5 text-sm font-bold text-gold">
          💡 {t.hintText}
        </div>
      )}

      {/* Action HUD */}
      <div className="grid gap-3 rounded-2xl border border-border bg-slate-950/75 p-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-muted-foreground">{t.shieldLabel}:</span>
          {[0, 1, 2].map((idx) => (
            <Heart
              key={idx}
              className={`size-6 transition-all ${idx < hp ? "fill-success text-success" : "text-slate-700"}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between text-sm font-bold">
            <span className="text-neon">{t.portalLabel}</span>
            <span className="font-display font-black text-foreground">{charge}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon via-sky-300 to-success transition-[width] duration-150"
              style={{ width: `${charge}%` }}
            />
          </div>
        </div>

        <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 font-display text-sm font-black text-gold">
          <Flame className="size-4" aria-hidden="true" />
          {t.comboLabel} ×{combo}
        </span>
      </div>

      {/* Action Arena */}
      <div className="relative h-[24rem] w-full overflow-hidden rounded-3xl border-2 border-neon/45 bg-[radial-gradient(circle_at_50%_100%,rgba(0,217,255,0.22),rgba(6,14,34,0.98)_65%)] select-none sm:h-[26rem]">
        {/* Decorative Laser Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 border-t-2 border-neon/70 bg-gradient-to-t from-neon/20 to-transparent"
        />

        {phase === "idle" && (
          <div className="flex size-full flex-col items-center justify-center p-6 text-center">
            <span className="grid size-20 place-items-center rounded-full border-4 border-neon bg-neon/15 text-neon shadow-[0_0_30px_rgba(0,217,255,0.3)]">
              <Zap className="size-10 fill-current" aria-hidden="true" />
            </span>
            <p className="mt-4 max-w-md text-base font-bold text-foreground sm:text-lg">{t.goal}</p>
            <motion.button
              type="button"
              onClick={startRun}
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              className="focus-ring mt-6 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-neon px-8 text-lg font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.4)]"
            >
              <Play className="size-5 fill-current" aria-hidden="true" />
              {t.startAction}
            </motion.button>
          </div>
        )}

        {phase === "playing" && (
          <>
            {targets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => hitTarget(item)}
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
                aria-label={item.kind}
                className={`focus-ring absolute grid size-14 place-items-center rounded-2xl border-2 shadow-lg transition-transform active:scale-75 sm:size-16 ${
                  item.kind === "virus"
                    ? "border-danger bg-danger/25 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.5)]"
                    : item.kind === "star"
                      ? "border-gold bg-gold/25 text-gold shadow-[0_0_20px_rgba(255,209,102,0.55)]"
                      : "border-success bg-success/20 text-success shadow-[0_0_16px_rgba(34,197,94,0.4)]"
                }`}
              >
                {item.kind === "virus" ? (
                  <Bug className="size-8" aria-hidden="true" />
                ) : item.kind === "star" ? (
                  <Star className="size-8 fill-current" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-8" aria-hidden="true" />
                )}
              </button>
            ))}

            {pops.map((pop) => (
              <motion.span
                key={pop.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -28, scale: 1.25 }}
                transition={{ duration: 0.6 }}
                style={{ left: `${pop.x}%`, top: `${pop.y}%`, transform: "translate(-50%, -50%)" }}
                className={`pointer-events-none absolute font-display text-base font-black ${
                  pop.tone === "gold" ? "text-gold" : pop.tone === "danger" ? "text-danger" : "text-neon"
                }`}
              >
                {pop.text}
              </motion.span>
            ))}
          </>
        )}

        {phase === "lost" && (
          <div className="flex size-full flex-col items-center justify-center bg-slate-950/85 p-6 text-center">
            <p className="font-display text-2xl font-black text-danger">{t.lostTitle}</p>
            <p className="mt-2 max-w-md text-base text-foreground">{t.lostDesc}</p>
            <button
              type="button"
              onClick={startRun}
              className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-danger px-7 text-base font-black text-white"
            >
              <RotateCcw className="size-5" aria-hidden="true" />
              {t.retryAction}
            </button>
          </div>
        )}

        {phase === "won" && (
          <div className="flex size-full flex-col items-center justify-center bg-slate-950/85 p-6 text-center">
            <span className="grid size-20 place-items-center rounded-full border-4 border-success bg-success/20 text-success">
              <Sparkles className="size-10" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-2xl font-black text-success">{t.wonTitle}</p>
            <p className="mt-2 max-w-md text-base text-foreground">{t.wonDesc}</p>
            <motion.button
              type="button"
              onClick={onSolved}
              whileHover={reducedMotion ? undefined : { scale: 1.04 }}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-8 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.4)]"
            >
              {t.nextRoomBtn}
              <ArrowRight className="size-5" aria-hidden="true" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
