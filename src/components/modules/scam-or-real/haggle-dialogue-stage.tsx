"use client";

import { useState } from "react";
import { Check, Store, User } from "lucide-react";

import { scamOrRealContent } from "@/data/scam-or-real";

type HaggleDialogueContent =
  | (typeof scamOrRealContent)["ru"]["haggleDialogue"]
  | (typeof scamOrRealContent)["ro"]["haggleDialogue"];

const STEP_COUNT = 5;

type Bubble = { from: "seller" | "you" | "note"; text: string };

export function HaggleDialogueStage({
  content,
  saving,
  onComplete,
}: {
  content: HaggleDialogueContent;
  saving: boolean;
  onComplete: (score: number) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    content.steps[0].messages.map((text) => ({ from: "seller" as const, text })),
  );
  const [wrongPicked, setWrongPicked] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = content.steps[stepIndex];
  const lastStep = stepIndex >= content.steps.length - 1;
  const score = Math.max(0, Math.round(((STEP_COUNT - misses) / STEP_COUNT) * 100));

  function choose(optionId: string, correct: boolean, text: string) {
    if (!step || finished || saving) return;
    if (!correct) {
      if (wrongPicked.has(optionId)) return;
      setWrongPicked((previous) => new Set(previous).add(optionId));
      setMisses((count) => count + 1);
      setBubbles((previous) => [...previous, { from: "you", text }, { from: "note", text: step.correction }]);
      return;
    }
    const nextBubbles: Bubble[] = [...bubbles, { from: "you", text }];
    if (lastStep) {
      setBubbles(nextBubbles);
      setFinished(true);
      onComplete(score);
      return;
    }
    const nextStep = content.steps[stepIndex + 1];
    setBubbles([...nextBubbles, ...nextStep.messages.map((message) => ({ from: "seller" as const, text: message }))]);
    setStepIndex((current) => current + 1);
    setWrongPicked(new Set());
  }

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>

      <div aria-live="polite" className="mt-6">
        {!finished && step ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {stepIndex + 1}/{content.steps.length}
            </p>
            <div className="mt-3 space-y-2 rounded-2xl border border-border bg-background/60 p-4 sm:p-5">
              {bubbles.map((bubble, position) =>
                bubble.from === "note" ? (
                  <p key={position} className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-foreground">
                    {bubble.text}
                  </p>
                ) : (
                  <div key={position} className={`flex items-start gap-2 ${bubble.from === "you" ? "flex-row-reverse" : ""}`}>
                    <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full ${bubble.from === "you" ? "bg-neon/15 text-neon" : "bg-gold/15 text-gold"}`}>
                      {bubble.from === "you" ? <User className="size-4" /> : <Store className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {bubble.from === "you" ? content.youName : content.sellerName}
                      </p>
                      <p className={`mt-0.5 rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:text-base ${bubble.from === "you" ? "rounded-tr-md bg-neon/15 text-foreground" : "rounded-tl-md border border-border bg-card/80 text-foreground"}`}>
                        {bubble.text}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 grid gap-2">
              {step.options.map((option) => {
                const disabled = wrongPicked.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id, option.correct, option.text)}
                    disabled={disabled || saving}
                    className="focus-ring min-h-12 rounded-xl border border-border bg-card/70 px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-neon/60 hover:bg-neon/5 disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-5">
            <p className="flex items-center gap-2 text-base font-black text-success">
              <Check className="size-5" aria-hidden="true" />
              {content.successTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {content.resultCount.replace("{misses}", String(misses))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
