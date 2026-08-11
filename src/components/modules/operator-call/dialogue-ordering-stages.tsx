"use client";

import { Check, CheckCircle2, Pause, Play, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

function DialogueStage({ locale, content, check, saving, feedback, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["dialogue"] | (typeof operatorCallContent)["ro"]["dialogue"]; check: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [errorText, setErrorText] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const firstPartRef = useRef<HTMLButtonElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];

  const level = content.levels?.[currentLevelIndex];

  useEffect(() => {
    if (level) firstPartRef.current?.focus();
    else completionRef.current?.focus();
  }, [currentLevelIndex, level]);

  if (!level) {
    return (
      <div ref={completionRef} tabIndex={-1} role="status" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
         <CheckCircle2 className="size-16 text-neon mb-4" aria-hidden="true" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.win}</p>
         {feedback && <ScoreFeedback score={feedback.score} />}
         <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
      </div>
    );
  }

  const togglePart = (id: string) => {
    setErrorText(null);
    setSelectedParts(prev => {
      const next = new Set(prev);
      const part = level.parts.find(item => item.id === id);
      if (next.has(id)) {
        next.delete(id);
        setAnnouncement(`${a11y.unselected}: ${part?.text ?? ""}`);
      } else {
        next.add(id);
        setAnnouncement(`${a11y.selected}: ${part?.text ?? ""}`);
      }
      return next;
    });
  };

  const verify = () => {
    let correct = true;
    let selectedLies = 0;

    level.parts.forEach(part => {
      const isSelected = selectedParts.has(part.id);
      if (part.isLie && isSelected) {
        selectedLies++;
      }
      if (!part.isLie && isSelected) {
        correct = false;
      }
    });

    if (correct && selectedLies === level.liesCount) {
      playSound("correct");
      setAnnouncement(`${a11y.correct}. ${a11y.levelComplete}`);
      setCurrentLevelIndex(prev => prev + 1);
      setSelectedParts(new Set());
      setErrorText(null);
    } else {
      playSound("wrong");
      setErrorText(content.error);
      setAnnouncement(`${a11y.wrong}. ${content.error}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-6">{content.prompt}</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-xs font-black tracking-widest text-neon/60 uppercase">
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>
        <span className="text-xs font-black text-muted-foreground">
          {selectedParts.size} / {level.liesCount}
        </span>
      </div>

      <div className="relative w-full bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-8 text-left leading-relaxed text-lg sm:text-xl">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-slate-900 border-b border-l border-border transform -rotate-45" />

         {level.parts.map((part, index) => {
          const isSelected = selectedParts.has(part.id);
          const selectedStyle = "bg-danger/30 text-danger-foreground border-b-2 border-danger";
          const hoverStyle = "hover:bg-foreground/10";
           const baseStyle = "focus-ring inline min-h-11 rounded px-1 py-1 text-left align-baseline transition-colors duration-200 select-none";

          return (
             <button
                key={part.id}
                ref={index === 0 ? firstPartRef : undefined}
                type="button"
                onClick={() => togglePart(part.id)}
                aria-pressed={isSelected}
                aria-label={`${a11y.chooseFragment}: ${part.text}. ${isSelected ? a11y.selected : a11y.unselected}`}
                className={`${baseStyle} ${isSelected ? selectedStyle : hoverStyle}`}
              >
                {isSelected && <Check className="mr-1 inline size-4" aria-hidden="true" />}
                {part.text}
              </button>
           );
         })}
      </div>

      <div className="h-8 mb-6">
        {errorText && (
          <p role="alert" className="text-danger font-bold animate-in slide-in-from-top-2 text-center">{errorText}</p>
        )}
      </div>

      <button
        type="button"
        onClick={verify}
        className="rounded-xl bg-neon px-12 py-4 text-sm font-black text-primary-foreground focus-ring hover:scale-105 transition shadow-[0_0_20px_rgba(0,217,255,0.4)]"
      >
        {content.verifyBtn}
      </button>

    </div>
  );
}

function OrderingStage({ locale, content, check, retry, saving, feedback, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["ordering"] | (typeof operatorCallContent)["ro"]["ordering"]; check: string; retry: string; saving: boolean; feedback: { score: number } | null; onSubmit: () => void }) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "failed" | "won">("playing");
  const [timeLeft, setTimeLeft] = useState<number>(() => content.levels[0]?.time ?? 0);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const levelPanelRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [shuffledSteps, setShuffledSteps] = useState<{id: string, text: string}[]>(() => [...(content.levels[0]?.steps ?? [])].sort(() => Math.random() - 0.5));
  const [flashError, setFlashError] = useState(false);

  const level = content.levels?.[currentLevelIndex];

  useEffect(() => {
    if (status !== "playing" || !level || paused) return;

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
  }, [a11y.wrong, content.fail, paused, status, timeLeft, level]);

  useEffect(() => {
    if (status === "failed" || !level) statusRef.current?.focus();
    else levelPanelRef.current?.focus();
  }, [currentLevelIndex, level, status]);

  if (!level) {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
         <CheckCircle2 className="size-16 text-neon mb-4" aria-hidden="true" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.win}</p>
         {feedback && <ScoreFeedback score={feedback.score} />}
         <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
      </div>
    );
  }

  const handleStepClick = (stepId: string) => {
    if (status !== "playing") return;
    if (orderedIds.includes(stepId)) return;

    const expectedNextId = level.steps[orderedIds.length].id;

    if (stepId === expectedNextId) {
      playSound("correct");
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
      setAnnouncement(`${a11y.wrong}. ${locale === "ru" ? "Попробуйте выбрать другой шаг" : "Încearcă să alegi alt pas"}`);
      setTimeLeft(prev => Math.max(0, prev - 3));
      setFlashError(true);
      setTimeout(() => setFlashError(false), 300);
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
      <div ref={statusRef} tabIndex={-1} role="alert" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-danger/40 rounded-3xl bg-danger/10">
         <XCircle className="size-16 text-danger mb-4" aria-hidden="true" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.fail}</p>
         <button type="button" onClick={restartLevel} className="rounded-xl bg-danger px-12 py-4 text-sm font-black text-danger-foreground focus-ring hover:scale-105 transition">{retry}</button>
      </div>
    );
  }

  const isLowTime = timeLeft <= 5;
  const isErrorState = isLowTime || flashError;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-10">
      <p className="font-bold text-center text-lg sm:text-xl text-foreground/90 mb-6">{content.prompt}</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-xs font-black tracking-widest text-neon/60 uppercase">
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>
        <div className="flex items-center gap-3">
          <span role="timer" aria-label={`${timeLeft} ${locale === "ru" ? "секунд" : "secunde"}`} className={`text-2xl font-black tabular-nums transition-colors duration-200 ${isErrorState ? 'text-danger animate-pulse scale-110' : 'text-neon'}`}>0:{timeLeft.toString().padStart(2, '0')}</span>
          <button type="button" onClick={() => { setPaused(value => !value); setAnnouncement(paused ? a11y.resume : a11y.paused); }} aria-pressed={paused} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/50 px-3 text-xs font-bold text-foreground">
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            {paused ? a11y.resume : a11y.pause}
          </button>
        </div>
      </div>

      <div ref={levelPanelRef} tabIndex={-1} className={`focus-ring w-full rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${isErrorState ? 'border-danger bg-danger/5 shadow-[0_0_50px_rgba(255,0,0,0.3)]' : 'border-border bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'}`}>

        <div className="flex flex-col gap-3">
          {shuffledSteps.map((step) => {
            const isSelected = orderedIds.includes(step.id);
            const indexNumber = isSelected ? orderedIds.indexOf(step.id) + 1 : null;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={isSelected}
                className={`focus-ring relative flex items-center p-4 rounded-2xl border-2 text-left transition-all duration-300
                  ${isSelected
                    ? 'border-neon/50 bg-neon/10 text-foreground/80 scale-[0.98] opacity-60'
                    : 'border-border bg-background/50 hover:bg-background/80 hover:border-neon/30 active:scale-[0.99]'
                  }
                `}
              >
                {isSelected && (
                   <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-neon text-background font-black flex items-center justify-center shadow-lg border-2 border-background z-10">
                     {indexNumber}
                   </div>
                )}
                <span className="text-sm sm:text-base font-medium">{step.text}</span>
                {isSelected && <span className="ml-auto pl-3 text-xs font-bold text-neon"><Check className="mr-1 inline size-4" aria-hidden="true" />{a11y.selected}: {indexNumber}</span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-6 w-full">
        <ActionButton disabled={true} onClick={() => {}}>{check}</ActionButton>
      </div>
    </div>
  );
}


export { DialogueStage, OrderingStage };
