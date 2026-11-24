"use client";

import {
  Pause,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import {
  answerRetryQuestion,
  continueRetryProgress,
  createRetryProgress,
  retryProgressScore,
} from "@/features/modules/runner/retry-progress";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";
import { useSoundEnabled } from "@/features/sound/use-sound-enabled";
import { NoTimerToggle } from "../shared/timer-setting";
import { ClassifyStage } from "./classify-stage";
import { PhoneFrame } from "./phone-frame";
import { StageRetryFeedback } from "./stage-retry-feedback";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";
import { useCallPhraseAudio } from "./use-call-phrase-audio";

const CALL_SECONDS = 20;
const EQ_BARS = [14, 26, 20, 30, 16] as const;

const callUi = {
  ru: {
    incoming: "Входящий звонок...",
    callerName: "Оператор MinTel",
    callerNumber: "+373 60 ••• 419",
    activeCall: "Идёт разговор",
    speaking: "Звонящий говорит:",
    listen: "Прослушать",
  },
  ro: {
    incoming: "Apel primit...",
    callerName: "Operator MinTel",
    callerNumber: "+373 60 ••• 419",
    activeCall: "Apel în curs",
    speaking: "Apelantul spune:",
    listen: "Ascultă",
  },
} as const;

function CallSimulatorStage({
  locale,
  content,
  check,
  saving,
  feedback,
  onSubmit,
}: {
  locale: OperatorLocale;
  content: (typeof operatorCallContent)["ru"]["callSimulator"] | (typeof operatorCallContent)["ro"]["callSimulator"];
  check: string;
  saving: boolean;
  feedback: { score: number } | null;
  onSubmit: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const phrases = useMemo(
    () =>
      content.levels.flatMap((level, levelIndex) =>
        level.phrases.map((phrase, phraseIndex) => ({ ...phrase, levelIndex, phraseIndex })),
      ),
    [content.levels],
  );
  const [progress, setProgress] = useState(() => createRetryProgress(phrases.map((_, index) => String(index))));
  const progressRef = useRef(progress);
  const [status, setStatus] = useState<"idle" | "playing" | "won">("idle");
  const [timeLeft, setTimeLeft] = useState(CALL_SECONDS);
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const noTimer = useNoTimer();
  const soundEnabled = useSoundEnabled();
  const a11y = accessibilityText[locale];
  const ui = callUi[locale];
  const phrase = phrases[progress.index];
  const currentLevelIndex = phrase?.levelIndex ?? 0;
  const currentPhraseIndex = phrase?.phraseIndex ?? 0;
  const explaining = progress.feedback !== null;
  const levelNum = currentLevelIndex + 1;
  const phraseNum = currentPhraseIndex + 1;
  const src = levelNum === 1 ? `/audio/${levelNum}/${locale}.mp3` : `/audio/${levelNum}/${locale}${phraseNum}.mp3`;
  const { audioFinished, playPhrase } = useCallPhraseAudio({
    src,
    playbackKey: `${currentLevelIndex}:${currentPhraseIndex}:${attempt}`,
    active: status === "playing" && !explaining,
    paused,
    enabled: soundEnabled,
  });

  useEffect(() => {
    if (status !== "playing" || explaining || paused || noTimer || !audioFinished) return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        const next = answerRetryQuestion(progressRef.current, false, `${content.timeout} ${phrase.explain}`);
        progressRef.current = next;
        setProgress(next);
        setTimeLeft(0);
        setShakeKey((k) => k + 1);
        playSound("timeout");
      } else setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [status, explaining, paused, noTimer, audioFinished, timeLeft, content.timeout, phrase, currentLevelIndex, currentPhraseIndex]);

  function handleAction(isDangerAction: boolean) {
    if (status !== "playing" || progressRef.current.feedback || !phrase) return;
    const correct = isDangerAction === phrase.isThreat;
    const next = answerRetryQuestion(progressRef.current, correct, phrase.explain);
    progressRef.current = next;
    setProgress(next);
    if (!correct) setShakeKey((k) => k + 1);
    playSound(correct ? "correct" : "wrong");
  }

  function continuePhrase() {
    const next = continueRetryProgress(progressRef.current);
    progressRef.current = next;
    setProgress(next);
    setTimeLeft(CALL_SECONDS);
    setPaused(false);
    setAttempt((value) => value + 1);
    if (next.index >= phrases.length) setStatus("won");
  }

  function start() {
    const next = createRetryProgress(phrases.map((_, index) => String(index)));
    progressRef.current = next;
    setProgress(next);
    setTimeLeft(CALL_SECONDS);
    setPaused(false);
    setAttempt((value) => value + 1);
    setStatus("playing");
  }

  const phoneTone =
    status === "won" || progress.feedback?.correct
      ? "success"
      : progress.feedback && !progress.feedback.correct
        ? "danger"
        : "neutral";

  return (
    <div className="flex flex-col items-center">
      <p className="mb-5 text-center text-base font-bold text-foreground/95 sm:text-lg">{content.prompt}</p>

      <PhoneFrame shakeKey={shakeKey} tone={phoneTone} maxWidthClass="max-w-lg">
        {!noTimer && status === "playing" && !explaining && (
          <div className="h-1.5 w-full bg-secondary/50">
            <div
              className={`h-full transition-all duration-150 ${timeLeft <= 5 ? "bg-danger" : "bg-neon"}`}
              style={{ width: `${(timeLeft / CALL_SECONDS) * 100}%` }}
            />
          </div>
        )}

        <div className="flex min-h-[25rem] flex-col items-center justify-between bg-[radial-gradient(circle_at_50%_18%,rgba(0,217,255,0.14),transparent_60%)] p-5 text-center sm:p-6">
          {status === "idle" && (
            <div className="my-auto flex w-full flex-col items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-success/45 bg-success/15 px-3.5 py-1 text-sm font-bold text-success">
                <span className="size-2.5 animate-ping rounded-full bg-success" aria-hidden="true" />
                {ui.incoming}
              </span>

              <motion.div
                animate={reducedMotion ? undefined : { rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 1.4, duration: 0.65 }}
                className="relative mt-6 grid size-24 place-items-center rounded-full border-4 border-neon/70 bg-neon/15 text-neon shadow-[0_0_32px_rgba(0,217,255,0.28)]"
              >
                <PhoneIncoming className="size-10" aria-hidden="true" />
              </motion.div>

              <h3 className="mt-5 font-display text-2xl font-black text-foreground">{ui.callerName}</h3>
              <p className="mt-1 text-base font-semibold tracking-wider text-muted-foreground">{ui.callerNumber}</p>

              <div className="mt-5">
                <NoTimerToggle locale={locale} />
              </div>

              <motion.button
                type="button"
                onClick={start}
                whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                className="focus-ring mt-6 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-success px-8 py-3 text-base font-black text-slate-950 shadow-[0_0_28px_rgba(34,197,94,0.4)]"
              >
                <PhoneCall className="size-5" aria-hidden="true" />
                {content.startBtn}
              </motion.button>
            </div>
          )}

          {status === "playing" && !explaining && phrase && (
            <div className="flex w-full flex-1 flex-col items-center justify-between">
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/10 px-3 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {content.levelText} {currentLevelIndex + 1}/{content.levels.length}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-sm font-bold text-success">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {ui.activeCall}
                </span>
              </div>

              <div className="my-4 flex w-full flex-col items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-neon/55 bg-slate-900 text-neon shadow-[0_0_22px_rgba(0,217,255,0.22)]">
                    <Volume2 className="size-6" aria-hidden="true" />
                  </span>
                  <div className="text-left">
                    <p className="font-display text-base font-black text-foreground">{ui.callerName}</p>
                    <div className="mt-1 flex h-6 items-end gap-1" aria-hidden="true">
                      {EQ_BARS.map((height, idx) => (
                        <motion.span
                          key={idx}
                          animate={
                            reducedMotion || paused || audioFinished
                              ? { height: 6 }
                              : { height: [6, height, 8, Math.round(height * 0.75), 6] }
                          }
                          transition={{ repeat: Infinity, duration: 0.7 + idx * 0.1, ease: "easeInOut" }}
                          className="w-1.5 rounded-full bg-neon"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentLevelIndex}-${currentPhraseIndex}`}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="mt-4 w-full rounded-3xl rounded-tl-md border-2 border-neon/40 bg-slate-900/95 p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:p-5"
                  >
                    <p className="text-sm font-bold text-gold">{ui.speaking}</p>
                    <h3 className="mt-2 text-lg font-black leading-snug text-foreground sm:text-xl">
                      «{phrase.text}»
                    </h3>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  {!soundEnabled && (
                    <button
                      type="button"
                      onClick={playPhrase}
                      disabled={paused}
                      className="focus-ring inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-4 py-2 text-sm font-bold text-neon disabled:opacity-50"
                    >
                      <Volume2 className="size-4" aria-hidden="true" />
                      {ui.listen}
                    </button>
                  )}
                  {!noTimer && (
                    <span
                      role="timer"
                      className={`rounded-xl border px-3 py-1.5 text-lg font-black tabular-nums ${
                        timeLeft <= 5
                          ? "animate-pulse border-danger/60 bg-danger/15 text-danger"
                          : "border-border bg-slate-900/80 text-foreground"
                      }`}
                    >
                      0:{timeLeft.toString().padStart(2, "0")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-pressed={paused}
                    className="focus-ring inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-border bg-slate-900/80 px-3.5 text-sm font-bold text-foreground"
                  >
                    {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
                    {paused ? a11y.resume : a11y.pause}
                  </button>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  onClick={() => handleAction(false)}
                  className="focus-ring flex min-h-16 min-w-11 items-center justify-center gap-2 rounded-2xl border-2 border-success/65 bg-success/15 px-3 text-center text-sm font-black text-success shadow-[0_8px_22px_rgba(34,197,94,0.18)] transition hover:border-success hover:bg-success/25 sm:text-base"
                >
                  <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
                  <span>{content.safeBtn}</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  onClick={() => handleAction(true)}
                  className="focus-ring flex min-h-16 min-w-11 items-center justify-center gap-2 rounded-2xl border-2 border-danger/70 bg-danger/15 px-3 text-center text-sm font-black text-danger shadow-[0_8px_22px_rgba(244,63,94,0.2)] transition hover:border-danger hover:bg-danger/25 sm:text-base"
                >
                  <PhoneOff className="size-5 shrink-0" aria-hidden="true" />
                  <span>{content.dangerBtn}</span>
                </motion.button>
              </div>
            </div>
          )}

          {status === "playing" && progress.feedback && (
            <div className="my-auto w-full">
              <StageRetryFeedback
                locale={locale}
                feedback={progress.feedback}
                retry={!progress.feedback.correct}
                onContinue={continuePhrase}
              />
            </div>
          )}

          {status === "won" && (
            <motion.div
              initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="my-auto flex w-full flex-col items-center py-4"
            >
              <span className="grid size-20 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_28px_rgba(255,209,102,0.3)]">
                <Trophy className="size-10" aria-hidden="true" />
              </span>
              <p className="mt-5 font-display text-xl font-black text-success sm:text-2xl">{content.win}</p>
            </motion.div>
          )}
        </div>
      </PhoneFrame>

      {status === "won" && (
        <div className="mt-6 w-full">
          {feedback && <ScoreFeedback score={feedback.score} />}
          <ActionButton disabled={saving} onClick={() => onSubmit(retryProgressScore(progress))} center>
            {check}
          </ActionButton>
        </div>
      )}
    </div>
  );
}

export { CallSimulatorStage, ClassifyStage };
