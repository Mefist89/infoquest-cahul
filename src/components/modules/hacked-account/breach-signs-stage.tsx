"use client";

import { useState } from "react";
import { Check, ChevronRight, ShieldAlert } from "lucide-react";

import { hackedAccountContent } from "@/data/hacked-account";

type BreachSignsContent =
  | (typeof hackedAccountContent)["ru"]["breachSigns"]
  | (typeof hackedAccountContent)["ro"]["breachSigns"];

const TOTAL_SIGNALS = 12;

export function BreachSignsStage({
  content,
  saving,
  onComplete,
}: {
  content: BreachSignsContent;
  saving: boolean;
  onComplete: (score: number) => void;
}) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flashMiss, setFlashMiss] = useState<string | null>(null);

  const level = content.levels[levelIndex];
  const levelSignals = level.items.filter((item) => item.suspicious);
  const levelFound = levelSignals.filter((item) => found.has(`${level.id}:${item.id}`)).length;
  const levelDone = levelFound >= levelSignals.length;
  const totalFound = content.levels.reduce(
    (total, entry) => total + entry.items.filter((item) => item.suspicious && found.has(`${entry.id}:${item.id}`)).length,
    0,
  );
  const score = Math.max(0, Math.round(((totalFound - misses) / TOTAL_SIGNALS) * 100));
  const lastLevel = levelIndex >= content.levels.length - 1;

  function tap(levelId: string, itemId: string, suspicious: boolean) {
    if (finished || saving) return;
    const key = `${levelId}:${itemId}`;
    if (found.has(key)) return;
    if (suspicious) {
      setFound((previous) => new Set(previous).add(key));
    } else {
      setMisses((count) => count + 1);
      setFlashMiss(key);
      window.setTimeout(() => setFlashMiss((current) => (current === key ? null : current)), 600);
    }
  }

  function advance() {
    if (saving) return;
    if (lastLevel) {
      setFinished(true);
      onComplete(score);
      return;
    }
    setLevelIndex((current) => current + 1);
  }

  return (
    <div>
      <p className="text-base font-semibold leading-relaxed text-foreground/90 sm:text-lg">{content.prompt}</p>

      <div aria-live="polite" className="mt-6">
        {!finished && level ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${levelIndex === 0 ? "bg-success/15 text-success" : levelIndex === 1 ? "bg-gold/15 text-gold" : "bg-danger/15 text-danger"}`}>
                {level.difficulty}
              </span>
              <p className="text-sm font-bold text-foreground">{level.title}</p>
              <p className="ml-auto text-xs font-bold text-muted-foreground">
                {levelIndex + 1}/{content.levels.length} · {levelFound}/{levelSignals.length}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{level.lead}</p>

            <div className="mt-4 grid gap-2">
              {level.items.map((item, position) => {
                const key = `${level.id}:${item.id}`;
                const hit = found.has(key);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => tap(level.id, item.id, item.suspicious)}
                    disabled={hit || saving}
                    aria-pressed={hit}
                    aria-label={`${position + 1}. ${item.title}. ${item.detail}`}
                    className={`focus-ring rounded-2xl border p-4 text-left transition ${
                      hit
                        ? "border-success/40 bg-success/10"
                        : flashMiss === key
                          ? "border-danger bg-danger/20"
                          : "border-border bg-background/60 hover:border-neon/60"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-xl ${hit ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
                        {hit ? <Check className="size-4" /> : <ShieldAlert className="size-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-foreground sm:text-base">{item.title}</span>
                        <span className="mt-0.5 block font-mono text-xs text-muted-foreground sm:text-sm">{item.detail}</span>
                        {hit && item.explain && <span className="mt-1 block text-sm text-success">{item.explain}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {levelDone && (
              <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4">
                <p className="text-sm font-black text-success">{content.levelComplete}</p>
                <button
                  type="button"
                  onClick={advance}
                  disabled={saving}
                  className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {content.nextLevel}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-5">
            <p className="flex items-center gap-2 text-base font-black text-success">
              <Check className="size-5" aria-hidden="true" />
              {content.successTitle}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {content.resultCount.replace("{found}", String(totalFound)).replace("{misses}", String(misses))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
