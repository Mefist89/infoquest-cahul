"use client";

import Link from "next/link";
import {
  AudioLines,
  FileAudio,
  MessageSquareText,
  Mic,
  Paperclip,
  Send,
  Square,
  X,
} from "lucide-react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";

import type { ChatContent } from "./content";
import type { AiLocale, AiMode, AnalyzerInputMode, Attachment } from "./types";

function formatRecordingTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function Composer({
  mode,
  locale,
  t,
  input,
  analyzerInputMode,
  onDraftChange,
  submit,
  thinking,
  dataConsent,
  onConsentChange,
  requestError,
  speechError,
  listening,
  recordingSeconds,
  toggleMicrophone,
  selectFile,
  attachment,
  clearAttachment,
  setAnalyzerInputMode,
}: {
  mode: AiMode;
  locale: AiLocale;
  t: ChatContent;
  input: string;
  analyzerInputMode: AnalyzerInputMode;
  onDraftChange: (value: string) => void;
  submit: (event?: FormEvent) => void;
  thinking: boolean;
  dataConsent: boolean;
  onConsentChange: (checked: boolean) => void;
  requestError: string | null;
  speechError: string | null;
  listening: boolean;
  recordingSeconds: number;
  toggleMicrophone: () => void;
  selectFile: (event: ChangeEvent<HTMLInputElement>) => void;
  attachment: Attachment | null;
  clearAttachment: () => void;
  setAnalyzerInputMode: Dispatch<SetStateAction<AnalyzerInputMode>>;
}) {
  return (
                <form onSubmit={submit} className="sticky bottom-0 z-20 shrink-0 border-t border-border/70 bg-background/95 p-3 backdrop-blur-xl sm:p-5">
              {mode === "analyzer" && (
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card/60 p-1.5" role="group" aria-label={locale === "ro" ? "Tipul analizei" : "Тип анализа"}>
                  <button type="button" onClick={() => setAnalyzerInputMode("text")} disabled={listening || thinking} aria-pressed={analyzerInputMode === "text"} className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${analyzerInputMode === "text" ? "bg-neon text-primary-foreground shadow-[0_0_18px_rgba(0,217,255,0.25)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><MessageSquareText className="size-4" aria-hidden="true" />{t.textMode}</button>
                  <button type="button" onClick={() => setAnalyzerInputMode("audio")} disabled={listening || thinking} aria-pressed={analyzerInputMode === "audio"} className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${analyzerInputMode === "audio" ? "bg-neon text-primary-foreground shadow-[0_0_18px_rgba(0,217,255,0.25)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><AudioLines className="size-4" aria-hidden="true" />{t.audioMode}</button>
                </div>
              )}
              {speechError && <p className="mb-3 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2 text-xs text-danger">{speechError}</p>}
              {requestError && <p className="mb-3 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2 text-xs text-danger">{requestError}</p>}
              {listening && <p className="mb-3 flex items-center gap-2 text-xs font-bold text-success"><span className="size-2 animate-pulse rounded-full bg-success" />{t.listening}</p>}
              {mode === "analyzer" && analyzerInputMode === "audio" && attachment && (
                <div className="mb-3 rounded-xl border border-neon/25 bg-card/70 p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-lg bg-success/10 text-success"><FileAudio className="size-6" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{attachment.name}</p><p className="text-xs text-muted-foreground">{t.audio} · {(attachment.file.size / 1024 / 1024).toFixed(1)} MB</p></div>
                    <button type="button" onClick={clearAttachment} aria-label={`${t.removeAttachment}: ${attachment.name}`} className="focus-ring grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-danger"><X className="size-4" aria-hidden="true" /></button>
                  </div>
                  <audio src={attachment.url} controls className="mt-3 w-full" />
                </div>
              )}
              <div className="mb-3 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs leading-relaxed text-muted-foreground">
                <p>{t.privacySummary}</p>
                <details className="mt-1">
                  <summary className="focus-ring inline-flex cursor-pointer rounded font-bold text-neon hover:underline">
                    {t.privacyMore}
                  </summary>
                  <div className="mt-2 border-l border-gold/30 pl-3">
                    <p>{mode === "analyzer" ? t.privacyNotice : t.chatPrivacyNotice}</p>
                    <Link href={`/${locale}/privacy`} className="mt-2 inline-flex font-bold text-neon hover:underline">
                      {t.privacyLink}
                    </Link>
                  </div>
                </details>
                <p className="mt-2 font-semibold text-foreground">{t.historyNotice}</p>
                <label className="mt-3 flex cursor-pointer items-start gap-3 text-foreground">
                  <input
                    type="checkbox"
                    checked={dataConsent}
                    onChange={(event) => onConsentChange(event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--neon)]"
                  />
                  <span>{t.consent}</span>
                </label>
              </div>
              {mode === "analyzer" && analyzerInputMode === "audio" ? (
                <div className="rounded-2xl border border-border bg-card/85 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`grid size-12 place-items-center rounded-full border ${listening ? "border-danger bg-danger/15 text-danger" : "border-success/40 bg-success/10 text-success"}`}><Mic className={`size-6 ${listening ? "animate-pulse" : ""}`} aria-hidden="true" /></span>
                    <div className="min-w-32 flex-1"><p className="text-xs text-muted-foreground">{t.recordingTime}</p><p className="font-display text-2xl font-black text-foreground tabular-nums">{formatRecordingTime(recordingSeconds)}</p></div>
                    <button type="button" onClick={toggleMicrophone} disabled={!dataConsent || thinking} aria-pressed={listening} aria-label={listening ? t.stopRecording : t.startRecording} className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${listening ? "bg-danger text-white" : "bg-success text-slate-950"}`}>{listening ? <Square className="size-4 fill-current" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}{listening ? t.stopRecording : t.startRecording}</button>
                    <label className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neon/35 px-4 text-sm font-bold text-neon ${dataConsent ? "cursor-pointer hover:bg-neon/10" : "cursor-not-allowed opacity-40"}`}><Paperclip className="size-4" aria-hidden="true" />{t.audio}<input type="file" accept="audio/*,.mp3,.m4a,.wav,.webm,.weba,.ogg,.aac,.flac" onChange={selectFile} disabled={!dataConsent || listening} className="sr-only" /></label>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t.audioFormats}</p>
                  <button type="submit" disabled={!dataConsent || thinking || listening || !attachment} aria-label={t.sendAudio} className="focus-ring mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-5" aria-hidden="true" />{t.send}</button>
                </div>
              ) : (
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/85 p-2 focus-within:border-neon/60">
                  <textarea aria-label={mode === "analyzer" ? t.analyzerPlaceholder : t.chatPlaceholder} value={input} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder={mode === "analyzer" ? t.analyzerPlaceholder : t.chatPlaceholder} className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  <button type="submit" disabled={!dataConsent || thinking || !input.trim()} title={t.sendMessage} aria-label={t.sendMessage} className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-neon text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-5" aria-hidden="true" /></button>
                </div>
              )}
            </form>
  );
}
