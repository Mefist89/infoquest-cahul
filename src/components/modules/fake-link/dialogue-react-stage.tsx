"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Gift,
  Landmark,
  MessageSquareText,
  Package,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import type { fakeLinkContent } from "@/data/fake-link";
import type { StageResult } from "@/features/modules/runner/use-module-runner";
import { useRetryQuiz } from "@/features/modules/runner/use-retry-quiz";
import { PhoneFrame } from "../operator-call/phone-frame";
import { retryLabels } from "../shared/retry-labels";

type DialogueReactContent =
  | (typeof fakeLinkContent)["ru"]["dialogueReact"]
  | (typeof fakeLinkContent)["ro"]["dialogueReact"];

const PASS_COUNT = 3;

const SPARKS = [
  { x: -64, y: -40, color: "text-gold" },
  { x: -30, y: -62, color: "text-neon" },
  { x: 0, y: -68, color: "text-success" },
  { x: 34, y: -60, color: "text-gold" },
  { x: 64, y: -38, color: "text-pink-400" },
  { x: -66, y: 12, color: "text-success" },
  { x: 66, y: 14, color: "text-neon" },
] as const;

const uiCopy = {
  ru: {
    typing: "печатает...",
    chooseReply: "Выбери свой ответ:",
    yourReply: "Твой ответ",
    starsLabel: "Верно",
    unknown: "неизвестный контакт",
    smsTag: "SMS",
    chatTag: "Чат",
    callTag: "Звонок",
  },
  ro: {
    typing: "scrie...",
    chooseReply: "Alege răspunsul tău:",
    yourReply: "Răspunsul tău",
    starsLabel: "Corect",
    unknown: "contact necunoscut",
    smsTag: "SMS",
    chatTag: "Chat",
    callTag: "Apel",
  },
} as const;

function getSenderMeta(id: string, locale: "ru" | "ro") {
  const t = uiCopy[locale];
  if (id === "parcel-sms") return { icon: Package, tag: t.smsTag, tone: "border-amber-400/55 bg-amber-400/15 text-amber-300" };
  if (id === "bank-call") return { icon: Landmark, tag: t.callTag, tone: "border-sky-400/55 bg-sky-400/15 text-sky-300" };
  if (id === "friend-loan") return { icon: UserRound, tag: t.chatTag, tone: "border-violet-400/55 bg-violet-400/15 text-violet-300" };
  return { icon: Gift, tag: t.smsTag, tone: "border-pink-400/55 bg-pink-400/15 text-pink-300" };
}

