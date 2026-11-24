"use client";

import {
  Check,
  Heart,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  answerRetryQuestion,
  continueRetryBattle,
  createRetryProgress,
  retryFailedQuestions,
  retryProgressScore,
  type RetryProgress,
} from "@/features/modules/runner/retry-progress";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { playSound } from "@/features/sound/play-sound";
import { RetryAnswerFeedback } from "./retry-answer-feedback";
import { retryLabels } from "./retry-labels";

export type ShadowBattleContent = {
  prompt: string;
  playerName: string;
  bossName: string;
  strike: string;
  gameOverTitle: string;
  winTitle: string;
  resultCount: string;
  questions: readonly {
    id: string;
    title: string;
    context: string;
    multi: boolean;
    explain: string;
    options: readonly { id: string; text: string; correct: boolean }[];
  }[];
};

const BOSS_HP = 4;
const PLAYER_HP = 3;

const WIN_SPARKS = [
  { x: -88, y: -56, color: "text-gold" },
  { x: -52, y: -86, color: "text-neon" },
  { x: 0, y: -96, color: "text-success" },
  { x: 54, y: -84, color: "text-gold" },
  { x: 90, y: -54, color: "text-pink-400" },
  { x: -96, y: 14, color: "text-success" },
  { x: 96, y: 16, color: "text-neon" },
  { x: -58, y: 66, color: "text-amber-300" },
  { x: 60, y: 64, color: "text-emerald-300" },
] as const;

const arenaCopy = {
  ru: {
    round: (n: number, total: number) => `Раунд ${n} из ${total}`,
    multiHint: "Можно выбрать несколько ответов",
    bossHit: "УДАР! -1",
    playerHit: "АТАКА ТЕНИ! -1",
  },
  ro: {
    round: (n: number, total: number) => `Runda ${n} din ${total}`,
    multiHint: "Poți alege mai multe variante",
    bossHit: "LOVITURĂ! -1",
    playerHit: "ATACUL UMBREI! -1",
  },
} as const;

