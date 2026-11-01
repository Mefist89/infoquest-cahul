"use client";

import { Check, CheckCircle2, Pause, Play, ShieldAlert, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { answerRetryQuestion, continueRetryProgress, createRetryProgress, retryProgressScore } from "@/features/modules/runner/retry-progress";
import { answerClassification, continueClassification, type ClassificationProgress } from "@/features/modules/runner/classification-progress";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";
import { useSoundEnabled } from "@/features/sound/use-sound-enabled";
import { NoTimerToggle } from "../shared/timer-setting";
import { useCallPhraseAudio } from "./use-call-phrase-audio";
import { StageRetryFeedback } from "./stage-retry-feedback";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

const CALL_SECONDS = 20;

function CallSimulatorStage({ locale, content, check, saving, feedback, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["callSimulator"] | (typeof operatorCallContent)["ro"]["callSimulator"]; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: (result: StageResult) => void }) {
  const phrases = useMemo(() => content.levels.flatMap((level, levelIndex) => level.phrases.map((phrase, phraseIndex) => ({ ...phrase, levelIndex, phraseIndex }))), [content.levels]);
  const [progress, setProgress] = useState(() => createRetryProgress(phrases.map((_, index) => String(index))));
  const progressRef = useRef(progress);
  const [status, setStatus] = useState<"idle" | "playing" | "won">("idle");
  const [timeLeft, setTimeLeft] = useState(CALL_SECONDS);
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const noTimer = useNoTimer();
  const soundEnabled = useSoundEnabled();
  const a11y = accessibilityText[locale];
  const phrase = phrases[progress.index];
  const currentLevelIndex = phrase?.levelIndex ?? 0;
  const currentPhraseIndex = phrase?.phraseIndex ?? 0;
  const explaining = progress.feedback !== null;
  const levelNum = currentLevelIndex + 1;
  const phraseNum = currentPhraseIndex + 1;
  const src = levelNum === 1 ? `/audio/${levelNum}/${locale}.mp3` : `/audio/${levelNum}/${locale}${phraseNum}.mp3`;
  const { audioFinished, playPhrase } = useCallPhraseAudio({ src, playbackKey: `${currentLevelIndex}:${currentPhraseIndex}:${attempt}`, active: status === "playing" && !explaining, paused, enabled: soundEnabled });

  useEffect(() => {
    if (status !== "playing" || explaining || paused || noTimer || !audioFinished) return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        const next = answerRetryQuestion(progressRef.current, false, `${content.timeout} ${phrase.explain}`);
        progressRef.current = next;
        setProgress(next);
        setTimeLeft(0);
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
    playSound(correct ? "correct" : "wrong");
  }

  function continuePhrase() {
    const next = continueRetryProgress(progressRef.current);
    progressRef.current = next;
    setProgress(next);
    setTimeLeft(CALL_SECONDS);
    setPaused(false);
    setAttempt(value => value + 1);
    if (next.index >= phrases.length) setStatus("won");
  }

  function start() {
    const next = createRetryProgress(phrases.map((_, index) => String(index)));
    progressRef.current = next;
    setProgress(next);
    setTimeLeft(CALL_SECONDS);
    setPaused(false);
    setAttempt(value => value + 1);
    setStatus("playing");
  }

  return (
    <div>
      <p className="font-semibold text-foreground/90 sm:text-lg">{content.prompt}</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neon/30 bg-slate-950 shadow-2xl relative">
        {!noTimer && <div className="absolute top-0 w-full h-1.5 bg-secondary/50">
           <div className={`h-full ${timeLeft <= 5 ? 'bg-danger' : 'bg-neon'} transition-all duration-75`} style={{ width: `${timeLeft / CALL_SECONDS * 100}%` }} />
        </div>}

        <div className="p-6 sm:p-8 text-center min-h-[340px] flex flex-col justify-center items-center relative">
          {status === "idle" && (
            <div className="animate-in fade-in">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-neon/10 border border-neon/40 text-neon animate-pulse">
                <Volume2 className="size-10" />
              </div>
              <div className="mt-5"><NoTimerToggle locale={locale} /></div>
              <button onClick={start} className="mt-8 rounded-xl bg-neon px-8 py-3 text-sm font-black text-primary-foreground focus-ring hover:scale-105 transition">{content.startBtn}</button>
            </div>
          )}

          {status === "playing" && !explaining && phrase && (
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95">
              <div className="mb-6 text-xs font-black text-neon/60 uppercase tracking-widest">
                {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
              </div>
              <div className="flex flex-col items-center gap-5">
                <div className="relative size-20 rounded-full bg-slate-800 flex items-center justify-center border border-border shadow-[0_0_25px_rgba(0,0,0,0.5)]">
                   <div className="absolute inset-0 rounded-full border border-neon/20 animate-ping opacity-50"></div>
                   <Volume2 className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold leading-relaxed text-foreground min-h-[96px] flex items-center justify-center px-4">
                  «{phrase.text}»
                </h3>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {!soundEnabled && <button type="button" onClick={playPhrase} disabled={paused} className="focus-ring inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-border px-4 py-2 text-base font-bold disabled:opacity-50"><Volume2 className="size-5" aria-hidden="true" />{locale === "ru" ? "Прослушать" : "Ascultă"}</button>}
                {!noTimer && <span role="timer" className="text-xl font-black tabular-nums">0:{timeLeft.toString().padStart(2, "0")}</span>}
                <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold">
                  {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}{paused ? a11y.resume : a11y.pause}
                </button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleAction(false)}
                  className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-success/40 bg-success/10 px-2 text-center text-sm font-black text-success transition hover:bg-success/20 hover:border-success/60 focus-ring"
                >
                  {content.safeBtn}
                </button>
                <button
                  onClick={() => handleAction(true)}
                  className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-danger/40 bg-danger/10 px-2 text-center text-sm font-black text-danger transition hover:bg-danger/20 hover:border-danger/60 focus-ring"
                >
                  {content.dangerBtn}
                </button>
              </div>
            </div>
          )}

          {status === "playing" && progress.feedback && (
            <StageRetryFeedback locale={locale} feedback={progress.feedback} retry={!progress.feedback.correct} onContinue={continuePhrase} />
          )}

          {status === "won" && (
            <div className="w-full max-w-sm animate-in fade-in zoom-in">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/10 text-success border border-success/30 mb-5">
                 <CheckCircle2 className="size-10" />
               </div>
               <p className="text-xl font-bold text-success">{content.win}</p>
            </div>
          )}
        </div>
      </div>

      {status === "won" && (
        <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4">
          {feedback && <ScoreFeedback score={feedback.score} />}
          <ActionButton disabled={saving} onClick={() => onSubmit(retryProgressScore(progress))} center>{check}</ActionButton>
        </div>
      )}
    </div>
  );
}

function ClassifyStage({ locale, content, answers, setAnswers, check, saving, feedback, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["classify"] | (typeof operatorCallContent)["ro"]["classify"]; answers: Record<string, "safe" | "danger">; setAnswers: Dispatch<SetStateAction<Record<string, "safe" | "danger">>>; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const answeredCount = content.items.filter(item => answers[item.id] !== undefined).length;
  const correctCount = content.items.filter(item => answers[item.id] === item.answer).length;
  const explanationRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<ClassificationProgress>(() => ({ index: answeredCount, feedback: null }));
  const progressRef = useRef(progress);
  const isComplete = progress.index >= content.items.length;
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const currentItem = content.items[progress.index];

  function handleSwipe(direction: "left" | "right") {
    if (!currentItem || progressRef.current.feedback || saving) return;
    const answer = direction === "left" ? "danger" : "safe";
    const correct = answer === currentItem.answer;
    const next = answerClassification(progressRef.current, correct, currentItem.explain);
    progressRef.current = next;
    setProgress(next);
    setAnswers(previous => ({ ...previous, [currentItem.id]: answer }));
    playSound(correct ? "correct" : "wrong");
  }

  function advance() {
    const next = continueClassification(progressRef.current);
    progressRef.current = next;
    setProgress(next);
  }

  useEffect(() => {
    if (isComplete) completionRef.current?.focus();
    else if (progress.feedback) explanationRef.current?.querySelector("button")?.focus();
    else firstActionRef.current?.focus();
  }, [progress.index, progress.feedback, isComplete]);

  return (
    <div className="flex w-full flex-col items-center overflow-hidden pb-10">
      <p className="mb-5 text-center text-lg font-bold text-foreground/90 sm:text-xl">{content.prompt}</p>
      <div className="mb-5 flex w-full max-w-lg flex-wrap justify-between gap-2 text-base font-semibold text-muted-foreground" aria-live="polite">
        <p>{content.progressText.replace("{current}", String(Math.min(progress.index + 1, content.items.length))).replace("{total}", String(content.items.length))}</p>
        <p>{content.correctText.replace("{count}", String(correctCount))}</p>
        <p>{content.remainingText.replace("{count}", String(content.items.length - answeredCount))}</p>
      </div>

      {!isComplete && currentItem && (progress.feedback ? (
        <div ref={explanationRef} className="w-full max-w-lg">
          <p className="mb-4 rounded-2xl border border-border bg-card/50 p-5 text-center text-xl font-semibold leading-relaxed">«{currentItem.text}»</p>
          <StageRetryFeedback locale={locale} feedback={progress.feedback} onContinue={advance} />
        </div>
      ) : (
        <>
          <div className="relative flex aspect-[4/5] w-full max-w-sm items-center justify-center sm:aspect-square">
            <AnimatePresence mode="popLayout">
              <SwipeCard key={currentItem.id} item={currentItem} onSwipe={handleSwipe} safeText={content.safe} dangerText={content.danger} />
            </AnimatePresence>
          </div>
          <div className="mt-6 flex w-full max-w-sm justify-between gap-4 px-4">
            <button ref={firstActionRef} type="button" disabled={saving} onClick={() => handleSwipe("left")} className="focus-ring flex min-h-12 flex-col items-center gap-2 rounded-2xl p-2 text-danger transition hover:scale-105 disabled:opacity-50">
              <span className="flex size-16 items-center justify-center rounded-full border-2 border-danger bg-danger/10"><ShieldAlert className="size-8" aria-hidden="true" /></span>
              <span className="text-base font-bold">{content.danger}</span>
            </button>
            <button type="button" disabled={saving} onClick={() => handleSwipe("right")} className="focus-ring flex min-h-12 flex-col items-center gap-2 rounded-2xl p-2 text-success transition hover:scale-105 disabled:opacity-50">
              <span className="flex size-16 items-center justify-center rounded-full border-2 border-success bg-success/10"><Check className="size-8" aria-hidden="true" /></span>
              <span className="text-base font-bold">{content.safe}</span>
            </button>
          </div>
        </>
      ))}

      {isComplete && <>
        <div ref={completionRef} tabIndex={-1} role="status" className="focus-ring flex flex-col items-center rounded-3xl border-2 border-neon/40 bg-neon/10 p-8 text-center">
          <CheckCircle2 className="mb-4 size-16 text-neon" aria-hidden="true" />
          <p className="mb-8 text-2xl font-black text-foreground">{content.completeMessage}</p>
          {feedback && <ScoreFeedback score={feedback.score} />}
        </div>
        <div className="mt-6 w-full"><ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton></div>
      </>}
    </div>
  );
}

function SwipeCard({ item, onSwipe, safeText, dangerText }: { item: { id: string; text: string; answer: string; explain: string }, onSwipe: (dir: "left" | "right") => void, safeText: string, dangerText: string }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const dangerOpacity = useTransform(x, [0, -100], [0, 1]);
  const safeOpacity = useTransform(x, [0, 100], [0, 1]);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragSnapToOrigin={true}
      onDragEnd={(e, { offset, velocity }) => {
        const swipeThreshold = 80;
        if (offset.x > swipeThreshold || velocity.x > 400) {
          onSwipe("right");
        } else if (offset.x < -swipeThreshold || velocity.x < -400) {
          onSwipe("left");
        }
      }}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      role="group"
      aria-label={item.text}
      className="absolute w-full h-full border border-border rounded-3xl bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col items-center justify-center text-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
      <p className="text-xl sm:text-3xl font-black leading-tight z-10 text-foreground">{item.text}</p>

      <motion.div style={{ opacity: dangerOpacity }} className="absolute inset-0 bg-danger/10 pointer-events-none flex items-center justify-center">
         <div className="absolute top-6 right-6 border-4 border-danger bg-background/50 backdrop-blur-sm text-danger font-black text-xl uppercase px-3 py-1 rounded-xl transform rotate-12 shadow-lg">
           {dangerText}
         </div>
      </motion.div>

      <motion.div style={{ opacity: safeOpacity }} className="absolute inset-0 bg-success/10 pointer-events-none flex items-center justify-center">
         <div className="absolute top-6 left-6 border-4 border-success bg-background/50 backdrop-blur-sm text-success font-black text-xl uppercase px-3 py-1 rounded-xl transform -rotate-12 shadow-lg">
           {safeText}
         </div>
      </motion.div>
    </motion.div>
  );
}


export { CallSimulatorStage, ClassifyStage };
