"use client";

import { Check, CheckCircle2, MessageCircle, Pause, Phone, Play, Skull, User, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { operatorCallContent, type OperatorLocale } from "@/data/operator-call";
import { accessibilityText, ActionButton, playSound } from "./stage-support";

function VisualClueButton({ label, selected, foundText, onSelect, className, children }: { label: string; selected: boolean; foundText: string; onSelect: () => void; className: string; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} aria-label={`${label}. ${selected ? foundText : ""}`} onClick={onSelect} className={`focus-ring relative ${className}`}>
      {children}
      {selected && <span className="mt-1 block text-[10px] font-black uppercase tracking-wide text-success"><Check className="mr-1 inline size-3" aria-hidden="true" />{foundText}</span>}
    </button>
  );
}

type VisualScenario = {
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

function FinalStage({ locale, content, check, retry, saving, onSubmit }: { locale: OperatorLocale; content: (typeof operatorCallContent)["ru"]["final"] | (typeof operatorCallContent)["ro"]["final"]; check: string; retry: string; saving: boolean; feedback: { score: number; passed?: boolean } | null; onSubmit: () => void }) {
  const MAX_PLAYER_HP = 3;
  const MAX_BOSS_HP = 10;

  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [foundDetails, setFoundDetails] = useState<Set<string>>(new Set());
  const [bossSelected, setBossSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"playing" | "gameover" | "win">("playing");
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(12);
  const [shake, setShake] = useState(false);
  const [blitzPaused, setBlitzPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const phaseRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const a11y = accessibilityText[locale];

  const takeDamage = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setPlayerHp(prev => {
      const next = prev - 1;
      if (next <= 0) setStatus("gameover");
      return next;
    });
  }, []);

  const advanceLevel = useCallback(() => {
    setFoundDetails(new Set());
    setBossSelected(new Set());
    setBossSelected(new Set());
    if (currentLevel < 9) {
      setCurrentLevel(prev => prev + 1);
    } else {
      if (currentPhase < 2) {
        setCurrentPhase(prev => prev + 1);
        setCurrentLevel(0);
      } else {
        setStatus("win");
      }
    }
    setBlitzTimeLeft(12);
    setBlitzPaused(false);
  }, [currentLevel, currentPhase]);

  useEffect(() => {
    if (status !== "playing" || currentPhase !== 1 || blitzPaused) return;

    const timer = window.setTimeout(() => {
      if (blitzTimeLeft <= 1) {
        playSound("timeout");
        setAnnouncement(`${a11y.wrong}. ${locale === "ru" ? "Время вышло" : "Timpul a expirat"}`);
        takeDamage();
        advanceLevel();
      } else {
        setBlitzTimeLeft(blitzTimeLeft - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [advanceLevel, a11y.wrong, blitzPaused, blitzTimeLeft, currentPhase, locale, status, takeDamage]);

  useEffect(() => {
    if (status === "playing") phaseRef.current?.focus();
    else statusRef.current?.focus();
  }, [currentLevel, currentPhase, status]);

  const handleVisualClick = (targetId: string, isCorrect: boolean) => {
    if (isCorrect) {
      playSound("correct");
      setAnnouncement(`${a11y.correct}. ${a11y.found}: ${targetId}`);
      setFoundDetails(prev => {
        const next = new Set(prev);
        next.add(targetId);

        const required = content.phase1[currentLevel].correctTargets.length || 1;
        if (next.size >= required) {
          setTimeout(() => advanceLevel(), 300);
          return new Set();
        }
        return next;
      });
    } else {
      playSound("wrong");
      setAnnouncement(a11y.wrong);
      takeDamage();
    }
  };

const handleBlitzClick = (optionIndex: number) => {
    const isCorrect = optionIndex === content.phase2[currentLevel].answer;
    if (isCorrect) {
      playSound("correct");
      setAnnouncement(a11y.correct);
      advanceLevel();
    } else {
      playSound("wrong");
      setAnnouncement(a11y.wrong);
      takeDamage();
      advanceLevel();
    }
  };

  const handleBossClick = (optionIndex: number) => {
    const answers = content.phase3[currentLevel].answers;
    const isCorrect = answers.includes(optionIndex);

    if (isCorrect) {
      playSound("correct");
      setAnnouncement(`${a11y.correct}. ${a11y.selected}`);
      setBossSelected(prev => {
        const next = new Set(prev);
        next.add(optionIndex);

        if (next.size >= answers.length) {
          setBossHp(hp => {
            const nextHp = hp - 1;
            setTimeout(() => {
              if (nextHp <= 0) {
                setStatus("win");
              } else {
                advanceLevel();
              }
            }, 300);
            return nextHp;
          });
          return new Set();
        }
        return next;
      });
    } else {
      playSound("wrong");
      setAnnouncement(a11y.wrong);
      takeDamage();
      setBossSelected(new Set());
    }
  };

const restart = () => {
    setPlayerHp(MAX_PLAYER_HP);
    setBossHp(MAX_BOSS_HP);
    setCurrentPhase(0);
    setCurrentLevel(0);
    setStatus("playing");
    setBlitzTimeLeft(12);
    setBlitzPaused(false);
    setFoundDetails(new Set());
  };

  if (status === "gameover") {
    return (
      <div ref={statusRef} tabIndex={-1} role="alert" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-danger/40 rounded-3xl bg-danger/10">
         <XCircle className="size-16 text-danger mb-4" aria-hidden="true" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.gameOver}</p>
         <button type="button" onClick={restart} className="rounded-xl bg-danger px-12 py-4 text-sm font-black text-danger-foreground focus-ring hover:scale-105 transition">{retry}</button>
      </div>
    );
  }

  if (status === "win") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="focus-ring flex flex-col items-center animate-in zoom-in text-center p-8 border-2 border-neon/40 rounded-3xl bg-neon/10 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
         <CheckCircle2 className="size-16 text-neon mb-4" aria-hidden="true" />
         <p className="text-2xl font-black mb-8 text-foreground">{content.win}</p>
         <ActionButton disabled={saving} onClick={onSubmit} center>{check}</ActionButton>
      </div>
    );
  }

  const renderHP = (hp: number, max: number, colorClass: string, label: string) => (
    <div className="min-w-0" role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${hp}/${max}`}>
      <span className="mb-1 block text-xs font-bold text-foreground">{hp}/{max}</span>
      <div className="grid w-full grid-flow-col auto-cols-fr gap-1" aria-hidden="true">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`h-3 min-w-0 rounded-full border-2 transition-all duration-300 ${i < hp ? colorClass + ' border-transparent' : 'bg-transparent border-foreground/20'}`} />
        ))}
      </div>
    </div>
  );

  const currentVisual = content.phase1[currentLevel] as VisualScenario;

  return (
    <div className={`flex flex-col items-center w-full max-w-2xl mx-auto pb-10 transition-transform ${shake ? 'animate-shake' : ''}`}>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <div className="mb-8 grid w-full gap-4 rounded-2xl border border-border bg-slate-900/50 p-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-1">HP</p>
          {renderHP(playerHp, MAX_PLAYER_HP, "bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]", "HP")}
        </div>
        {currentPhase === 2 && (
          <div className="min-w-0 sm:text-right">
            <p className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-1">Boss HP</p>
            {renderHP(bossHp, MAX_BOSS_HP, "bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]", "Boss HP")}
          </div>
        )}
      </div>

      {currentPhase === 0 && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring w-full flex flex-col items-center animate-in fade-in">
          <p className="font-bold text-center text-lg text-neon mb-6">{content.phase1Intro}</p>
          <div className="w-full max-w-sm bg-slate-100 dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="bg-slate-200 dark:bg-slate-950 px-6 py-2 flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-300 dark:border-slate-800">
              <span>09:41</span>
              <div className="flex gap-1"><span className="w-4 h-2 bg-slate-400 rounded-sm"></span></div>
            </div>

            <div className="bg-slate-800/10 py-1 text-center border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">{content.clues}: {foundDetails.size} / {content.phase1[currentLevel].correctTargets.length || 1}</span>
            </div>

            <div className="p-4 flex flex-col gap-4 min-h-[300px]">
              {currentVisual.type === "sms" && (
                <div className="flex flex-col gap-4">
                  <VisualClueButton label={`${a11y.sender}: ${currentVisual.sender || "MinTel"}`} selected={foundDetails.has("sender")} foundText={a11y.found} onSelect={() => handleVisualClick("sender", currentVisual.correctTargets.includes("sender"))} className={`mt-2 w-full rounded-lg border-2 p-2 text-center text-xs font-bold uppercase tracking-wider ${foundDetails.has("sender") ? "border-success bg-success/10 text-success" : "border-transparent text-slate-500"}`}>{currentVisual.sender || "MinTel"}</VisualClueButton>
                  <div className="rounded-2xl rounded-tl-sm border-2 border-transparent bg-blue-500 p-3 text-white shadow-md">
                    <VisualClueButton label={`${a11y.message}: ${currentVisual.text}`} selected={foundDetails.has("text")} foundText={a11y.found} onSelect={() => handleVisualClick("text", currentVisual.correctTargets.includes("text"))} className={`w-full rounded-lg border-2 p-2 text-left text-sm leading-relaxed ${foundDetails.has("text") ? "border-success bg-success/20" : "border-transparent"}`}>{currentVisual.text}</VisualClueButton>
                    <VisualClueButton label={`${a11y.link}: ${currentVisual.fakeLink}`} selected={foundDetails.has("fakeLink")} foundText={a11y.found} onSelect={() => handleVisualClick("fakeLink", currentVisual.correctTargets.includes("fakeLink"))} className={`mt-3 w-full break-all rounded-lg border-2 p-2 text-left font-bold underline ${foundDetails.has("fakeLink") ? "border-success bg-success/20 text-success" : "border-transparent text-blue-100"}`}>{currentVisual.fakeLink}</VisualClueButton>
                  </div>
                </div>
              )}
              {currentVisual.type === "call" && (
                <div className="flex flex-col items-center justify-center h-full pt-10">
                  <VisualClueButton label={a11y.avatar} selected={foundDetails.has("avatar")} foundText={a11y.found} onSelect={() => handleVisualClick("avatar", currentVisual.correctTargets.includes("avatar"))} className={`mb-4 flex min-h-20 w-24 flex-col items-center justify-center rounded-full border-4 ${foundDetails.has("avatar") ? "border-success bg-success/10 text-success" : "border-transparent bg-slate-300 dark:bg-slate-800"}`}><User className="size-10 text-slate-500" aria-hidden="true" /></VisualClueButton>
                  <VisualClueButton label={`${a11y.caller}: ${currentVisual.caller}`} selected={foundDetails.has("caller")} foundText={a11y.found} onSelect={() => handleVisualClick("caller", currentVisual.correctTargets.includes("caller"))} className={`mb-1 w-full rounded-lg border-2 p-2 text-xl font-bold ${foundDetails.has("caller") ? "border-success bg-success/10 text-success" : "border-transparent text-slate-800 dark:text-slate-100"}`}>{currentVisual.caller}</VisualClueButton>
                  <VisualClueButton label={`${a11y.number}: ${currentVisual.number}`} selected={foundDetails.has("number")} foundText={a11y.found} onSelect={() => handleVisualClick("number", currentVisual.correctTargets.includes("number"))} className={`rounded-lg border-2 px-3 py-2 text-lg font-black tracking-wider ${foundDetails.has("number") ? "border-success bg-success/10 text-success" : "border-danger/20 bg-danger/10 text-danger"}`}>{currentVisual.number}</VisualClueButton>
                  <div className="flex gap-8 mt-12 w-full justify-center">
                    <button type="button" aria-label={a11y.callAction} onClick={() => handleVisualClick("action", false)} className="focus-ring grid min-h-14 w-14 place-items-center rounded-full bg-danger shadow-lg"><Phone className="text-white transform rotate-[135deg]" aria-hidden="true" /></button>
                    <button type="button" aria-label={a11y.callAction} onClick={() => handleVisualClick("action", false)} className="focus-ring grid min-h-14 w-14 place-items-center rounded-full bg-success shadow-lg"><Phone className="text-white" aria-hidden="true" /></button>
                  </div>
                </div>
              )}
              {currentVisual.type === "profile" && (
                <div className="flex flex-col items-center pt-8">
                  <VisualClueButton label={a11y.avatar} selected={foundDetails.has("avatar")} foundText={a11y.found} onSelect={() => handleVisualClick("avatar", currentVisual.correctTargets.includes("avatar"))} className={`mb-4 flex min-h-24 w-28 flex-col items-center justify-center rounded-full border-4 ${foundDetails.has("avatar") ? "border-success bg-success/10" : "border-neon bg-neon/20"}`}><CheckCircle2 className={`size-12 ${foundDetails.has("avatar") ? "text-success" : "text-neon"}`} aria-hidden="true" /></VisualClueButton>
                  <VisualClueButton label={`${a11y.profileName}: ${currentVisual.name}`} selected={foundDetails.has("name")} foundText={a11y.found} onSelect={() => handleVisualClick("name", currentVisual.correctTargets.includes("name"))} className={`mb-2 w-full rounded-lg border-2 p-2 text-2xl font-bold ${foundDetails.has("name") ? "border-success bg-success/10 text-success" : "border-transparent text-slate-800 dark:text-slate-100"}`}>{currentVisual.name}</VisualClueButton>
                  <VisualClueButton label={`${a11y.accountType}: ${currentVisual.accountType}`} selected={foundDetails.has("accountType")} foundText={a11y.found} onSelect={() => handleVisualClick("accountType", currentVisual.correctTargets.includes("accountType"))} className={`mb-6 rounded-xl border-2 px-4 py-2 text-sm font-bold ${foundDetails.has("accountType") ? "border-success bg-success/10 text-success" : "border-transparent bg-slate-200 text-slate-500 dark:bg-slate-800"}`}>{currentVisual.accountType}</VisualClueButton>
                  <div className="w-full flex justify-around border-t border-slate-300 dark:border-slate-800 pt-4">
                     <button type="button" onClick={() => handleVisualClick("action", false)} className="focus-ring flex min-h-11 flex-col items-center rounded-xl p-2 text-neon"><Phone className="size-6 mb-1" aria-hidden="true"/><span className="text-xs">{a11y.callAction}</span></button>
                     <button type="button" onClick={() => handleVisualClick("action", false)} className="focus-ring flex min-h-11 flex-col items-center rounded-xl p-2 text-neon"><MessageCircle className="size-6 mb-1" aria-hidden="true"/><span className="text-xs">{a11y.messageAction}</span></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentPhase === 1 && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring w-full flex flex-col items-center animate-in fade-in">
          <p className="font-bold text-center text-lg text-warning mb-6">{content.phase2Intro}</p>
          <div className="w-full bg-slate-900 border-2 border-warning/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{currentLevel + 1} / 10</span>
               <div className="flex items-center gap-3">
                 <span role="timer" aria-label={`${blitzTimeLeft} ${locale === "ru" ? "секунд" : "secunde"}`} className={`text-3xl font-black tabular-nums transition-colors ${blitzTimeLeft <= 3 ? 'text-danger animate-pulse' : 'text-warning'}`}>0:{blitzTimeLeft.toString().padStart(2, "0")}</span>
                 <button type="button" onClick={() => { setBlitzPaused(value => !value); setAnnouncement(blitzPaused ? a11y.resume : a11y.paused); }} aria-pressed={blitzPaused} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-warning/40 bg-background/50 px-3 text-xs font-bold text-foreground">
                   {blitzPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
                   {blitzPaused ? a11y.resume : a11y.pause}
                 </button>
               </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold mb-8 text-foreground">{content.phase2[currentLevel].text}</p>
            <div className="flex flex-col gap-3">
              {content.phase2[currentLevel].options.map((opt, i) => (
                <button key={i} type="button" onClick={() => handleBlitzClick(i)} className="w-full text-left p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-warning/50 transition font-medium text-lg focus-ring">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentPhase === 2 && (
        <div ref={phaseRef} tabIndex={-1} className="focus-ring w-full flex flex-col items-center animate-in zoom-in-95">
          <p className="font-bold text-center text-lg text-danger mb-6">{content.phase3Intro}</p>
          <div className="w-full bg-slate-950 border-2 border-danger rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-danger/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-6 mb-8">
               <div className="w-24 h-24 flex items-center justify-center rounded-2xl border-2 border-danger/50 shadow-lg bg-slate-900">
                 <Skull className="size-12 text-danger animate-pulse" />
               </div>
               <div className="relative bg-danger/10 border border-danger/30 rounded-2xl p-4 w-full">
                  <div className="absolute top-1/2 -left-3 w-4 h-4 bg-slate-950 border-t border-l border-danger/30 transform -rotate-45 -translate-y-1/2" />
                  <p className="text-lg font-bold text-danger-foreground">{content.phase3[currentLevel].bossText}</p>
               </div>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              {content.phase3[currentLevel].options.map((opt, i) => (
                <button key={i} type="button" aria-pressed={bossSelected.has(i)} onClick={() => handleBossClick(i)} className={`w-full text-left p-4 rounded-xl border transition font-medium text-lg focus-ring ${bossSelected.has(i) ? 'border-success bg-success/20 text-success shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-danger/20 bg-background/50 hover:bg-danger/20 hover:border-danger/50'}`}>
                  {opt}
                  {bossSelected.has(i) && <span className="ml-2 text-xs font-black uppercase"><Check className="mr-1 inline size-4" aria-hidden="true" />{a11y.selected}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export { FinalStage };
