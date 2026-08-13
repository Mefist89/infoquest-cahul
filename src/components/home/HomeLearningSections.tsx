"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  Fingerprint,
  Link2,
  Lock,
  Medal,
  Megaphone,
  MessageSquareMore,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { useState } from "react";

import { missions, type Lang } from "@/data/home-data";
import { MODULE_COUNT, TOTAL_MAX_XP, type ModuleId } from "@/data/module-catalog";

type ModuleStatus = "not_started" | "in_progress" | "completed";
export type HomeProgressSummary = {
  isAuthenticated: boolean;
  xp: number;
  rewards: number;
  modules: Partial<Record<ModuleId, { status: ModuleStatus; xp: number }>>;
};

const content = {
  ru: {
    howTitle: "Как проходит расследование",
    how: [
      ["Изучи происшествие", "Прочитай историю и познакомься с проблемой."],
      ["Собери цифровые улики", "Найди подсказки и проверь информацию."],
      ["Прими безопасное решение", "Выбери правильное действие и защити сообщество."],
    ],
    attention: "Проверь свою внимательность",
    question: "Какое сообщение выглядит подозрительно?",
    choose: "Выбери одну карточку, затем покажи ответ.",
    showAnswer: "Показать ответ",
    pickFirst: "Сначала выбери сообщение.",
    correct: "Верно! Это фишинговое сообщение.",
    retry: "Посмотри ещё раз: мошенническое сообщение находится справа.",
    explanation: "Срочность, обещание дорогого приза и незнакомая ссылка — типичные признаки мошенничества.",
    goMission: "Перейти к расследованию",
    messages: [
      ["BankSecure", "Операция отклонена. Откройте официальное приложение банка — ссылок в сообщении нет."],
      ["Анна", "Привет! Скинь, пожалуйста, домашку по математике, а то я пропустила урок 😊"],
      ["Супер-приз", "Поздравляем! Вы выиграли iPhone 15! Забери приз здесь: win-prize-now.ru"],
    ],
    skillsTitle: "Твои суперспособности в цифровом мире",
    skills: [
      ["Проверять ссылки", "Не переходи на опасные сайты"],
      ["Распознавать мошенников", "Замечай обман и угрозы"],
      ["Защищать аккаунты", "Используй надёжные пароли и 2FA"],
      ["Отличать дипфейки", "Анализируй видео и изображения"],
      ["Проверять слухи", "Ищи факты, а не домыслы"],
      ["Реагировать на троллинг", "Поддержи себя и друзей"],
    ],
    path: "Твой путь защитника",
    casesDone: "дел завершено",
    nextReward: "Ближайшая награда",
    nextRewardText: "Пройди ещё одно дело и получи бейдж «Эксперт по ссылкам».",
    badges: "Бейджи",
    earned: "Получен",
    locked: "Заблокирован",
    audienceTitle: "Кому подходит InfoQuest",
    audience: [
      ["Школьникам", "Учиться цифровой безопасности через игры, расследования и интересные задания.", "Начать игру"],
      ["Учителям", "Использовать готовые игровые материалы на уроках цифровой грамотности.", "Материалы учителю"],
      ["Родителям", "Обсуждать вместе с детьми мошенничество, соцсети и безопасное поведение.", "Советы родителям"],
    ],
    aiTitle: "Цифровой AI-помощник",
    aiText: "Не знаешь, безопасна ли ссылка или сообщение? Спроси цифрового помощника.",
    aiButton: "Задать вопрос",
    aiWarning: "Не отправляй помощнику пароли, номера банковских карт и другие личные данные.",
    faqTitle: "Частые вопросы",
    faq: [
      ["Что такое InfoQuest?", "Это двуязычная образовательная игра о цифровой безопасности, мошенничестве и проверке информации."],
      ["Для какого возраста подходит игра?", "Основная аудитория — школьники, но материалы подходят также учителям, родителям и семьям."],
      ["Можно ли играть бесплатно?", "Да, участие в образовательной версии InfoQuest бесплатное."],
      ["Нужно ли регистрироваться?", "Главную страницу и мини-задание можно открыть без регистрации. Вход нужен для сохранения прогресса."],
      ["Сохраняется ли игровой прогресс?", "Да. После входа завершённые этапы, XP и награды сохраняются в профиле."],
      ["Можно ли использовать игру на уроке?", "Да. Учитель может использовать игру как практическую часть занятия по цифровой грамотности."],
    ],
  },
  ro: {
    howTitle: "Cum decurge investigația",
    how: [
      ["Studiază incidentul", "Citește povestea și descoperă problema."],
      ["Adună probe digitale", "Găsește indicii și verifică informația."],
      ["Ia o decizie sigură", "Alege acțiunea corectă și protejează comunitatea."],
    ],
    attention: "Testează-ți atenția",
    question: "Care mesaj pare suspect?",
    choose: "Alege un card, apoi afișează răspunsul.",
    showAnswer: "Arată răspunsul",
    pickFirst: "Alege mai întâi un mesaj.",
    correct: "Corect! Acesta este un mesaj de phishing.",
    retry: "Privește din nou: mesajul fraudulos este în dreapta.",
    explanation: "Urgența, promisiunea unui premiu scump și linkul necunoscut sunt semne tipice de fraudă.",
    goMission: "Mergi la investigație",
    messages: [
      ["BankSecure", "Operațiunea a fost respinsă. Deschide aplicația oficială a băncii — mesajul nu conține linkuri."],
      ["Ana", "Salut! Trimite-mi, te rog, tema la matematică. Am lipsit de la lecție 😊"],
      ["Super-premiu", "Felicitări! Ai câștigat un iPhone 15! Ridică premiul: win-prize-now.ru"],
    ],
    skillsTitle: "Superputerile tale în lumea digitală",
    skills: [
      ["Verifică linkurile", "Evită site-urile periculoase"],
      ["Recunoaște escrocii", "Observă manipularea și amenințările"],
      ["Protejează conturile", "Folosește parole sigure și 2FA"],
      ["Distinge deepfake-uri", "Analizează video și imagini"],
      ["Verifică zvonurile", "Caută fapte, nu presupuneri"],
      ["Răspunde la trolling", "Protejează-te pe tine și pe prieteni"],
    ],
    path: "Drumul tău de protector",
    casesDone: "dosare finalizate",
    nextReward: "Următoarea recompensă",
    nextRewardText: "Finalizează încă un dosar și obține insigna «Expert în linkuri».",
    badges: "Insigne",
    earned: "Obținută",
    locked: "Blocată",
    audienceTitle: "Pentru cine este InfoQuest",
    audience: [
      ["Elevi", "Învață siguranța digitală prin jocuri, investigații și sarcini interesante.", "Începe jocul"],
      ["Profesori", "Folosește materiale de joc pregătite la lecțiile de alfabetizare digitală.", "Materiale pentru profesori"],
      ["Părinți", "Discută cu copiii despre fraude, rețele sociale și comportament sigur.", "Sfaturi pentru părinți"],
    ],
    aiTitle: "Asistent AI digital",
    aiText: "Nu știi dacă un link sau mesaj este sigur? Întreabă asistentul digital.",
    aiButton: "Pune o întrebare",
    aiWarning: "Nu trimite parole, numere de card bancar sau alte date personale.",
    faqTitle: "Întrebări frecvente",
    faq: [
      ["Ce este InfoQuest?", "Este un joc educațional bilingv despre siguranță digitală, fraude și verificarea informației."],
      ["Pentru ce vârstă este jocul?", "Publicul principal sunt elevii, dar materialele sunt utile și profesorilor și părinților."],
      ["Jocul este gratuit?", "Da, participarea la versiunea educațională InfoQuest este gratuită."],
      ["Este necesară înregistrarea?", "Pagina principală și mini-jocul funcționează fără cont. Autentificarea este necesară pentru progres."],
      ["Progresul este salvat?", "Da. După autentificare, etapele, XP și recompensele sunt salvate în profil."],
      ["Poate fi folosit la lecție?", "Da. Profesorul poate folosi jocul ca parte practică a unei lecții de alfabetizare digitală."],
    ],
  },
} as const;

