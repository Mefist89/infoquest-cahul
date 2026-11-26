"use client";

import { Check, Pause, Play, Send, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { OperatorLocale } from "@/data/operator-call";
import { PhoneFrame } from "./phone-frame";
import { accessibilityText } from "./stage-support";

const battleCopy = {
  ru: {
    blitzHeader: "Срочный чат · Блиц",
    blitzStatus: "ответь быстро",
    bossHeader: "Тень · Атака",
    bossStatus: "пытается обмануть тебя",
    chooseReply: "Выбери безопасный ответ:",
  },
  ro: {
    blitzHeader: "Chat urgent · Blitz",
    blitzStatus: "răspunde rapid",
    bossHeader: "Umbra · Atac",
    bossStatus: "încearcă să te păcălească",
    chooseReply: "Alege răspunsul sigur:",
  },
} as const;

export function FinalPhase2Phone({
  locale,
  currentLevel,
  totalLevels,
  text,
  options,
  noTimer,
  blitzTimeLeft,
  blitzPaused,
  shakeKey,
  onTogglePause,
  onSelect,
}: {
  locale: OperatorLocale;
  currentLevel: number;
  totalLevels: number;
  text: string;
  options: readonly string[];
  noTimer: boolean;
  blitzTimeLeft: number;
  blitzPaused: boolean;
  shakeKey: number;
  onTogglePause: () => void;
  onSelect: (index: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const a11y = accessibilityText[locale];
  const t = battleCopy[locale];

  return (
    <PhoneFrame shakeKey={shakeKey} tone={blitzTimeLeft <= 3 && !noTimer ? "danger" : "neutral"} maxWidthClass="max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900/95 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-gold/60 bg-gold/15 text-gold">
            <Zap className="size-5" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="font-display text-sm font-black text-foreground">{t.blitzHeader}</p>
            <p className="text-sm text-gold">{currentLevel + 1}/{totalLevels} · {t.blitzStatus}</p>
          </div>
        </div>

        {!noTimer && (
          <div className="flex items-center gap-2">
            <span
              role="timer"
              aria-label={`${blitzTimeLeft} ${locale === "ru" ? "секунд" : "secunde"}`}
              className={`rounded-xl border px-3 py-1 text-xl font-black tabular-nums ${
                blitzTimeLeft <= 3 ? "animate-pulse border-danger bg-danger/15 text-danger" : "border-gold/50 bg-gold/10 text-gold"
              }`}
            >
              0:{blitzTimeLeft.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={onTogglePause}
              aria-pressed={blitzPaused}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl border border-gold/40 bg-background/50 px-3 text-sm font-bold text-foreground"
            >
              {blitzPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              {blitzPaused ? a11y.resume : a11y.pause}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`p2-${currentLevel}`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="rounded-3xl rounded-tl-md border-2 border-gold/45 bg-slate-900/95 p-4 text-left shadow-lg sm:p-5"
          >
            <p className="text-lg font-black leading-snug text-foreground sm:text-xl">{text}</p>
            <p className="mt-2 text-right text-sm text-muted-foreground">12:46</p>
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 mb-2.5 text-sm font-bold text-neon">{t.chooseReply}</p>
        <div className="grid gap-2.5">
          {options.map((opt, idx) => (
            <motion.button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              whileHover={reducedMotion ? undefined : { scale: 1.015, x: 2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              className="focus-ring group flex min-h-14 min-w-11 items-center gap-3 rounded-2xl border-2 border-border bg-card/85 px-4 py-3 text-left text-base font-semibold text-foreground transition hover:border-gold/70 hover:bg-gold/10"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-gold/45 bg-gold/15 font-display text-sm font-black text-gold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              <Send className="size-4 shrink-0 text-muted-foreground transition group-hover:text-gold" aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

export function FinalPhase3Phone({
  locale,
  currentLevel,
  totalLevels,
  bossText,
  options,
  bossSelected,
  shakeKey,
  onSelect,
}: {
  locale: OperatorLocale;
  currentLevel: number;
  totalLevels: number;
  bossText: string;
  options: readonly string[];
  bossSelected: ReadonlySet<number>;
  shakeKey: number;
  onSelect: (index: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const a11y = accessibilityText[locale];
  const t = battleCopy[locale];

  return (
    <PhoneFrame shakeKey={shakeKey} tone="danger" maxWidthClass="max-w-xl">
      <div className="flex items-center justify-between gap-3 border-b border-danger/30 bg-slate-900/95 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-danger bg-danger/20 text-danger shadow-[0_0_18px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="font-display text-base font-black text-danger">{t.bossHeader}</p>
            <p className="text-sm text-muted-foreground">{t.bossStatus}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-danger/50 bg-danger/15 px-3 py-1 font-display text-sm font-black text-danger">
          <Sparkles className="size-4" aria-hidden="true" />
          {currentLevel + 1}/{totalLevels}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`p3-${currentLevel}`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="rounded-3xl rounded-tl-md border-2 border-danger/60 bg-danger/15 p-4 text-left shadow-lg sm:p-5"
          >
            <p className="text-lg font-black leading-snug text-foreground sm:text-xl">«{bossText}»</p>
            <p className="mt-2 text-right text-sm text-muted-foreground">12:47</p>
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 mb-2.5 text-sm font-bold text-neon">{t.chooseReply}</p>
        <div className="grid gap-2.5">
          {options.map((opt, idx) => {
            const isPicked = bossSelected.has(idx);
            return (
              <motion.button
                key={idx}
                type="button"
                aria-pressed={isPicked}
                onClick={() => onSelect(idx)}
                whileHover={reducedMotion ? undefined : { scale: 1.015, x: 2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                className={`focus-ring flex min-h-14 min-w-11 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition ${
                  isPicked
                    ? "border-success bg-success/20 text-success shadow-[0_0_16px_rgba(34,197,94,0.28)]"
                    : "border-danger/30 bg-card/85 text-foreground hover:border-neon/65 hover:bg-neon/10"
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-xl border font-display text-sm font-black ${
                    isPicked ? "border-success bg-success text-slate-950" : "border-neon/40 bg-neon/10 text-neon"
                  }`}
                >
                  {isPicked ? <Check className="size-4 stroke-[3]" aria-hidden="true" /> : String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isPicked && <span className="text-sm font-black uppercase text-success">{a11y.selected}</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