export function DialogueReactStage({
  locale,
  content,
  retryLabel,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: DialogueReactContent;
  retryLabel: string;
  saving: boolean;
  onComplete: (result: StageResult) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [typingId, setTypingId] = useState<string | null>(null);
  const quiz = useRetryQuiz(content.scenarios.map((entry) => entry.id), PASS_COUNT, onComplete, saving);
  const { index, revealed, finished, passed, correctCount, advance, retry } = quiz;
  const t = uiCopy[locale];

  const scenario = content.scenarios[index];
  const answer = scenario ? answers[scenario.id] : undefined;
  const chosenOption = scenario?.options.find((option) => option.id === answer);
  const correctOption = scenario?.options.find((option) => option.correct);
  const isCorrect = answer !== undefined && answer === correctOption?.id;
  const isTyping = !reducedMotion && scenario !== undefined && typingId === scenario.id;

  useEffect(() => {
    if (!scenario || finished || reducedMotion) return;
    const startTimer = window.setTimeout(() => setTypingId(scenario.id), 0);
    const doneTimer = window.setTimeout(() => setTypingId(null), 450);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(doneTimer);
    };
  }, [scenario, finished, reducedMotion]);

  function choose(optionId: string) {
    if (!scenario || revealed || saving || isTyping) return;
    const hit = optionId === correctOption?.id;
    if (quiz.answer(hit, scenario.explain)) {
      setAnswers((previous) => ({ ...previous, [scenario.id]: optionId }));
      if (!hit) setShakeKey((k) => k + 1);
    }
  }

  const counter = (quiz.retrying ? retryLabels[locale].repeat : retryLabels[locale].question)
    .replace("{current}", String(quiz.roundPosition))
    .replace("{total}", String(quiz.roundTotal));

  const sender = scenario ? getSenderMeta(scenario.id, locale) : null;
  const SenderIcon = sender?.icon ?? MessageSquareText;
  const phoneTone = !revealed ? "neutral" : isCorrect ? "success" : "danger";

  return (
    <div>
      <div className="rounded-3xl border-2 border-neon/35 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(10,22,48,0.88))] p-4 sm:p-5">
        <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">{content.prompt}</p>
        <p className="mt-1.5 text-sm font-semibold text-neon">{content.passNote}</p>
        {quiz.retrying && !finished && (
          <p role="status" className="mt-2.5 text-sm font-bold text-success">
            {retryLabels[locale].questionsKept}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/45 bg-neon/15 px-3 py-1 font-display text-sm font-black uppercase tracking-wider text-neon">
            <MessageSquareText className="size-4" aria-hidden="true" />
            {counter}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-sm font-black text-gold">
            <Star className="size-4 fill-current" aria-hidden="true" />
            {t.starsLabel}: {correctCount}/{content.scenarios.length}
          </span>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {!finished && scenario && sender ? (
          <PhoneFrame shakeKey={shakeKey} tone={phoneTone} maxWidthClass="max-w-xl">
            <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3">
              <span className={`relative grid size-11 shrink-0 place-items-center rounded-full border-2 ${sender.tone}`}>
                <SenderIcon className="size-5" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-slate-900 bg-success" />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate font-display text-base font-black text-foreground">{scenario.title}</p>
                <p className="truncate text-sm text-neon/80">{isTyping ? t.typing : t.unknown}</p>
              </div>
              <span className="rounded-full border border-danger/45 bg-danger/15 px-2.5 py-0.5 text-sm font-bold text-danger">
                {sender.tag}
              </span>
            </div>

            <div className="min-h-[16rem] space-y-3 bg-[radial-gradient(circle_at_20%_15%,rgba(0,217,255,0.08),transparent_55%)] p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {isTyping ? (
                  <motion.div
                    key={`typing-${scenario.id}`}
                    initial={{ opacity: 0, y: 10 }}
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
                    key={`incoming-${scenario.id}`}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="space-y-2.5"
                  >
                    {scenario.incoming.map((message) => (
                      <div key={message} className="max-w-[92%] rounded-3xl rounded-tl-md border-2 border-danger/40 bg-slate-900/95 px-4 py-3.5 text-left shadow-md">
                        <p className="text-base font-semibold leading-relaxed text-foreground">{message}</p>
                        <p className="mt-1.5 text-right text-sm text-muted-foreground">12:45</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {revealed && chosenOption && (
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 24, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 24 }}
                  className="flex justify-end"
                >
                  <div
                    className={`max-w-[90%] rounded-3xl rounded-tr-md border-2 px-4 py-3 text-left shadow-md ${
                      isCorrect
                        ? "border-success/70 bg-success/20 text-foreground"
                        : "border-danger/70 bg-danger/20 text-foreground"
                    }`}
                  >
                    <p className="text-sm font-bold text-muted-foreground">{t.yourReply}</p>
                    <p className="mt-1 text-base font-bold leading-snug">{chosenOption.text}</p>
                    <p className="mt-1 text-right text-sm text-muted-foreground">12:46 ✓✓</p>
                  </div>
                </motion.div>
              )}

              {revealed && (
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`relative overflow-hidden rounded-3xl border-2 p-4 text-left sm:p-5 ${
                    isCorrect
                      ? "border-success/75 bg-success/10 shadow-[0_0_26px_rgba(34,197,94,0.2)]"
                      : "border-danger/75 bg-danger/10 shadow-[0_0_26px_rgba(244,63,94,0.2)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative grid size-11 shrink-0 place-items-center">
                      {!reducedMotion && isCorrect && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                          {SPARKS.map((spark, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                              animate={{ x: spark.x, y: spark.y, scale: [0, 1.15, 0.7], opacity: [1, 1, 0] }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className={`absolute ${spark.color}`}
                            >
                              {idx % 2 === 0 ? <Star className="size-3.5 fill-current" /> : <Sparkles className="size-3.5" />}
                            </motion.span>
                          ))}
                        </span>
                      )}
                      <span
                        className={`grid size-11 place-items-center rounded-2xl border-2 ${
                          isCorrect
                            ? "border-success bg-success/20 text-success"
                            : "border-danger bg-danger/20 text-danger"
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="size-6" aria-hidden="true" /> : <AlertTriangle className="size-6" aria-hidden="true" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-display text-lg font-black sm:text-xl ${isCorrect ? "text-success" : "text-danger"}`}>
                        {isCorrect ? content.correctMark : content.wrongMark}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground sm:text-base">{scenario.explain}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="border-t border-white/10 bg-slate-900/90 p-4">
              {!revealed ? (
                <div>
                  <p className="mb-2.5 text-sm font-bold text-neon">{t.chooseReply}</p>
                  <div className="grid gap-2.5">
                    {scenario.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      return (
                        <motion.button
                          key={option.id}
                          type="button"
                          disabled={isTyping || saving}
                          onClick={() => choose(option.id)}
                          whileHover={reducedMotion ? undefined : { scale: 1.015, x: 2 }}
                          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                          className="focus-ring group flex min-h-12 min-w-11 items-center gap-3 rounded-2xl border-2 border-border bg-card/85 px-4 py-3 text-left text-base font-semibold text-foreground transition hover:border-neon/70 hover:bg-neon/10 disabled:opacity-50"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-neon/40 bg-neon/10 font-display text-sm font-black text-neon">
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{option.text}</span>
                          <Send className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-neon" aria-hidden="true" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={advance}
                  disabled={saving}
                  whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground shadow-[0_0_22px_rgba(0,217,255,0.3)] disabled:opacity-60"
                >
                  {content.next}
                  <ArrowRight className="size-5" aria-hidden="true" />
                </motion.button>
              )}
            </div>
          </PhoneFrame>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className={`rounded-3xl border-2 p-6 ${
              passed
                ? "border-success/65 bg-success/10 shadow-[0_0_34px_rgba(34,197,94,0.18)]"
                : "border-danger/60 bg-danger/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl border-2 ${
                  passed ? "border-gold bg-gold/20 text-gold" : "border-danger bg-danger/20 text-danger"
                }`}
              >
                {passed ? <Trophy className="size-7" aria-hidden="true" /> : <ShieldAlert className="size-7" aria-hidden="true" />}
              </span>
              <div>
                <p className={`font-display text-xl font-black ${passed ? "text-success" : "text-danger"}`}>
                  {passed ? content.successTitle : content.failTitle}
                </p>
                <p className="mt-0.5 text-base font-bold text-foreground">
                  {content.resultCount.replace("{score}", String(correctCount))}
                </p>
              </div>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.scenarios.map((entry) => {
                const picked = answers[entry.id];
                const right = entry.options.find((option) => option.correct);
                const hit = picked === right?.id;
                return (
                  <li
                    key={entry.id}
                    className={`rounded-2xl border p-3.5 text-sm ${
                      hit ? "border-success/45 bg-success/5" : "border-border bg-background/50"
                    }`}
                  >
                    <p className="font-bold text-foreground">{entry.title}</p>
                    <p className={`mt-1.5 font-bold ${hit ? "text-success" : "text-danger"}`}>
                      {hit ? (
                        <Check className="mr-1.5 inline size-4" aria-hidden="true" />
                      ) : (
                        <X className="mr-1.5 inline size-4" aria-hidden="true" />
                      )}
                      {hit ? content.correctMark : content.wrongMark}
                    </p>
                    {!hit && <p className="mt-1 text-muted-foreground">{entry.explain}</p>}
                  </li>
                );
              })}
            </ul>

            {!passed && (
              <button
                type="button"
                onClick={retry}
                className="focus-ring mt-5 inline-flex min-h-12 min-w-11 items-center rounded-2xl bg-neon px-6 text-base font-black text-primary-foreground transition hover:-translate-y-0.5"
              >
                {retryLabel}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