const skillIcons = [Link2, UserRoundCheck, ShieldCheck, Fingerprint, Megaphone, MessageSquareMore];
const howIcons = [Search, Fingerprint, CheckCircle2];
const audienceImages = ["/characters/06_schoolboy_left.png", "/characters/02_woman_glasses_book_left.png", "/characters/01_woman_purple_blazer_left.png"];

export function HowItWorks({ lang }: { lang: Lang }) {
  const t = content[lang];
  return <section id="how" className="home-panel home-panel-wide scroll-mt-24"><h2 className="home-title">{t.howTitle}</h2><div className="relative mt-6 grid gap-5 md:grid-cols-3"><div className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-neon/45 md:block" aria-hidden="true" />{t.how.map(([title, text], index) => { const Icon = howIcons[index]; return <article key={title} className="relative z-10 flex min-h-64 flex-col items-center rounded-3xl border border-neon/30 bg-slate-950/55 px-6 py-6 text-center"><span className="mx-auto grid size-16 shrink-0 place-items-center rounded-2xl border border-neon/35 bg-neon/10 text-neon"><Icon className="size-8" aria-hidden="true" /></span><span className="mx-auto mt-4 grid size-8 shrink-0 place-items-center rounded-full border border-neon bg-background font-display text-sm text-neon">{index + 1}</span><h3 className="mt-4 text-base font-black leading-snug">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></article>; })}</div></section>;
}

