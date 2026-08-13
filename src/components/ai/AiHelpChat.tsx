"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Circle,
  FileAudio,
  LoaderCircle,
  MessageCircle,
  MessageSquareText,
  Mic,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getRiskIndicatorClass, getRiskLevel } from "@/lib/risk-level";

type AiLocale = "ro" | "ru";
type AiMode = "analyzer" | "chat";
type AnalyzerInputMode = "text" | "audio";
type Attachment = { name: string; url: string; file: File };
type Verdict = "likely_scam" | "suspicious" | "unclear" | "likely_safe";
type FraudAnalysis = { verdict: Verdict; risk: number; summary: string; signals: string[]; actions: string[]; reply: string; disclaimer: string };
type ChatMessage = { id: string; role: "assistant" | "user"; text: string; attachment?: Attachment; analysis?: FraudAnalysis; transcript?: string };
type ApiResult = { analysis?: FraudAnalysis; transcript?: string; reply?: string; audioRemaining?: number; dailyRemaining?: number; error?: string };
type QuotaStatus = { audioRemaining: number | null; dailyRemaining: number | null };

const content = {
  ro: {
    title: "Ajutor online AI",
    subtitle: "Asistent pentru siguranță digitală",
    back: "Pagina principală",
    status: "Chrono este online",
    intro: "Salut! Sunt Chrono, ghidul tău digital. Întreabă-mă despre apeluri suspecte, linkuri false sau siguranța contului.",
    placeholder: "Scrie întrebarea ta…",
    send: "Trimite",
    sendMessage: "Trimite mesajul",
    sendAudio: "Trimite fișierul audio pentru analiză",
    attach: "Atașează un fișier audio (maximum 4 MB)",
    audio: "Audio",
    listenOn: "Oprește vocea răspunsurilor",
    listenOff: "Pornește vocea răspunsurilor",
    micStart: "Înregistrează un mesaj vocal",
    micStop: "Oprește înregistrarea",
    listening: "Înregistrare în curs… Apasă din nou pentru a opri.",
    unsupported: "Înregistrarea audio nu este disponibilă în acest browser.",
    permission: "Permite accesul la microfon pentru a înregistra mesajul.",
    fileError: "Alege un fișier audio de maximum 4 MB.",
    networkError: "Chrono nu poate analiza mesajul acum. Încearcă din nou.",
    transcript: "Transcriere audio",
    signals: "Semnale detectate",
    actions: "Ce trebuie să faci",
    risk: "Risc",
    verdicts: { likely_scam: "Probabil fraudă", suspicious: "Suspect", unclear: "Neclar", likely_safe: "Probabil sigur" },
    demo: "Analiză AI",
    demoHint: "Chrono transcrie înregistrarea, explică semnalele de fraudă și recomandă pași siguri.",
    privacyNotice: "Textul și fișierul audio sunt trimise prin serverul InfoQuest către un furnizor AI extern pentru transcriere și analiză. Nu trimite parole, coduri SMS, date bancare, documente sau înregistrări ale altor persoane fără acordul lor.",
    privacySummary: "Textul sau fișierul audio va fi transmis unui furnizor AI extern. Nu trimite date personale.",
    privacyMore: "Detalii",
    historyNotice: "Istoricul verificărilor nu se salvează după închiderea paginii.",
    consent: "Sunt de acord cu transmiterea datelor pentru această solicitare.",
    newCheck: "Verificare nouă",
    analysisReady: "Analiza este gata",
    consentRequired: "Confirmă acordul privind prelucrarea datelor înainte de înregistrare sau trimitere.",
    privacyLink: "Politica de confidențialitate",
    removeAttachment: "Elimină atașamentul",
    thinking: "Chrono analizează mesajul…",
    analyzer: "Analizator",
    chat: "Chat",
    analyzerIntro: "Trimite un text suspect sau un fișier audio. Îți voi arăta nivelul de risc, semnalele și pașii siguri.",
    chatIntro: "Salut! Sunt Chrono. Întreabă-mă orice despre siguranța digitală — voi ține cont de mesajele recente din această conversație.",
    analyzerPlaceholder: "Lipește mesajul suspect sau descrie apelul…",
    chatPlaceholder: "Întreabă-l pe Chrono despre siguranța digitală…",
    analyzerHint: "Verifică text sau audio și primește o evaluare structurată a riscului.",
    chatHint: "Discută cu Chrono și pune întrebări suplimentare în același context.",
    chatThinking: "Chrono pregătește răspunsul…",
    chatPrivacyNotice: "Mesajele din conversație sunt trimise prin serverul InfoQuest către un furnizor AI extern. Nu trimite parole, coduri SMS, date bancare sau documente.",
    textMode: "Scrie un mesaj",
    audioMode: "Verifică audio",
    quota: "Astăzi",
    textRequests: "solicitări text",
    audioRequests: "analize audio",
    recordingTime: "Durata înregistrării",
    startRecording: "Începe înregistrarea",
    stopRecording: "Oprește înregistrarea",
    audioFormats: "Formate: MP3, M4A, WAV, WEBM, OGG, AAC sau FLAC · maximum 4 MB · maximum 60 secunde",
    quickTitle: "Încearcă un exemplu",
    quickExamples: [
      ["M-a sunat banca", "M-a sunat cineva care spune că este de la bancă și îmi cere să confirm datele contului."],
      ["Verifică un link suspect", "Am primit un link suspect. Cum îl pot verifica în siguranță fără să îl deschid?"],
      ["Îmi cer codul SMS", "Cineva îmi cere codul primit prin SMS. Este sigur să îl comunic?"],
      ["Am câștigat un premiu", "Am primit un mesaj că am câștigat un premiu și trebuie să plătesc livrarea."],
      ["Înregistrează apelul", ""],
    ],
    audioSteps: ["Audio încărcat", "Recunosc vorbirea", "Verific semnalele de fraudă", "Pregătesc pașii siguri"],
  },
  ru: {
    title: "Онлайн-помощник AI",
    subtitle: "Помощник по цифровой безопасности",
    back: "На главную",
    status: "Chrono онлайн",
    intro: "Привет! Я Chrono, твой цифровой помощник. Спроси меня о подозрительных звонках, ложных ссылках или защите аккаунта.",
    placeholder: "Напишите вопрос…",
    send: "Отправить",
    sendMessage: "Отправить сообщение",
    sendAudio: "Отправить аудио на анализ",
    attach: "Прикрепить аудиофайл (не больше 4 МБ)",
    audio: "Аудио",
    listenOn: "Выключить озвучивание ответов",
    listenOff: "Включить озвучивание ответов",
    micStart: "Записать голосовое сообщение",
    micStop: "Остановить запись",
    listening: "Идёт запись… Нажмите ещё раз, чтобы остановить.",
    unsupported: "Запись аудио недоступна в этом браузере.",
    permission: "Разрешите доступ к микрофону, чтобы записать сообщение.",
    fileError: "Выберите аудиофайл размером не больше 4 МБ.",
    networkError: "Chrono сейчас не может выполнить анализ. Попробуйте ещё раз.",
    transcript: "Расшифровка аудио",
    signals: "Обнаруженные признаки",
    actions: "Что нужно сделать",
    risk: "Риск",
    verdicts: { likely_scam: "Вероятно мошенничество", suspicious: "Подозрительно", unclear: "Недостаточно данных", likely_safe: "Вероятно безопасно" },
    demo: "AI-анализ",
    demoHint: "Chrono расшифрует запись, объяснит признаки мошенничества и предложит безопасные действия.",
    privacyNotice: "Текст и аудиофайл передаются через сервер InfoQuest внешнему AI-провайдеру для расшифровки и анализа. Не отправляйте пароли, SMS-коды, банковские данные, документы или записи других людей без их согласия.",
    privacySummary: "Ваш текст или аудио будет передан внешнему AI-провайдеру. Не отправляйте личные данные.",
    privacyMore: "Подробнее",
    historyNotice: "История проверок не сохраняется после закрытия страницы.",
    consent: "Я согласен(на) на передачу данных для этого запроса.",
    newCheck: "Новая проверка",
    analysisReady: "Анализ готов",
    consentRequired: "Подтвердите согласие на обработку данных перед записью или отправкой.",
    privacyLink: "Политика конфиденциальности",
    removeAttachment: "Удалить вложение",
    thinking: "Chrono анализирует сообщение…",
    analyzer: "Анализатор",
    chat: "Чат",
    analyzerIntro: "Отправьте подозрительный текст или аудио. Я покажу уровень риска, признаки и безопасные действия.",
    chatIntro: "Привет! Я Chrono. Спроси меня о цифровой безопасности — я учту недавние сообщения этого разговора.",
    analyzerPlaceholder: "Вставьте подозрительное сообщение или опишите звонок…",
    chatPlaceholder: "Спросите Chrono о цифровой безопасности…",
    analyzerHint: "Проверяйте текст или аудио и получайте структурированную оценку риска.",
    chatHint: "Общайтесь с Chrono и задавайте уточняющие вопросы в одном контексте.",
    chatThinking: "Chrono готовит ответ…",
    chatPrivacyNotice: "Сообщения разговора передаются через сервер InfoQuest внешнему AI-провайдеру. Не отправляйте пароли, SMS-коды, банковские данные или документы.",
    textMode: "Написать сообщение",
    audioMode: "Проверить аудио",
    quota: "Сегодня",
    textRequests: "текстовых запросов",
    audioRequests: "аудиоанализов",
    recordingTime: "Время записи",
    startRecording: "Начать запись",
    stopRecording: "Остановить запись",
    audioFormats: "Форматы: MP3, M4A, WAV, WEBM, OGG, AAC или FLAC · до 4 МБ · до 60 секунд",
    quickTitle: "Попробуйте пример",
    quickExamples: [
      ["Мне позвонили из банка", "Мне позвонил человек, представился сотрудником банка и просит подтвердить данные счёта."],
      ["Проверить подозрительную ссылку", "Мне прислали подозрительную ссылку. Как безопасно проверить её, не открывая?"],
      ["Просят назвать SMS-код", "Человек просит назвать код, который пришёл мне по SMS. Можно ли его сообщать?"],
      ["Я выиграл приз", "Мне написали, что я выиграл приз, но для получения нужно оплатить доставку."],
      ["Записать звонок", ""],
    ],
    audioSteps: ["Аудио загружено", "Распознаю речь", "Проверяю признаки мошенничества", "Готовлю безопасные действия"],
  },
} as const;

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}

