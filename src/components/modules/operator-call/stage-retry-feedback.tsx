"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Sparkles, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { OperatorLocale } from "@/data/operator-call";
import type { RetryFeedback } from "@/features/modules/runner/retry-progress";

const SPARKS = [
  { x: -72, y: -48, color: "text-gold" },
  { x: -38, y: -74, color: "text-neon" },
  { x: 0, y: -82, color: "text-success" },
  { x: 42, y: -72, color: "text-gold" },
  { x: 74, y: -44, color: "text-pink-400" },
  { x: -78, y: 12, color: "text-success" },
  { x: 78, y: 14, color: "text-neon" },
  { x: 0, y: 66, color: "text-amber-300" },
] as const;

export function StageRetryFeedback({
  locale,
  feedback,
  retry = false,
  onContinue,
}: {
  locale: OperatorLocale;
  feedback: RetryFeedback;
  retry?: boolean;
  onContinue: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
  }, [feedback]);

  const correctLabel = locale === "ru" ? "Молодец! Верно!" : "Bravo! Corect!";
  const wrongLabel = locale === "ru" ? "Ой! Попался в ловушку!" : "Ups! Ai căzut în capcană!";
  const nextLabel = locale === "ru" ? "Дальше" : "Continuă";
  const retryLabel = locale === "ru" ? "Попробовать ещё раз" : "Încearcă din nou";
  const ok = feedback.correct;

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      initial={reducedMotion ? { opacity: 1 } : ok ? { scale: 0.86, opacity: 0, y: 14 } : { opacity: 0 }}
      animate={
        reducedMotion
          ? { opacity: 1 }
          : ok
            ? { scale: [0.86, 1.03, 1], opacity: 1, y: 0 }
            : { x: [0, -12, 12, -8, 8, -4, 4, 0], opacity: 1 }
      }
      transition={ok ? { type: "spring", stiffness: 320, damping: 22 } : { duration: 0.48 }}
      className={`focus-ring relative w-full overflow-hidden rounded-3xl border-2 p-5 text-center sm:p-6 ${
        ok
          ? "border-success/75 bg-success/10 shadow-[0_0_32px_rgba(34,197,94,0.2)]"
          : "border-danger/75 bg-danger/10 shadow-[0_0_32px_rgba(244,63,94,0.2)]"
      }`}
    >
      <div className="relative mx-auto flex size-16 items-center justify-center">
        {!reducedMotion && ok && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {SPARKS.map((spark, idx) => (
              <motion.span
                key={idx}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: spark.x, y: spark.y, scale: [0, 1.2, 0.7], opacity: [1, 1, 0] }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className={`absolute ${spark.color}`}
              >
                {idx % 2 === 0 ? <Star className="size-4 fill-current" /> : <Sparkles className="size-4" />}
              </motion.span>
            ))}
          </div>
        )}
        <motion.span
          initial={reducedMotion ? false : { scale: 0.6 }}
          animate={reducedMotion ? undefined : ok ? { scale: [0.6, 1.2, 1] } : { rotate: [0, -12, 12, -6, 6, 0], scale: 1 }}
          transition={{ duration: 0.45 }}
          className={`relative grid size-16 place-items-center rounded-full border-2 ${
            ok ? "border-success bg-success/20 text-success" : "border-danger bg-danger/20 text-danger"
          }`}
        >
          {ok ? <CheckCircle2 className="size-8" aria-hidden="true" /> : <AlertTriangle className="size-8" aria-hidden="true" />}
        </motion.span>
      </div>

      <p className={`mt-3 font-display text-xl font-black sm:text-2xl ${ok ? "text-success" : "text-danger"}`}>
        {ok ? correctLabel : wrongLabel}
      </p>
      <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">{feedback.explanation}</p>

      <motion.button
        type="button"
        onClick={onContinue}
        whileHover={reducedMotion ? undefined : { scale: 1.03 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        className="focus-ring mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neon px-6 py-3 text-base font-black text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.28)]"
      >
        {retry ? <RotateCcw className="size-4" aria-hidden="true" /> : null}
        {retry ? retryLabel : nextLabel}
        {!retry ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </motion.button>
    </motion.div>
  );
}
