"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getRiskLevel } from "@/lib/risk-level";

import { Composer } from "./chat/composer";
import { ChatMessageBubble } from "./chat/message-bubble";
import { QuickExamples } from "./chat/quick-examples";
import { AudioProcessingCard, ThinkingBubble } from "./chat/thinking-card";
import { useChronoAudio } from "./chat/use-chrono-audio";
import type { AiLocale, AiMode, AnalyzerInputMode, ApiResult, ChatMessage, QuotaStatus } from "./chat/types";
import type { ChatContent } from "@/data/chrono-content";

export function AiHelpChat({ locale, content }: { locale: AiLocale; content: ChatContent }) {
  const router = useRouter();
  const t = content;
  const audio = useChronoAudio({ t });
  const { attachment, listening, recordingSeconds, speechError } = audio;
  const [mode, setMode] = useState<AiMode>("analyzer");
  const [analyzerInputMode, setAnalyzerInputMode] = useState<AnalyzerInputMode>("text");
  const [messagesByMode, setMessagesByMode] = useState<Record<AiMode, ChatMessage[]>>({
    analyzer: [{ id: "analyzer-intro", role: "assistant", text: t.analyzerIntro }],
    chat: [{ id: "chat-intro", role: "assistant", text: t.chatIntro }],
  });
  const [drafts, setDrafts] = useState<Record<AiMode, string>>({ analyzer: "", chat: "" });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [welcoming, setWelcoming] = useState(true);
  const [dataConsent, setDataConsent] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [audioAnalysisStep, setAudioAnalysisStep] = useState(1);
  const [analysisAnnouncement, setAnalysisAnnouncement] = useState("");
  const [quota, setQuota] = useState<QuotaStatus>({ audioRemaining: null, dailyRemaining: null });
  const requestControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = messagesByMode[mode];
  const input = drafts[mode];

  const latestAnalysis = useMemo(() => [...messages].reverse().find((message) => message.analysis)?.analysis, [messages]);
  const latestRiskLevel = latestAnalysis ? getRiskLevel(latestAnalysis.risk) : null;
  const highRisk = latestRiskLevel === "high";
  const lowRisk = latestRiskLevel === "low";

  const robotImage = useMemo(() => {
    if (thinking) return "/characters/chrono/04_sad_thinking.png";
    if (highRisk) return "/characters/chrono/03_warning.png";
    if (speechError || requestError) return "/characters/chrono/03_warning.png";
    if (listening) return "/characters/chrono/02_happy.png";
    if (lowRisk) return "/characters/chrono/06_confident.png";
    if (voiceEnabled) return "/characters/chrono/06_confident.png";
    if (welcoming) return "/characters/chrono/02_happy.png";
    return "/characters/chrono/01_neutral.png";
  }, [highRisk, listening, lowRisk, requestError, speechError, thinking, voiceEnabled, welcoming]);

  useEffect(() => {
    const timer = setTimeout(() => setWelcoming(false), 3_000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadQuota() {
      try {
        const response = await fetch("/api/ai", { headers: { "x-infoquest-locale": locale }, cache: "no-store" });
        const result = await response.json() as ApiResult;
        if (active && response.ok) {
          setQuota({
            audioRemaining: typeof result.audioRemaining === "number" ? result.audioRemaining : null,
            dailyRemaining: typeof result.dailyRemaining === "number" ? result.dailyRemaining : null,
          });
        }
      } catch {
        // The form remains usable; the next successful request refreshes the counters.
      }
    }
    void loadQuota();
    return () => { active = false; };
  }, [locale]);

  useEffect(() => {
    if (!thinking || !processingAudio) return;
    const fraudCheckTimer = window.setTimeout(() => setAudioAnalysisStep(2), 10_000);
    const actionsTimer = window.setTimeout(() => setAudioAnalysisStep(3), 25_000);
    return () => {
      window.clearTimeout(fraudCheckTimer);
      window.clearTimeout(actionsTimer);
    };
  }, [processingAudio, thinking]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  useEffect(() => () => {
    requestControllerRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "ro" ? "ro-RO" : "ru-RU";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const cleanText = mode === "analyzer" && analyzerInputMode === "audio" ? "" : input.trim();
    const currentMode = mode;
    const currentMessages = messagesByMode[currentMode];
    const currentAttachment = currentMode === "analyzer" && analyzerInputMode === "audio" ? attachment : null;
    if ((!cleanText && !currentAttachment) || thinking) return;
    if (!dataConsent) {
      setRequestError(t.consentRequired);
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: cleanText,
      attachment: currentAttachment ?? undefined,
    };
    setMessagesByMode((current) => ({ ...current, [currentMode]: [...current[currentMode], userMessage] }));
    setDrafts((current) => ({ ...current, [currentMode]: "" }));
    if (currentMode === "analyzer") audio.clearAttachment();
    setRequestError(null);
    setAnalysisAnnouncement("");
    setThinking(true);
    setProcessingAudio(Boolean(currentAttachment));

    const requestController = new AbortController();
    requestControllerRef.current = requestController;
    try {
      const body = new FormData();
      body.append("locale", locale);
      body.append("mode", currentMode);
      body.append("dataConsent", "accepted");
      if (cleanText) body.append("message", cleanText);
      if (currentAttachment) body.append("audio", currentAttachment.file, currentAttachment.name);
      if (currentMode === "chat") {
        body.append("history", JSON.stringify(currentMessages.filter((message) => message.id !== "chat-intro").slice(-6).map((message) => ({ role: message.role, content: message.text }))));
      }
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "x-infoquest-locale": locale },
        body,
        signal: requestController.signal,
      });
      const result = await response.json() as ApiResult;
      if (response.status === 401) {
        setThinking(false);
        setProcessingAudio(false);
        router.push(`/${locale}/login?next=${encodeURIComponent(`/${locale}/ai-help`)}`);
        return;
      }
      if (!response.ok || (currentMode === "analyzer" ? !result.analysis : !result.reply)) throw new Error(result.error || t.networkError);
      setQuota((current) => ({
        audioRemaining: typeof result.audioRemaining === "number" ? result.audioRemaining : current.audioRemaining,
        dailyRemaining: typeof result.dailyRemaining === "number" ? result.dailyRemaining : current.dailyRemaining,
      }));
      const reply = currentMode === "analyzer" ? result.analysis!.reply : result.reply!;
      if (currentMode === "analyzer" && result.analysis) {
        setAnalysisAnnouncement(`${t.analysisReady}. ${t.risk}: ${result.analysis.risk}%. ${t.verdicts[result.analysis.verdict]}. ${result.analysis.summary}`);
      }
      setMessagesByMode((current) => ({
        ...current,
        [currentMode]: [...current[currentMode], { id: crypto.randomUUID(), role: "assistant", text: reply, analysis: result.analysis, transcript: result.transcript }],
      }));
      setThinking(false);
      setProcessingAudio(false);
      if (voiceEnabled) speak(reply);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const message = error instanceof Error ? error.message : t.networkError;
      setRequestError(message);
      setMessagesByMode((current) => ({ ...current, [currentMode]: [...current[currentMode], { id: crypto.randomUUID(), role: "assistant", text: message }] }));
      setThinking(false);
      setProcessingAudio(false);
    } finally {
      if (requestControllerRef.current === requestController) requestControllerRef.current = null;
    }
  }

  function toggleVoice() {
    if (voiceEnabled) window.speechSynthesis?.cancel();
    setVoiceEnabled((enabled) => !enabled);
  }

  function selectMode(nextMode: AiMode) {
    if (nextMode === mode || thinking || listening) return;
    window.speechSynthesis?.cancel();
    setMode(nextMode);
    audio.clearError();
    setRequestError(null);
    setAnalysisAnnouncement("");
  }

  function startNewCheck() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    window.speechSynthesis?.cancel();
    setVoiceEnabled(false);

    audio.stopAndDiscard();

    const urlsToRelease = new Set<string>();
    if (attachment) urlsToRelease.add(attachment.url);
    messagesByMode[mode].forEach((message) => {
      if (message.attachment) urlsToRelease.add(message.attachment.url);
    });
    audio.releaseUrls([...urlsToRelease]);
    audio.clearAttachment();

    const introMessage: ChatMessage = mode === "analyzer"
      ? { id: "analyzer-intro", role: "assistant", text: t.analyzerIntro }
      : { id: "chat-intro", role: "assistant", text: t.chatIntro };
    setMessagesByMode((current) => ({ ...current, [mode]: [introMessage] }));
    setDrafts((current) => ({ ...current, [mode]: "" }));
    setRequestError(null);
    setThinking(false);
    setProcessingAudio(false);
    setAudioAnalysisStep(1);
    setAnalysisAnnouncement("");
    setAnalyzerInputMode("text");
    setWelcoming(false);
  }

  function handleConsentChange(checked: boolean) {
    setDataConsent(checked);
    if (checked) {
      audio.clearError();
      setRequestError(null);
    }
  }

  function handleToggleMicrophone() {
    void audio.toggleMicrophone(dataConsent);
  }

  return (
    <main className="circuit-bg relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute left-0 top-20 size-80 rounded-full bg-success/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <header className="relative mb-5 flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-sm font-bold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" />{t.back}
          </Link>
          <div className="order-3 mx-auto flex w-full justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:order-none lg:w-auto lg:-translate-x-1/2 lg:-translate-y-1/2" role="group" aria-label={locale === "ro" ? "Modul Chrono" : "Режим Chrono"}>
            <div className="flex rounded-2xl border border-neon/25 bg-card/80 p-1.5 shadow-[0_0_24px_rgba(0,217,255,0.08)] backdrop-blur">
              <button type="button" onClick={() => selectMode("analyzer")} disabled={thinking || listening} aria-pressed={mode === "analyzer"} className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed ${mode === "analyzer" ? "bg-neon text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.35)]" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}><ShieldCheck className="size-4" aria-hidden="true" />{t.analyzer}</button>
              <button type="button" onClick={() => selectMode("chat")} disabled={thinking || listening} aria-pressed={mode === "chat"} className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed ${mode === "chat" ? "bg-neon text-primary-foreground shadow-[0_0_20px_rgba(0,217,255,0.35)]" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}><MessageCircle className="size-4" aria-hidden="true" />{t.chat}</button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-success/35 bg-success/10 px-3 py-2 text-xs font-bold text-success sm:inline-flex">
              <span className="size-2 animate-pulse rounded-full bg-success" />{t.status}
            </span>
            <nav className="flex rounded-full border border-border bg-card/70 p-1" aria-label="Language">
              {(["ro", "ru"] as const).map((language) => (
                <Link key={language} href={`/${language}/ai-help`} className={`focus-ring rounded-full px-3 py-2 text-xs font-black uppercase ${locale === language ? "bg-neon text-primary-foreground" : "text-muted-foreground"}`}>{language}</Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="grid gap-5 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="relative hidden min-h-72 flex-col items-center justify-end overflow-hidden rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_50%_45%,rgba(0,217,255,0.18),transparent_48%),rgba(6,18,48,0.8)] p-6 text-center lg:flex lg:min-h-0">
            <div className="absolute inset-x-10 top-12 h-40 rounded-full bg-neon/15 blur-3xl" aria-hidden="true" />
            <Image key={robotImage} src={robotImage} alt="Chrono" width={512} height={512} priority className="relative mx-auto w-52 drop-shadow-[0_0_34px_rgba(0,217,255,0.38)] transition sm:w-60 lg:w-full" />
            <div className="relative mt-2 w-full rounded-2xl border border-neon/25 bg-background/65 p-4 backdrop-blur">
              <div className="flex items-center justify-center gap-2"><Bot className="size-5 text-neon" aria-hidden="true" /><h1 className="text-xl font-black">Chrono</h1></div>
              <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
              <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 px-3 py-2 text-xs text-gold"><strong>{mode === "analyzer" ? t.analyzer : t.chat}</strong><span className="mt-1 block text-muted-foreground">{mode === "analyzer" ? t.analyzerHint : t.chatHint}</span></div>
            </div>
          </aside>

          <section className="flex h-[calc(100dvh-10.5rem)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-neon/25 bg-card/75 shadow-[0_22px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:h-auto lg:min-h-[640px]">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-6 sm:py-4">
              <Image key={`compact-${robotImage}`} src={robotImage} alt="Chrono" width={96} height={96} priority className="size-12 rounded-2xl object-contain drop-shadow-[0_0_14px_rgba(0,217,255,0.35)] lg:hidden" />
              <span className="hidden size-11 place-items-center rounded-2xl bg-success/15 text-success lg:grid"><Sparkles className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><h2 className="truncate font-black">{mode === "analyzer" ? `${t.title} · ${t.analyzer}` : `${t.title} · ${t.chat}`}</h2><p className="text-xs text-muted-foreground">{t.status}</p><p className="mt-1 truncate text-[11px] font-semibold text-neon">{t.quota}: {quota.dailyRemaining ?? "—"} {t.textRequests} · {quota.audioRemaining ?? "—"} {t.audioRequests}</p></div>
              <button type="button" onClick={startNewCheck} className="focus-ring order-3 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neon/35 bg-neon/10 px-3 text-xs font-black text-neon transition hover:bg-neon/20 sm:order-none sm:w-auto" title={t.newCheck} aria-label={t.newCheck}><RotateCcw className="size-4" aria-hidden="true" /><span>{t.newCheck}</span></button>
              <button type="button" onClick={toggleVoice} aria-pressed={voiceEnabled} aria-label={voiceEnabled ? t.listenOn : t.listenOff} title={voiceEnabled ? t.listenOn : t.listenOff} className={`focus-ring grid size-11 place-items-center rounded-xl border transition ${voiceEnabled ? "border-success/50 bg-success/15 text-success" : "border-border bg-background/40 text-muted-foreground hover:text-neon"}`}>
                {voiceEnabled ? <Volume2 className="size-5" aria-hidden="true" /> : <VolumeX className="size-5" aria-hidden="true" />}
              </button>
            </div>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{analysisAnnouncement}</p>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} t={t} locale={locale} onSpeak={speak} />
              ))}
              {latestAnalysis && !thinking && (
                <div className="flex justify-center lg:hidden" aria-hidden="true">
                  <Image key={`result-${robotImage}`} src={robotImage} alt="" width={240} height={240} className="w-36 drop-shadow-[0_0_26px_rgba(0,217,255,0.3)]" />
                </div>
              )}
              {mode === "analyzer" && messages.length === 1 && (
                <QuickExamples t={t} setAnalyzerInputMode={setAnalyzerInputMode} setDrafts={setDrafts} />
              )}
              {thinking && processingAudio ? (
                <AudioProcessingCard t={t} audioAnalysisStep={audioAnalysisStep} />
              ) : thinking ? <ThinkingBubble t={t} mode={mode} /> : null}
              <div ref={bottomRef} />
            </div>

            <Composer
              mode={mode}
              locale={locale}
              t={t}
              input={input}
              analyzerInputMode={analyzerInputMode}
              onDraftChange={(value) => setDrafts((current) => ({ ...current, [mode]: value }))}
              submit={submit}
              thinking={thinking}
              dataConsent={dataConsent}
              onConsentChange={handleConsentChange}
              requestError={requestError}
              speechError={audio.speechError}
              listening={listening}
              recordingSeconds={recordingSeconds}
              toggleMicrophone={handleToggleMicrophone}
              selectFile={audio.selectFile}
              attachment={attachment}
              clearAttachment={audio.clearAttachment}
              setAnalyzerInputMode={setAnalyzerInputMode}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