export function MiniChallenge({ lang }: { lang: Lang }) {
  const t = content[lang];
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = 2;
  return <section className="home-panel"><h2 className="home-title">{t.attention}</h2><p className="mt-1 text-center text-sm text-muted-foreground">{t.question}</p><div className="mt-5 grid gap-4 md:grid-cols-3">{t.messages.map(([sender, message], index) => { const chosen = selected === index; const isCorrect = revealed && index === correct; const isWrong = revealed && chosen && index !== correct; return <button key={sender} type="button" aria-pressed={chosen} onClick={() => { setSelected(index); setRevealed(false); }} className={`focus-ring min-h-36 rounded-3xl border p-5 text-left transition ${isCorrect ? "border-success bg-success/10" : isWrong ? "border-danger bg-danger/10" : chosen ? "border-neon bg-neon/10" : "border-border bg-card/65 hover:border-neon/45"}`}><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><MessageSquareMore className="size-5 text-neon" aria-hidden="true" /></span><strong>{sender}</strong>{isCorrect && <CheckCircle2 className="ml-auto size-5 text-success" aria-hidden="true" />}</span><span className="mt-4 block text-sm leading-relaxed text-muted-foreground">{message}</span></button>; })}</div><div className="mt-5 flex flex-wrap items-center gap-4"><button type="button" onClick={() => setRevealed(true)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-neon/45 bg-neon/10 px-5 text-sm font-bold text-neon"><Eye className="size-4" aria-hidden="true" />{t.showAnswer}</button><p className="text-sm text-muted-foreground" role="status">{selected === null && revealed ? t.pickFirst : !revealed ? t.choose : selected === correct ? t.correct : t.retry}</p></div>{revealed && selected !== null && <div className={`mt-4 flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${selected === correct ? "border-success/45 bg-success/10" : "border-gold/45 bg-gold/10"}`}><ShieldQuestion className={`size-9 shrink-0 ${selected === correct ? "text-success" : "text-gold"}`} aria-hidden="true" /><p className="min-w-0 flex-1 text-sm leading-relaxed">{t.explanation}</p><Link href={`/${lang}/modules/operator-call`} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon px-4 text-sm font-black text-primary-foreground">{t.goMission}<ArrowRight className="size-4" aria-hidden="true" /></Link></div>}</section>;
}

export function SkillsSection({ lang }: { lang: Lang }) {
  const t = content[lang];
  return <section className="home-section"><h2 className="home-title">{t.skillsTitle}</h2><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{t.skills.map(([title, text], index) => { const Icon = skillIcons[index]; return <article key={title} className="rounded-3xl border border-neon/25 bg-card/55 p-4 text-center"><Icon className={`mx-auto size-9 ${index === 3 ? "text-violet" : "text-neon"}`} aria-hidden="true" /><h3 className="mt-4 text-xs font-black">{title}</h3><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{text}</p></article>; })}</div></section>;
}

