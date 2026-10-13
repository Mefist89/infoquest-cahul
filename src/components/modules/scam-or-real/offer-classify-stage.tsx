"use client";

import { useState } from "react";
import { BadgeCheck, ShieldAlert, Tag } from "lucide-react";

import { scamOrRealContent } from "@/data/scam-or-real";

type OfferClassifyContent =
  | (typeof scamOrRealContent)["ru"]["offerClassify"]
  | (typeof scamOrRealContent)["ro"]["offerClassify"];

const ITEM_COUNT = 6;
const PASS_COUNT = 5;

export function OfferClassifyStage({
  content,
  retryLabel,
  saving,
  onComplete,
}: {
  content: OfferClassifyContent;
  retryLabel: string;
  saving: boolean;
  onComplete: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "honest" | "scam">>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  const item = content.items[index];
  const answer = item ? answers[item.id] : undefined;
  const isCorrect = item && answer === item.verdict;
  const correctCount = content.items.filter((entry) => answers[entry.id] === entry.verdict).length;
  const score = Math.round((correctCount / ITEM_COUNT) * 100);

  function choose(verdict: "honest" | "scam") {
    if (!item || revealed || saving) return;
    setAnswers((previous) => ({ ...previous, [item.id]: verdict }));
    setRevealed(true);
  }

  function advance() {
    if (!item) return;
    if (index >= content.items.length - 1) {
      setFinished(true);
      if (correctCount >= PASS_COUNT) {
        setPassed(true);
        onComplete(score);
      }
      return;
    }
    setIndex((current) => current + 1);
    setRevealed(false);
  }

  function retry() {
    setIndex(0);
    setAnswers({});
    setRevealed(false);
    setFinished(false);
    setPassed(false);
  }

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>
      <p className="mt-2 text-sm font-semibold text-neon">{content.passNote}</p>

      <div aria-live="polite" className="mt-6">
        {!finished && item ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {index + 1}/{content.items.length}
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-background/60 p-5 text-center sm:p-6">
              <Tag className="mx-auto size-8 text-neon" aria-hidden="true" />
              <p className="mt-3 text-base font-bold leading-relaxed text-foreground sm:text-lg">{item.offer}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.context}</p>

              {!revealed ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => choose("honest")}
                    className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-success/40 bg-success/10 px-2 text-center text-sm font-black text-success transition hover:bg-success/20"
                  >
                    <BadgeCheck className="size-5" aria-hidden="true" />
                    {content.honest}
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("scam")}
                    className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-danger/40 bg-danger/10 px-2 text-center text-sm font-black text-danger transition hover:bg-danger/20"
                  >
                    <ShieldAlert className="size-5" aria-hidden="true" />
                    {content.scam}
                  </button>
                </div>
              ) : (
                <div className={`mt-5 rounded-xl border p-4 text-left ${isCorrect ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"}`}>
                  <p className={`text-sm font-black ${isCorrect ? "text-success" : "text-danger"}`}>
                    {isCorrect ? content.correctMark : content.wrongMark}
                  </p>
                  <p className="mt-1 text-sm text-foreground/90">{item.explain}</p>
                  <button
                    type="button"
                    onClick={advance}
                    disabled={saving}
                    className="focus-ring mt-3 inline-flex min-h-11 items-center rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
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
                    <p className="font-bold text-foreground">{entry.offer}</p>
                    <p className={`mt-1 font-bold ${hit ? "text-success" : "text-danger"}`}>
                      {hit ? content.correctMark : content.wrongMark} {entry.verdict === "honest" ? content.honest : content.scam}
                    </p>
                    {!hit && <p className="mt-1 text-muted-foreground">{entry.explain}</p>}
                  </li>
                );
              })}
            </ul>
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
