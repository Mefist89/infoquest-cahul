"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Volume2,
  BookOpen,
  Clapperboard,
  Video,
  ScanSearch,
  ListChecks,
  ListOrdered,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import { fakeLinkContent, type FakeLinkLocale } from "@/data/fake-link";
import type { ModuleProgress, StageProgress } from "@/features/modules/runner/use-module-runner";
import { createClient } from "@/lib/supabase/client";
import { NextButtonContext } from "./operator-call/stage-support";

function HeaderStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon sm:size-12">
        <Icon className="size-5 sm:size-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
        <p className="mt-0.5 text-lg font-black text-foreground sm:text-xl">{value}</p>
      </div>
    </div>
  );
}

const stageIcons: LucideIcon[] = [BookOpen, Clapperboard, Video, ScanSearch, ListChecks, MessageSquare, ListOrdered, ShieldAlert];

export function FakeLinkModule({ locale, initialStages, initialModule, isAdmin }: { locale: FakeLinkLocale; initialStages: StageProgress[]; initialModule: ModuleProgress; isAdmin?: boolean }) {
  const t = fakeLinkContent[locale];
  const initialCompleted = initialStages.filter((stage) => stage.status === "completed").map((stage) => stage.stage_index);
  const firstOpenStage = Array.from({ length: 8 }, (_, index) => index + 1).find((stage) => !initialCompleted.includes(stage)) ?? 1;
  const [completedStages, setCompletedStages] = useState(() => new Set(initialCompleted));
  const [currentStage, setCurrentStage] = useState(initialCompleted.length === 0 ? 0 : firstOpenStage);
  const [moduleXp, setModuleXp] = useState(initialModule?.xp ?? 0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const unlockedThrough = useMemo(() => {
    return Math.max(1, ...Array.from(completedStages).map((s) => s + 1));
  }, [completedStages]);

  const completionPercent = Math.round((completedStages.size / 8) * 100);

  async function completeStage(stageIndex: number, score = 100) {
    if (saving) return false;
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("complete_module_stage", {
      p_module_id: "fake-link",
      p_stage_index: stageIndex,
      p_score: Math.max(0, Math.min(100, Math.round(score))),
    });
    setSaving(false);

    if (error) {
      setNotice({ kind: "error", text: t.saveError });
      return false;
    }

    const result = Array.isArray(data) ? data[0] : null;
    setCompletedStages((previous) => new Set(previous).add(stageIndex));
    setModuleXp(Number(result?.module_xp ?? moduleXp));
    setNotice({ kind: "success", text: t.saved });
    return true;
  }

  function chooseStage(stage: number) {
    setCurrentStage(stage);
    setNotice(null);
  }

  async function submitIntro() {
    chooseStage(1);
  }

  async function submitTheory() {
    await completeStage(1, 100);
  }

  return (
    <main className="circuit-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.back}
          </Link>
          <Link href={`/${locale}/profile`} className="focus-ring ml-auto inline-flex min-h-11 items-center rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-muted-foreground transition hover:border-neon/60 hover:text-foreground">{t.profile}</Link>
          {isAdmin && (
            <Link href={`/${locale}/admin`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-xs font-bold text-neon transition hover:border-neon hover:bg-neon/20">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{locale === "ro" ? "Administrare" : "Админ"}</span>
            </Link>
          )}
          <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
            {(["ro", "ru"] as const).map((language) => <Link key={language} href={`/${language}/modules/fake-link`} className={`focus-ring rounded-full px-3 py-2 text-xs font-bold uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>)}
          </nav>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-neon/30 bg-card/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-neon/10 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">{t.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeaderStat label={t.completed} value={`${completedStages.size}/8`} icon={CheckCircle2} />
              <HeaderStat label={t.xp} value={`${moduleXp}/100`} icon={Sparkles} />
            </div>
          </div>
          <div className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={completedStages.size} aria-valuemin={0} aria-valuemax={8} aria-label={t.progress}>
            <div className="h-full rounded-full bg-neon transition-[width] duration-500" style={{ width: `${completionPercent}%` }} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          
            <aside className="rounded-3xl border border-border bg-card/70 p-4 lg:sticky lg:top-24 lg:self-start">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{t.progress}</p>
              <button type="button" onClick={() => chooseStage(0)} className={`focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${currentStage === 0 ? "border-neon/60 bg-neon/10" : "border-border bg-background/25"}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${currentStage === 0 ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}`}><MessageSquare className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">Intro</span><span className="block truncate text-sm font-bold text-foreground">{t.intro.title}</span></span>
              </button>
              
              <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {t.stages.slice(1).map((stage, index) => {
                  const number = index + 1; // 1 for Theory
                  const dbStage = number;   // 1 for Theory
                  const Icon = stageIcons[number] || BookOpen;
                  const done = completedStages.has(dbStage);
                  const locked = !done && dbStage > unlockedThrough;
                  const active = currentStage === number;
                  return (
                    <li key={stage.title}>
                      <button type="button" onClick={() => chooseStage(number)} disabled={locked} className={`focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-neon/60 bg-neon/10" : done ? "border-success/30 bg-success/5" : "border-border bg-background/25"} disabled:cursor-not-allowed disabled:opacity-45`}>
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${done ? "bg-success/15 text-success" : active ? "bg-neon/15 text-neon" : "bg-secondary text-muted-foreground"}`}>{locked ? <Lock className="size-4" /> : done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                        <span className="min-w-0"><span className="block text-xs text-muted-foreground">{dbStage}/8 {stage.subtitle}</span><span className="block truncate text-sm font-bold text-foreground">{stage.title}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>


          
          <section className="min-h-[34rem] rounded-3xl border border-border bg-card/75 p-5 sm:p-8">
            {notice && (
              <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${notice.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>
                {notice.text}
              </div>
            )}

            {currentStage === 0 ? (
              <StageHeading number={0} title={t.intro.title} subtitle={t.intro.subtitle} done={false} />
            ) : (
              <StageHeading number={currentStage} title={t.stages[currentStage].title} subtitle={t.stages[currentStage].subtitle} done={completedStages.has(currentStage)} />
            )}
            <NextButtonContext.Provider value={
              currentStage > 0 && currentStage < 8 ? (
                <button type="button" disabled={!completedStages.has(currentStage)} onClick={() => chooseStage(currentStage + 1)} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-5 text-sm font-black text-neon transition hover:border-neon hover:bg-neon/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neon/40 disabled:hover:bg-neon/10">
                  {t.continue}<ChevronRight className="size-4" aria-hidden="true" />
                </button>
              ) : null
            }>
              <div className="mt-7">
                {currentStage === 0 && <IntroStage locale={locale} content={t.intro} onFinish={submitIntro} />}
                {currentStage === 1 && <TheoryStage content={t.theory} button={t.continue} saving={saving} onComplete={submitTheory} />}
                {currentStage > 1 && currentStage < 9 && (
                  <div className="py-20 text-center">
                    <p className="text-xl font-bold text-muted-foreground">{t.stages[currentStage].title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">В разработке / În dezvoltare</p>
                    <button type="button" onClick={() => { completeStage(currentStage, 100); chooseStage(currentStage < 8 ? currentStage + 1 : 8); }} disabled={saving} className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
                      Завершить этап (Dev)
                    </button>
                  </div>
                )}
              </div>
            </NextButtonContext.Provider>
          </section>

        </div>
      </div>
    </main>
  );
}

function IntroStage({ locale, content, onFinish }: { locale: "ru" | "ro"; content: (typeof fakeLinkContent)["ru"]["intro"] | (typeof fakeLinkContent)["ro"]["intro"]; onFinish: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const fullText = content.lines[lineIndex];
  const lastLine = lineIndex === content.lines.length - 1;

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
          <Image src="/characters/01_woman_purple_blazer_left.png" alt={content.name} fill sizes="(max-width: 640px) 256px, 384px" className="object-contain object-bottom drop-shadow-[0_0_28px_rgba(0,217,255,0.22)]" priority />
        </div>
        <div className="relative z-10 self-center pb-8 sm:pb-0">
          <div className="rounded-3xl rounded-bl-md border border-neon/35 bg-card/95 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neon">{content.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{content.role}</p>
            <p className="sr-only">{fullText}</p>
            <TypewriterText key={lineIndex} text={fullText} onDone={finishTyping} />
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

function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    let character = 0;
    const timer = window.setInterval(() => {
      character += 1;
      setVisibleCharacters(character);
      if (character >= text.length) {
        window.clearInterval(timer);
        onDone();
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [onDone, text]);

  const done = visibleCharacters >= text.length;
  return (
    <p aria-hidden="true" className="mt-5 min-h-20 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
      {text.slice(0, visibleCharacters)}
      {!done && <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-neon align-middle" />}
    </p>
  );
}

function TheoryStage({ content, button, saving, onComplete }: { content: (typeof fakeLinkContent)["ru"]["theory"] | (typeof fakeLinkContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <button type="button" onClick={onComplete} disabled={saving} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 text-sm font-black text-primary-foreground shadow-[0_0_28px_rgba(0,217,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(0,217,255,0.5)] disabled:opacity-60">{button}</button>
    </div>
  </div>;
}

function StageHeading({ number, title, subtitle, done }: { number: number; title: string; subtitle: string; done: boolean }) {
  return <div className="flex items-start gap-4"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-display font-black ${done ? "border-success/40 bg-success/10 text-success" : "border-neon/40 bg-neon/10 text-neon"}`}>{done ? <Check className="size-5" /> : number === 0 ? <MessageSquare className="size-5" /> : number}</span><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{number === 0 ? "Intro" : `${number}/8`}</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div></div>;
}