export function ProgressAndBadges({ lang, progress }: { lang: Lang; progress: HomeProgressSummary }) {
  const t = content[lang];
  const xpPercent = Math.min(100, Math.round((progress.xp / TOTAL_MAX_XP) * 100));
  return <section id="badges" className="home-panel scroll-mt-24"><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-2xl border border-neon/30 bg-background/40 p-5"><p className="font-bold">{t.path}: {progress.rewards} / {MODULE_COUNT} {t.casesDone}</p><div className="mt-5 flex items-center gap-3"><Sparkles className="size-5 text-gold" aria-hidden="true" /><span className="text-xs text-muted-foreground">XP</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-neon shadow-[0_0_14px_rgba(0,217,255,0.45)]" style={{ width: `${xpPercent}%` }} /></div><strong>{progress.xp}/{TOTAL_MAX_XP}</strong></div></article><article className="flex items-center gap-4 rounded-2xl border border-gold/45 bg-gold/10 p-5"><span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-gold/50 bg-gold/10 text-gold"><Trophy className="size-7" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase text-gold">{t.nextReward}</p><p className="mt-2 text-sm font-bold">{t.nextRewardText}</p></div></article></div><h2 className="mt-6 text-lg font-black text-gold">{t.badges}</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{missions.map((mission) => { const earned = progress.modules[mission.moduleId]?.status === "completed"; return <article key={mission.moduleId} className={`rounded-2xl border p-3 text-center ${earned ? "border-gold/55 bg-gold/10 shadow-[0_0_18px_rgba(255,196,0,0.14)]" : "border-border bg-card/50"}`}><span className={`mx-auto grid size-10 place-items-center rounded-xl ${earned ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"}`}>{earned ? <Medal className="size-5" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}</span><p className={`mt-3 text-[10px] font-bold leading-snug ${earned ? "text-foreground" : "text-muted-foreground"}`}>{mission.badge[lang]}</p><p className={`mt-2 text-[9px] uppercase ${earned ? "text-gold" : "text-muted-foreground"}`}>{earned ? t.earned : t.locked}</p></article>; })}</div></section>;
}

export function AudienceSection({ lang }: { lang: Lang }) {
  const t = content[lang];
  return <section id="about" className="home-section scroll-mt-24"><h2 className="home-title">{t.audienceTitle}</h2><div className="mt-5 grid gap-4 lg:grid-cols-3">{t.audience.map(([title, text, button], index) => <article key={title} className="relative min-h-56 overflow-hidden rounded-3xl border border-neon/30 bg-card/55 p-6 pr-32"><h3 className="text-lg font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p><Link href={index === 0 ? `/${lang}/login` : `/${lang}#materials`} className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-3 text-xs font-bold text-neon">{button}<ArrowRight className="size-3.5" aria-hidden="true" /></Link><Image src={audienceImages[index]} alt="" width={180} height={300} className="absolute -bottom-16 -right-7 h-64 w-auto object-contain" /></article>)}</div></section>;
}

export function AiAssistantSection({ lang, href, restricted }: { lang: Lang; href: string; restricted: boolean }) {
  const t = content[lang];
  return <section className="home-section overflow-hidden rounded-3xl border border-success/40 bg-[linear-gradient(100deg,rgba(5,28,57,0.94),rgba(10,55,60,0.78))] px-5 py-6 sm:px-8"><div className="grid items-center gap-5 sm:grid-cols-[8rem_1fr_auto]"><Image src="/characters/chrono/02_happy.png" alt="Chrono" width={180} height={180} className="mx-auto h-32 w-auto object-contain" /><div><h2 className="text-2xl font-black text-neon">{t.aiTitle}</h2><p className="mt-2 text-sm text-foreground">{t.aiText}</p></div>{restricted ? <span className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 text-sm font-bold text-muted-foreground"><Lock className="size-4" aria-hidden="true" />{t.aiButton}</span> : <Link href={href} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-black text-slate-950"><Bot className="size-5" aria-hidden="true" />{t.aiButton}</Link>}</div><p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-end"><Lock className="size-3.5 text-gold" aria-hidden="true" />{t.aiWarning}</p></section>;
}

export function FaqSection({ lang }: { lang: Lang }) {
  const t = content[lang];
  return <section className="mt-12"><h2 className="home-title">{t.faqTitle}</h2><div className="mt-5 grid gap-2">{t.faq.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-border bg-card/45 px-5 py-4 open:border-neon/35 open:bg-card/70"><summary className="focus-ring cursor-pointer list-none rounded-lg pr-8 text-sm font-bold marker:hidden">{question}<span className="float-right text-neon transition group-open:rotate-45">+</span></summary><p className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p></details>)}</div></section>;
}
