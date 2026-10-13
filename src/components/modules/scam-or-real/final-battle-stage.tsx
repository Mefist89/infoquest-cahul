"use client";

import { useState } from "react";
import { Check, ShieldAlert, Skull, Swords } from "lucide-react";

import { scamOrRealContent } from "@/data/scam-or-real";

type ShopBattleContent =
  | (typeof scamOrRealContent)["ru"]["shopBattle"]
  | (typeof scamOrRealContent)["ro"]["shopBattle"];

const BOSS_HP = 4;
const PLAYER_HP = 3;

function HpBar({ label, hp, max, barClass }: { label: string; hp: number; max: number; barClass: string }) {
  return (
    <div className="min-w-0" role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${hp}/${max}`}>
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-foreground">{label} · {hp}/{max}</p>
      <div className="grid auto-cols-fr grid-flow-col gap-1" aria-hidden="true">
        {Array.from({ length: max }).map((_, position) => (
          <span key={position} className={`h-3 min-w-0 rounded-full border-2 transition-all ${position < hp ? `${barClass} border-transparent` : "border-foreground/20 bg-transparent"}`} />
        ))}
      </div>
    </div>
  );
}

export function FinalBattleStage({
  content,
  nextLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  content: ShopBattleContent;
  nextLabel: string;
  retryLabel: string;
  saving: boolean;
  onComplete: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<"playing" | "gameover" | "win" | "fail">("playing");
  const [correctHits, setCorrectHits] = useState(0);

  const question = content.questions[index];
  const correctIds = new Set<string>(question?.options.filter((option) => option.correct).map((option) => option.id) ?? []);
  const lastQuestion = index >= content.questions.length - 1;

  function toggle(optionId: string) {
    if (!question || revealed || saving || status !== "playing") return;
    if (!question.multi) {
      resolve(new Set([optionId]));
      return;
    }
    setPicked((previous) => {
      const next = new Set(previous);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }

  function resolve(selection: Set<string>) {
    if (!question) return;
    const hit = selection.size === correctIds.size && [...selection].every((id) => correctIds.has(id));
    const answered = index + 1;
    setRevealed(true);
    if (hit) {
      const nextBoss = bossHp - 1;
      const nextHits = correctHits + 1;
      setBossHp(nextBoss);
      setCorrectHits(nextHits);
      if (nextBoss <= 0) {
        setStatus("win");
        onComplete(Math.round((nextHits / answered) * 100));
      } else if (lastQuestion) {
        setStatus("fail");
      }
    } else {
      const nextPlayer = playerHp - 1;
      setPlayerHp(nextPlayer);
      if (nextPlayer <= 0) setStatus("gameover");
      else if (lastQuestion) setStatus("fail");
    }
  }

  function advance() {
    if (lastQuestion) return;
    setIndex((current) => current + 1);
    setPicked(new Set());
    setRevealed(false);
  }

  function retry() {
    setIndex(0);
    setPlayerHp(PLAYER_HP);
    setBossHp(BOSS_HP);
    setPicked(new Set());
    setRevealed(false);
    setStatus("playing");
    setCorrectHits(0);
  }

  if (status === "gameover" || status === "fail") {
    return (
      <div role="alert" className="flex flex-col items-center p-8 text-center">
        <ShieldAlert className="mb-4 size-16 text-danger" aria-hidden="true" />
        <p className="text-xl font-black text-foreground">{content.gameOverTitle}</p>
        <p className="mt-2 text-sm font-bold text-muted-foreground">{content.resultCount.replace("{score}", String(correctHits))}</p>
        <button type="button" onClick={retry} className="focus-ring mt-6 inline-flex min-h-12 items-center rounded-xl bg-danger px-8 text-sm font-black text-white transition hover:-translate-y-0.5">
          {retryLabel}
        </button>
      </div>
    );
  }

  if (status === "win") {
    return (
      <div role="status" className="flex flex-col items-center rounded-3xl border-2 border-neon/40 bg-neon/10 p-8 text-center shadow-[0_0_40px_rgba(0,217,255,0.15)]">
        <Check className="mb-4 size-16 text-neon" aria-hidden="true" />
        <p className="text-xl font-black text-foreground">{content.winTitle}</p>
        <p className="mt-2 text-sm font-bold text-muted-foreground">{content.resultCount.replace("{score}", String(correctHits))}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="flex items-center gap-2 text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">
        <Swords className="size-5 shrink-0 text-danger" aria-hidden="true" />
        {content.prompt}
      </p>

      <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-2">
        <HpBar label={content.playerName} hp={playerHp} max={PLAYER_HP} barClass="bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <HpBar label={content.bossName} hp={bossHp} max={BOSS_HP} barClass="bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
      </div>

      {question && (
        <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/5 p-4 sm:p-5" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {index + 1}/{content.questions.length}
          </p>
          <div className="mt-2 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-danger/50 bg-slate-900" aria-hidden="true">
              <Skull className="size-6 animate-pulse text-danger" />
            </span>
            <div>
              <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">{question.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{question.context}</p>
            </div>
          </div>

          {!revealed ? (
            <div className="mt-4 grid gap-2">
              {question.options.map((option) => {
                const active = picked.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggle(option.id)}
                    aria-pressed={question.multi ? active : undefined}
                    className={`focus-ring min-h-12 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition sm:text-base ${
                      active
                        ? "border-success bg-success/20 text-success"
                        : "border-border bg-card/70 text-foreground hover:border-danger/60"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
              {question.multi && (
                <button
                  type="button"
                  onClick={() => resolve(picked)}
                  disabled={saving || picked.size === 0}
                  className="focus-ring mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-danger px-6 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {content.strike}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="mt-3 text-sm text-foreground/90">{question.explain}</p>
              {!lastQuestion && (
                <button
                  type="button"
                  onClick={advance}
                  disabled={saving}
                  className="focus-ring mt-3 inline-flex min-h-11 items-center rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {nextLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
