"use client";

import {
  AlertTriangle,
  ArrowDown,
  Check,
  CheckCircle2,
  ListOrdered,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { retainCorrectOrder, toggleOrderSlot, type OrderSlots } from "@/features/modules/runner/retry-progress";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { playSound } from "@/features/sound/play-sound";
import { retryLabels } from "./retry-labels";

type OrderContent = {
  prompt: string;
  passNote: string;
  yourOrder: string;
  available: string;
  tapToRemove: string;
  successTitle: string;
  failTitle: string;
  resultCount: string;
  steps: readonly { id: string; text: string }[];
};

const SLOT_COLORS = [
  "bg-rose-400 text-slate-950",
  "bg-amber-400 text-slate-950",
  "bg-neon text-slate-950",
  "bg-violet-400 text-slate-950",
  "bg-emerald-400 text-slate-950",
] as const;

const SPARKS = [
  { x: -72, y: -44, color: "text-gold" },
  { x: -34, y: -66, color: "text-neon" },
  { x: 0, y: -74, color: "text-success" },
  { x: 36, y: -64, color: "text-gold" },
  { x: 74, y: -42, color: "text-pink-400" },
  { x: -70, y: 14, color: "text-success" },
  { x: 70, y: 14, color: "text-neon" },
] as const;

const extraCopy = {
  ru: {
    nextHere: "Выбери шаг для этого места",
    emptySlot: "Пустое место",
    inSlot: (n: number) => `Шаг #${n}`,
    readyHint: "Все шаги на месте — нажми «Проверить»!",
  },
  ro: {
    nextHere: "Alege pasul pentru acest loc",
    emptySlot: "Loc liber",
    inSlot: (n: number) => `Pasul #${n}`,
    readyHint: "Toți pașii sunt puși — apasă «Verifică»!",
  },
} as const;

export function RetryOrderStage({
  locale,
  content,
  checkLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: OrderContent;
  checkLabel: string;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const required = useMemo(() => content.steps.map((step) => step.id), [content]);
  const byId = new Map(content.steps.map((step) => [step.id, step]));
  const [slots, setSlots] = useState<OrderSlots>(() => required.map(() => null));
  const [locked, setLocked] = useState<ReadonlySet<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const firstCorrectRef = useRef<number | null>(null);
  const exactPositions = required.filter((id, position) => slots[position] === id).length;
  const pickedCount = slots.filter((id) => id !== null).length;
  const firstEmptySlot = slots.findIndex((id) => id === null);
  const complete = pickedCount === required.length;
  const passed = submitted && exactPositions >= 4;
  const t = retryLabels[locale];
  const ui = extraCopy[locale];

  function toggle(id: string) {
    if (submittedRef.current || saving) return;
    setSlots((previous) => toggleOrderSlot(previous, locked, id));
  }

  function submit() {
    if (saving || submittedRef.current || !complete) return;
    submittedRef.current = true;
    firstCorrectRef.current ??= exactPositions;
    setSubmitted(true);
    if (exactPositions >= 4) {
      playSound("correct");
      onComplete({ correct: firstCorrectRef.current, total: required.length });
    } else {
      playSound("wrong");
    }
  }

  function retry() {
    if (saving || !submittedRef.current || passed) return;
    const next = retainCorrectOrder(slots, required);
    setSlots(next.slots);
    setLocked(next.locked);
    submittedRef.current = false;
    setSubmitted(false);
  }

  return (
    <div>
      <div className="rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(10,22,48,0.88))] p-4 sm:p-5">
        <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">{content.prompt}</p>
        <p className="mt-1.5 text-sm font-semibold text-neon">{content.passNote}</p>
        {locked.size > 0 && (
          <p role="status" className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-success/45 bg-success/15 px-3 py-1 text-sm font-bold text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {t.kept}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/15 px-3 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
            <ListOrdered className="size-4" aria-hidden="true" />
            {content.yourOrder}: {pickedCount}/{required.length}
          </span>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {required.map((stepId, idx) => {
              const filled = slots[idx] !== null;
              return (
                <motion.span
                  key={stepId}
                  animate={reducedMotion ? undefined : filled ? { scale: [0.75, 1.2, 1] } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 18 }}
                  className={`grid size-8 place-items-center rounded-full border-2 font-display text-sm font-black ${
                    locked.has(idx)
                      ? "border-success bg-success/20 text-success"
                      : filled
                        ? "border-neon bg-neon/20 text-neon shadow-[0_0_12px_rgba(0,217,255,0.3)]"
                        : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-neon/30 bg-background/55 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-neon">
            <Sparkles className="size-4" aria-hidden="true" />
            {content.yourOrder} ({pickedCount}/{required.length})
          </p>
          <ol className="mt-4 space-y-1.5">
            {slots.map((id, position) => {
              const isNextTarget = !submitted && position === firstEmptySlot;
              const isLockedSlot = locked.has(position);
              const badgeColor = isLockedSlot
                ? "bg-success text-slate-950"
                : SLOT_COLORS[position % SLOT_COLORS.length];

              return (
                <li key={position}>
                  {id === null ? (
                    <div
                      className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 border-dashed px-3.5 py-3 text-base transition ${
                        isNextTarget
                          ? "border-neon/75 bg-neon/10 text-foreground shadow-[0_0_20px_rgba(0,217,255,0.16)]"
                          : "border-border/80 bg-card/30 text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-xl font-display text-sm font-black ${
                          isNextTarget ? "bg-neon text-slate-950" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {position + 1}
                      </span>
                      <span className="text-sm font-semibold sm:text-base">
                        {isNextTarget ? ui.nextHere : ui.emptySlot}
                      </span>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.button
                        key={`${position}-${id}`}
                        type="button"
                        onClick={() => toggle(id)}
                        disabled={submitted || saving || isLockedSlot}
                        initial={reducedMotion ? false : { scale: 0.9, opacity: 0, x: 16 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 360, damping: 22 }}
                        aria-label={`${position + 1}. ${byId.get(id)?.text}. ${isLockedSlot ? t.correct : content.tapToRemove}`}
                        className={`focus-ring group flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-left text-base font-semibold text-foreground transition ${
                          isLockedSlot
                            ? "border-success/60 bg-success/15"
                            : "border-neon/55 bg-neon/10 hover:border-danger/60 hover:bg-danger/10"
                        }`}
                      >
                        <span className={`grid size-8 shrink-0 place-items-center rounded-xl font-display text-sm font-black shadow-sm ${badgeColor}`} aria-hidden="true">
                          {position + 1}
                        </span>
                        <span className="min-w-0 flex-1 leading-snug">{byId.get(id)?.text}</span>
                        {isLockedSlot ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/20 px-2.5 py-0.5 text-sm font-bold text-success">
                            <Lock className="size-3.5" aria-hidden="true" />
                            {t.correct}
                          </span>
                        ) : (
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-background/60 text-muted-foreground transition group-hover:bg-danger/20 group-hover:text-danger">
                            <X className="size-4" aria-hidden="true" />
                          </span>
                        )}
                      </motion.button>
                    </AnimatePresence>
                  )}

                  {position < required.length - 1 && (
                    <div className="my-1 flex justify-center" aria-hidden="true">
                      <ArrowDown className={`size-4 ${id !== null ? "text-neon" : "text-muted-foreground/40"}`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-3xl border-2 border-border bg-background/55 p-4 sm:p-5">
          <p className="font-display text-sm font-black uppercase tracking-wider text-gold">{content.available}</p>
          <div className="mt-4 grid gap-2.5">
            {[2, 0, 4, 1, 3].map((position) => content.steps[position]).map((step) => {
              const slotIndex = slots.indexOf(step.id);
              const picked = slotIndex !== -1;
              const stepLocked = picked && locked.has(slotIndex);

              return (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => toggle(step.id)}
                  disabled={submitted || saving || stepLocked}
                  aria-pressed={picked}
                  whileHover={reducedMotion || picked || submitted ? undefined : { scale: 1.02, x: -3 }}
                  whileTap={reducedMotion || stepLocked || submitted ? undefined : { scale: 0.97 }}
                  className={`focus-ring flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition ${
                    picked
                      ? "border-border/50 bg-secondary/40 text-muted-foreground"
                      : "border-border bg-card/85 text-foreground shadow-sm hover:border-neon/65 hover:bg-neon/10"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl border ${
                      picked
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-neon/40 bg-neon/10 text-neon"
                    }`}
                    aria-hidden="true"
                  >
                    {picked ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{step.text}</span>
                  {picked && (
                    <span className="shrink-0 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-0.5 text-sm font-bold text-neon">
                      {ui.inSlot(slotIndex + 1)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {complete && !submitted && (
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-success/45 bg-success/15 px-4 py-2.5 text-center text-sm font-bold text-success"
            >
              {ui.readyHint}
            </motion.p>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {!submitted ? (
          <motion.button
            type="button"
            onClick={submit}
            disabled={saving || !complete}
            whileHover={reducedMotion || !complete ? undefined : { scale: 1.03, y: -1 }}
            whileTap={reducedMotion || !complete ? undefined : { scale: 0.96 }}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-7 text-base font-black text-primary-foreground shadow-[0_0_26px_rgba(0,217,255,0.32)] disabled:opacity-50"
          >
            <CheckCircle2 className="size-5" aria-hidden="true" />
            {checkLabel}
          </motion.button>
        ) : (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : passed ? { scale: 0.9, opacity: 0 } : { opacity: 0 }}
            animate={
              reducedMotion
                ? { opacity: 1 }
                : passed
                  ? { scale: 1, opacity: 1 }
                  : { x: [0, -12, 12, -8, 8, -4, 4, 0], opacity: 1 }
            }
            transition={passed ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 0.48 }}
            className={`relative overflow-hidden rounded-3xl border-2 p-6 ${
              passed
                ? "border-success/70 bg-success/10 shadow-[0_0_36px_rgba(34,197,94,0.2)]"
                : "border-danger/70 bg-danger/10 shadow-[0_0_32px_rgba(244,63,94,0.2)]"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative grid size-14 shrink-0 place-items-center">
                {!reducedMotion && passed && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
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
                  </span>
                )}
                <span
                  className={`grid size-14 place-items-center rounded-2xl border-2 ${
                    passed ? "border-gold bg-gold/20 text-gold" : "border-danger bg-danger/20 text-danger"
                  }`}
                >
                  {passed ? <Trophy className="size-7" aria-hidden="true" /> : <AlertTriangle className="size-7" aria-hidden="true" />}
                </span>
              </div>
              <div>
                <p className={`font-display text-xl font-black ${passed ? "text-success" : "text-danger"}`}>
                  {passed ? content.successTitle : content.failTitle}
                </p>
                <p className="mt-0.5 text-base font-bold text-foreground">
                  {content.resultCount.replace("{score}", String(exactPositions))}
                </p>
              </div>
            </div>

            <ol className="mt-5 grid gap-2.5">
              {required.map((id, position) => {
                const hit = slots[position] === id;
                return (
                  <li
                    key={id}
                    className={`rounded-2xl border p-3.5 text-base ${
                      hit ? "border-success/45 bg-success/5" : "border-danger/35 bg-background/50"
                    }`}
                  >
                    <p className={hit ? "font-bold text-success" : "font-bold text-danger"}>
                      {hit ? (
                        <Check className="mr-1.5 inline size-5" aria-hidden="true" />
                      ) : (
                        <X className="mr-1.5 inline size-5" aria-hidden="true" />
                      )}
                      {hit ? t.correct : t.wrong} · {position + 1}
                    </p>
                    <p className="mt-1 text-foreground">{byId.get(id)?.text}</p>
                  </li>
                );
              })}
            </ol>

            {!passed && (
              <motion.button
                type="button"
                onClick={retry}
                disabled={saving}
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground disabled:opacity-60"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                {retryLabel}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
