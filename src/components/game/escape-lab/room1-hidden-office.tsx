"use client";

import {
  BookOpen,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  FileText,
  Flashlight,
  Frame,
  KeyRound,
  Laptop,
  Lock,
  Sparkles,
  Star,
  Trash2,
  Usb,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { playSound } from "@/features/sound/play-sound";
import { escapeLabCopy, type EscapeLocale } from "./escape-lab-copy";

const SECRET_CODE = "4279";

export function Room1HiddenOffice({
  locale,
  hintSignal,
  onFindSecret,
  onSolved,
}: {
  locale: EscapeLocale;
  hintSignal: number;
  onFindSecret: () => void;
  onSolved: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const t = escapeLabCopy[locale].room1;

  const [hasUv, setHasUv] = useState(false);
  const [hasUsb, setHasUsb] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [solvedPainting, setSolvedPainting] = useState(false);
  const [solvedLaptop, setSolvedLaptop] = useState(false);
  const [foundSecret, setFoundSecret] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [message, setMessage] = useState<string>(t.goal);

  const digits = [
    hasNote ? "4" : "?",
    hasNote ? "2" : "?",
    solvedPainting ? "7" : "?",
    solvedLaptop ? "9" : "?",
  ];

  const nextHintTarget = !hasUv
    ? "rug"
    : !hasUsb
      ? "drawer"
      : !hasNote
        ? "bin"
        : !solvedPainting
          ? "painting"
          : !solvedLaptop
            ? "laptop"
            : "door";

  const activeHintText =
    hintSignal > 0
      ? !hasUv
        ? t.hints.getUv
        : !hasUsb
          ? t.hints.getUsb
          : !hasNote
            ? t.hints.getNote
            : !solvedPainting
              ? t.hints.useUv
              : !solvedLaptop
                ? t.hints.useUsb
                : t.hints.openDoor
      : null;

  function clickRug() {
    if (!hasUv) {
      setHasUv(true);
      setMessage(t.messages.foundUv);
      playSound("correct");
    } else {
      setMessage(t.messages.alreadyUv);
    }
  }

  function clickDrawer() {
    if (!hasUsb) {
      setHasUsb(true);
      setMessage(t.messages.foundUsb);
      playSound("correct");
    } else {
      setMessage(t.messages.alreadyUsb);
    }
  }

  function clickBin() {
    if (!hasNote) {
      setHasNote(true);
      setMessage(t.messages.foundNote);
      playSound("correct");
    } else {
      setMessage(t.messages.alreadyNote);
    }
  }

  function clickPainting() {
    if (!hasUv) {
      setMessage(t.messages.needUv);
      playSound("wrong");
      return;
    }
    if (!solvedPainting) {
      setSolvedPainting(true);
      playSound("correct");
    }
    setMessage(t.messages.solvedPainting);
  }

  function clickLaptop() {
    if (!hasUsb) {
      setMessage(t.messages.needUsb);
      playSound("wrong");
      return;
    }
    if (!solvedLaptop) {
      setSolvedLaptop(true);
      playSound("correct");
    }
    setMessage(t.messages.solvedLaptop);
  }

  function clickShelf() {
    if (!foundSecret) {
      setFoundSecret(true);
      onFindSecret();
      setMessage(t.messages.foundSecret);
      playSound("correct");
    } else {
      setMessage(t.messages.alreadySecret);
    }
  }

  function pressDigit(digit: string) {
    if (doorOpen || codeInput.length >= 4) return;
    setCodeError(false);
    setCodeInput((prev) => prev + digit);
  }

  function submitCode() {
    if (codeInput === SECRET_CODE) {
      setDoorOpen(true);
      setShowKeypad(false);
      setMessage(t.messages.doorOpened);
      playSound("correct");
      window.setTimeout(onSolved, reducedMotion ? 200 : 1100);
    } else {
      setCodeError(true);
      setMessage(t.messages.wrongCode);
      playSound("wrong");
      setCodeInput("");
    }
  }

  const hintRing = (id: string) =>
    hintSignal > 0 && nextHintTarget === id
      ? "ring-4 ring-gold/80 animate-pulse"
      : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon/35 bg-slate-950/75 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-black text-neon sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base" role="status" aria-live="polite">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border border-gold/45 bg-gold/10 px-3 py-2">
          <span className="text-sm font-bold text-gold">{t.codeProgress}:</span>
          {digits.map((d, i) => (
            <span
              key={i}
              className={`grid size-8 place-items-center rounded-lg border font-display text-base font-black ${
                d === "?"
                  ? "border-border bg-slate-900 text-muted-foreground"
                  : "border-success bg-success/20 text-success"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {activeHintText && (
        <div className="rounded-2xl border-2 border-gold/60 bg-gold/15 px-4 py-2.5 text-sm font-bold text-gold">
          💡 {activeHintText}
        </div>
      )}

      {/* Interactive Illustrated Escape Room */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-neon/35 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),rgba(8,18,40,0.98)_72%)] p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {/* Painting */}
          <motion.button
            type="button"
            onClick={clickPainting}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              solvedPainting
                ? "border-success/75 bg-success/15"
                : "border-violet-400/50 bg-violet-500/10 hover:border-violet-300"
            } ${hintRing("painting")}`}
          >
            <Frame className={`size-10 ${solvedPainting ? "text-success" : "text-violet-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.painting}</span>
            {solvedPainting ? (
              <span className="rounded-full bg-violet-500/30 px-3 py-0.5 font-display text-sm font-black text-neon">
                UV: • • 7 •
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{hasUv ? "🔦 UV!" : "???"}</span>
            )}
          </motion.button>

          {/* Bookshelf (Bonus Secret) */}
          <motion.button
            type="button"
            onClick={clickShelf}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              foundSecret
                ? "border-gold/75 bg-gold/15"
                : "border-amber-400/45 bg-amber-500/10 hover:border-amber-300"
            }`}
          >
            <BookOpen className={`size-10 ${foundSecret ? "text-gold" : "text-amber-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.shelf}</span>
            {foundSecret && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/25 px-2.5 py-0.5 text-sm font-black text-gold">
                <Star className="size-3.5 fill-current" aria-hidden="true" /> +1
              </span>
            )}
          </motion.button>

          {/* Code Door */}
          <motion.button
            type="button"
            onClick={() => setShowKeypad((prev) => !prev)}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative col-span-2 flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition sm:col-span-1 sm:row-span-2 ${
              doorOpen
                ? "border-success bg-success/20 shadow-[0_0_32px_rgba(34,197,94,0.35)]"
                : "border-neon/65 bg-neon/10 hover:border-neon"
            } ${hintRing("door")}`}
          >
            {doorOpen ? (
              <DoorOpen className="size-14 text-success" aria-hidden="true" />
            ) : (
              <DoorClosed className="size-14 text-neon" aria-hidden="true" />
            )}
            <span className="font-display text-lg font-black text-foreground">{t.objects.door}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neon/45 bg-slate-950/75 px-3 py-1 font-mono text-sm font-black text-neon">
              <Lock className="size-3.5" aria-hidden="true" />
              {doorOpen ? "OPEN" : "••••"}
            </span>
          </motion.button>

          {/* Laptop */}
          <motion.button
            type="button"
            onClick={clickLaptop}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              solvedLaptop
                ? "border-success/75 bg-success/15"
                : "border-sky-400/50 bg-sky-500/10 hover:border-sky-300"
            } ${hintRing("laptop")}`}
          >
            <Laptop className={`size-10 ${solvedLaptop ? "text-success" : "text-sky-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.laptop}</span>
            {solvedLaptop ? (
              <span className="rounded-full bg-success/25 px-3 py-0.5 font-display text-sm font-black text-success">
                • • • 9
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{hasUsb ? "🔑 USB!" : "🔒"}</span>
            )}
          </motion.button>

          {/* Desk Drawer */}
          <motion.button
            type="button"
            onClick={clickDrawer}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              hasUsb
                ? "border-success/60 bg-success/10"
                : "border-emerald-400/45 bg-emerald-500/10 hover:border-emerald-300"
            } ${hintRing("drawer")}`}
          >
            <Usb className={`size-10 ${hasUsb ? "text-success" : "text-emerald-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.drawer}</span>
            {hasUsb && <CheckCircle2 className="size-5 text-success" aria-hidden="true" />}
          </motion.button>

          {/* Floor Rug */}
          <motion.button
            type="button"
            onClick={clickRug}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              hasUv
                ? "border-success/60 bg-success/10"
                : "border-rose-400/45 bg-rose-500/10 hover:border-rose-300"
            } ${hintRing("rug")}`}
          >
            <Flashlight className={`size-9 ${hasUv ? "text-success" : "text-rose-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.rug}</span>
            {hasUv && <CheckCircle2 className="size-5 text-success" aria-hidden="true" />}
          </motion.button>

          {/* Trash Bin */}
          <motion.button
            type="button"
            onClick={clickBin}
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={`focus-ring relative col-span-1 sm:col-span-2 flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              hasNote
                ? "border-success/60 bg-success/10"
                : "border-cyan-400/45 bg-cyan-500/10 hover:border-cyan-300"
            } ${hintRing("bin")}`}
          >
            <Trash2 className={`size-9 ${hasNote ? "text-success" : "text-cyan-300"}`} aria-hidden="true" />
            <span className="font-display text-base font-black text-foreground">{t.objects.bin}</span>
            {hasNote && (
              <span className="rounded-full bg-success/20 px-3 py-0.5 font-display text-sm font-black text-success">
                4 • 2 • •
              </span>
            )}
          </motion.button>
        </div>

        {/* Interactive Keypad Drawer */}
        <AnimatePresence>
          {showKeypad && !doorOpen && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.95 }}
              animate={
                codeError && !reducedMotion
                  ? { x: [0, -10, 10, -7, 7, 0], opacity: 1, y: 0, scale: 1 }
                  : { x: 0, opacity: 1, y: 0, scale: 1 }
              }
              exit={{ opacity: 0, y: 10 }}
              className="mx-auto mt-5 max-w-sm rounded-3xl border-2 border-neon/65 bg-slate-950/95 p-5 text-center shadow-[0_0_40px_rgba(0,217,255,0.22)]"
            >
              <p className="font-display text-base font-black text-neon">{t.messages.doorPrompt}</p>
              <div className="my-3 flex justify-center gap-2">
                {[0, 1, 2, 3].map((slot) => (
                  <span
                    key={slot}
                    className={`grid size-12 place-items-center rounded-xl border-2 font-display text-2xl font-black ${
                      codeError
                        ? "border-danger bg-danger/15 text-danger"
                        : codeInput[slot]
                          ? "border-neon bg-neon/15 text-neon"
                          : "border-border bg-slate-900 text-muted-foreground"
                    }`}
                  >
                    {codeInput[slot] ?? "•"}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => pressDigit(num)}
                    className="focus-ring min-h-12 rounded-xl border border-border bg-card/85 font-display text-xl font-black text-foreground transition hover:border-neon hover:bg-neon/15"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput("");
                    setCodeError(false);
                  }}
                  className="focus-ring min-h-12 rounded-xl border border-danger/45 bg-danger/15 text-sm font-bold text-danger"
                >
                  {t.messages.codeCleared}
                </button>
                <button
                  type="button"
                  onClick={() => pressDigit("0")}
                  className="focus-ring min-h-12 rounded-xl border border-border bg-card/85 font-display text-xl font-black text-foreground transition hover:border-neon hover:bg-neon/15"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={submitCode}
                  disabled={codeInput.length < 4}
                  className="focus-ring min-h-12 rounded-xl bg-success text-sm font-black text-slate-950 disabled:opacity-45"
                >
                  OK
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inventory Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-slate-950/75 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 font-display text-sm font-black uppercase tracking-wider text-gold">
          <Sparkles className="size-4" aria-hidden="true" />
          {t.inventory}:
        </span>
        {!hasUv && !hasUsb && !hasNote ? (
          <span className="text-sm text-muted-foreground">{t.emptyInv}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hasUv && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/60 bg-violet-500/20 px-3 py-1 text-sm font-bold text-violet-200">
                <Flashlight className="size-4" aria-hidden="true" />
                {t.items.uv}
              </span>
            )}
            {hasUsb && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-200">
                <KeyRound className="size-4" aria-hidden="true" />
                {t.items.usb}
              </span>
            )}
            {hasNote && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-200">
                <FileText className="size-4" aria-hidden="true" />
                {t.items.note} (4·2)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
