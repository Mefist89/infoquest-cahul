"use client";

import { CheckCircle2, ChevronRight, Layers, RotateCw, Sparkles } from "lucide-react";
import { useState } from "react";

import type { FlashcardItem } from "@/data/module-flashcards";

const copy = {
  ru: {
    navTitle: "Карточки",
    navSubtitle: "Ключевые термины",
    title: "Флэш-карты: запомни термины",
    hint: "Нажми на карточку, чтобы перевернуть и увидеть объяснение.",
    tapToFlip: "Нажми, чтобы открыть",
    tapToBack: "Нажми, чтобы вернуть",
    opened: "Открыто",
    continueLabel: "Перейти к теории",
  },
  ro: {
    navTitle: "Carduri",
    navSubtitle: "Termeni cheie",
    title: "Carduri flash: reține termenii",
    hint: "Apasă pe un card pentru a-l întoarce și a vedea explicația.",
    tapToFlip: "Apasă pentru a deschide",
    tapToBack: "Apasă pentru a întoarce",
    opened: "Deschise",
    continueLabel: "Mergi la teorie",
  },
} as const;

export function FlashcardsNavButton({
  locale,
  active,
  onClick,
}: {
  locale: "ru" | "ro";
  active: boolean;
  onClick: () => void;
}) {
  const t = copy[locale];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring mt-2 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
        active ? "border-neon/60 bg-neon/10" : "border-border bg-background/25 hover:border-neon/40"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          active ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"
        }`}
      >
        <Layers className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-muted-foreground">{t.navSubtitle}</span>
        <span className="block truncate text-sm font-bold text-foreground">{t.navTitle}</span>
      </span>
    </button>
  );
}

export function TheoryFlashcards({
  locale,
  cards,
  onContinue,
}: {
  locale: "ru" | "ro";
  cards: readonly FlashcardItem[];
  onContinue?: () => void;
}) {
  const t = copy[locale];
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  const seenCount = Object.values(seen).filter(Boolean).length;
  const allSeen = seenCount === cards.length;

  function toggleCard(term: string) {
    setFlipped((prev) => ({ ...prev, [term]: !prev[term] }));
    setSeen((prev) => (prev[term] ? prev : { ...prev, [term]: true }));
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-neon/40 bg-neon/10 text-neon">
          <Layers className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{t.navSubtitle}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{t.navTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.hint}</p>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-neon/25 bg-background/35 p-5 sm:p-6" aria-label={t.title}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-black text-foreground sm:text-lg">{t.title}</h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${
              allSeen
                ? "border-success/50 bg-success/15 text-success"
                : "border-neon/35 bg-neon/10 text-neon"
            }`}
          >
            {allSeen && <CheckCircle2 className="size-4" aria-hidden="true" />}
            {t.opened}: {seenCount}/{cards.length}
          </span>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          {cards.map((card, index) => {
            const isFlipped = Boolean(flipped[card.term]);
            const isSeen = Boolean(seen[card.term]);
            return (
              <button
                key={card.term}
                type="button"
                onClick={() => toggleCard(card.term)}
                aria-pressed={isFlipped}
                className={`focus-ring group flex min-h-36 w-full flex-col justify-between rounded-2xl border p-4 text-left transition duration-200 sm:p-5 ${
                  isFlipped
                    ? "border-neon/60 bg-neon/10 shadow-[0_0_24px_rgba(0,217,255,0.14)]"
                    : isSeen
                      ? "border-success/35 bg-card/70 hover:border-neon/50"
                      : "border-border bg-card/65 hover:border-neon/50 hover:bg-card/85"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-sm font-black tracking-wider text-neon/80">
                    0{index + 1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    {isSeen && <CheckCircle2 className="size-4 text-success" aria-hidden="true" />}
                    <RotateCw
                      className={`size-4 text-neon transition-transform duration-200 ${isFlipped ? "rotate-180" : "group-hover:rotate-45"}`}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                {isFlipped ? (
                  <div className="mt-3">
                    <p className="text-sm font-black text-neon">{card.term}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/95">{card.definition}</p>
                  </div>
                ) : (
                  <div className="my-3">
                    <p className="font-display text-lg font-black text-foreground">{card.term}</p>
                  </div>
                )}

                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  {isFlipped ? t.tapToBack : t.tapToFlip}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {onContinue && (
        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={onContinue}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-base font-black text-primary-foreground shadow-[0_0_24px_rgba(0,217,255,0.28)] transition hover:-translate-y-0.5"
          >
            {t.continueLabel}
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
