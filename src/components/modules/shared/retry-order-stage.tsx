"use client";

import { Check, ListOrdered, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { retainCorrectOrder, toggleOrderSlot, type OrderSlots } from "@/features/modules/runner/retry-progress";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { retryLabels } from "./retry-labels";

type OrderContent = {
  prompt: string; passNote: string; yourOrder: string; available: string; tapToRemove: string;
  successTitle: string; failTitle: string; resultCount: string;
  steps: readonly { id: string; text: string }[];
};

export function RetryOrderStage({ locale, content, checkLabel, retryLabel, saving, onComplete }: {
  locale: "ru" | "ro"; content: OrderContent; checkLabel: string; retryLabel: string; saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const required = useMemo(() => content.steps.map(step => step.id), [content]);
  const byId = new Map(content.steps.map(step => [step.id, step]));
  const [slots, setSlots] = useState<OrderSlots>(() => required.map(() => null));
  const [locked, setLocked] = useState<ReadonlySet<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const firstCorrectRef = useRef<number | null>(null);
  const exactPositions = required.filter((id, position) => slots[position] === id).length;
  const pickedCount = slots.filter(id => id !== null).length;
  const complete = pickedCount === required.length;
  const passed = submitted && exactPositions >= 4;
  const t = retryLabels[locale];

  function toggle(id: string) {
    if (submittedRef.current || saving) return;
    setSlots(previous => toggleOrderSlot(previous, locked, id));
  }

  function submit() {
    if (saving || submittedRef.current || !complete) return;
    submittedRef.current = true;
    firstCorrectRef.current ??= exactPositions;
    setSubmitted(true);
    if (exactPositions >= 4) onComplete({ correct: firstCorrectRef.current, total: required.length });
  }

  function retry() {
    if (saving || !submittedRef.current || passed) return;
    const next = retainCorrectOrder(slots, required);
    setSlots(next.slots);
    setLocked(next.locked);
    submittedRef.current = false;
    setSubmitted(false);
  }

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>
      {locked.size > 0 && <p role="status" className="mt-3 text-base font-bold text-success">{t.kept}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><ListOrdered className="size-4" aria-hidden="true" />{content.yourOrder} ({pickedCount}/{required.length})</p>
          <ol className="mt-3 grid gap-2">
            {slots.map((id, position) => (
              <li key={position}>
                {id === null ? <p className="flex min-h-14 items-center gap-3 rounded-xl border border-dashed border-border p-3 text-base text-muted-foreground"><span>{position + 1}.</span>{content.available}</p> : (
                  <button type="button" onClick={() => toggle(id)} disabled={submitted || saving || locked.has(position)} aria-label={`${position + 1}. ${byId.get(id)?.text}. ${locked.has(position) ? t.correct : content.tapToRemove}`} className="focus-ring flex min-h-14 w-full items-center gap-3 rounded-xl border border-neon/40 bg-neon/10 px-3 py-2.5 text-left text-base font-semibold text-foreground">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-neon font-black text-primary-foreground" aria-hidden="true">{position + 1}</span>
                    <span className="min-w-0 flex-1">{byId.get(id)?.text}</span>
                    {locked.has(position) ? <span className="text-success"><Check className="mr-1 inline size-5" aria-hidden="true" />{t.correct}</span> : <X className="size-4 shrink-0" aria-hidden="true" />}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="text-sm font-bold text-muted-foreground">{content.available}</p>
          <div className="mt-3 grid gap-2">
            {[2, 0, 4, 1, 3].map(position => content.steps[position]).map(step => {
              const picked = slots.includes(step.id);
              return <button key={step.id} type="button" onClick={() => toggle(step.id)} disabled={submitted || saving || locked.has(slots.indexOf(step.id))} aria-pressed={picked} className={`focus-ring min-h-14 rounded-xl border px-4 py-2.5 text-left text-base font-semibold ${picked ? "border-border/40 bg-secondary/40 text-muted-foreground" : "border-border bg-card/70 text-foreground hover:border-neon/60"}`}>{step.text}</button>;
            })}
          </div>
        </div>
      </div>
      <div aria-live="polite" className="mt-6">
        {!submitted ? <button type="button" onClick={submit} disabled={saving || !complete} className="focus-ring min-h-12 rounded-xl bg-neon px-6 text-base font-black text-primary-foreground disabled:opacity-60">{checkLabel}</button> : (
          <div className={`rounded-2xl border p-5 ${passed ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
            <p className={`flex items-center gap-2 text-base font-black ${passed ? "text-success" : "text-danger"}`}>{passed ? <Check className="size-5" aria-hidden="true" /> : <X className="size-5" aria-hidden="true" />}{passed ? content.successTitle : content.failTitle}</p>
            <p className="mt-2 font-bold text-foreground">{content.resultCount.replace("{score}", String(exactPositions))}</p>
            <ol className="mt-4 grid gap-2">
              {required.map((id, position) => {
                const hit = slots[position] === id;
                return <li key={id} className="rounded-xl border border-border p-3 text-base"><p className={hit ? "font-bold text-success" : "font-bold text-danger"}>{hit ? <Check className="mr-1 inline size-5" aria-hidden="true" /> : <X className="mr-1 inline size-5" aria-hidden="true" />}{hit ? t.correct : t.wrong} · {position + 1}</p><p className="mt-1 text-foreground">{byId.get(id)?.text}</p></li>;
              })}
            </ol>
            {!passed && <button type="button" onClick={retry} disabled={saving} className="focus-ring mt-4 min-h-12 rounded-xl bg-neon px-6 text-base font-black text-primary-foreground disabled:opacity-60">{retryLabel}</button>}
          </div>
        )}
      </div>
    </div>
  );
}
