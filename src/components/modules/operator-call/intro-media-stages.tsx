"use client";

import Image from "next/image";
import { BookOpen, CheckCircle2, ChevronRight, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { ActionButton } from "./stage-support";

function IntroStage({ content, locale, onFinish }: { content: (typeof operatorCallContent)["ru"]["intro"] | (typeof operatorCallContent)["ro"]["intro"]; locale: OperatorLocale; onFinish: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const lastLine = lineIndex === content.lines.length - 1;
  const fullText = content.lines[lineIndex];
  const finishTyping = useCallback(() => setTypingDone(true), []);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function listen() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = locale === "ru" ? "ru-RU" : "ro-RO";
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function advance() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    if (lastLine) {
      onFinish();
      return;
    }
    setTypingDone(false);
    setLineIndex((index) => index + 1);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_25%_60%,rgba(0,217,255,0.13),transparent_42%),rgba(2,10,30,0.72)]">
      <div className="grid min-h-[31rem] items-end gap-2 px-5 pt-6 sm:grid-cols-[minmax(13rem,0.75fr)_minmax(18rem,1.25fr)] sm:px-8">
        <div className="relative mx-auto h-72 w-full max-w-64 self-end sm:h-[30rem] sm:max-w-sm">
          <Image src="/characters/02_woman_glasses_book_left.png" alt={content.name} fill sizes="(max-width: 640px) 256px, 384px" className="object-contain object-bottom drop-shadow-[0_0_28px_rgba(0,217,255,0.22)]" priority />
        </div>
        <div className="relative z-10 self-center pb-8 sm:pb-0">
          <div className="rounded-3xl rounded-bl-md border border-neon/35 bg-card/95 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neon">{content.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{content.role}</p>
            <p className="sr-only">{fullText}</p>
            <TypewriterText
              key={lineIndex}
              text={fullText}
              onDone={finishTyping}
              showAllLabel={locale === "ro" ? "Arată tot textul" : "Показать весь текст"}
            />
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex gap-1.5" aria-label={`${lineIndex + 1}/${content.lines.length}`}>{content.lines.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === lineIndex ? "w-7 bg-neon" : index < lineIndex ? "w-3 bg-success" : "w-3 bg-secondary"}`} />)}</div>
              {typingDone && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={listen} disabled={speaking} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-4 text-sm font-bold text-neon disabled:opacity-60">
                    <Volume2 className={`size-4 ${speaking ? "animate-pulse" : ""}`} aria-hidden="true" />{speaking ? content.listening : content.listen}
                  </button>
                  <button type="button" onClick={advance} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-neon px-4 text-sm font-black text-primary-foreground">
                    {lastLine ? content.start : content.next}<ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypewriterText({ text, onDone, showAllLabel }: { text: string; onDone: () => void; showAllLabel: string }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisibleCharacters(text.length);
    onDone();
  }, [onDone, text.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionTimer = window.setTimeout(complete, 0);
      return () => window.clearTimeout(reducedMotionTimer);
    }

    let character = 0;
    const timer = window.setInterval(() => {
      character += 1;
      setVisibleCharacters(character);
      if (character >= text.length) {
        window.clearInterval(timer);
        complete();
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [complete, text]);

  const done = visibleCharacters >= text.length;
  return (
    <div className="mt-5">
      <p aria-hidden="true" className="min-h-20 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
        {text.slice(0, visibleCharacters)}
        {!done && <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-neon align-middle motion-reduce:hidden" />}
      </p>
      {!done && (
        <button type="button" onClick={complete} className="focus-ring mt-3 min-h-11 rounded-xl border border-neon/35 px-4 text-sm font-bold text-neon hover:bg-neon/10">
          {showAllLabel}
        </button>
      )}
    </div>
  );
}


function TheoryStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["theory"] | (typeof operatorCallContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  const [playingMp3, setPlayingMp3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ('audioFile' in content && content.audioFile) {
       audioRef.current = new Audio(content.audioFile as string);
       audioRef.current.onended = () => setPlayingMp3(false);
    }
    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = "";
       }
    };
  }, [content]);

  function toggleMp3() {
    if (!audioRef.current) return;
    if (playingMp3) {
      audioRef.current.pause();
      setPlayingMp3(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlayingMp3(true);
    }
  }

  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>

    <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-start gap-4">
      {'bookletText' in content && 'bookletFile' in content && content.bookletText && content.bookletFile && (
        <a href={content.bookletFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          <BookOpen className="text-neon size-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm sm:text-base">{content.bookletText}</span>
        </a>
      )}
      {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
        <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
          <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
        </button>
      )}
    </div>

    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}

function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
  const [playingMp3, setPlayingMp3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ('audioFile' in content && content.audioFile) {
       audioRef.current = new Audio(content.audioFile as string);
       audioRef.current.onended = () => setPlayingMp3(false);
    }
    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = "";
       }
    };
  }, [content]);

  function toggleMp3() {
    if (!audioRef.current) return;
    if (playingMp3) {
      audioRef.current.pause();
      setPlayingMp3(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlayingMp3(true);
    }
  }

  return (
    <div>
      <VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src={content.videoUrl} />
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {content.points.map((point) => (
          <li key={point} className="flex gap-3 rounded-xl border border-border bg-background/35 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon" />
            {point}
          </li>
        ))}
      </ul>

      {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
        <div className="mt-8 flex justify-center sm:justify-start">
          <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
            {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
          </button>
        </div>
      )}

      <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
    </div>
  );
}

function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
  const [playingMp3, setPlayingMp3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ('audioFile' in content && content.audioFile) {
       audioRef.current = new Audio(content.audioFile as string);
       audioRef.current.onended = () => setPlayingMp3(false);
    }
    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = "";
       }
    };
  }, [content]);

  function toggleMp3() {
    if (!audioRef.current) return;
    if (playingMp3) {
      audioRef.current.pause();
      setPlayingMp3(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlayingMp3(true);
    }
  }

  return <div>
    <VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src="/video/3video.mp4" />
    <div className="mt-5 space-y-3">
      {content.transcript.map((line, index) => <div key={`${line.speaker}-${index}`} className={`max-w-[88%] rounded-2xl border p-4 ${index % 2 === 0 ? "border-danger/25 bg-danger/5" : "ml-auto border-neon/25 bg-neon/5"}`}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{line.speaker}</p><p className="mt-1 text-sm">{line.text}</p></div>)}
    </div>

    {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
      <div className="mt-8 flex justify-center sm:justify-start">
        <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
          <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
        </button>
      </div>
    )}

    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}

function VideoPlaceholder({ title, placeholder, hint, src }: { title: string; placeholder: string; hint: string; src?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neon/25 bg-slate-950">
      <video
        className="aspect-video w-full bg-black object-cover"
        controls
        preload="metadata"
      >
        <source src={src || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} type="video/mp4" />
        <p>Your browser doesn&apos;t support HTML5 video.</p>
      </video>
      <div className="border-t border-border bg-card p-4">
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{placeholder} — {hint}</p>
      </div>
    </div>
  );
}


export { IntroStage, TheoryStage, VideoExplanationStage, VideoExampleStage };