function ShadowBossIcon() {
  return (
    <svg viewBox="0 0 64 64" className="size-12" aria-hidden="true">
      <path d="M14 54 C14 26 20 12 32 10 C44 12 50 26 50 54 Z" fill="#1e1b4b" stroke="#fb7185" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="32" cy="31" rx="13" ry="12" fill="#090d1f" />
      <path d="M23 29 L29 32 L23 34 Z" fill="#ff4d6d" />
      <path d="M41 29 L35 32 L41 34 Z" fill="#ff4d6d" />
      <path d="M25 40 Q32 44 39 40" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function HpBar({
  label,
  hp,
  max,
  variant,
}: {
  label: string;
  hp: number;
  max: number;
  variant: "player" | "boss";
}) {
  const isPlayer = variant === "player";
  return (
    <div role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${hp}/${max}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="truncate font-display text-sm font-black text-foreground">{label}</p>
        <span className={`text-sm font-black tabular-nums ${isPlayer ? "text-success" : "text-danger"}`}>
          {hp}/{max}
        </span>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: max }, (_, index) => {
          const active = index < hp;
          return isPlayer ? (
            <Heart
              key={index}
              className={`size-5 transition-all duration-300 ${
                active ? "scale-100 fill-success text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "scale-90 text-slate-600"
              }`}
            />
          ) : (
            <span
              key={index}
              className={`h-3.5 flex-1 rounded-full border-2 transition-all duration-300 ${
                active
                  ? "border-transparent bg-gradient-to-r from-rose-500 to-danger shadow-[0_0_12px_rgba(244,63,94,0.45)]"
                  : "border-foreground/15 bg-slate-900/70"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ShadowBattleStage({
  locale,
  content,
  nextLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: ShadowBattleContent;
  nextLabel: string;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(() => createRetryProgress(content.questions.map((question) => question.id)));
  const progressRef = useRef(progress);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const resultsRef = useRef(results);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"playing" | "gameover" | "win" | "fail">("playing");
  const [hitTarget, setHitTarget] = useState<"boss" | "player" | null>(null);
  const [hitKey, setHitKey] = useState(0);
  const terminalRef = useRef(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const question = content.questions.find((item) => item.id === progress.questionIds[progress.index]);
  const correctHits = Object.values(results).filter(Boolean).length;
  const revealed = progress.feedback !== null;
  const ui = arenaCopy[locale];
  const update = (next: RetryProgress) => {
    progressRef.current = next;
    setProgress(next);
  };

  useEffect(() => {
    if (status !== "playing") headingRef.current?.focus();
  }, [status]);

  function resolve(selection: ReadonlySet<string>) {
    if (saving || !question || progressRef.current.feedback || status !== "playing") return;
    const correctIds = question.options.filter((option) => option.correct).map((option) => option.id);
    const hit = selection.size === correctIds.length && correctIds.every((id) => selection.has(id));
    resultsRef.current = { ...resultsRef.current, [question.id]: hit };
    setResults(resultsRef.current);
    update(answerRetryQuestion(progressRef.current, hit, question.explain));
    setHitTarget(hit ? "boss" : "player");
    setHitKey((k) => k + 1);
    playSound(hit ? "correct" : "wrong");
    if (hit) setBossHp((hp) => Math.max(0, hp - 1));
    else setPlayerHp((hp) => Math.max(0, hp - 1));
  }

  function toggle(id: string) {
    if (saving || !question || progressRef.current.feedback || status !== "playing") return;
    if (!question.multi) {
      resolve(new Set([id]));
      return;
    }
    setPicked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function advance() {
    if (saving || terminalRef.current || !progressRef.current.feedback) return;
    const next = continueRetryBattle(progressRef.current, playerHp, bossHp);
    terminalRef.current = next.outcome !== "playing";
    update(next.progress);
    setStatus(next.outcome);
    setPicked(new Set());
    setHitTarget(null);
    if (next.outcome === "win") {
      onComplete(retryProgressScore(progressRef.current, Object.keys(progressRef.current.firstAttempts).length));
    }
  }

  function retry() {
    if (saving || status === "playing" || status === "win") return;
    terminalRef.current = false;
    update(retryFailedQuestions(progressRef.current, resultsRef.current));
    setPlayerHp(PLAYER_HP);
    setPicked(new Set());
    setHitTarget(null);
    setStatus("playing");
  }

  if (status !== "playing") {
    const won = status === "win";
    return (
      <motion.div
        role={won ? "status" : "alert"}
        initial={reducedMotion ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className={`relative overflow-hidden rounded-[2rem] border-4 p-8 text-center ${
          won
            ? "border-success/75 bg-[linear-gradient(155deg,rgba(34,197,94,0.2),rgba(0,217,255,0.12),rgba(8,22,48,0.96))] shadow-[0_0_46px_rgba(34,197,94,0.25)]"
            : "border-danger/70 bg-danger/10 shadow-[0_0_36px_rgba(244,63,94,0.2)]"
        }`}
      >
        <div className="relative mx-auto flex size-20 items-center justify-center">
          {!reducedMotion && won && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              {WIN_SPARKS.map((spark, idx) => (
                <motion.span
                  key={idx}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: spark.x, y: spark.y, scale: [0, 1.25, 0.7], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.9, delay: idx * 0.03, ease: "easeOut" }}
                  className={`absolute ${spark.color}`}
                >
                  {idx % 2 === 0 ? <Star className="size-4 fill-current" /> : <Sparkles className="size-4" />}
                </motion.span>
              ))}
            </div>
          )}
          <span
            className={`grid size-20 place-items-center rounded-full border-4 ${
              won
                ? "border-gold bg-gold/20 text-gold shadow-[0_0_28px_rgba(255,209,102,0.35)]"
                : "border-danger bg-danger/20 text-danger"
            }`}
          >
            {won ? <Trophy className="size-10" aria-hidden="true" /> : <ShieldAlert className="size-10" aria-hidden="true" />}
          </span>
        </div>

        <p ref={headingRef} tabIndex={-1} className="focus-ring mt-5 font-display text-2xl font-black text-foreground sm:text-3xl">
          {won ? content.winTitle : content.gameOverTitle}
        </p>
        <p className="mt-2 text-base font-bold text-neon">{content.resultCount.replace("{score}", String(correctHits))}</p>
        {!won && <p className="mt-3 text-base text-foreground">{retryLabels[locale].questionsKept}</p>}
        {!won && (
          <motion.button
            type="button"
            onClick={retry}
            disabled={saving}
            whileHover={reducedMotion ? undefined : { scale: 1.03 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-danger px-8 text-base font-black text-white shadow-[0_0_24px_rgba(244,63,94,0.35)] disabled:opacity-60"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {retryLabel}
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(244,63,94,0.08),rgba(8,18,40,0.92))] p-4 sm:p-5">
        <p className="flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
          <Swords className="size-5 shrink-0 text-gold" aria-hidden="true" />
          {content.prompt}
        </p>

        <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <motion.div
            key={hitTarget === "player" ? `p-hit-${hitKey}` : "p-steady"}
            animate={!reducedMotion && hitTarget === "player" ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
            transition={{ duration: 0.42 }}
            className={`relative rounded-2xl border-2 bg-slate-950/75 p-4 transition-colors ${
              hitTarget === "player" ? "border-danger shadow-[0_0_24px_rgba(244,63,94,0.3)]" : "border-success/45"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-success/60 bg-success/15 text-success shadow-[0_0_18px_rgba(34,197,94,0.22)]">
                <ShieldCheck className="size-7" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <HpBar label={content.playerName} hp={playerHp} max={PLAYER_HP} variant="player" />
              </div>
            </div>
            <AnimatePresence>
              {hitTarget === "player" && (
                <motion.span
                  key={`p-badge-${hitKey}`}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-3 right-3 rounded-full border border-danger bg-danger px-2.5 py-0.5 text-sm font-black text-white shadow-lg"
                >
                  {ui.playerHit}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex justify-center" aria-hidden="true">
            <motion.span
              key={`vs-${hitKey}`}
              animate={reducedMotion || !hitTarget ? undefined : { scale: [1, 1.35, 1], rotate: [0, 12, -12, 0] }}
              transition={{ duration: 0.4 }}
              className={`grid size-12 place-items-center rounded-full border-2 font-display text-sm font-black shadow-lg ${
                hitTarget === "boss"
                  ? "border-neon bg-neon/20 text-neon shadow-[0_0_24px_rgba(0,217,255,0.4)]"
                  : hitTarget === "player"
                    ? "border-danger bg-danger/20 text-danger"
                    : "border-gold/60 bg-gold/15 text-gold"
              }`}
            >
              {hitTarget === "boss" ? <Zap className="size-6 fill-current" /> : "VS"}
            </motion.span>
          </div>

          <motion.div
            key={hitTarget === "boss" ? `b-hit-${hitKey}` : "b-steady"}
            animate={!reducedMotion && hitTarget === "boss" ? { x: [0, 12, -12, 8, -8, 0] } : { x: 0 }}
            transition={{ duration: 0.42 }}
            className={`relative rounded-2xl border-2 bg-slate-950/75 p-4 transition-colors ${
              hitTarget === "boss" ? "border-neon shadow-[0_0_26px_rgba(0,217,255,0.35)]" : "border-danger/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-danger/60 bg-danger/15 shadow-[0_0_18px_rgba(244,63,94,0.22)]"
              >
                <ShadowBossIcon />
              </motion.span>
              <div className="min-w-0 flex-1">
                <HpBar label={content.bossName} hp={bossHp} max={BOSS_HP} variant="boss" />
              </div>
            </div>
            <AnimatePresence>
              {hitTarget === "boss" && (
                <motion.span
                  key={`b-badge-${hitKey}`}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full border border-neon bg-neon px-2.5 py-0.5 text-sm font-black text-slate-950 shadow-lg"
                >
                  <Zap className="size-3.5 fill-current" aria-hidden="true" />
                  {ui.bossHit}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {question && (
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-5 rounded-3xl border-2 border-danger/45 bg-[linear-gradient(155deg,rgba(244,63,94,0.1),rgba(8,18,40,0.95))] p-5 shadow-[0_16px_42px_rgba(0,0,0,0.35)] sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/45 bg-danger/15 px-3 py-1 font-display text-sm font-black uppercase tracking-wider text-danger">
                <Swords className="size-4" aria-hidden="true" />
                {ui.round(content.questions.indexOf(question) + 1, content.questions.length)}
              </span>
              {question.multi && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-sm font-bold text-gold">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {ui.multiHint}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/65 p-4">
              <p className="font-display text-lg font-black leading-snug text-foreground sm:text-xl">{question.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{question.context}</p>
            </div>

            {!revealed ? (
              <div className="mt-4 grid gap-2.5">
                {question.options.map((option, optIdx) => {
                  const isPicked = picked.has(option.id);
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(option.id)}
                      disabled={saving}
                      aria-pressed={question.multi ? isPicked : undefined}
                      whileHover={reducedMotion ? undefined : { scale: 1.015, x: 2 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                      className={`focus-ring flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition ${
                        isPicked
                          ? "border-success bg-success/20 text-foreground shadow-[0_0_18px_rgba(34,197,94,0.2)]"
                          : "border-border bg-card/85 text-foreground hover:border-neon/65 hover:bg-neon/10"
                      }`}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-xl border font-display text-sm font-black ${
                          isPicked
                            ? "border-success bg-success text-slate-950"
                            : "border-neon/40 bg-neon/10 text-neon"
                        }`}
                        aria-hidden="true"
                      >
                        {isPicked ? <Check className="size-4 stroke-[3]" /> : letter}
                      </span>
                      <span className="flex-1 leading-snug">{option.text}</span>
                    </motion.button>
                  );
                })}
                {question.multi && (
                  <motion.button
                    type="button"
                    onClick={() => resolve(picked)}
                    disabled={saving || picked.size === 0}
                    whileHover={reducedMotion || picked.size === 0 ? undefined : { scale: 1.02 }}
                    whileTap={reducedMotion || picked.size === 0 ? undefined : { scale: 0.96 }}
                    className="focus-ring mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-danger to-rose-500 px-6 text-base font-black text-white shadow-[0_0_24px_rgba(244,63,94,0.35)] disabled:opacity-50"
                  >
                    <Zap className="size-5 fill-current" aria-hidden="true" />
                    {content.strike}
                  </motion.button>
                )}
              </div>
            ) : (
              <RetryAnswerFeedback
                key={question.id}
                locale={locale}
                correct={progress.feedback!.correct}
                explanation={question.explain}
                nextLabel={nextLabel}
                onNext={advance}
                disabled={saving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
