"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";

export const playSound = (type: "correct" | "wrong" | "timeout") => {
  if (typeof window !== "undefined") {
    const audio = new Audio(`/audio/${type}.mp3`);
    audio.play().catch(() => {});
  }
};

export const NextButtonContext = createContext<ReactNode>(null);

export const accessibilityText = {
  ru: {
    correct: "Правильно",
    wrong: "Ошибка",
    selected: "Выбрано",
    unselected: "Не выбрано",
    found: "Найдено",
    pause: "Пауза",
    resume: "Продолжить",
    paused: "Таймер приостановлен",
    nextCard: "Следующая карточка",
    levelComplete: "Уровень завершён",
    chooseFragment: "Выбрать фрагмент",
    clue: "Проверить деталь",
    sender: "Отправитель",
    message: "Текст сообщения",
    link: "Ссылка",
    avatar: "Аватар",
    caller: "Имя звонящего",
    number: "Номер телефона",
    profileName: "Имя профиля",
    accountType: "Тип аккаунта",
    callAction: "Кнопка звонка",
    messageAction: "Кнопка сообщения",
  },
  ro: {
    correct: "Corect",
    wrong: "Eroare",
    selected: "Selectat",
    unselected: "Neselectat",
    found: "Găsit",
    pause: "Pauză",
    resume: "Continuă",
    paused: "Cronometrul este oprit",
    nextCard: "Cardul următor",
    levelComplete: "Nivel finalizat",
    chooseFragment: "Selectează fragmentul",
    clue: "Verifică detaliul",
    sender: "Expeditor",
    message: "Textul mesajului",
    link: "Link",
    avatar: "Avatar",
    caller: "Numele apelantului",
    number: "Numărul de telefon",
    profileName: "Numele profilului",
    accountType: "Tipul contului",
    callAction: "Buton de apel",
    messageAction: "Buton de mesaj",
  },
} as const;

export function ActionButton({ children, disabled, onClick, center }: { children: ReactNode; disabled?: boolean; onClick: () => void; center?: boolean }) {
  const nextBtn = useContext(NextButtonContext);
  return (
    <div className={`mt-6 flex w-full flex-wrap items-center gap-4 ${center ? "justify-center" : "justify-between"}`}>
      <button type="button" disabled={disabled} onClick={onClick} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
        {disabled ? <Loader2 className="size-4 animate-spin" /> : null}{children}<ChevronRight className="size-4" />
      </button>
      {nextBtn}
    </div>
  );
}

export function ScoreFeedback({ score }: { score: number }) {
  return <p className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${score >= 80 ? "border-success/30 bg-success/10 text-success" : "border-gold/30 bg-gold/10 text-gold"}`}>{score}%</p>;
}
