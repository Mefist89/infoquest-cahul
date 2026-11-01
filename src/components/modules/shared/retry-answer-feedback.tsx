"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { retryLabels } from "./retry-labels";

export function RetryAnswerFeedback({ locale, correct, explanation, nextLabel, onNext, disabled }: {
  locale: "ru" | "ro"; correct: boolean; explanation: string; nextLabel: string; onNext: () => void; disabled: boolean;
}) {
  const heading = useRef<HTMLParagraphElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return (
    <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-4 ${correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
      <p ref={heading} tabIndex={-1} className={`focus-ring flex items-center gap-2 text-lg font-black ${correct ? "text-success" : "text-danger"}`}>
        {correct ? <Check aria-hidden="true" className="size-6" /> : <X aria-hidden="true" className="size-6" />}
        {correct ? retryLabels[locale].correct : retryLabels[locale].wrong}
      </p>
      <p className="mt-2 text-base leading-relaxed text-foreground">{explanation}</p>
      <button type="button" onClick={onNext} disabled={disabled} className="focus-ring mt-4 min-h-11 rounded-xl bg-neon px-5 py-3 text-base font-black text-primary-foreground disabled:opacity-60">{nextLabel}</button>
    </div>
  );
}
