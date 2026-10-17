"use client";

import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import type { ChatContent } from "./content";
import type { AiMode } from "./types";

export function AudioProcessingCard({ t, audioAnalysisStep }: { t: ChatContent; audioAnalysisStep: number }) {
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-md rounded-2xl rounded-bl-md border border-neon/30 bg-background/70 p-5 shadow-[0_0_24px_rgba(0,217,255,0.08)]">
        <p className="sr-only" role="status" aria-live="polite">{t.audioSteps[audioAnalysisStep]}</p>
        <ol className="space-y-3" aria-label={t.thinking}>
          {t.audioSteps.map((step, index) => {
            const completed = index < audioAnalysisStep;
            const active = index === audioAnalysisStep;
            return (
              <li key={step} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${active ? "bg-neon/10 text-foreground" : completed ? "text-success" : "text-muted-foreground/55"}`}>
                {completed ? <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" /> : active ? <LoaderCircle className="size-5 shrink-0 animate-spin text-neon" aria-hidden="true" /> : <Circle className="size-5 shrink-0" aria-hidden="true" />}
                <span className={`text-sm ${active || completed ? "font-bold" : ""}`}>{step}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function ThinkingBubble({ t, mode }: { t: ChatContent; mode: AiMode }) {
  return (
    <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-background/55 px-4 py-4" role="status" aria-live="polite"><span className="flex gap-1" aria-hidden="true"><span className="size-2 animate-bounce rounded-full bg-neon" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:120ms]" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:240ms]" /></span><span className="text-xs text-muted-foreground">{mode === "analyzer" ? t.thinking : t.chatThinking}</span></div></div>
  );
}
