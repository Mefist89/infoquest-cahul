"use client";

import { Heart, ShieldCheck, Skull, Trophy, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import {
  answerRetryQuestion,
  continueRetryPhase,
  continueRetryProgress,
  createRetryProgress,
  findRetryDetail,
  restartRetryPhase,
  retryProgressScore,
  type RetryProgress,
} from "@/features/modules/runner/retry-progress";
import { useNoTimer } from "@/features/modules/runner/use-no-timer";
import { TimerGameStart } from "../shared/timer-setting";
import { FinalPhase1Phone, FinalPhase2Phone, FinalPhase3Phone, type VisualScenario } from "./final-phone-phases";
import { StageRetryFeedback } from "./stage-retry-feedback";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

const BLITZ_SECONDS = 25;

function FinalStage({
  locale,
  content,
  check,
  retry,
  saving,
  feedback,
  onSubmit,
}: {
  locale: OperatorLocale;
  content: (typeof operatorCallContent)["ru"]["final"] | (typeof operatorCallContent)["ro"]["final"];
  check: string;
  retry: string;
  saving: boolean;
  feedback: { score: number; passed?: boolean } | null;
  onSubmit: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const noTimer = useNoTimer();
  const [started, setStarted] = useState(false);
  const MAX_PLAYER_HP = 3;
  const MAX_BOSS_HP = 10;

  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [currentPhase, setCurrentPhase] = useState(0);
  const phaseIds = useMemo(
    () => [content.phase1.map((item) => item.id), content.phase2.map((item) => item.id), content.phase3.map((item) => item.id)],
    [content],
  );
  const [progress, setProgress] = useState(() => createRetryProgress(phaseIds[0]));
  const progressRef = useRef(progress);
  const currentLevel = progress.index;
  const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());
  const [bossSelected, setBossSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"playing" | "gameover" | "win">("playing");
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(BLITZ_SECONDS);
  const [shakeKey, setShakeKey] = useState(0);
  const [blitzPaused, setBlitzPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const foundDetailsRef = useRef(foundDetails);
  const phaseRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];

  const updateProgress = useCallback((next: RetryProgress) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  const takeDamage = useCallback(
    (deferGameOver = false) => {
      setShakeKey((k) => k + 1);
      setPlayerHp((hp) => Math.max(0, hp - 1));
      if (playerHp <= 1 && !deferGameOver) setStatus("gameover");
    },
    [playerHp],
  );

  const advanceLevel = useCallback(() => {
    const next = continueRetryProgress(progressRef.current);
    foundDetailsRef.current = new Set();
    setFoundDetails(new Set());
    setBossSelected(new Set());
    if (next.index >= next.questionIds.length) {
      if (currentPhase < 2) {
        setCurrentPhase((phase) => phase + 1);
        updateProgress(createRetryProgress(phaseIds[currentPhase + 1], next.firstAttempts));
      } else {
        updateProgress(next);
        setStatus("win");
      }
    } else updateProgress(next);
    setBlitzTimeLeft(BLITZ_SECONDS);
    setBlitzPaused(false);
  }, [currentPhase, phaseIds, updateProgress]);

  const showAnswer = useCallback(
    (correct: boolean, explanation: string, complete = true) => {
      if (progressRef.current.feedback) return;
      updateProgress(answerRetryQuestion(progressRef.current, correct, explanation, complete));
      setBlitzPaused(true);
      setAnnouncement(correct ? a11y.correct : a11y.wrong);
      playSound(correct ? "correct" : "wrong");
      if (!correct) takeDamage(true);
    },
    [a11y.correct, a11y.wrong, takeDamage, updateProgress],
  );

  useEffect(() => {
    if (!started || noTimer || status !== "playing" || currentPhase !== 1 || blitzPaused || progress.feedback) return;
    const timer = window.setTimeout(() => {
      if (blitzTimeLeft <= 1) showAnswer(false, content.phase2[currentLevel].explain);
      else setBlitzTimeLeft(blitzTimeLeft - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [blitzPaused, blitzTimeLeft, content, currentLevel, currentPhase, progress.feedback, showAnswer, status, started, noTimer]);

  useEffect(() => {
    if (status !== "playing" || currentPhase !== 0 || !progress.feedback?.complete) return;
    const timer = window.setTimeout(advanceLevel, 380);
    return () => window.clearTimeout(timer);
  }, [advanceLevel, currentPhase, progress.feedback, status]);

  useEffect(() => {
    if (status === "playing") phaseRef.current?.focus();
    else statusRef.current?.focus();
  }, [currentLevel, currentPhase, status, progress.feedback, started]);

  const handleVisualClick = (targetId: string, isCorrect: boolean) => {
    if (status !== "playing" || progressRef.current.feedback || foundDetails.has(targetId) || foundDetailsRef.current.has(targetId)) return;
    const result = findRetryDetail(
      progressRef.current,
      foundDetailsRef.current,
      targetId,
      isCorrect,
      content.phase1[currentLevel].correctTargets.length,
    );
    if (result.ignored) return;
    updateProgress(result.progress);
    if (isCorrect) {
      playSound("correct");
      setAnnouncement(`${a11y.correct}. ${a11y.found}: ${targetId}`);
      const next = new Set(result.found);
      foundDetailsRef.current = next;
      setFoundDetails(next);
    } else {
      playSound("wrong");
      setAnnouncement(a11y.wrong);
      takeDamage();
    }
  };

  const handleBlitzClick = (optionIndex: number) => {
    if (status !== "playing" || progressRef.current.feedback) return;
    const question = content.phase2[currentLevel];
    showAnswer(optionIndex === question.answer, question.explain);
  };

  const handleBossClick = (optionIndex: number) => {
    if (status !== "playing" || progressRef.current.feedback || bossSelected.has(optionIndex)) return;
    const question = content.phase3[currentLevel];
    const correct = question.answers.includes(optionIndex);
    const next = new Set(bossSelected).add(optionIndex);
    const complete = correct && next.size >= question.answers.length;
    if (correct) setBossSelected(next);
    if (complete) setBossHp((hp) => Math.max(0, hp - 1));
    showAnswer(correct, question.explain, complete);
  };

  function continueExplanation() {
    const answer = progressRef.current.feedback;
    if (!answer) return;
    const result = continueRetryPhase(progressRef.current, playerHp);
    if (result.outcome === "gameover") {
      setStatus("gameover");
      return;
    }
    if (answer.complete) advanceLevel();
    else {
      updateProgress(result.progress);
      if (!answer.correct) setBossSelected(new Set());
      setBlitzTimeLeft(BLITZ_SECONDS);
      setBlitzPaused(false);
    }
  }

  const restart = () => {
    setPlayerHp(MAX_PLAYER_HP);
    if (currentPhase === 2) setBossHp(MAX_BOSS_HP);
    updateProgress(restartRetryPhase(progressRef.current));
    setStatus("playing");
    setBlitzTimeLeft(BLITZ_SECONDS);
    setBlitzPaused(false);
    foundDetailsRef.current = new Set();
    setFoundDetails(new Set());
    setBossSelected(new Set());
  };

  if (!started) return <TimerGameStart locale={locale} onStart={() => setStarted(true)} />;

  if (status === "gameover") {
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
        <p className="mb-8 text-2xl font-black text-foreground">{content.gameOver}</p>
        <button
          type="button"
          onClick={restart}
          className="focus-ring min-h-12 min-w-11 rounded-2xl bg-danger px-10 py-3.5 text-base font-black text-danger-foreground transition hover:scale-105"
        >
          {retry}
        </button>
      </motion.div>
    );
  }

  if (status === "win") {
    return (
      <motion.div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        initial={reducedMotion ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="focus-ring mx-auto flex max-w-lg flex-col items-center rounded-[2rem] border-4 border-success/75 bg-[linear-gradient(155deg,rgba(34,197,94,0.18),rgba(0,217,255,0.12),rgba(8,22,48,0.96))] p-8 text-center shadow-[0_0_40px_rgba(34,197,94,0.22)]"
      >
        <span className="grid size-20 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_26px_rgba(255,209,102,0.3)]">
          <Trophy className="size-10" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-2xl font-black text-foreground">{content.win}</p>
        {feedback && <ScoreFeedback score={feedback.score} />}
        <div className="mt-6 w-full">
          <ActionButton
            disabled={saving}
            onClick={() => onSubmit(retryProgressScore(progress, phaseIds.reduce((total, ids) => total + ids.length, 0)))}
            center
          >
            {check}
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  const currentVisual = content.phase1[currentLevel] as VisualScenario;
  const playerHpLabel = locale === "ro" ? "Forța ta" : "Твои силы";
  const bossHpLabel = locale === "ro" ? "Forța escrocului" : "Силы мошенника";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center pb-8">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <div className="mb-6 grid w-full gap-3 rounded-3xl border-2 border-neon/30 bg-slate-900/75 p-4 sm:grid-cols-2">
        <div className="flex items-center gap-3" role="progressbar" aria-valuenow={playerHp} aria-valuemin={0} aria-valuemax={MAX_PLAYER_HP} aria-label={`${playerHpLabel}: ${playerHp}/${MAX_PLAYER_HP}`}>
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/50 bg-success/15 text-success">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">{playerHpLabel} · {playerHp}/{MAX_PLAYER_HP}</p>
            <div className="mt-1 flex gap-1.5" aria-hidden="true">
              {Array.from({ length: MAX_PLAYER_HP }).map((_, i) => (
                <Heart key={i} className={`size-5 transition-all ${i < playerHp ? "fill-success text-success" : "text-slate-600"}`} />
              ))}
            </div>
          </div>
        </div>

        {currentPhase === 2 && (
          <div className="flex items-center gap-3" role="progressbar" aria-valuenow={bossHp} aria-valuemin={0} aria-valuemax={MAX_BOSS_HP} aria-label={`${bossHpLabel}: ${bossHp}/${MAX_BOSS_HP}`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-danger/50 bg-danger/15 text-danger">
              <Skull className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">{bossHpLabel} · {bossHp}/{MAX_BOSS_HP}</p>
              <div className="mt-1.5 grid grid-flow-col auto-cols-fr gap-1" aria-hidden="true">
                {Array.from({ length: MAX_BOSS_HP }).map((_, i) => (
                  <span key={i} className={`h-3 rounded-full border ${i < bossHp ? "border-transparent bg-danger" : "border-foreground/20"}`} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {currentPhase === 0 && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring flex w-full flex-col items-center">
          <p className="mb-4 text-center text-base font-bold text-neon sm:text-lg">{content.phase1Intro}</p>
          <FinalPhase1Phone
            locale={locale}
            currentLevel={currentLevel}
            totalLevels={content.phase1.length}
            visual={currentVisual}
            cluesLabel={content.clues}
            foundDetails={foundDetails}
            shakeKey={shakeKey}
            onVisualClick={handleVisualClick}
          />
        </div>
      )}

      {currentPhase > 0 && progress.feedback && (
        <StageRetryFeedback locale={locale} feedback={progress.feedback} onContinue={continueExplanation} />
      )}

      {currentPhase === 1 && !progress.feedback && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring flex w-full flex-col items-center">
          <p className="mb-4 text-center text-base font-bold text-gold sm:text-lg">
            {noTimer ? (locale === "ru" ? "Фаза 2: Блиц. Отвечай в своём темпе." : "Faza 2: Blitz. Răspunde în ritmul tău.") : content.phase2Intro}
          </p>
          <FinalPhase2Phone
            locale={locale}
            currentLevel={currentLevel}
            totalLevels={content.phase2.length}
            text={content.phase2[currentLevel].text}
            options={content.phase2[currentLevel].options}
            noTimer={noTimer}
            blitzTimeLeft={blitzTimeLeft}
            blitzPaused={blitzPaused}
            shakeKey={shakeKey}
            onTogglePause={() => {
              setBlitzPaused((value) => !value);
              setAnnouncement(blitzPaused ? a11y.resume : a11y.paused);
            }}
            onSelect={handleBlitzClick}
          />
        </div>
      )}

      {currentPhase === 2 && !progress.feedback && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring flex w-full flex-col items-center">
          <p className="mb-4 text-center text-base font-bold text-danger sm:text-lg">{content.phase3Intro}</p>
          <FinalPhase3Phone
            locale={locale}
            currentLevel={currentLevel}
            totalLevels={content.phase3.length}
            bossText={content.phase3[currentLevel].bossText}
            options={content.phase3[currentLevel].options}
            bossSelected={bossSelected}
            shakeKey={shakeKey}
            onSelect={handleBossClick}
          />
        </div>
      )}
    </div>
  );
}

export { FinalStage };
