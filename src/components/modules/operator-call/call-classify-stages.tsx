"use client";

import { Check, CheckCircle2, ShieldAlert, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

function CallSimulatorStage({ locale, content, check, saving, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["callSimulator"] | (typeof operatorCallContent)["ro"]["callSimulator"]; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "failed" | "won">("idle");
  const [failReason, setFailReason] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const level = content.levels[currentLevelIndex];
  const phrase = level?.phrases[currentPhraseIndex];

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setStatus("failed");
          setFailReason(content.timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [status, content.timeout, currentPhraseIndex]);

  useEffect(() => {
    if (status !== "playing" || !phrase) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const levelNum = currentLevelIndex + 1;
    const phraseNum = currentPhraseIndex + 1;
    const audioSrc = levelNum === 1
      ? `/audio/${levelNum}/${locale}.mp3`
      : `/audio/${levelNum}/${locale}${phraseNum}.mp3`;

    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Audio play failed:", e));

    return () => {
      audio.pause();
    };
  }, [status, currentLevelIndex, currentPhraseIndex, locale, phrase]);

  function handleAction(isDangerAction: boolean) {
    if (status !== "playing" || !phrase) return;
    if (phrase.isThreat) {
      if (isDangerAction) { playSound("correct"); advanceLevel(); }
      else { playSound("wrong"); setStatus("failed"); setFailReason(content.loseThreat); }
    } else {
      if (isDangerAction) { playSound("wrong"); setStatus("failed"); setFailReason(content.loseSafe); }
      else {
        if (currentPhraseIndex < level.phrases.length - 1) {
          setCurrentPhraseIndex((prev) => prev + 1);
          setTimeLeft(100);
        } else { playSound("correct"); advanceLevel(); }
      }
    }
  }

  function advanceLevel() {
    if (currentLevelIndex < content.levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setCurrentPhraseIndex(0);
      setTimeLeft(100);
    } else {
      setStatus("won");
    }
  }

  function start() {
    setCurrentLevelIndex(0);
    setCurrentPhraseIndex(0);
    setTimeLeft(100);
    setStatus("playing");
    setFailReason(null);
  }

  return (
    <div>
      <p className="font-semibold text-foreground/90 sm:text-lg">{content.prompt}</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neon/30 bg-slate-950 shadow-2xl relative">
        <div className="absolute top-0 w-full h-1.5 bg-secondary/50">
           <div className={`h-full ${timeLeft < 30 ? 'bg-danger' : 'bg-neon'} transition-all duration-75`} style={{ width: `${timeLeft}%` }} />
        </div>

        <div className="p-6 sm:p-8 text-center min-h-[340px] flex flex-col justify-center items-center relative">
          {status === "idle" && (
            <div className="animate-in fade-in">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-neon/10 border border-neon/40 text-neon animate-pulse">
                <Volume2 className="size-10" />
              </div>
              <button onClick={start} className="mt-8 rounded-xl bg-neon px-8 py-3 text-sm font-black text-primary-foreground focus-ring hover:scale-105 transition">{content.startBtn}</button>
            </div>
          )}

          {status === "playing" && phrase && (
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

          {status === "failed" && (
            <div className="w-full max-w-sm animate-in fade-in zoom-in">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-danger/10 text-danger border border-danger/30 mb-5">
                 <ShieldAlert className="size-10" />
               </div>
               <p className="text-lg font-bold text-danger">{failReason}</p>
               <button onClick={start} className="mt-8 rounded-xl border-2 border-danger/40 bg-danger/10 px-8 py-3 text-sm font-black text-danger focus-ring hover:bg-danger/20 transition">
                 {content.retryBtn}
               </button>
            </div>
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
          <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
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
