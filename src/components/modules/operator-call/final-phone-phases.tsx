"use client";

import { Check, CheckCircle2, MessageCircleWarning, PhoneIncoming, Search, User } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import type { OperatorLocale } from "@/data/operator-call";
import { FinalVisualActions } from "./final-visual-actions";
import { PhoneFrame } from "./phone-frame";
import { accessibilityText } from "./stage-support";

export { FinalPhase2Phone, FinalPhase3Phone } from "./final-phone-battle";

export type VisualScenario = {
  type: "sms" | "call" | "profile";
  sender?: string;
  text?: string;
  fakeLink?: string;
  caller?: string;
  number?: string;
  name?: string;
  accountType?: string;
  correctTargets: readonly string[];
};

const phoneCopy = {
  ru: {
    typing: "печатает...",
    newMsg: "Новое сообщение",
    incomingCall: "Входящий звонок",
    profileCard: "Профиль в мессенджере",
    tapClue: "Нажми на подозрительные детали на экране",
  },
  ro: {
    typing: "scrie...",
    newMsg: "Mesaj nou",
    incomingCall: "Apel primit",
    profileCard: "Profil pe mesagerie",
    tapClue: "Apasă pe detaliile suspecte de pe ecran",
  },
} as const;

function VisualClueButton({
  label,
  selected,
  foundText,
  onSelect,
  className,
  children,
}: {
  label: string;
  selected: boolean;
  foundText: string;
  onSelect: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={selected}
      aria-pressed={selected}
      aria-label={`${label}. ${selected ? foundText : ""}`}
      onClick={onSelect}
      className={`focus-ring relative min-h-11 min-w-11 transition ${className}`}
    >
      {children}
      {selected && (
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-0.5 text-sm font-black uppercase tracking-wide text-success">
          <Check className="size-3.5" aria-hidden="true" />
          {foundText}
        </span>
      )}
    </button>
  );
}

