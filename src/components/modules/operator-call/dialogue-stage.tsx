"use client";

import { Check, MessageCircleWarning, Search, ShieldAlert, Sparkles, Star, Trophy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { operatorCallContent, OperatorLocale } from "@/data/operator-call";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { PhoneFrame } from "./phone-frame";
import { accessibilityText, ActionButton, playSound, ScoreFeedback } from "./stage-support";

const chatCopy = {
  ru: {
    contactName: "MinTel Поддержка",
    online: "в сети · неизвестный номер",
    typing: "печатает сообщение...",
    newMsg: "Новое сообщение",
    tapHint: "Нажми на подозрительные слова прямо в сообщении!",
    marked: "Отмечено",
    levelOk: "Молодец! Уловка найдена!",
    nextMsg: "Загружаем следующее сообщение...",
  },
  ro: {
    contactName: "Suport MinTel",
    online: "online · număr necunoscut",
    typing: "scrie un mesaj...",
    newMsg: "Mesaj nou",
    tapHint: "Apasă pe fragmentele suspecte direct în mesaj!",
    marked: "Selectate",
    levelOk: "Bravo! Capcana a fost găsită!",
    nextMsg: "Se primește următorul mesaj...",
  },
} as const;

export function DialogueStage({
  locale,
  content,
  check,
  saving,
  feedback,
  onSubmit,
}: {
  locale: OperatorLocale;
  content: (typeof operatorCallContent)["ru"]["dialogue"] | (typeof operatorCallContent)["ro"]["dialogue"];
  check: string;
  saving: boolean;
  feedback: { score: number } | null;
  onSubmit: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [errorText, setErrorText] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [typingLevel, setTypingLevel] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [verifiedOk, setVerifiedOk] = useState(0);
  const [verifyTries, setVerifyTries] = useState(0);
  const firstPartRef = useRef<HTMLButtonElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];
  const t = chatCopy[locale];

  const level = content.levels?.[currentLevelIndex];
  const isTyping = !reducedMotion && typingLevel === currentLevelIndex;

  useEffect(() => {
    if (!level) {
      completionRef.current?.focus();
      return;
    }
    if (reducedMotion) {
      firstPartRef.current?.focus();
      return;
    }
    const startTimer = window.setTimeout(() => setTypingLevel(currentLevelIndex), 0);
    const doneTimer = window.setTimeout(() => {
      setTypingLevel(null);
      firstPartRef.current?.focus();
    }, 550);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(doneTimer);
    };
  }, [currentLevelIndex, level, reducedMotion]);

  if (!level) {
    return (
      <motion.div
        ref={completionRef}
        tabIndex={-1}
        role="status"
        initial={reducedMotion ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="focus-ring mx-auto flex max-w-lg flex-col items-center rounded-[2rem] border-4 border-success/70 bg-[linear-gradient(155deg,rgba(34,197,94,0.18),rgba(0,217,255,0.12),rgba(8,22,48,0.96))] p-8 text-center shadow-[0_0_40px_rgba(34,197,94,0.2)]"
      >
        <span className="grid size-20 place-items-center rounded-full border-4 border-gold bg-gold/20 text-gold shadow-[0_0_26px_rgba(255,209,102,0.3)]">
          <Trophy className="size-10" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-2xl font-black text-foreground">{content.win}</p>
        {feedback && <ScoreFeedback score={feedback.score} />}
        <div className="mt-6 w-full">
          <ActionButton disabled={saving} onClick={() => onSubmit({ correct: verifiedOk, total: verifyTries })} center>
            {check}
          </ActionButton>
        </div>
      </motion.div>
    );
  }

  const togglePart = (id: string) => {
    if (celebrating) return;
    setErrorText(null);
    setSelectedParts((prev) => {
      const next = new Set(prev);
      const part = level.parts.find((item) => item.id === id);
      if (next.has(id)) {
        next.delete(id);
        setAnnouncement(`${a11y.unselected}: ${part?.text ?? ""}`);
      } else {
        next.add(id);
        setAnnouncement(`${a11y.selected}: ${part?.text ?? ""}`);
      }
      return next;
    });
  };

  const verify = () => {
    if (celebrating) return;
    let correct = true;
    let selectedLies = 0;
    setVerifyTries((count) => count + 1);

    level.parts.forEach((part) => {
      const isSelected = selectedParts.has(part.id);
      if (part.isLie && isSelected) selectedLies++;
      if (!part.isLie && isSelected) correct = false;
    });

    if (correct && selectedLies === level.liesCount) {
      playSound("correct");
      setVerifiedOk((count) => count + 1);
      setAnnouncement(`${a11y.correct}. ${a11y.levelComplete}`);
      setErrorText(null);
      setCelebrating(true);
      window.setTimeout(() => {
        setCelebrating(false);
        setCurrentLevelIndex((prev) => prev + 1);
        setSelectedParts(new Set());
      }, reducedMotion ? 150 : 900);
    } else {
      playSound("wrong");
      setShakeKey((k) => k + 1);
      setErrorText(content.error);
      setAnnouncement(`${a11y.wrong}. ${content.error}`);
    }
  };

  const phoneTone = celebrating ? "success" : errorText ? "danger" : "neutral";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center pb-8">
      <p className="mb-4 text-center text-base font-bold text-foreground/95 sm:text-lg">{content.prompt}</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <div className="mb-5 flex w-full max-w-md flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/10 px-3.5 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
          <Sparkles className="size-4" aria-hidden="true" />
          {content.levelText} {currentLevelIndex + 1} / {content.levels.length}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3.5 py-1 text-sm font-black text-gold">
          <Search className="size-4" aria-hidden="true" />
          {t.marked}: {selectedParts.size} / {level.liesCount}
        </span>
      </div>

      <PhoneFrame shakeKey={shakeKey} tone={phoneTone} maxWidthClass="max-w-lg">
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-gold/55 bg-gold/15 text-gold">
            <MessageCircleWarning className="size-5" aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-slate-900 bg-success" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-display text-base font-black text-foreground">{t.contactName}</p>
            <p className="truncate text-sm text-neon/80">{isTyping ? t.typing : t.online}</p>
          </div>
          <span className="rounded-full border border-danger/45 bg-danger/15 px-2.5 py-0.5 text-sm font-bold text-danger">
            SMS
          </span>
        </div>

        <div className="min-h-[19rem] bg-[radial-gradient(circle_at_20%_15%,rgba(0,217,255,0.09),transparent_55%)] p-4 sm:p-5">
          <div className="mb-3 flex justify-center">
            <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-sm font-semibold text-muted-foreground">
              {t.newMsg} · #{currentLevelIndex + 1}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key={`typing-${currentLevelIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-2 rounded-3xl rounded-tl-md border border-neon/35 bg-slate-900/90 px-4 py-3 shadow-lg"
              >
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: dot * 0.14 }}
                    className="size-2.5 rounded-full bg-neon"
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-muted-foreground">{t.typing}</span>
              </motion.div>
            ) : (
              <motion.div
                key={`msg-${currentLevelIndex}`}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="relative rounded-3xl rounded-tl-md border-2 border-neon/35 bg-slate-900/95 p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
                  {level.parts.map((part, index) => {
                    const isSelected = selectedParts.has(part.id);
                    return (
                      <button
                        key={part.id}
                        ref={index === 0 ? firstPartRef : undefined}
                        type="button"
                        onClick={() => togglePart(part.id)}
                        aria-pressed={isSelected}
                        aria-label={`${a11y.chooseFragment}: ${part.text}. ${isSelected ? a11y.selected : a11y.unselected}`}
                        className={`focus-ring inline-flex min-h-11 min-w-11 items-center rounded-xl border px-2.5 py-2 text-left text-base font-semibold transition sm:text-lg ${
                          isSelected
                            ? "border-danger bg-danger/25 text-foreground shadow-[0_0_16px_rgba(244,63,94,0.28)]"
                            : "border-transparent bg-white/[0.04] text-foreground/95 hover:border-neon/45 hover:bg-neon/10"
                        }`}
                      >
                        {isSelected && <Check className="mr-1.5 size-4 shrink-0 text-danger" aria-hidden="true" />}
                        {part.text}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-right text-sm font-semibold text-muted-foreground">12:45 ✓✓</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {celebrating && (
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-success/75 bg-success/20 px-4 py-3 text-base font-black text-success shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              >
                <Star className="size-5 fill-current text-gold" aria-hidden="true" />
                {t.levelOk}
              </motion.div>
            )}

            {errorText && !celebrating && (
              <motion.p
                role="alert"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-danger/65 bg-danger/15 px-4 py-3 text-center text-sm font-bold text-danger sm:text-base"
              >
                <ShieldAlert className="size-5 shrink-0" aria-hidden="true" />
                {errorText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 bg-slate-900/85 p-4 text-center">
          <p className="mb-3 text-sm text-muted-foreground">{t.tapHint}</p>
          <motion.button
            type="button"
            disabled={celebrating || isTyping}
            onClick={verify}
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-6 py-3 text-base font-black text-primary-foreground shadow-[0_0_22px_rgba(0,217,255,0.35)] disabled:opacity-50"
          >
            <Search className="size-5" aria-hidden="true" />
            {content.verifyBtn}
          </motion.button>
        </div>
      </PhoneFrame>
    </div>
  );
}
