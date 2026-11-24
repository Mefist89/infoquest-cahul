"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import type { OperatorLocale } from "@/data/operator-call";

const BURST_PARTICLES = [
  { x: -95, y: -62, rotate: -45, color: "text-gold", delay: 0 },
  { x: -62, y: -92, rotate: 25, color: "text-neon", delay: 0.03 },
  { x: 0, y: -104, rotate: 0, color: "text-success", delay: 0.05 },
  { x: 64, y: -90, rotate: -20, color: "text-gold", delay: 0.02 },
  { x: 96, y: -58, rotate: 45, color: "text-pink-400", delay: 0.04 },
  { x: -108, y: 10, rotate: -60, color: "text-success", delay: 0.06 },
  { x: 108, y: 12, rotate: 60, color: "text-neon", delay: 0.05 },
  { x: -72, y: 66, rotate: 35, color: "text-amber-300", delay: 0.07 },
  { x: 74, y: 64, rotate: -35, color: "text-emerald-300", delay: 0.04 },
  { x: -24, y: -82, rotate: 18, color: "text-pink-300", delay: 0.08 },
  { x: 26, y: -84, rotate: -18, color: "text-sky-300", delay: 0.06 },
  { x: 0, y: 78, rotate: 15, color: "text-gold", delay: 0.07 },
] as const;

const feedbackCopy = {
  ru: {
    correctTitle: "Молодец! Верно!",
    wrongTitle: "Ой! Ошибка — запомни!",
    rightVerdict: "Правильный ответ:",
    nextBtn: "Дальше",
    gotItBtn: "Понятно, дальше",
  },
  ro: {
    correctTitle: "Bravo! Corect!",
    wrongTitle: "Ups! Greșeală — reține!",
    rightVerdict: "Răspuns corect:",
    nextBtn: "Continuă",
    gotItBtn: "Am înțeles, continuă",
  },
} as const;

export type ClassifyItem = {
  readonly id: string;
  readonly text: string;
  readonly answer: "safe" | "danger";
  readonly explain: string;
};

export function ClassifyFeedbackCard({
  locale,
  item,
  correct,
  explanation,
  safeLabel,
  dangerLabel,
  onContinue,
}: {
  locale: OperatorLocale;
  item: ClassifyItem;
  correct: boolean;
  explanation: string;
  safeLabel: string;
  dangerLabel: string;
  onContinue: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const t = feedbackCopy[locale];
  const rightAnswerLabel = item.answer === "danger" ? dangerLabel : safeLabel;

  useEffect(() => {
    panelRef.current?.querySelector("button")?.focus();
  }, [item.id, correct]);

  return (
    <motion.div
      ref={panelRef}
      key={`${item.id}-${correct ? "ok" : "err"}`}
      role="status"
      aria-live="polite"
      initial={reducedMotion ? { opacity: 1 } : correct ? { scale: 0.84, opacity: 0, y: 18 } : { scale: 0.96, opacity: 0 }}
      animate={
        reducedMotion
          ? { opacity: 1 }
          : correct
            ? { scale: [0.84, 1.03, 1], opacity: 1, y: 0 }
            : { x: [0, -14, 14, -10, 10, -5, 5, 0], scale: 1, opacity: 1 }
      }
      transition={correct ? { type: "spring", stiffness: 320, damping: 20 } : { duration: 0.52, ease: "easeInOut" }}
      className={`relative w-full max-w-lg overflow-hidden rounded-[2rem] border-4 p-6 text-center shadow-2xl sm:p-7 ${
        correct
          ? "border-success/80 bg-[linear-gradient(155deg,rgba(34,197,94,0.18),rgba(8,22,48,0.97))] shadow-[0_0_46px_rgba(34,197,94,0.28)]"
          : "border-danger/80 bg-[linear-gradient(155deg,rgba(244,63,94,0.18),rgba(20,14,40,0.97))] shadow-[0_0_46px_rgba(244,63,94,0.26)]"
      }`}
    >
      <div className="relative mx-auto flex size-20 items-center justify-center">
        {!reducedMotion && correct && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {BURST_PARTICLES.map((particle, idx) => (
              <motion.span
                key={idx}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{ x: particle.x, y: particle.y, scale: [0, 1.25, 0.7], opacity: [1, 1, 0], rotate: particle.rotate }}
                transition={{ duration: 0.85, delay: particle.delay, ease: "easeOut" }}
                className={`absolute ${particle.color}`}
              >
                {idx % 2 === 0 ? <Star className="size-4 fill-current" /> : <Sparkles className="size-4" />}
              </motion.span>
            ))}
          </div>
        )}

        {!reducedMotion && !correct && (
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.8, opacity: 0.85 }}
            animate={{ scale: 1.65, opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-full border-4 border-danger"
          />
        )}

        <motion.span
          initial={reducedMotion ? false : correct ? { scale: 0, rotate: -140 } : { rotate: 0, scale: 0.85 }}
          animate={
            reducedMotion
              ? undefined
              : correct
                ? { scale: [0, 1.22, 0.94, 1], rotate: 0 }
                : { rotate: [0, -14, 14, -9, 9, 0], scale: [0.85, 1.08, 1] }
          }
          transition={{ duration: 0.55 }}
          className={`relative grid size-20 place-items-center rounded-full border-4 ${
            correct
              ? "border-success bg-success/20 text-success shadow-[0_0_26px_rgba(34,197,94,0.35)]"
              : "border-danger bg-danger/20 text-danger shadow-[0_0_26px_rgba(244,63,94,0.35)]"
          }`}
        >
          {correct ? <CheckCircle2 className="size-10" aria-hidden="true" /> : <AlertTriangle className="size-10" aria-hidden="true" />}
        </motion.span>

        {correct && (
          <motion.span
            aria-hidden="true"
            initial={reducedMotion ? false : { y: 12, opacity: 0, scale: 0.6 }}
            animate={{ y: -6, opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="absolute -right-6 -top-2 inline-flex items-center gap-1 rounded-full border border-gold/60 bg-gold/20 px-2.5 py-0.5 font-display text-sm font-black text-gold shadow-md"
          >
            +1 ★
          </motion.span>
        )}
      </div>

      <p className={`mt-4 font-display text-2xl font-black sm:text-3xl ${correct ? "text-success" : "text-danger"}`}>
        {correct ? t.correctTitle : t.wrongTitle}
      </p>

      {!correct && (
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold/15 px-3.5 py-1 text-sm font-bold text-gold">
          {t.rightVerdict} <span className="font-black text-foreground">{rightAnswerLabel}</span>
        </p>
      )}

      <p className="mt-4 rounded-2xl border border-border/80 bg-background/55 px-4 py-3 text-base font-bold leading-relaxed text-foreground/95">
        «{item.text}»
      </p>

      <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">{explanation}</p>

      <motion.button
        type="button"
        onClick={onContinue}
        whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neon px-7 py-3 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.3)]"
      >
        {correct ? t.nextBtn : t.gotItBtn}
        <ArrowRight className="size-5" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
}
