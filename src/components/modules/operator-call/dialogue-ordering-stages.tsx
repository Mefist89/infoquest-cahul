"use client";

import { Check, Pause, Play, ShieldAlert, Sparkles, Trophy, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";
import { TimerGameStart } from "../shared/timer-setting";
import { DialogueStage } from "./dialogue-stage";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

function OrderingStage({
  locale,
  content,
  check,
  retry,
  saving,
  feedback,
  onSubmit,
}: {
  locale: OperatorLocale;
  content: (typeof operatorCallContent)["ru"]["ordering"] | (typeof operatorCallContent)["ro"]["ordering"];
  check: string;
  retry: string;
  saving: boolean;
  feedback: { score: number } | null;
  onSubmit: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const noTimer = useNoTimer();
  const [started, setStarted] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "failed" | "won">("playing");
  const [timeLeft, setTimeLeft] = useState<number>(() => content.levels[0]?.time ?? 0);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const levelPanelRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [orderedOk, setOrderedOk] = useState(0);
  const [orderedWrong, setOrderedWrong] = useState(0);
  const [shuffledSteps, setShuffledSteps] = useState<{ id: string; text: string }[]>(() =>
    [...(content.levels[0]?.steps ?? [])].sort(() => Math.random() - 0.5),
  );
  const [flashError, setFlashError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const level = content.levels?.[currentLevelIndex];

  useEffect(() => {
    if (!started || noTimer || status !== "playing" || !level || paused) return;

    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        setStatus("failed");
        setAnnouncement(`${a11y.wrong}. ${content.fail}`);
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [a11y.wrong, content.fail, paused, status, timeLeft, level, started, noTimer]);

  useEffect(() => {
    if (status === "failed" || !level) statusRef.current?.focus();
    else levelPanelRef.current?.focus();
  }, [currentLevelIndex, level, status, started]);

  if (!started) return <TimerGameStart locale={locale} onStart={() => setStarted(true)} />;

  if (!level) {
    return (
      <motion.div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        initial={reducedMotion ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="focus-ring mx-auto flex max-w-lg flex-col items-center rounded-[2rem] border-4 border-success/70 bg-[linear-gradient(155deg,rgba(34,197,94,0.18),rgba(0,217,255,0.12),rgba(8,22,48,0.96))] p-8 text-center shadow-[0_0_40px_rgba(34,197,94,0.2)]"
      >
        <span className="grid size-20 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_26px_rgba(255,209,102,0.3)]">
          <Trophy className="size-10" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-2xl font-black text-foreground">{content.win}</p>
        {feedback && <ScoreFeedback score={feedback.score} />}
        <div className="mt-6 w-full">
          <ActionButton disabled={saving} onClick={() => onSubmit({ correct: orderedOk, total: orderedOk + orderedWrong })} center>
            {check}
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  const handleStepClick = (stepId: string) => {
    if (status !== "playing") return;
    if (orderedIds.includes(stepId)) return;

    const expectedNextId = level.steps[orderedIds.length].id;

    if (stepId === expectedNextId) {
      playSound("correct");
      setOrderedOk((count) => count + 1);
      const newOrderedIds = [...orderedIds, stepId];
      setOrderedIds(newOrderedIds);
      setAnnouncement(`${a11y.correct}. ${a11y.selected}: ${newOrderedIds.length}`);

      if (newOrderedIds.length === level.steps.length) {
        const nextLevelIndex = currentLevelIndex + 1;
        const nextLevel = content.levels[nextLevelIndex];
        if (nextLevel) {
          setTimeLeft(nextLevel.time);
          setOrderedIds([]);
          setShuffledSteps([...nextLevel.steps].sort(() => Math.random() - 0.5));
        }
        setCurrentLevelIndex(nextLevelIndex);
      }
    } else {
      playSound("wrong");
      setOrderedWrong((count) => count + 1);
      setAnnouncement(`${a11y.wrong}. ${locale === "ru" ? "Попробуйте выбрать другой шаг" : "Încearcă să alegi alt pas"}`);
      setShakeKey((k) => k + 1);
      setFlashError(true);
      window.setTimeout(() => setFlashError(false), 380);
    }
  };

  const restartLevel = () => {
    setStatus("playing");
    setPaused(false);
    setTimeLeft(level.time);
    setOrderedIds([]);
    setShuffledSteps([...level.steps].sort(() => Math.random() - 0.5));
  };

  if (status === "failed") {
    return (
      <motion.div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="focus-ring mx-auto flex max-w-lg flex-col items-center rounded-[2rem] border-4 border-danger/60 bg-danger/10 p-8 text-center"
      >
        <XCircle className="mb-4 size-16 text-danger" aria-hidden="true" />
        <p className="mb-8 text-2xl font-black text-foreground">{content.fail}</p>
        <button
          type="button"
          onClick={restartLevel}
          className="focus-ring min-h-12 min-w-11 rounded-2xl bg-danger px-10 py-3.5 text-base font-black text-danger-foreground transition hover:scale-105"
        >
          {retry}
        </button>
      </motion.div>
    );
  }

  const isLowTime = !noTimer && timeLeft <= 5;
  const isErrorState = isLowTime || flashError;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center pb-8">
      <p className="mb-5 text-center text-base font-bold text-foreground/95 sm:text-lg">{content.prompt}</p>
      {"situation" in level && (
        <div className="mb-5 flex w-full items-start gap-3 rounded-2xl border-2 border-gold/45 bg-gold/10 p-4 text-base font-bold text-foreground">
          <ShieldAlert className="mt-0.5 size-6 shrink-0 text-gold" aria-hidden="true" />
          <p>{level.situation}</p>
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/10 px-3.5 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
          <Sparkles className="size-4" aria-hidden="true" />
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>

        {!noTimer && (
          <div className="flex items-center gap-2.5">
            <span
              role="timer"
              aria-label={`${timeLeft} ${locale === "ru" ? "секунд" : "secunde"}`}
              className={`rounded-xl border px-3 py-1.5 text-xl font-black tabular-nums transition-colors ${
                isErrorState
                  ? "animate-pulse border-danger/60 bg-danger/15 text-danger"
                  : "border-border bg-slate-900/80 text-neon"
              }`}
            >
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => {
                setPaused((value) => !value);
                setAnnouncement(paused ? a11y.resume : a11y.paused);
              }}
              aria-pressed={paused}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-border bg-background/50 px-3 text-sm font-bold text-foreground"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              {paused ? a11y.resume : a11y.pause}
            </button>
          </div>
        )}
      </div>

      <motion.div
        ref={levelPanelRef}
        key={shakeKey > 0 ? `ord-shake-${shakeKey}` : "ord-steady"}
        tabIndex={-1}
        animate={!reducedMotion && shakeKey > 0 ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`focus-ring w-full rounded-[2rem] border-2 p-5 transition-colors duration-300 sm:p-7 ${
          isErrorState
            ? "border-danger bg-danger/10 shadow-[0_0_40px_rgba(244,63,94,0.28)]"
            : "border-neon/35 bg-slate-900/90 shadow-[0_14px_36px_rgba(0,0,0,0.38)]"
        }`}
      >
        <div className="flex flex-col gap-3">
          {shuffledSteps.map((step) => {
            const isSelected = orderedIds.includes(step.id);
            const indexNumber = isSelected ? orderedIds.indexOf(step.id) + 1 : null;

            return (
              <motion.button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={isSelected}
                whileHover={reducedMotion || isSelected ? undefined : { scale: 1.015, y: -1 }}
                whileTap={reducedMotion || isSelected ? undefined : { scale: 0.98 }}
                className={`focus-ring relative flex min-h-14 min-w-11 items-center rounded-2xl border-2 p-4 text-left transition-colors ${
                  isSelected
                    ? "border-success/70 bg-success/15 text-foreground shadow-[0_0_18px_rgba(34,197,94,0.16)]"
                    : "border-border bg-background/60 hover:border-neon/50 hover:bg-background/85"
                }`}
              >
                {isSelected && (
                  <motion.span
                    initial={reducedMotion ? false : { scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                    className="mr-3 grid size-9 shrink-0 place-items-center rounded-full bg-success font-display text-base font-black text-slate-950 shadow-md"
                  >
                    {indexNumber}
                  </motion.span>
                )}
                <span className="text-base font-semibold leading-snug">{step.text}</span>
                {isSelected && (
                  <span className="ml-auto flex shrink-0 items-center gap-1 pl-3 text-sm font-black text-success">
                    <Check className="size-4" aria-hidden="true" />
                    {a11y.selected}: {indexNumber}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export { DialogueStage, OrderingStage };