async function convertToWhisperWav(source: Blob) {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await source.arrayBuffer());
    const targetRate = 16_000;
    const sampleCount = Math.ceil(decoded.duration * targetRate);
    const samples = new Float32Array(sampleCount);
    for (let index = 0; index < sampleCount; index += 1) {
      const sourceIndex = Math.min(decoded.length - 1, Math.floor(index * decoded.sampleRate / targetRate));
      let mixed = 0;
      for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) mixed += decoded.getChannelData(channel)[sourceIndex];
      samples[index] = mixed / decoded.numberOfChannels;
    }

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);
    for (let index = 0; index < samples.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, samples[index]));
      view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  } finally {
    await context.close();
  }
}

export function AiHelpChat({ locale }: { locale: AiLocale }) {
  const router = useRouter();
  const t = content[locale];
  const [mode, setMode] = useState<AiMode>("analyzer");
  const [analyzerInputMode, setAnalyzerInputMode] = useState<AnalyzerInputMode>("text");
  const [messagesByMode, setMessagesByMode] = useState<Record<AiMode, ChatMessage[]>>({
    analyzer: [{ id: "analyzer-intro", role: "assistant", text: t.analyzerIntro }],
    chat: [{ id: "chat-intro", role: "assistant", text: t.chatIntro }],
  });
  const [drafts, setDrafts] = useState<Record<AiMode, string>>({ analyzer: "", chat: "" });
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [welcoming, setWelcoming] = useState(true);
  const [dataConsent, setDataConsent] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [audioAnalysisStep, setAudioAnalysisStep] = useState(1);
  const [analysisAnnouncement, setAnalysisAnnouncement] = useState("");
  const [quota, setQuota] = useState<QuotaStatus>({ audioRemaining: null, dailyRemaining: null });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileUrlsRef = useRef<string[]>([]);
  const requestControllerRef = useRef<AbortController | null>(null);
  const discardRecordingRef = useRef(false);
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
    if (!listening) return;
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => Math.min(60, seconds + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [listening]);

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
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    requestControllerRef.current?.abort();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    window.speechSynthesis?.cancel();
    fileUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
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
    if (currentMode === "analyzer") setAttachment(null);
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

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const hasAudioExtension = /\.(mp3|m4a|wav|webm|weba|ogg|aac|flac)$/i.test(file.name);
    if ((!file.type.startsWith("audio/") && !hasAudioExtension) || file.size > 4 * 1024 * 1024) {
      setRequestError(t.fileError);
      event.target.value = "";
      return;
    }
    let preparedFile = file;
    if (/\.weba?m?$/i.test(file.name) || file.type.includes("webm") || file.type === "audio/weba") {
      try {
        const wav = await convertToWhisperWav(file);
        preparedFile = new File([wav], file.name.replace(/\.web[am]$/i, ".wav"), { type: "audio/wav" });
      } catch {
        setRequestError(t.fileError);
        event.target.value = "";
        return;
      }
    }
    const url = URL.createObjectURL(preparedFile);
    fileUrlsRef.current.push(url);
    setRequestError(null);
    setAttachment({ name: preparedFile.name, url, file: preparedFile });
    event.target.value = "";
  }

  async function toggleMicrophone() {
    setSpeechError(null);
    if (listening) {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      return;
    }

    if (!dataConsent) {
      setSpeechError(t.consentRequired);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setSpeechError(t.unsupported);
      return;
    }

    try {
      setRecordingSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setListening(false);
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          recordedChunksRef.current = [];
          return;
        }
        const mimeType = recorder.mimeType || "audio/webm";
        const recordedBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        recordedChunksRef.current = [];
        if (!recordedBlob.size) {
          setSpeechError(t.fileError);
          return;
        }
        try {
          const wav = await convertToWhisperWav(recordedBlob);
          if (wav.size > 4 * 1024 * 1024) throw new Error("Recording is too large");
          const file = new File([wav], `chrono-${Date.now()}.wav`, { type: "audio/wav" });
          const url = URL.createObjectURL(file);
          fileUrlsRef.current.push(url);
          setAttachment({ name: file.name, url, file });
        } catch {
          setSpeechError(t.fileError);
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setListening(false);
        setSpeechError(t.unsupported);
      };
      recorder.start(1000);
      setListening(true);
      recordingTimeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 60_000);
    } catch {
      setListening(false);
      setSpeechError(t.permission);
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
    setSpeechError(null);
    setRequestError(null);
    setAnalysisAnnouncement("");
  }

  function startNewCheck() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    window.speechSynthesis?.cancel();
    setVoiceEnabled(false);

    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") {
      discardRecordingRef.current = true;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setListening(false);
    setRecordingSeconds(0);

    const urlsToRelease = new Set<string>();
    if (attachment) urlsToRelease.add(attachment.url);
    messagesByMode[mode].forEach((message) => {
      if (message.attachment) urlsToRelease.add(message.attachment.url);
    });
    urlsToRelease.forEach((url) => URL.revokeObjectURL(url));
    fileUrlsRef.current = fileUrlsRef.current.filter((url) => !urlsToRelease.has(url));

    const introMessage: ChatMessage = mode === "analyzer"
      ? { id: "analyzer-intro", role: "assistant", text: t.analyzerIntro }
      : { id: "chat-intro", role: "assistant", text: t.chatIntro };
    setMessagesByMode((current) => ({ ...current, [mode]: [introMessage] }));
    setDrafts((current) => ({ ...current, [mode]: "" }));
    setAttachment(null);
    setSpeechError(null);
    setRequestError(null);
    setThinking(false);
    setProcessingAudio(false);
    setAudioAnalysisStep(1);
    setAnalysisAnnouncement("");
    setAnalyzerInputMode("text");
    setWelcoming(false);
  }

  function formatRecordingTime(seconds: number) {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
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
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <article className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${message.role === "user" ? "rounded-br-md bg-neon text-primary-foreground" : "rounded-bl-md border border-border bg-background/55 text-foreground"}`}>
                    {message.analysis && getRiskLevel(message.analysis.risk) === "high" && <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-danger/90 shadow-[0_0_24px_rgba(255,60,80,0.35)] animate-pulse [animation-duration:2s]" aria-hidden="true" />}
                    {message.analysis && getRiskLevel(message.analysis.risk) === "medium" && <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-gold/90 shadow-[0_0_24px_rgba(255,195,60,0.32)] animate-pulse [animation-duration:2s]" aria-hidden="true" />}
                    {message.attachment && <audio src={message.attachment.url} controls className="mb-3 max-w-full" />}
                    {message.text && <p>{message.text}</p>}
                    {message.analysis && (
                      <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-black ${message.analysis.verdict === "likely_scam" ? "border-danger/45 bg-danger/10 text-danger" : message.analysis.verdict === "suspicious" ? "border-gold/45 bg-gold/10 text-gold" : message.analysis.verdict === "likely_safe" ? "border-success/45 bg-success/10 text-success" : "border-border bg-secondary text-muted-foreground"}`}>{t.verdicts[message.analysis.verdict]}</span>
                          <span className="font-display text-xs font-black text-gold">{t.risk}: {message.analysis.risk}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${getRiskIndicatorClass(getRiskLevel(message.analysis.risk))}`} style={{ width: `${message.analysis.risk}%` }} /></div>
                        <p className="text-xs text-muted-foreground">{message.analysis.summary}</p>
                        {message.analysis.signals.length > 0 && <div><strong className="text-xs text-neon">{t.signals}</strong><ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{message.analysis.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></div>}
                        <div><strong className="text-xs text-success">{t.actions}</strong><ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">{message.analysis.actions.map((action) => <li key={action}>{action}</li>)}</ol></div>
                        <p className="rounded-lg border border-border bg-card/60 px-3 py-2 text-[11px] text-muted-foreground">{message.analysis.disclaimer}</p>
                      </div>
                    )}
                    {message.transcript && <details className="mt-3 rounded-lg border border-border bg-card/50 px-3 py-2 text-xs"><summary className="cursor-pointer font-bold text-neon">{t.transcript}</summary><p className="mt-2 text-muted-foreground">{message.transcript}</p></details>}
                    {message.role === "assistant" && <button type="button" onClick={() => speak(message.text)} className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-success/60 bg-success px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_0_18px_rgba(43,214,123,0.22)] transition hover:brightness-110"><Volume2 className="size-5" aria-hidden="true" />{locale === "ro" ? "Ascultă" : "Прослушать"}</button>}
                  </article>
                </div>
              ))}
              {latestAnalysis && !thinking && (
                <div className="flex justify-center lg:hidden" aria-hidden="true">
                  <Image key={`result-${robotImage}`} src={robotImage} alt="" width={240} height={240} className="w-36 drop-shadow-[0_0_26px_rgba(0,217,255,0.3)]" />
                </div>
              )}
              {mode === "analyzer" && messages.length === 1 && (
                <div className="rounded-2xl border border-neon/20 bg-neon/5 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-neon">{t.quickTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.quickExamples.map(([label, prompt], index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (index === t.quickExamples.length - 1) {
                            setAnalyzerInputMode("audio");
                          } else {
                            setAnalyzerInputMode("text");
                            setDrafts((current) => ({ ...current, analyzer: prompt }));
                          }
                        }}
                        className="focus-ring min-h-10 rounded-xl border border-border bg-card/70 px-3 py-2 text-left text-xs font-bold text-foreground transition hover:border-neon/60 hover:bg-neon/10 hover:text-neon"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {thinking && processingAudio ? (
                <div className="flex justify-start">
                  <div className="w-full max-w-md rounded-2xl rounded-bl-md border border-neon/30 bg-background/70 p-5 shadow-[0_0_24px_rgba(0,217,255,0.08)]">
                    <p className="sr-only" role="status" aria-live="polite">{t.audioSteps[audioAnalysisStep]}</p>
                    <ol className="space-y-3" aria-label={t.thinking}>
                      {t.audioSteps.map((step, index) => {
                        const completed = index < audioAnalysisStep;
                        const active = index === audioAnalysisStep;
                        return (
                          <li key={step} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${active ? "bg-neon/10 text-foreground" : completed ? "text-success" : "text-muted-foreground/55"}`}>
                            {completed ? <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" /> : active ? <LoaderCircle className="size-5 shrink-0 animate-spin text-neon" aria-hidden="true" /> : <Circle className="size-5 shrink-0" aria-hidden="true" />}
                            <span className={`text-sm ${active || completed ? "font-bold" : ""}`}>{step}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              ) : thinking ? <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-background/55 px-4 py-4" role="status" aria-live="polite"><span className="flex gap-1" aria-hidden="true"><span className="size-2 animate-bounce rounded-full bg-neon" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:120ms]" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:240ms]" /></span><span className="text-xs text-muted-foreground">{mode === "analyzer" ? t.thinking : t.chatThinking}</span></div></div> : null}
              <div ref={bottomRef} />
            </div>

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
                    <button type="button" onClick={() => setAttachment(null)} aria-label={`${t.removeAttachment}: ${attachment.name}`} className="focus-ring grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-danger"><X className="size-4" aria-hidden="true" /></button>
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
                    onChange={(event) => {
                      setDataConsent(event.target.checked);
                      if (event.target.checked) {
                        setSpeechError(null);
                        setRequestError(null);
                      }
                    }}
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
                  <textarea aria-label={mode === "analyzer" ? t.analyzerPlaceholder : t.chatPlaceholder} value={input} onChange={(event) => setDrafts((current) => ({ ...current, [mode]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder={mode === "analyzer" ? t.analyzerPlaceholder : t.chatPlaceholder} className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  <button type="submit" disabled={!dataConsent || thinking || !input.trim()} title={t.sendMessage} aria-label={t.sendMessage} className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-neon text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-5" aria-hidden="true" /></button>
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