export function FinalPhase1Phone({
  locale,
  currentLevel,
  totalLevels,
  visual,
  cluesLabel,
  foundDetails,
  shakeKey,
  onVisualClick,
}: {
  locale: OperatorLocale;
  currentLevel: number;
  totalLevels: number;
  visual: VisualScenario;
  cluesLabel: string;
  foundDetails: ReadonlySet<string>;
  shakeKey: number;
  onVisualClick: (targetId: string, isCorrect: boolean) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [typingLevel, setTypingLevel] = useState<number | null>(null);
  const a11y = accessibilityText[locale];
  const t = phoneCopy[locale];
  const isTyping = !reducedMotion && visual.type === "sms" && typingLevel === currentLevel;
  const totalTargets = visual.correctTargets.length || 1;
  const allFound = foundDetails.size >= totalTargets;

  useEffect(() => {
    if (reducedMotion || visual.type !== "sms") return;
    const startTimer = window.setTimeout(() => setTypingLevel(currentLevel), 0);
    const doneTimer = window.setTimeout(() => setTypingLevel(null), 420);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(doneTimer);
    };
  }, [currentLevel, reducedMotion, visual.type]);

  const headerTitle =
    visual.type === "sms"
      ? visual.sender || "MinTel"
      : visual.type === "call"
        ? t.incomingCall
        : t.profileCard;

  return (
    <PhoneFrame shakeKey={shakeKey} tone={allFound ? "success" : shakeKey > 0 ? "danger" : "neutral"} maxWidthClass="max-w-lg">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-900/95 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-gold/55 bg-gold/15 text-gold">
            {visual.type === "call" ? (
              <PhoneIncoming className="size-5" aria-hidden="true" />
            ) : visual.type === "profile" ? (
              <User className="size-5" aria-hidden="true" />
            ) : (
              <MessageCircleWarning className="size-5" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate font-display text-sm font-black text-foreground">{headerTitle}</p>
            <p className="text-sm text-neon/80">{currentLevel + 1}/{totalLevels}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-sm font-black text-gold">
          <Search className="size-4" aria-hidden="true" />
          {cluesLabel}: {foundDetails.size}/{totalTargets}
        </span>
      </div>

      <div className="min-h-[21rem] bg-[radial-gradient(circle_at_25%_15%,rgba(0,217,255,0.1),transparent_60%)] p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {isTyping ? (
            <motion.div
              key={`p1-type-${currentLevel}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 inline-flex items-center gap-2 rounded-3xl rounded-tl-md border border-neon/35 bg-slate-900/95 px-4 py-3"
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
              key={`p1-card-${currentLevel}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              {visual.type === "sms" && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-center">
                    <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-sm font-semibold text-muted-foreground">
                      {t.newMsg}
                    </span>
                  </div>
                  <VisualClueButton
                    label={`${a11y.sender}: ${visual.sender || "MinTel"}`}
                    selected={foundDetails.has("sender")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("sender", visual.correctTargets.includes("sender"))}
                    className={`w-full rounded-2xl border-2 px-3 py-2 text-center font-display text-base font-black uppercase tracking-wider ${
                      foundDetails.has("sender")
                        ? "border-success bg-success/15 text-success"
                        : "border-white/10 bg-slate-900/70 text-foreground hover:border-neon/50"
                    }`}
                  >
                    {visual.sender || "MinTel"}
                  </VisualClueButton>

                  <div className="rounded-3xl rounded-tl-md border-2 border-neon/35 bg-slate-900/95 p-4 text-left shadow-lg">
                    <VisualClueButton
                      label={`${a11y.message}: ${visual.text}`}
                      selected={foundDetails.has("text")}
                      foundText={a11y.found}
                      onSelect={() => onVisualClick("text", visual.correctTargets.includes("text"))}
                      className={`w-full rounded-xl border-2 p-2.5 text-left text-base font-semibold leading-relaxed text-foreground ${
                        foundDetails.has("text")
                          ? "border-success bg-success/15"
                          : "border-transparent bg-white/[0.04] hover:border-neon/45"
                      }`}
                    >
                      {visual.text}
                    </VisualClueButton>
                    <VisualClueButton
                      label={`${a11y.link}: ${visual.fakeLink}`}
                      selected={foundDetails.has("fakeLink")}
                      foundText={a11y.found}
                      onSelect={() => onVisualClick("fakeLink", visual.correctTargets.includes("fakeLink"))}
                      className={`mt-2.5 w-full break-all rounded-xl border-2 p-2.5 text-left font-mono text-base font-bold underline ${
                        foundDetails.has("fakeLink")
                          ? "border-success bg-success/15 text-success"
                          : "border-neon/30 bg-neon/10 text-neon hover:border-neon"
                      }`}
                    >
                      {visual.fakeLink}
                    </VisualClueButton>
                    <p className="mt-2.5 text-right text-sm text-muted-foreground">12:45 ✓✓</p>
                  </div>
                </div>
              )}

              {visual.type === "call" && (
                <div className="flex flex-col items-center pt-4">
                  <VisualClueButton
                    label={a11y.avatar}
                    selected={foundDetails.has("avatar")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("avatar", visual.correctTargets.includes("avatar"))}
                    className={`mb-4 flex min-h-20 w-24 flex-col items-center justify-center rounded-full border-4 ${
                      foundDetails.has("avatar")
                        ? "border-success bg-success/15 text-success"
                        : "border-neon/45 bg-slate-900 text-neon hover:border-neon"
                    }`}
                  >
                    <User className="size-10" aria-hidden="true" />
                  </VisualClueButton>
                  <VisualClueButton
                    label={`${a11y.caller}: ${visual.caller}`}
                    selected={foundDetails.has("caller")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("caller", visual.correctTargets.includes("caller"))}
                    className={`mb-2 w-full rounded-2xl border-2 p-2.5 text-center font-display text-xl font-black ${
                      foundDetails.has("caller")
                        ? "border-success bg-success/15 text-success"
                        : "border-white/10 bg-slate-900/75 text-foreground hover:border-neon/50"
                    }`}
                  >
                    {visual.caller}
                  </VisualClueButton>
                  <VisualClueButton
                    label={`${a11y.number}: ${visual.number}`}
                    selected={foundDetails.has("number")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("number", visual.correctTargets.includes("number"))}
                    className={`rounded-2xl border-2 px-4 py-2 font-mono text-lg font-black tracking-wider ${
                      foundDetails.has("number")
                        ? "border-success bg-success/15 text-success"
                        : "border-danger/45 bg-danger/15 text-danger hover:border-danger"
                    }`}
                  >
                    {visual.number}
                  </VisualClueButton>
                  <FinalVisualActions key={currentLevel} locale={locale} kind="call" onAnswer={() => onVisualClick("answer", false)} />
                </div>
              )}

              {visual.type === "profile" && (
                <div className="flex flex-col items-center pt-4">
                  <VisualClueButton
                    label={a11y.avatar}
                    selected={foundDetails.has("avatar")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("avatar", visual.correctTargets.includes("avatar"))}
                    className={`mb-4 flex min-h-24 w-28 flex-col items-center justify-center rounded-full border-4 ${
                      foundDetails.has("avatar")
                        ? "border-success bg-success/15"
                        : "border-neon bg-neon/15 hover:bg-neon/25"
                    }`}
                  >
                    <CheckCircle2 className={`size-12 ${foundDetails.has("avatar") ? "text-success" : "text-neon"}`} aria-hidden="true" />
                  </VisualClueButton>
                  <VisualClueButton
                    label={`${a11y.profileName}: ${visual.name}`}
                    selected={foundDetails.has("name")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("name", visual.correctTargets.includes("name"))}
                    className={`mb-2 w-full rounded-2xl border-2 p-2.5 text-center font-display text-xl font-black ${
                      foundDetails.has("name")
                        ? "border-success bg-success/15 text-success"
                        : "border-white/10 bg-slate-900/75 text-foreground hover:border-neon/50"
                    }`}
                  >
                    {visual.name}
                  </VisualClueButton>
                  <VisualClueButton
                    label={`${a11y.accountType}: ${visual.accountType}`}
                    selected={foundDetails.has("accountType")}
                    foundText={a11y.found}
                    onSelect={() => onVisualClick("accountType", visual.correctTargets.includes("accountType"))}
                    className={`mb-5 w-full rounded-2xl border-2 px-4 py-2.5 text-center text-base font-bold ${
                      foundDetails.has("accountType")
                        ? "border-success bg-success/15 text-success"
                        : "border-gold/35 bg-gold/10 text-foreground hover:border-gold"
                    }`}
                  >
                    {visual.accountType}
                  </VisualClueButton>
                  <FinalVisualActions key={currentLevel} locale={locale} kind="profile" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 bg-slate-900/85 px-4 py-2.5 text-center text-sm text-muted-foreground">
        {t.tapClue}
      </div>
    </PhoneFrame>
  );
}
