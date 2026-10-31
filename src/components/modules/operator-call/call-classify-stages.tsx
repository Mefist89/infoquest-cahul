"use client";

import { Check, CheckCircle2, Pause, Play, ShieldAlert, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { answerRetryQuestion, continueRetryProgress, createRetryProgress, retryProgressScore } from "@/features/modules/runner/retry-progress";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";
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
  const a11y = accessibilityText[locale];
  const phrase = phrases[progress.index];
  const currentLevelIndex = phrase?.levelIndex ?? 0;
  const currentPhraseIndex = phrase?.phraseIndex ?? 0;
  const explaining = progress.feedback !== null;
  const levelNum = currentLevelIndex + 1;
  const phraseNum = currentPhraseIndex + 1;
  const src = levelNum === 1 ? `/audio/${levelNum}/${locale}.mp3` : `/audio/${levelNum}/${locale}${phraseNum}.mp3`;
  const audioFinished = useCallPhraseAudio({ src, playbackKey: `${currentLevelIndex}:${currentPhraseIndex}:${attempt}`, active: status === "playing" && !explaining, paused });

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
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount >= content.items.length;
  const a11y = accessibilityText[locale];
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const currentItem = content.items[answeredCount];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentItem) return;
    const answer = direction === "left" ? "danger" : "safe";
    const isCorrect = answer === currentItem.answer;
    if (isCorrect) playSound("correct");
    else playSound("wrong");
    setAnnouncement(`${isCorrect ? a11y.correct : a11y.wrong}. ${answeredCount + 1 < content.items.length ? a11y.nextCard : content.completeMessage}`);
    setAnswers(prev => ({ ...prev, [currentItem.id]: answer }));
  };

  useEffect(() => {
    if (isComplete) completionRef.current?.focus();
    else firstActionRef.current?.focus();
  }, [answeredCount, isComplete]);

  return (
    <div className="flex flex-col items-center w-full overflow-hidden pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-8">{content.prompt}</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {!isComplete ? (
        <div className="relative w-full max-w-sm aspect-[4/5] sm:aspect-square flex items-center justify-center">
          <AnimatePresence mode="popLayout">
             {currentItem && (
               <SwipeCard
                  key={currentItem.id}
                  item={currentItem}
                  onSwipe={handleSwipe}
                  safeText={content.safe}
                  dangerText={content.danger}
               />
             )}
          </AnimatePresence>
        </div>
      ) : (
        <div ref={completionRef} tabIndex={-1} role="status" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
           <CheckCircle2 className="size-16 text-neon mb-4" aria-hidden="true" />
           <p className="text-2xl font-black mb-8 text-foreground">{content.completeMessage}</p>
           {feedback && <ScoreFeedback score={feedback.score} />}
        </div>
      )}

      {!isComplete && (
         <div className="flex justify-between w-full max-w-sm mt-8 px-4">
             <button ref={firstActionRef} type="button" onClick={() => handleSwipe("left")} className="focus-ring flex min-h-11 flex-col items-center gap-2 rounded-2xl p-2 text-danger transition hover:scale-110">
               <div className="size-16 rounded-full border-2 border-danger flex items-center justify-center bg-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <ShieldAlert className="size-8" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">{content.danger}</span>
            </button>
             <button type="button" onClick={() => handleSwipe("right")} className="focus-ring flex min-h-11 flex-col items-center gap-2 rounded-2xl p-2 text-success transition hover:scale-110">
               <div className="size-16 rounded-full border-2 border-success flex items-center justify-center bg-success/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Check className="size-8" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider">{content.safe}</span>
            </button>
         </div>
      )}
      {isComplete && (
        <div className="mt-6 w-full">
          <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
        </div>
      )}
    </div>
  );
}

function SwipeCard({ item, onSwipe, safeText, dangerText }: { item: { id: string; text: string; answer: string }, onSwipe: (dir: "left" | "right") => void, safeText: string, dangerText: string }) {
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
