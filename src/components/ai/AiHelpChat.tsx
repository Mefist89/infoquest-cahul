"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  FileAudio,
  ImagePlus,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AiLocale = "ro" | "ru";
type Attachment = { name: string; kind: "image" | "audio"; url: string };
type ChatMessage = { id: string; role: "assistant" | "user"; text: string; attachment?: Attachment };

type SpeechResultEvent = {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const content = {
  ro: {
    title: "Ajutor online AI",
    subtitle: "Asistent pentru siguranță digitală",
    back: "Pagina principală",
    status: "Chrono este online",
    intro: "Salut! Sunt Chrono, ghidul tău digital. Întreabă-mă despre apeluri suspecte, linkuri false sau siguranța contului.",
    placeholder: "Scrie întrebarea ta…",
    send: "Trimite",
    attach: "Atașează o imagine sau un fișier audio",
    image: "Imagine",
    audio: "Audio",
    listenOn: "Oprește vocea răspunsurilor",
    listenOff: "Pornește vocea răspunsurilor",
    micStart: "Vorbește cu Chrono",
    micStop: "Oprește microfonul",
    listening: "Te ascult în timp real…",
    unsupported: "Recunoașterea vocală nu este disponibilă în acest browser.",
    attachmentImage: "Am primit imaginea. Nu publica date personale, coduri sau parole. Spune-mi ce element ți se pare suspect și îl analizăm împreună.",
    attachmentAudio: "Am primit fișierul audio. Nu pot verifica încă vocea automat, dar te pot ajuta să identifici presiunea, urgența sau cererile de coduri și bani.",
    generic: "Într-o situație suspectă, oprește conversația, nu divulga parole sau coduri SMS și verifică informația folosind canalul oficial. Spune-mi mai multe și îți propun pașii exacți.",
    call: "Dacă un «operator» cere codul din SMS, parola sau bani, închide apelul. Sună apoi compania folosind numărul oficial de pe site sau contract.",
    link: "Nu deschide linkul imediat. Verifică domeniul literă cu literă și intră pe site tastând singur adresa oficială.",
    privacy: "Nu trimite în chat parole, coduri SMS, date bancare sau acte de identitate. Poți ascunde aceste informații înainte de a încărca imaginea.",
    demo: "Mod demonstrativ",
    demoHint: "Interfața și funcțiile vocale sunt active. Conectarea la un model AI extern va fi adăugată separat.",
  },
  ru: {
    title: "Онлайн-помощник AI",
    subtitle: "Помощник по цифровой безопасности",
    back: "На главную",
    status: "Chrono онлайн",
    intro: "Привет! Я Chrono, твой цифровой помощник. Спроси меня о подозрительных звонках, ложных ссылках или защите аккаунта.",
    placeholder: "Напишите вопрос…",
    send: "Отправить",
    attach: "Прикрепить изображение или аудиофайл",
    image: "Изображение",
    audio: "Аудио",
    listenOn: "Выключить озвучивание ответов",
    listenOff: "Включить озвучивание ответов",
    micStart: "Говорить с Chrono",
    micStop: "Остановить микрофон",
    listening: "Слушаю вас в реальном времени…",
    unsupported: "Распознавание речи недоступно в этом браузере.",
    attachmentImage: "Я получил изображение. Не публикуйте личные данные, коды и пароли. Расскажите, какой элемент кажется подозрительным, и мы разберём его вместе.",
    attachmentAudio: "Я получил аудиофайл. Пока я не могу автоматически проверить голос, но помогу заметить давление, срочность или просьбы сообщить код и перевести деньги.",
    generic: "В подозрительной ситуации остановите разговор, не сообщайте пароли и SMS-коды, затем проверьте информацию через официальный канал. Расскажите подробнее — я предложу точные шаги.",
    call: "Если «оператор» просит SMS-код, пароль или деньги, завершите звонок. Затем сами позвоните компании по официальному номеру с сайта или договора.",
    link: "Не открывайте ссылку сразу. Проверьте домен по буквам и зайдите на сайт, самостоятельно набрав официальный адрес.",
    privacy: "Не отправляйте в чат пароли, SMS-коды, банковские данные и документы. Перед загрузкой изображения эти данные можно скрыть.",
    demo: "Демонстрационный режим",
    demoHint: "Интерфейс и голосовые функции активны. Подключение внешней AI-модели будет добавлено отдельно.",
  },
} as const;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function AiHelpChat({ locale }: { locale: AiLocale }) {
  const t = content[locale];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro", role: "assistant", text: t.intro },
  ]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileUrlsRef = useRef<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const robotImage = useMemo(() => {
    if (speechError) return "/characters/chrono/03_warning.png";
    if (listening) return "/characters/chrono/02_happy.png";
    if (thinking) return "/characters/chrono/04_sad_thinking.png";
    if (voiceEnabled) return "/characters/chrono/06_confident.png";
    return "/characters/chrono/01_neutral.png";
  }, [listening, speechError, thinking, voiceEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
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

  function buildReply(text: string, item: Attachment | null) {
    if (item?.kind === "image") return t.attachmentImage;
    if (item?.kind === "audio") return t.attachmentAudio;
    const normalized = text.toLocaleLowerCase(locale);
    if (/parol|cod|sms|date|парол|код|данн/.test(normalized)) return t.privacy;
    if (/apel|sunat|operator|звон|оператор/.test(normalized)) return t.call;
    if (/link|site|qr|ссыл|сайт/.test(normalized)) return t.link;
    return t.generic;
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const cleanText = input.trim();
    if ((!cleanText && !attachment) || thinking) return;

    const currentAttachment = attachment;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: cleanText,
      attachment: currentAttachment ?? undefined,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setAttachment(null);
    setThinking(true);

    window.setTimeout(() => {
      const reply = buildReply(cleanText, currentAttachment);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
      setThinking(false);
      if (voiceEnabled) speak(reply);
    }, 650);
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : null;
    if (!kind) return;
    const url = URL.createObjectURL(file);
    fileUrlsRef.current.push(url);
    setAttachment({ name: file.name, kind, url });
    event.target.value = "";
  }

  function toggleMicrophone() {
    setSpeechError(null);
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechError(t.unsupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = locale === "ro" ? "ro-RO" : "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0].transcript;
      setInput(transcript.trimStart());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setSpeechError(t.unsupported);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function toggleVoice() {
    if (voiceEnabled) window.speechSynthesis?.cancel();
    setVoiceEnabled((enabled) => !enabled);
  }

  return (
    <main className="circuit-bg relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute left-0 top-20 size-80 rounded-full bg-success/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <Link href={`/${locale}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-sm font-bold text-neon transition hover:border-neon/60">
            <ArrowLeft className="size-4" aria-hidden="true" />{t.back}
          </Link>
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

        <div className="grid min-h-[calc(100vh-7rem)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="relative flex min-h-72 flex-col items-center justify-end overflow-hidden rounded-3xl border border-neon/25 bg-[radial-gradient(circle_at_50%_45%,rgba(0,217,255,0.18),transparent_48%),rgba(6,18,48,0.8)] p-6 text-center lg:min-h-0">
            <div className="absolute inset-x-10 top-12 h-40 rounded-full bg-neon/15 blur-3xl" aria-hidden="true" />
            <Image key={robotImage} src={robotImage} alt="Chrono" width={512} height={512} priority className="relative mx-auto w-52 drop-shadow-[0_0_34px_rgba(0,217,255,0.38)] transition sm:w-60 lg:w-full" />
            <div className="relative mt-2 w-full rounded-2xl border border-neon/25 bg-background/65 p-4 backdrop-blur">
              <div className="flex items-center justify-center gap-2"><Bot className="size-5 text-neon" aria-hidden="true" /><h1 className="text-xl font-black">Chrono</h1></div>
              <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
              <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 px-3 py-2 text-xs text-gold"><strong>{t.demo}</strong><span className="mt-1 block text-muted-foreground">{t.demoHint}</span></div>
            </div>
          </aside>

          <section className="flex min-h-[640px] flex-col overflow-hidden rounded-3xl border border-neon/25 bg-card/75 shadow-[0_22px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-success/15 text-success"><Sparkles className="size-5" aria-hidden="true" /></span>
              <div><h2 className="font-black">{t.title}</h2><p className="text-xs text-muted-foreground">{t.status}</p></div>
              <button type="button" onClick={toggleVoice} aria-pressed={voiceEnabled} title={voiceEnabled ? t.listenOn : t.listenOff} className={`focus-ring ml-auto grid size-11 place-items-center rounded-xl border transition ${voiceEnabled ? "border-success/50 bg-success/15 text-success" : "border-border bg-background/40 text-muted-foreground hover:text-neon"}`}>
                {voiceEnabled ? <Volume2 className="size-5" aria-hidden="true" /> : <VolumeX className="size-5" aria-hidden="true" />}
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <article className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${message.role === "user" ? "rounded-br-md bg-neon text-primary-foreground" : "rounded-bl-md border border-border bg-background/55 text-foreground"}`}>
                    {message.attachment?.kind === "image" && <Image src={message.attachment.url} alt={message.attachment.name} width={420} height={280} unoptimized className="mb-3 max-h-56 w-auto rounded-xl object-contain" />}
                    {message.attachment?.kind === "audio" && <audio src={message.attachment.url} controls className="mb-3 max-w-full" />}
                    {message.text && <p>{message.text}</p>}
                    {message.role === "assistant" && <button type="button" onClick={() => speak(message.text)} className="focus-ring mt-2 inline-flex items-center gap-1 text-xs font-bold text-neon"><Volume2 className="size-3.5" aria-hidden="true" />{locale === "ro" ? "Ascultă" : "Прослушать"}</button>}
                  </article>
                </div>
              ))}
              {thinking && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-background/55 px-4 py-4"><span className="size-2 animate-bounce rounded-full bg-neon" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:120ms]" /><span className="size-2 animate-bounce rounded-full bg-neon [animation-delay:240ms]" /></div></div>}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={submit} className="border-t border-border/70 bg-background/30 p-4 sm:p-5">
              {speechError && <p className="mb-3 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2 text-xs text-danger">{speechError}</p>}
              {listening && <p className="mb-3 flex items-center gap-2 text-xs font-bold text-success"><span className="size-2 animate-pulse rounded-full bg-success" />{t.listening}</p>}
              {attachment && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-neon/25 bg-card/70 p-2">
                  {attachment.kind === "image" ? <Image src={attachment.url} alt="" width={48} height={48} unoptimized className="size-12 rounded-lg object-cover" /> : <span className="grid size-12 place-items-center rounded-lg bg-success/10 text-success"><FileAudio className="size-6" /></span>}
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{attachment.name}</p><p className="text-xs text-muted-foreground">{attachment.kind === "image" ? t.image : t.audio}</p></div>
                  <button type="button" onClick={() => setAttachment(null)} className="focus-ring grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-danger"><X className="size-4" aria-hidden="true" /></button>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/85 p-2 focus-within:border-neon/60">
                <label title={t.attach} className="focus-ring grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-neon">
                  <Paperclip className="size-5" aria-hidden="true" />
                  <input type="file" accept="image/*,audio/*" onChange={selectFile} className="sr-only" />
                </label>
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder={t.placeholder} className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={toggleMicrophone} aria-pressed={listening} title={listening ? t.micStop : t.micStart} className={`focus-ring grid size-11 shrink-0 place-items-center rounded-xl transition ${listening ? "bg-danger text-white" : "bg-success/15 text-success hover:bg-success/25"}`}>
                  {listening ? <Square className="size-4 fill-current" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
                </button>
                <button type="submit" disabled={thinking || (!input.trim() && !attachment)} title={t.send} className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-neon text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-5" aria-hidden="true" /></button>
              </div>
              <div className="mt-2 flex items-center gap-3 px-1 text-[11px] text-muted-foreground"><ImagePlus className="size-3.5" aria-hidden="true" />{t.attach}</div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
