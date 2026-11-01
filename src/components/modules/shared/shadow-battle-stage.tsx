"use client";

import { Check, ShieldAlert, Skull, Swords } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { answerRetryQuestion, continueRetryBattle, createRetryProgress, retryFailedQuestions, retryProgressScore, type RetryProgress } from "@/features/modules/runner/retry-progress";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { RetryAnswerFeedback } from "./retry-answer-feedback";
import { retryLabels } from "./retry-labels";

export type ShadowBattleContent = {
  prompt: string; playerName: string; bossName: string; strike: string;
  gameOverTitle: string; winTitle: string; resultCount: string;
  questions: readonly {
    id: string; title: string; context: string; multi: boolean; explain: string;
    options: readonly { id: string; text: string; correct: boolean }[];
  }[];
};

const BOSS_HP = 4;
const PLAYER_HP = 3;

function HpBar({ label, hp, max, color }: { label: string; hp: number; max: number; color: string }) {
  return <div role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${hp}/${max}`}>
    <p className="mb-1 text-sm font-bold text-foreground">{label} · {hp}/{max}</p>
    <div className="grid auto-cols-fr grid-flow-col gap-1" aria-hidden="true">{Array.from({ length: max }, (_, index) => <span key={index} className={`h-3 rounded-full border-2 ${index < hp ? `${color} border-transparent` : "border-foreground/20"}`} />)}</div>
  </div>;
}

export function ShadowBattleStage({ locale, content, nextLabel, retryLabel, saving, onComplete }: {
  locale: "ru" | "ro"; content: ShadowBattleContent; nextLabel: string; retryLabel: string; saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const [progress, setProgress] = useState(() => createRetryProgress(content.questions.map(question => question.id)));
  const progressRef = useRef(progress);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const resultsRef = useRef(results);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"playing" | "gameover" | "win" | "fail">("playing");
  const terminalRef = useRef(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const question = content.questions.find(item => item.id === progress.questionIds[progress.index]);
  const correctHits = Object.values(results).filter(Boolean).length;
  const revealed = progress.feedback !== null;
  const update = (next: RetryProgress) => { progressRef.current = next; setProgress(next); };

  useEffect(() => { if (status !== "playing") headingRef.current?.focus(); }, [status]);

  function resolve(selection: ReadonlySet<string>) {
    if (saving || !question || progressRef.current.feedback || status !== "playing") return;
    const correctIds = question.options.filter(option => option.correct).map(option => option.id);
    const hit = selection.size === correctIds.length && correctIds.every(id => selection.has(id));
    resultsRef.current = { ...resultsRef.current, [question.id]: hit };
    setResults(resultsRef.current);
    update(answerRetryQuestion(progressRef.current, hit, question.explain));
    if (hit) setBossHp(hp => Math.max(0, hp - 1));
    else setPlayerHp(hp => Math.max(0, hp - 1));
  }

  function toggle(id: string) {
    if (saving || !question || progressRef.current.feedback || status !== "playing") return;
    if (!question.multi) { resolve(new Set([id])); return; }
    setPicked(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
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
    if (next.outcome === "win") onComplete(retryProgressScore(progressRef.current, Object.keys(progressRef.current.firstAttempts).length));
  }

  function retry() {
    if (saving || status === "playing" || status === "win") return;
    terminalRef.current = false;
    update(retryFailedQuestions(progressRef.current, resultsRef.current));
    setPlayerHp(PLAYER_HP);
    setPicked(new Set());
    setStatus("playing");
  }

  if (status !== "playing") {
    const won = status === "win";
    return <div role={won ? "status" : "alert"} className="rounded-3xl border border-border p-8 text-center">
      {won ? <Check className="mx-auto mb-4 size-16 text-success" aria-hidden="true" /> : <ShieldAlert className="mx-auto mb-4 size-16 text-danger" aria-hidden="true" />}
      <p ref={headingRef} tabIndex={-1} className="focus-ring text-xl font-black text-foreground">{won ? content.winTitle : content.gameOverTitle}</p>
      <p className="mt-2 text-base font-bold text-muted-foreground">{content.resultCount.replace("{score}", String(correctHits))}</p>
      {!won && <p className="mt-3 text-base text-foreground">{retryLabels[locale].questionsKept}</p>}
      {!won && <button type="button" onClick={retry} disabled={saving} className="focus-ring mt-6 min-h-12 rounded-xl bg-danger px-8 text-base font-black text-white disabled:opacity-60">{retryLabel}</button>}
    </div>;
  }

  return <div>
    <p className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg"><Swords className="size-5 shrink-0 text-danger" aria-hidden="true" />{content.prompt}</p>
    <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-2">
      <HpBar label={content.playerName} hp={playerHp} max={PLAYER_HP} color="bg-success" />
      <HpBar label={content.bossName} hp={bossHp} max={BOSS_HP} color="bg-danger" />
    </div>
    {question && <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/5 p-4 sm:p-5">
      <p className="text-sm font-bold text-muted-foreground">{content.questions.indexOf(question) + 1}/{content.questions.length}</p>
      <div className="mt-2 flex items-start gap-3"><Skull className="size-6 shrink-0 text-danger" aria-hidden="true" /><div><p className="text-base font-bold text-foreground sm:text-lg">{question.title}</p><p className="mt-1 text-sm text-muted-foreground">{question.context}</p></div></div>
      {!revealed ? <div className="mt-4 grid gap-2">
        {question.options.map(option => <button key={option.id} type="button" onClick={() => toggle(option.id)} disabled={saving} aria-pressed={question.multi ? picked.has(option.id) : undefined} className={`focus-ring min-h-14 rounded-xl border px-4 py-3 text-left text-base font-semibold ${picked.has(option.id) ? "border-success bg-success/20 text-success" : "border-border bg-card/70 text-foreground"}`}>{option.text}</button>)}
        {question.multi && <button type="button" onClick={() => resolve(picked)} disabled={saving || picked.size === 0} className="focus-ring min-h-12 rounded-xl bg-danger px-6 text-base font-black text-white disabled:opacity-60">{content.strike}</button>}
      </div> : <RetryAnswerFeedback key={question.id} locale={locale} correct={progress.feedback!.correct} explanation={question.explain} nextLabel={nextLabel} onNext={advance} disabled={saving} />}
    </div>}
  </div>;
}
