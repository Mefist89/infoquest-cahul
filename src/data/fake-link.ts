export type FakeLinkLocale = "ru" | "ro";

export const fakeLinkContent = {
  ru: {
    title: "Ловушка фальшивой ссылки",
    eyebrow: "Модуль 2 · Фишинг",
    description: "Научись отличать поддельные сайты от настоящих и безопасно проверять ссылки.",
    back: "На главную",
    profile: "Профиль",
    progress: "Прогресс модуля",
    xp: "XP модуля",
    completed: "Пройдено",
    locked: "Сначала заверши предыдущий этап",
    continue: "Завершить этап",
    next: "Следующий этап",
    retry: "Попробовать ещё раз",
    check: "Проверить ответ",
    saved: "Прогресс сохранён в Supabase",
    saveError: "Не удалось сохранить прогресс. Проверь соединение и повтори.",
    intro: {
      title: "Вступление",
      subtitle: "Знакомство с наставником",
      name: "Наталья",
      role: "Наставник по цифровой безопасности",
      next: "Дальше",
      start: "Начать теорию",
      listen: "Прослушать текст",
      listening: "Воспроизведение…",
      lines: [
        "Привет! Я Наталья, и сегодня мы разберём фишинг — ловушку фальшивой ссылки.",
        "Мошенник создаёт точную копию сайта, чтобы украсть твои пароли.",
        "Запомни: всегда проверяй адресную строку перед вводом данных.",
        "Будь внимателен, проверяй каждую деталь — и останови атаку Тени.",
      ],
    },
    stages: [
      { title: "Вступление", subtitle: "Знакомство" }
    ],
  },
  ro: {
    title: "Capcana linkului fals",
    eyebrow: "Modulul 2 · Phishing",
    description: "Învață să distingi site-urile false de cele reale și să verifici linkurile în siguranță.",
    back: "Acasă",
    profile: "Profil",
    progress: "Progresul modulului",
    xp: "XP modul",
    completed: "Finalizat",
    locked: "Finalizează etapa anterioară mai întâi",
    continue: "Finalizează etapa",
    next: "Etapa următoare",
    retry: "Încearcă din nou",
    check: "Verifică răspunsul",
    saved: "Progres salvat în Supabase",
    saveError: "Nu s-a putut salva progresul. Verifică conexiunea și încearcă din nou.",
    intro: {
      title: "Introducere",
      subtitle: "Cunoașterea mentorului",
      name: "Natalia",
      role: "Mentor în securitate digitală",
      next: "Mai departe",
      start: "Începe teoria",
      listen: "Ascultă textul",
      listening: "Redare…",
      lines: [
        "Salut! Sunt Natalia, iar astăzi vom discuta despre phishing — capcana linkului fals.",
        "Escrocul creează o copie exactă a site-ului pentru a fura parolele tale.",
        "Reține: verifică mereu bara de adrese înainte de a introduce date.",
        "Fii atent, verifică fiecare detaliu — și oprește atacul Umbrei.",
      ],
    },
    stages: [
      { title: "Introducere", subtitle: "Cunoaștere" }
    ],
  }
} as const;
