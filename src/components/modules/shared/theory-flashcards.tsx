"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Layers, RotateCw, Sparkles } from "lucide-react";
import { useState } from "react";

import type { FlashcardItem } from "@/data/module-flashcards";
import { FlashcardArt } from "./flashcard-art";

const copy = {
  ru: {
    navTitle: "Карточки",
    navSubtitle: "Ключевые термины",
    hint: "Нажми на карточку, чтобы увидеть объяснение, и листай с 1 по 4.",
    cardOf: (current: number, total: number) => `Карточка ${current} из ${total}`,
    termBadge: "Термин",
    definitionBadge: "Объяснение",
    tapToFlip: "Нажми, чтобы открыть объяснение",
    tapToBack: "Нажми, чтобы вернуть термин",
    opened: "Открыто",
    prev: "Назад",
    next: "Дальше",
    continueLabel: "Перейти к теории",
  },
  ro: {
    navTitle: "Carduri",
    navSubtitle: "Termeni cheie",
    hint: "Apasă pe card pentru a vedea explicația și parcurge toate cele 4 carduri.",
    cardOf: (current: number, total: number) => `Cardul ${current} din ${total}`,
    termBadge: "Termen",
    definitionBadge: "Explicație",
    tapToFlip: "Apasă pentru a vedea explicația",
    tapToBack: "Apasă pentru a reveni la termen",
    opened: "Deschise",
    prev: "Înapoi",
    next: "Următorul",
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  const card = cards[activeIndex] ?? cards[0];
  const seenCount = Object.values(seen).filter(Boolean).length;
  const allSeen = seenCount === cards.length;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === cards.length - 1;

  function selectCard(index: number) {
    setActiveIndex(index);
    setFlipped(false);
  }

  function toggleFlip() {
    setFlipped((prev) => !prev);
    if (card) {
      setSeen((prev) => (prev[card.term] ? prev : { ...prev, [card.term]: true }));
    }
  }

  if (!card) return null;

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

      <section className="mt-6 rounded-3xl border border-neon/25 bg-background/35 p-5 sm:p-7" aria-label={t.navTitle}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-neon">
            <Sparkles className="size-4" aria-hidden="true" />
            {t.cardOf(activeIndex + 1, cards.length)}
          </span>
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

        <button
          key={card.term}
          type="button"
          onClick={toggleFlip}
          aria-pressed={flipped}
          className={`focus-ring group mx-auto mt-5 flex min-h-80 w-full max-w-sm flex-col items-center justify-between rounded-[2rem] border-4 p-6 text-center transition duration-200 sm:min-h-96 sm:p-7 ${
            flipped
              ? "border-success/80 bg-card/95 shadow-[0_0_36px_rgba(34,197,94,0.2)]"
              : "border-neon/80 bg-card/90 shadow-[0_0_36px_rgba(0,217,255,0.2)] hover:border-neon hover:bg-card"
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-sm font-bold uppercase tracking-wider ${
              flipped
                ? "border-success/45 bg-success/15 text-success"
                : "border-gold/45 bg-gold/10 text-gold"
            }`}
          >
            {flipped ? t.definitionBadge : t.termBadge}
          </span>

          {flipped ? (
            <div className="my-5 flex flex-col items-center">
              <p className="font-display text-xl font-black text-neon sm:text-2xl">{card.term}</p>
              <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">{card.definition}</p>
            </div>
          ) : (
            <div className="my-4 flex flex-col items-center gap-4">
              <FlashcardArt art={card.art} />
              <p className="font-display text-2xl font-black leading-snug text-foreground sm:text-3xl">{card.term}</p>
            </div>
          )}

          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition group-hover:border-neon/40 group-hover:text-foreground">
            <RotateCw
              className={`size-4 text-neon transition-transform duration-200 ${flipped ? "rotate-180" : "group-hover:rotate-45"}`}
              aria-hidden="true"
            />
            {flipped ? t.tapToBack : t.tapToFlip}
          </span>
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => selectCard(activeIndex - 1)}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card/70 px-4 text-sm font-bold text-foreground transition hover:border-neon/50 hover:text-neon disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {t.prev}
          </button>

          <div className="flex items-center gap-1.5" role="tablist" aria-label={t.navTitle}>
            {cards.map((item, index) => {
              const isCurrent = index === activeIndex;
              const isCardSeen = Boolean(seen[item.term]);
              return (
                <button
                  key={item.term}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`${index + 1}`}
                  onClick={() => selectCard(index)}
                  className="focus-ring grid size-11 place-items-center rounded-xl hover:bg-neon/10"
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? "w-7 bg-neon"
                        : isCardSeen
                          ? "w-2.5 bg-success"
                          : "w-2.5 bg-secondary"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {!isLast ? (
            <button
              type="button"
              onClick={() => selectCard(activeIndex + 1)}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-neon px-4 text-sm font-black text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.25)] transition hover:-translate-y-0.5"
            >
              {t.next}
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          ) : onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-neon px-4 text-sm font-black text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.25)] transition hover:-translate-y-0.5"
            >
              {t.continueLabel}
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
