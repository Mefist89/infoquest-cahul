"use client";

import {
  ArrowLeft,
  ArrowRight,
  Flame,
  PhoneIncoming,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import { answerClassification, continueClassification, type ClassificationProgress } from "@/features/modules/runner/classification-progress";
import { ClassifyFeedbackCard, type ClassifyItem } from "./classify-feedback-card";
import { ActionButton, playSound, ScoreFeedback } from "./stage-support";

const uiCopy = {
  ru: {
    phraseBadge: (n: number) => `Фраза #${n}`,
    swipeHint: "Свайпни карточку или нажми кнопку",
    streak: (n: number) => `Серия ×${n}!`,
    starsEarned: (correct: number, total: number) => `Ты правильно разобрал ${correct} из ${total} фраз!`,
  },
  ro: {
    phraseBadge: (n: number) => `Fraza #${n}`,
    swipeHint: "Glisează cardul sau apasă butonul",
    streak: (n: number) => `Serie ×${n}!`,
    starsEarned: (correct: number, total: number) => `Ai sortat corect ${correct} din ${total} fraze!`,
  },
} as const;

function SwipeCard({
  item,
  cardNumber,
  locale,
  onSwipe,
  safeText,
  dangerText,
}: {
  item: ClassifyItem;
  cardNumber: number;
  locale: OperatorLocale;
  onSwipe: (dir: "left" | "right") => void;
  safeText: string;
  dangerText: string;
}) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const opacity = useTransform(x, [-220, -110, 0, 110, 220], [0.2, 1, 1, 1, 0.2]);
  const dangerOpacity = useTransform(x, [0, -90], [0, 1]);
  const safeOpacity = useTransform(x, [0, 90], [0, 1]);
  const t = uiCopy[locale];

  return (
    <motion.div
      style={reducedMotion ? undefined : { x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragSnapToOrigin
      onDragEnd={(_, { offset, velocity }) => {
        const swipeThreshold = 80;
        if (offset.x > swipeThreshold || velocity.x > 400) onSwipe("right");
        else if (offset.x < -swipeThreshold || velocity.x < -400) onSwipe("left");
      }}
      initial={reducedMotion ? { opacity: 0 } : { scale: 0.86, opacity: 0, y: 36 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      role="group"
      aria-label={item.text}
      className="relative z-10 flex min-h-[21rem] w-full cursor-grab select-none flex-col items-center justify-between overflow-hidden rounded-[2rem] border-4 border-neon/75 bg-[radial-gradient(circle_at_50%_0%,rgba(0,217,255,0.18),rgba(10,22,48,0.97)_68%)] p-6 text-center shadow-[0_20px_50px_rgba(0,217,255,0.18)] active:cursor-grabbing sm:min-h-[23rem] sm:p-7"
    >
      <div className="relative z-10 flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3.5 py-1 text-sm font-black uppercase tracking-wider text-gold">
        <PhoneIncoming className="size-4" aria-hidden="true" />
        {t.phraseBadge(cardNumber)}
      </div>

      <p className="relative z-10 my-5 font-display text-xl font-black leading-snug text-foreground sm:text-2xl">
        «{item.text}»
      </p>

      <div className="relative z-10 flex w-full items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background/55 px-3.5 py-2 text-sm font-bold">
        <span className="inline-flex items-center gap-1 text-danger">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dangerText}
        </span>
        <span className="hidden text-muted-foreground sm:inline">{t.swipeHint}</span>
        <span className="inline-flex items-center gap-1 text-success">
          {safeText}
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <motion.div style={{ opacity: dangerOpacity }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-danger/15">
        <div className="absolute right-5 top-5 rotate-12 rounded-2xl border-4 border-danger bg-background/85 px-3.5 py-1.5 font-display text-lg font-black uppercase text-danger shadow-lg">
          {dangerText}
        </div>
      </motion.div>

      <motion.div style={{ opacity: safeOpacity }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-success/15">
        <div className="absolute left-5 top-5 -rotate-12 rounded-2xl border-4 border-success bg-background/85 px-3.5 py-1.5 font-display text-lg font-black uppercase text-success shadow-lg">
          {safeText}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ClassifyStage({
  locale,
  content,
  answers,
  setAnswers,
  check,
  saving,
  feedback,
  onSubmit,
}: {
  locale: OperatorLocale;
  content: (typeof operatorCallContent)["ru"]["classify"] | (typeof operatorCallContent)["ro"]["classify"];
  answers: Record<string, "safe" | "danger">;
  setAnswers: Dispatch<SetStateAction<Record<string, "safe" | "danger">>>;
  check: string;
  saving: boolean;
  feedback: { score: number } | null;
  onSubmit: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const t = uiCopy[locale];
  const answeredCount = content.items.filter((item) => answers[item.id] !== undefined).length;
  const correctCount = content.items.filter((item) => answers[item.id] === item.answer).length;
  const [progress, setProgress] = useState<ClassificationProgress>(() => ({ index: answeredCount, feedback: null }));
  const [streak, setStreak] = useState(0);
  const progressRef = useRef(progress);
  const isComplete = progress.index >= content.items.length;
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const currentItem = content.items[progress.index];
  const barPercent = Math.min(100, Math.round((answeredCount / Math.max(1, content.items.length)) * 100));

  function handleSwipe(direction: "left" | "right") {
    if (!currentItem || progressRef.current.feedback || saving) return;
    const answer = direction === "left" ? "danger" : "safe";
    const correct = answer === currentItem.answer;
    const next = answerClassification(progressRef.current, correct, currentItem.explain);
    progressRef.current = next;
    setProgress(next);
    setStreak((prev) => (correct ? prev + 1 : 0));
    setAnswers((previous) => ({ ...previous, [currentItem.id]: answer }));
    playSound(correct ? "correct" : "wrong");
  }

  function advance() {
    const next = continueClassification(progressRef.current);
    progressRef.current = next;
    setProgress(next);
  }

  useEffect(() => {
    if (isComplete) completionRef.current?.focus();
    else if (!progress.feedback) firstActionRef.current?.focus();
  }, [progress.index, progress.feedback, isComplete]);

  return (
    <div className="flex w-full flex-col items-center overflow-hidden pb-6">
      <div className="w-full max-w-xl rounded-3xl border-2 border-neon/30 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(10,22,48,0.85))] p-4 text-center sm:p-5">
        <p className="text-base font-bold text-foreground sm:text-lg">{content.prompt}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between" aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-sm font-bold text-neon">
            <Sparkles className="size-4" aria-hidden="true" />
            {content.progressText
              .replace("{current}", String(Math.min(progress.index + 1, content.items.length)))
              .replace("{total}", String(content.items.length))}
          </span>

          <motion.span
            key={correctCount}
            initial={reducedMotion ? false : { scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-sm font-black text-gold"
          >
            <Star className="size-4 fill-current" aria-hidden="true" />
            {content.correctText.replace("{count}", String(correctCount))}
          </motion.span>

          {streak >= 2 ? (
            <motion.span
              key={streak}
              initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-400/20 px-3 py-1 text-sm font-black text-amber-300"
            >
              <Flame className="size-4" aria-hidden="true" />
              {t.streak(streak)}
            </motion.span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-sm font-semibold text-muted-foreground">
              {content.remainingText.replace("{count}", String(content.items.length - answeredCount))}
            </span>
          )}
        </div>

        <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-neon via-sky-300 to-success transition-[width] duration-300" style={{ width: `${barPercent}%` }} />
        </div>
      </div>

      <div className="mt-6 flex w-full flex-col items-center">
        {!isComplete && currentItem && (progress.feedback ? (
          <ClassifyFeedbackCard
            locale={locale}
            item={currentItem}
            correct={progress.feedback.correct}
            explanation={progress.feedback.explanation}
            safeLabel={content.safe}
            dangerLabel={content.danger}
            onContinue={advance}
          />
        ) : (
          <>
            <div className="relative mx-auto w-full max-w-md pt-2">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 bottom-0 top-4 -rotate-3 rounded-[2rem] border-2 border-violet-400/35 bg-card/45" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-0 top-3 rotate-2 rounded-[2rem] border-2 border-gold/35 bg-card/65" />
              <AnimatePresence mode="wait">
                <SwipeCard key={currentItem.id} item={currentItem} cardNumber={progress.index + 1} locale={locale} onSwipe={handleSwipe} safeText={content.safe} dangerText={content.danger} />
              </AnimatePresence>
            </div>
            <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4">
              <motion.button ref={firstActionRef} type="button" disabled={saving} whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }} onClick={() => handleSwipe("left")} className="focus-ring flex min-h-16 items-center justify-center gap-2.5 rounded-2xl border-2 border-danger/65 bg-danger/15 px-4 py-3 text-base font-black text-danger shadow-[0_8px_24px_rgba(244,63,94,0.18)] transition hover:border-danger hover:bg-danger/25 disabled:opacity-50">
                <ShieldAlert className="size-6 shrink-0" aria-hidden="true" />
                <span>{content.danger}</span>
              </motion.button>
              <motion.button type="button" disabled={saving} whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }} onClick={() => handleSwipe("right")} className="focus-ring flex min-h-16 items-center justify-center gap-2.5 rounded-2xl border-2 border-success/65 bg-success/15 px-4 py-3 text-base font-black text-success shadow-[0_8px_24px_rgba(34,197,94,0.18)] transition hover:border-success hover:bg-success/25 disabled:opacity-50">
                <ShieldCheck className="size-6 shrink-0" aria-hidden="true" />
                <span>{content.safe}</span>
              </motion.button>
            </div>
          </>
        ))}

        {isComplete && (
          <>
            <motion.div ref={completionRef} tabIndex={-1} role="status" initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }} className="focus-ring flex w-full max-w-lg flex-col items-center rounded-[2rem] border-4 border-success/70 bg-[linear-gradient(155deg,rgba(34,197,94,0.18),rgba(0,217,255,0.12),rgba(8,22,48,0.96))] p-8 text-center shadow-[0_0_45px_rgba(34,197,94,0.22)]">
              <motion.span initial={reducedMotion ? false : { scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }} className="grid size-20 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_28px_rgba(255,209,102,0.3)]">
                <Trophy className="size-10" aria-hidden="true" />
              </motion.span>
              <p className="mt-5 font-display text-2xl font-black text-foreground sm:text-3xl">{content.completeMessage}</p>
              <p className="mt-2 text-base font-bold text-neon">{t.starsEarned(correctCount, content.items.length)}</p>
              {feedback && <ScoreFeedback score={feedback.score} />}
            </motion.div>
            <div className="mt-6 w-full"><ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton></div>
          </>
        )}
      </div>
    </div>
  );
}
