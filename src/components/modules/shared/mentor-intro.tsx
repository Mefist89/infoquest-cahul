"use client";

import Image from "next/image";
import { ChevronRight, Square, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type IntroContent = {
  name: string; role: string; lines: readonly string[];
  next: string; start: string; listen: string; listening: string; showAll: string;
};

export function MentorIntro({ content, locale, imageSrc, onFinish }: {
  content: IntroContent; locale: "ru" | "ro"; imageSrc: string; onFinish: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [lineShown, setLineShown] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const fullyShown = lineShown || reducedMotion;
  const revealLine = useCallback(() => setLineShown(true), []);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullText = content.lines[lineIndex];
  const lastLine = lineIndex === content.lines.length - 1;

  useEffect(() => () => {
    const utterance = utteranceRef.current;
    if (utterance) utterance.onend = utterance.onerror = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function stop() {
    const utterance = utteranceRef.current;
    if (utterance) utterance.onend = utterance.onerror = null;
    utteranceRef.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function listen() {
    revealLine();
    if (speaking) { stop(); return; }
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current = utterance;
    utterance.lang = locale === "ru" ? "ru-RU" : "ro-RO";
    utterance.rate = 0.95;
    utterance.onend = utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      setSpeaking(false);
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function advance() {
    if (!fullyShown) { revealLine(); return; }
    stop();
    if (lastLine) onFinish();
    else {
      setLineShown(false);
      setLineIndex(index => index + 1);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_25%_60%,rgba(0,217,255,0.13),transparent_42%),rgba(2,10,30,0.72)]">
      <div className="grid min-h-[31rem] items-end gap-2 px-5 pt-6 sm:grid-cols-[minmax(13rem,0.75fr)_minmax(18rem,1.25fr)] sm:px-8">
        <div className="relative mx-auto h-72 w-full max-w-64 self-end sm:h-[30rem] sm:max-w-sm">
          <Image src={imageSrc} alt={content.name} fill sizes="(max-width: 640px) 256px, 384px" className="object-contain object-bottom drop-shadow-[0_0_28px_rgba(0,217,255,0.22)]" priority />
        </div>
        <div className="relative z-10 min-w-0 self-center pb-8 sm:pb-0">
          <div className="rounded-3xl rounded-bl-md border border-neon/35 bg-card/95 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neon">{content.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{content.role}</p>
            <p className="sr-only">{fullText}</p>
            <TypewriterText key={lineIndex} text={fullText} fullyShown={fullyShown} onComplete={revealLine} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex shrink-0 gap-1.5" aria-label={`${lineIndex + 1}/${content.lines.length}`}>{content.lines.map((_, index) => <span key={index} className={`h-1.5 rounded-full motion-safe:transition-all ${index === lineIndex ? "w-7 bg-neon" : index < lineIndex ? "w-3 bg-success" : "w-3 bg-secondary"}`} />)}</div>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={listen} aria-pressed={speaking} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-4 py-2 text-sm font-bold text-neon">
                  {speaking ? <Square className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}{speaking ? content.listening : content.listen}
                </button>
                <button type="button" onClick={advance} title={!fullyShown ? content.showAll : undefined} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-neon px-4 py-2 text-sm font-black text-primary-foreground">
                  {lastLine && fullyShown ? content.start : content.next}<ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function subscribeReducedMotion(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function TypewriterText({ text, fullyShown, onComplete }: { text: string; fullyShown: boolean; onComplete: () => void }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (fullyShown) return;
    let character = 0;
    const timer = window.setInterval(() => {
      character += 1;
      setVisibleCharacters(character);
      if (character >= text.length) {
        window.clearInterval(timer);
        onComplete();
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [fullyShown, onComplete, text]);

  const textClass = "col-start-1 row-start-1 min-h-20 break-words text-base font-semibold leading-relaxed text-foreground sm:text-lg";
  return (
    <div className="mt-5 grid">
      <p aria-hidden="true" className={`invisible ${textClass}`}>{text}</p>
      <p aria-hidden="true" className={textClass}>
        {fullyShown ? text : text.slice(0, visibleCharacters)}
        {!fullyShown && <span className="ml-0.5 inline-block h-5 w-0.5 motion-safe:animate-pulse bg-neon align-middle motion-reduce:hidden" />}
      </p>
    </div>
  );
}
