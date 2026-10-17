"use client";

import { useMemo, useState } from "react";
import { Check, ListOrdered, X } from "lucide-react";

import type { hackedAccountContent } from "@/data/hacked-account";
import type { StageResult } from "@/features/modules/runner/use-module-runner";

type RescueOrderContent =
  | (typeof hackedAccountContent)["ru"]["rescueOrder"]
  | (typeof hackedAccountContent)["ro"]["rescueOrder"];

const STEP_COUNT = 5;
const PASS_COUNT = 4;
// Фиксированный перемешанный порядок: одинаковый для обеих локалей.
const SHUFFLED = [2, 0, 4, 1, 3];

export function RescueOrderStage({
  content,
  checkLabel,
  retryLabel,
  saving,
  onComplete,
}: {
  content: RescueOrderContent;
  checkLabel: string;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const correctOrder = useMemo(() => content.steps.map((step) => step.id), [content]);
  const shuffledSteps = useMemo(() => SHUFFLED.map((position) => content.steps[position]), [content]);
  const byId = useMemo(() => new Map<string, (typeof content.steps)[number]>(content.steps.map((step) => [step.id, step])), [content]);

  const exactPositions = correctOrder.filter((id, position) => chosen[position] === id).length;
  const complete = chosen.length === STEP_COUNT;

  function toggle(id: string) {
    if (submitted || saving) return;
    setChosen((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );
  }

  function submit() {
    if (saving || !complete) return;
    setSubmitted(true);
    if (exactPositions >= PASS_COUNT) {
      setPassed(true);
      onComplete({ correct: exactPositions, total: STEP_COUNT });
    }
  }

  function retry() {
    setChosen([]);
    setSubmitted(false);
    setPassed(false);
  }

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <ListOrdered className="size-4" aria-hidden="true" />
            {content.yourOrder} ({chosen.length}/{STEP_COUNT})
          </p>
          <ol className="mt-3 grid gap-2">
            {chosen.map((id, position) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  disabled={submitted || saving}
                  aria-label={`${position + 1}. ${byId.get(id)?.text ?? id}. ${content.tapToRemove}`}
                  className="focus-ring flex w-full items-center gap-3 rounded-xl border border-neon/40 bg-neon/10 px-3 py-2.5 text-left text-sm font-semibold text-foreground transition hover:border-neon disabled:cursor-default"
                >
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-neon font-black text-primary-foreground">
                    {position + 1}
                  </span>
                  <span className="min-w-0 flex-1">{byId.get(id)?.text}</span>
                  {!submitted && <X className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {chosen.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                {content.available} ↓
              </li>
            )}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{content.available}</p>
          <div className="mt-3 grid gap-2">
            {shuffledSteps.map((step) => {
              const picked = chosen.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggle(step.id)}
                  disabled={submitted || saving}
                  aria-pressed={picked}
                  className={`focus-ring min-h-12 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                    picked
                      ? "border-border/40 bg-secondary/40 text-muted-foreground opacity-60"
                      : "border-border bg-card/70 text-foreground hover:border-neon/60 hover:bg-neon/5"
                  }`}
                >
                  {step.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={saving || !complete}
            className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {checkLabel}
          </button>
        ) : (
          <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
            <p className={`flex items-center gap-2 text-base font-black ${passed ? "text-success" : "text-danger"}`}>
              <Check className="size-5" aria-hidden="true" />
              {passed ? content.successTitle : content.failTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{content.resultCount.replace("{score}", String(exactPositions))}</p>
            <ol className="mt-4 grid gap-2">
              {correctOrder.map((id, position) => {
                const hit = chosen[position] === id;
                return (
                  <li key={id} className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${hit ? "border-success/40 bg-success/5" : "border-border bg-background/40"}`}>
                    <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-lg font-black ${hit ? "bg-success text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {position + 1}
                    </span>
                    <span className="font-semibold text-foreground">{byId.get(id)?.text}</span>
                  </li>
                );
              })}
            </ol>
            {!passed && (
              <button type="button" onClick={retry} className="focus-ring mt-4 inline-flex min-h-12 items-center rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5">
                {retryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
