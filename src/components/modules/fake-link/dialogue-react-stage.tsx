"use client";

import { useState } from "react";
import { useRetryQuiz } from "@/features/modules/runner/use-retry-quiz";
import { retryLabels } from "../shared/retry-labels";
import { Check, X, MessageSquareText, ShieldAlert } from "lucide-react";

import type { fakeLinkContent } from "@/data/fake-link";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type DialogueReactContent =
  | (typeof fakeLinkContent)["ru"]["dialogueReact"]
  | (typeof fakeLinkContent)["ro"]["dialogueReact"];

const PASS_COUNT = 3;

export function DialogueReactStage({
  locale,
  content,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: DialogueReactContent;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const quiz = useRetryQuiz(content.scenarios.map(entry => entry.id), PASS_COUNT, onComplete, saving);
  const { index, revealed, finished, passed, correctCount, advance, retry } = quiz;

  const scenario = content.scenarios[index];
  const answer = scenario ? answers[scenario.id] : undefined;
  const correctOption = scenario?.options.find((option) => option.correct);
  const isCorrect = answer !== undefined && answer === correctOption?.id;

  function choose(optionId: string) {
    if (!scenario || revealed || saving) return;
    if (quiz.answer(optionId === correctOption?.id, scenario.explain)) {
      setAnswers((previous) => ({ ...previous, [scenario.id]: optionId }));
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
        {!finished && scenario ? (
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {scenario.title} · {counter}
            </p>

            <div className="mt-3 space-y-2 rounded-2xl border border-border bg-background/60 p-4 sm:p-5">
              {scenario.incoming.map((message) => (
                <div key={message} className="flex items-start gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-danger/15 text-danger" aria-hidden="true">
                    <MessageSquareText className="size-4" />
                  </span>
                  <p className="rounded-2xl rounded-tl-md border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm leading-relaxed text-foreground sm:text-base">
                    {message}
                  </p>
                </div>
              ))}
            </div>

            {!revealed ? (
              <div className="mt-3 grid gap-2">
                {scenario.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    className="focus-ring min-w-11 min-h-12 rounded-xl border border-border bg-card/70 px-4 py-3 text-left text-base font-semibold text-foreground transition hover:border-neon/60 hover:bg-neon/5 sm:text-base"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`mt-3 rounded-xl border p-4 ${isCorrect ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
                <p className={`flex items-center gap-2 text-base font-black ${isCorrect ? "text-success" : "text-danger"}`}>
                  {isCorrect ? <Check className="size-5 shrink-0" aria-hidden="true" /> : <X className="size-5 shrink-0" aria-hidden="true" />}{isCorrect ? content.correctMark : content.wrongMark}
                </p>
                <p className="mt-1 text-sm text-foreground/90">{scenario.explain}</p>
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
        ) : (
          <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
            <p className={`flex items-center gap-2 text-base font-black ${passed ? "text-success" : "text-danger"}`}>
              {passed ? <Check className="size-5" aria-hidden="true" /> : <ShieldAlert className="size-5" aria-hidden="true" />}
              {passed ? content.successTitle : content.failTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{content.resultCount.replace("{score}", String(correctCount))}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.scenarios.map((entry) => {
                const picked = answers[entry.id];
                const right = entry.options.find((option) => option.correct);
                const hit = picked === right?.id;
                return (
                  <li key={entry.id} className={`rounded-xl border p-3 text-sm ${hit ? "border-success/40 bg-success/5" : "border-border bg-background/40"}`}>
                    <p className="font-bold text-foreground">{entry.title}</p>
                    <p className={`mt-1 font-bold ${hit ? "text-success" : "text-danger"}`}>
                      {hit ? <Check className="mr-2 inline size-5" aria-hidden="true" /> : <X className="mr-2 inline size-5" aria-hidden="true" />}{hit ? content.correctMark : content.wrongMark}
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
