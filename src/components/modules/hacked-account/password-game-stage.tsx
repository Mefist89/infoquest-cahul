"use client";

import { useState } from "react";
import { useRetryQuiz } from "@/features/modules/runner/use-retry-quiz";
import { retryLabels } from "../shared/retry-labels";
import { KeyRound, ShieldAlert, ShieldCheck, Check, X } from "lucide-react";

import type { hackedAccountContent } from "@/data/hacked-account";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type PasswordGameContent =
  | (typeof hackedAccountContent)["ru"]["passwordGame"]
  | (typeof hackedAccountContent)["ro"]["passwordGame"];

const PASS_COUNT = 5;

export function PasswordGameStage({
  locale,
  content,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: PasswordGameContent;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, "strong" | "weak">>({});
  const quiz = useRetryQuiz(content.items.map(entry => entry.id), PASS_COUNT, onComplete, saving);
  const { index, revealed, finished, passed, correctCount, advance, retry } = quiz;

  const item = content.items[index];
  const answer = item ? answers[item.id] : undefined;
  const isCorrect = item && answer === item.verdict;

  function choose(verdict: "strong" | "weak") {
    if (!item || revealed || saving) return;
    if (quiz.answer(verdict === item.verdict, item.explain)) {
      setAnswers((previous) => ({ ...previous, [item.id]: verdict }));
    }
  }

  const counter = (quiz.retrying ? retryLabels[locale].repeat : retryLabels[locale].question)
    .replace("{current}", String(quiz.roundPosition))
    .replace("{total}", String(quiz.roundTotal));

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>
      {quiz.retrying && !finished && <p role="status" className="mt-3 text-base font-bold text-success">{retryLabels[locale].questionsKept}</p>}

      <div aria-live="polite" className="mt-6">
        {!finished && item ? (
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {counter}
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-background/60 p-5 text-center sm:p-6">
              <KeyRound className="mx-auto size-8 text-neon" aria-hidden="true" />
              <p className="mt-3 font-mono text-xl font-black break-all text-foreground sm:text-2xl">{item.password}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.context}</p>

              {!revealed ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => choose("strong")}
                    className="focus-ring min-w-11 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-success/40 bg-success/10 px-2 text-center text-base font-black text-success transition hover:bg-success/20"
                  >
                    <ShieldCheck className="size-5" aria-hidden="true" />
                    {content.strong}
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("weak")}
                    className="focus-ring min-w-11 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-danger/40 bg-danger/10 px-2 text-center text-base font-black text-danger transition hover:bg-danger/20"
                  >
                    <ShieldAlert className="size-5" aria-hidden="true" />
                    {content.weak}
                  </button>
                </div>
              ) : (
                <div className={`mt-5 rounded-xl border p-4 text-left ${isCorrect ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
                  <p className={`flex items-center gap-2 text-base font-black ${isCorrect ? "text-success" : "text-danger"}`}>
                    {isCorrect ? <Check className="size-5 shrink-0" aria-hidden="true" /> : <X className="size-5 shrink-0" aria-hidden="true" />}{isCorrect ? content.correctMark : content.wrongMark}
                  </p>
                  <p className="mt-1 text-sm text-foreground/90">{item.explain}</p>
                  <button
                    type="button"
                    onClick={advance}
                    disabled={saving}
                    className="focus-ring min-w-11 mt-3 inline-flex min-h-11 items-center rounded-xl bg-neon px-5 text-base font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {content.next}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
            <p className={`text-base font-black ${passed ? "text-success" : "text-danger"}`}>
              {passed ? content.successTitle : content.failTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{content.resultCount.replace("{score}", String(correctCount))}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.items.map((entry) => {
                const hit = answers[entry.id] === entry.verdict;
                return (
                  <li key={entry.id} className={`rounded-xl border p-3 text-sm ${hit ? "border-success/40 bg-success/5" : "border-border bg-background/40"}`}>
                    <p className="font-mono font-bold break-all text-foreground">{entry.password}</p>
                    <p className={`mt-1 font-bold ${hit ? "text-success" : "text-danger"}`}>
                      {hit ? <Check className="mr-2 inline size-5" aria-hidden="true" /> : <X className="mr-2 inline size-5" aria-hidden="true" />}{hit ? content.correctMark : content.wrongMark} {entry.verdict === "strong" ? content.strong : content.weak}
                    </p>
                    {!hit && <p className="mt-1 text-muted-foreground">{entry.explain}</p>}
                  </li>
                );
              })}
            </ul>
            {!passed && (
              <button type="button" onClick={retry} className="focus-ring min-w-11 mt-4 inline-flex min-h-12 items-center rounded-xl bg-neon px-6 text-base font-black text-primary-foreground transition hover:-translate-y-0.5">
                {retryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
