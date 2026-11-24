"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { retryLabels } from "./retry-labels";

const SPARKS = [
  { x: -64, y: -42, color: "text-gold" },
  { x: -30, y: -62, color: "text-neon" },
  { x: 0, y: -68, color: "text-success" },
  { x: 34, y: -60, color: "text-gold" },
  { x: 64, y: -40, color: "text-pink-400" },
  { x: -66, y: 12, color: "text-success" },
  { x: 66, y: 14, color: "text-neon" },
] as const;

export function RetryAnswerFeedback({
  locale,
  correct,
  explanation,
  nextLabel,
  onNext,
  disabled,
}: {
  locale: "ru" | "ro";
  correct: boolean;
  explanation: string;
  nextLabel: string;
  onNext: () => void;
  disabled: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const heading = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reducedMotion ? { opacity: 1 } : correct ? { scale: 0.9, opacity: 0, y: 12 } : { opacity: 0 }}
      animate={
        reducedMotion
          ? { opacity: 1 }
          : correct
            ? { scale: 1, opacity: 1, y: 0 }
            : { x: [0, -12, 12, -8, 8, -4, 4, 0], opacity: 1 }
      }
      transition={correct ? { type: "spring", stiffness: 320, damping: 22 } : { duration: 0.45 }}
      className={`relative mt-4 overflow-hidden rounded-3xl border-2 p-5 ${
        correct
          ? "border-success/75 bg-success/10 shadow-[0_0_28px_rgba(34,197,94,0.2)]"
          : "border-danger/75 bg-danger/10 shadow-[0_0_28px_rgba(244,63,94,0.2)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative grid size-12 shrink-0 place-items-center">
          {!reducedMotion && correct && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              {SPARKS.map((spark, idx) => (
                <motion.span
                  key={idx}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: spark.x, y: spark.y, scale: [0, 1.15, 0.7], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`absolute ${spark.color}`}
                >
                  {idx % 2 === 0 ? <Star className="size-3.5 fill-current" /> : <Sparkles className="size-3.5" />}
                </motion.span>
              ))}
            </span>
          )}
          <span
            className={`grid size-12 place-items-center rounded-2xl border-2 ${
              correct
                ? "border-success bg-success/20 text-success"
                : "border-danger bg-danger/20 text-danger"
            }`}
          >
            {correct ? <CheckCircle2 aria-hidden="true" className="size-6" /> : <AlertTriangle aria-hidden="true" className="size-6" />}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p
            ref={heading}
            tabIndex={-1}
            className={`focus-ring font-display text-xl font-black ${correct ? "text-success" : "text-danger"}`}
          >
            {correct ? retryLabels[locale].correct : retryLabels[locale].wrong}
          </p>
          <p className="mt-1.5 text-base leading-relaxed text-foreground">{explanation}</p>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onNext}
        disabled={disabled}
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        className="focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-6 py-3 text-base font-black text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.28)] disabled:opacity-60"
      >
        {nextLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
}
