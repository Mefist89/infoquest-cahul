"use client";

import { Volume2 } from "lucide-react";

import { getRiskIndicatorClass, getRiskLevel } from "@/lib/risk-level";
import type { ChatContent } from "./content";
import type { AiLocale, ChatMessage } from "./types";

export function ChatMessageBubble({ message, t, locale, onSpeak }: { message: ChatMessage; t: ChatContent; locale: AiLocale; onSpeak: (text: string) => void }) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <article className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${message.role === "user" ? "rounded-br-md bg-neon text-primary-foreground" : "rounded-bl-md border border-border bg-background/55 text-foreground"}`}>
        {message.analysis && getRiskLevel(message.analysis.risk) === "high" && <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-danger/90 shadow-[0_0_24px_rgba(255,60,80,0.35)] animate-pulse [animation-duration:2s]" aria-hidden="true" />}
        {message.analysis && getRiskLevel(message.analysis.risk) === "medium" && <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-gold/90 shadow-[0_0_24px_rgba(255,195,60,0.32)] animate-pulse [animation-duration:2s]" aria-hidden="true" />}
        {message.attachment && <audio src={message.attachment.url} controls className="mb-3 max-w-full" />}
        {message.text && <p>{message.text}</p>}
        {message.analysis && (
          <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${message.analysis.verdict === "likely_scam" ? "border-danger/45 bg-danger/10 text-danger" : message.analysis.verdict === "suspicious" ? "border-gold/45 bg-gold/10 text-gold" : message.analysis.verdict === "likely_safe" ? "border-success/45 bg-success/10 text-success" : "border-border bg-secondary text-muted-foreground"}`}>{t.verdicts[message.analysis.verdict]}</span>
              <span className="font-display text-xs font-black text-gold">{t.risk}: {message.analysis.risk}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${getRiskIndicatorClass(getRiskLevel(message.analysis.risk))}`} style={{ width: `${message.analysis.risk}%` }} /></div>
            <p className="text-xs text-muted-foreground">{message.analysis.summary}</p>
            {message.analysis.signals.length > 0 && <div><strong className="text-xs text-neon">{t.signals}</strong><ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{message.analysis.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></div>}
            <div><strong className="text-xs text-success">{t.actions}</strong><ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">{message.analysis.actions.map((action) => <li key={action}>{action}</li>)}</ol></div>
            <p className="rounded-lg border border-border bg-card/60 px-3 py-2 text-[11px] text-muted-foreground">{message.analysis.disclaimer}</p>
          </div>
        )}
        {message.transcript && <details className="mt-3 rounded-lg border border-border bg-card/50 px-3 py-2 text-xs"><summary className="cursor-pointer font-bold text-neon">{t.transcript}</summary><p className="mt-2 text-muted-foreground">{message.transcript}</p></details>}
        {message.role === "assistant" && <button type="button" onClick={() => onSpeak(message.text)} className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-success/60 bg-success px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_0_18px_rgba(43,214,123,0.22)] transition hover:brightness-110"><Volume2 className="size-5" aria-hidden="true" />{locale === "ro" ? "Ascultă" : "Прослушать"}</button>}
      </article>
</div>
  );
}
