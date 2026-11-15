import { SAFETY_PHRASES } from "./safety-phrases";

import type { PatrolLocale } from "./patrol";

export type ProfileXraySpot = {
  id: string;
  label: { ru: string; ro: string };
  sublabel: { ru: string; ro: string };
  isFlag: boolean;
  findingTitle: { ru: string; ro: string };
  findingDesc: { ru: string; ro: string };
};

export type LoginTrapCase = {
  id: string;
  attackerMessage: { ru: string; ro: string };
  trapMechanism: { ru: string; ro: string };
  correctBlockerIndex: number;
  successFeedback: { ru: string; ro: string };
  wrongFeedback: { ru: string; ro: string };
};

export type ActiveSessionItem = {
  id: string;
  deviceTitle: { ru: string; ro: string };
  locationMeta: { ru: string; ro: string };
  liveActivity: { ru: string; ro: string };
  isHacker: boolean;
  explanation: { ru: string; ro: string };
};

export type DefenseLayerRound = {
  id: string;
  layerBadge: { ru: string; ro: string };
  shadowThreat: { ru: string; ro: string };
  cards: {
    id: string;
    title: { ru: string; ro: string };
    desc: { ru: string; ro: string };
    correct: boolean;
    feedback: { ru: string; ro: string };
  }[];
};

export const HACKED_ACCOUNT_META: Record<
  PatrolLocale,
  {
    categoryBadge: string;
    npcBadge: string;
    progressLabel: string;
    remainingLabel: string;
    allDoneLabel: string;
    closeLabel: string;
    introActionBtn: string;
    nextStageBtn: string;
    finishBtn: string;
    stageNames: [string, string, string, string];
    stage1Title: string;
    stage1Subtitle: string;
    stage1ScanHint: string;
    stage1HeaderBadge: string;
    stage1SelectHint: string;
    stage1BehaviorHint: string;
    stage1HiddenClueLabel: string;
    stage1ClueTag: string;
    stage1CheckTag: string;
    stage1NormTag: string;
    stage2Title: string;
    stage2Subtitle: string;
    stage2Blockers: [string, string, string];
    stage2TrapBadge: (current: number) => string;
    stage2FeedbackDefault: string;
    stage2NextTrapBtn: string;
    stage3Title: string;
    stage3Subtitle: string;
    stage3KillBtn: string;
    stage3KilledBadge: string;
    stage3OwnerBadge: string;
    stage3AllKilledNotice: string;
    stage3KilledCounter: (done: number, total: number) => string;
    stage4Title: string;
    stage4Subtitle: string;
    stage4HpLabel: (hp: number) => string;
    stage4StepHint: (step: number) => string;
    stage4ActivateBtn: string;
    victoryTitle: string;
    victoryRetryNotice: string;
    victorySubtitle: string;
    victoryRules: string[];
  }
> = {
  ru: {
    categoryBadge: "КАТЕГОРИЯ · ВЗЛОМАННЫЙ АККАУНТ И ЗАЩИТА ПРОФИЛЯ",
    npcBadge: "Продавец · Район Магазина · 4 этапа спасения аккаунта",
    progressLabel: "Прогресс спасения",
    remainingLabel: "Осталось шагов",
    allDoneLabel: "Аккаунт полностью защищён!",
    closeLabel: "Закрыть",
    introActionBtn: "Разобраться",
    nextStageBtn: "Перейти к следующему этапу →",
    finishBtn: "Вернуть аккаунт Продавцу и выйти в город ✓",
    stageNames: [
      "1. Проверка профиля",
      "2. Поддельная страница входа",
      "3. Активные сессии",
      "4. 3 рубежа защиты",
    ],
    stage1Title: "Этап 1/4 · «Проверка профиля»: Распознай взломанный аккаунт продавца",
    stage1Subtitle:
      "Проверенный магазин в Кагуле вдруг требует срочную предоплату за телефон. Проверь карточку профиля и найди 3 улики взлома:",
    stage1ScanHint: "Нажми на подозрительные элементы профиля слева (найдено улик: ",
    stage1HeaderBadge: "🔍 ПРОФИЛЬ ПРОДАВЦА · ПРОВЕРКА ПРОФИЛЯ",
    stage1SelectHint: "Нажми на любой блок профиля слева для проверки...",
    stage1BehaviorHint: "Проверь, что изменилось в поведении продавца: цена, способ оплаты, способ связи.",
    stage1HiddenClueLabel: "Скрытая улика взлома (проверь профиль)",
    stage1ClueTag: "⚠️ УЛИКА",
    stage1CheckTag: "ПРОВЕРИТЬ",
    stage1NormTag: "✓ НОРМА",
    stage2Title: "Этап 2/4 · «Поддельная страница входа и QR-код»: Как угнали доступ?",
    stage2Subtitle:
      "Разбери 3 уловки, которыми мошенник выманил доступ у продавца. Выбирай правильную защиту внизу для каждой ловушки:",
    stage2Blockers: [
      "Защита 1 · Не вводить пароль по ссылке",
      "Защита 2 · Не сканировать чужой QR-код",
      "Защита 3 · Никому не называть код входа",
    ],
    stage2TrapBadge: (current: number) => `ЛОВУШКА ${current} ИЗ 3 · СООБЩЕНИЕ В ЧАТЕ ПРОДАВЦА`,
    stage2FeedbackDefault: "Выбери подходящую защиту ниже, чтобы обезвредить уловку:",
    stage2NextTrapBtn: "Следующая ловушка входа →",
    stage3Title: "Этап 3/4 · «Диспетчер активных сессий»: Выброси хакера из аккаунта",
    stage3Subtitle:
      "Хакер прямо сейчас сидит внутри аккаунта и рассылает реквизиты! Отключи 3 чужие сессии и не трогай настоящее устройство владельца:",
    stage3KillBtn: "Завершить чужую сессию ⚡",
    stage3KilledBadge: "Отключено ✓",
    stage3OwnerBadge: "Устройство владельца 🛡️",
    stage3AllKilledNotice: "Все 3 чужие сессии отключены! Хакер выброшен из аккаунта!",
    stage3KilledCounter: (done: number, total: number) => `Отключено чужих сессий: ${done} из ${total}`,
    stage4Title: "Этап 4/4 · «Щит восстановления»: 3 рубежа защиты (Пароль + Двухфакторная защита + Оповещение)",
    stage4Subtitle:
      "Тень пытается вернуться в профиль! Установи по очереди 3 рубежа защиты (100% → 0% власти Тени), чтобы окончательно защитить аккаунт и покупателей:",
    stage4HpLabel: (hp: number) => `Доступ Тени к аккаунту · Жизни: ${hp}%`,
    stage4StepHint: (step: number) => `Рубеж ${step}/3 · Выбери правильную меру защиты аккаунта:`,
    stage4ActivateBtn: "УСТАНОВИТЬ РУБЕЖ ⚡",
    victoryTitle: "Взломанный аккаунт спасён! Продавец и покупатели под защитой!",
    victoryRetryNotice: "Ты справился, но с ошибками. Пройди ещё раз",
    victorySubtitle:
      "Ты прошёл все 4 этапа расследования: выявил признаки взлома профиля, разобрал схему кражи аккаунта через QR-код и поддельную страницу, выбросил хакера из активных сессий и установил 3 рубежа защиты.",
    victoryRules: [
      "Даже старый профиль с отличными отзывами может быть взломан: требование срочной предоплаты на чужую карту — главный сигнал тревоги.",
      "Никогда не вводи логин/пароль по ссылкам из чата («получить оплату за доставку») и никогда не сканируй QR-код «для привязки устройства», который тебе прислал кто-то другой, — так ты впустишь его в свой аккаунт.",
      "Смени пароль и заверши все чужие сеансы — оба шага сразу, один за другим. Проверь почту и телефон для восстановления, включи двухфакторную защиту (2FA). Если войти уже не получается — восстанавливай доступ только через официальную поддержку соцсети.",
      "Обязательно предупреди клиентов и друзей о взломе и восстанови настоящие реквизиты.",
    ],
  },
  ro: {
    categoryBadge: "CATEGORIE · CONT SPART ȘI PROTECȚIA PROFILULUI",
    npcBadge: "Vânzătorul · Cartierul Magazinului · 4 etape de salvare",
    progressLabel: "Progresul salvării",
    remainingLabel: "Pași rămași",
    allDoneLabel: "Contul este complet securizat!",
    closeLabel: "Închide",
    introActionBtn: "Să verificăm",
    nextStageBtn: "Treci la etapa următoare →",
    finishBtn: "Redă contul Vânzătorului și revino în oraș ✓",
    stageNames: [
      "1. Verificarea profilului",
      "2. Pagina falsă de intrare",
      "3. Sesiuni active",
      "4. 3 scuturi",
    ],
    stage1Title: "Etapa 1/4 · «Verificarea profilului»: Recunoaște contul spart al vânzătorului",
    stage1Subtitle:
      "Un magazin verificat din Cahul cere brusc avans urgent pentru un telefon. Verifică profilul și găsește 3 indicii că a fost spart:",
    stage1ScanHint: "Apasă pe zonele suspecte ale profilului din stânga (indicii găsite: ",
    stage1HeaderBadge: "🔍 PROFIL VÂNZĂTOR · VERIFICAREA PROFILULUI",
    stage1SelectHint: "Selectează un element din profilul din stânga pentru verificare...",
    stage1BehaviorHint: "Verifică ce s-a schimbat în comportamentul vânzătorului: prețul, modul de plată, modul de contact.",
    stage1HiddenClueLabel: "Indiciu ascuns (verifică profilul)",
    stage1ClueTag: "⚠️ INDICIU",
    stage1CheckTag: "VERIFICĂ",
    stage1NormTag: "✓ ÎN REGULĂ",
    stage2Title: "Etapa 2/4 · «Pagina falsă de intrare și codul QR»: Cum a fost furat accesul?",
    stage2Subtitle:
      "Analizează cele 3 trucuri prin care escrocul a furat contul. Alege măsura de protecție corectă de jos pentru fiecare capcană:",
    stage2Blockers: [
      "Măsura 1 · Nu scrie parola pe link fals",
      "Măsura 2 · Nu scana un cod QR străin",
      "Măsura 3 · Nu spune nimănui codul SMS",
    ],
    stage2TrapBadge: (current: number) => `CAPCANA ${current} DIN 3 · MESAJ ÎN CHATUL VÂNZĂTORULUI`,
    stage2FeedbackDefault: "Alege măsura de protecție potrivită mai jos:",
    stage2NextTrapBtn: "Următoarea pagină falsă de intrare →",
    stage3Title: "Etapa 3/4 · «Manager sesiuni active»: Scoate hackerul din cont",
    stage3Subtitle:
      "Hackerul este chiar acum în cont și trimite mesaje! Închide cele 3 sesiuni străine fără a deconecta dispozitivul real al proprietarului:",
    stage3KillBtn: "Închide sesiunea străină ⚡",
    stage3KilledBadge: "Deconectat ✓",
    stage3OwnerBadge: "Dispozitiv proprietar 🛡️",
    stage3AllKilledNotice: "Toate cele 3 sesiuni străine au fost închise! Hackerul a fost scos din cont!",
    stage3KilledCounter: (done: number, total: number) => `Sesiuni străine închise: ${done} din ${total}`,
    stage4Title: "Etapa 4/4 · «Scutul de recuperare»: 3 linii de apărare (Parolă + 2FA + Alertă)",
    stage4Subtitle:
      "Umbra încearcă să revină în profil! Instalează pe rând cele 3 linii de apărare (100% → 0% puterea Umbrei) pentru a securiza contul:",
    stage4HpLabel: (hp: number) => `Accesul Umbrei la cont · Vieți: ${hp}%`,
    stage4StepHint: (step: number) => `Pasul ${step}/3 · Alege măsura de securitate corectă:`,
    stage4ActivateBtn: "ACTIVEAZĂ SCUTUL ⚡",
    victoryTitle: "Contul spart a fost salvat! Vânzătorul și clienții sunt în siguranță!",
    victoryRetryNotice: "Ai reușit, dar cu greșeli. Mai încearcă",
    victorySubtitle:
      "Ai parcurs toate cele 4 etape: ai depistat semnele contului compromis, ai blocat capcanele furtului contului prin cod QR și pagină falsă, ai eliminat sesiunile hackerului și ai activat cele 3 linii de apărare.",
    victoryRules: [
      "Chiar și un profil vechi cu recenzii excelente poate fi spart: cererea unui avans urgent pe un card străin este semnalul principal de alarmă.",
      "Nu introduce niciodată parola pe linkuri din chat («încasează plata») și nu scana niciodată un cod QR «de asociere a dispozitivului» primit de la altcineva — așa îi dai acces la contul tău.",
      "Schimbă parola și închide toate sesiunile străine — ambii pași imediat, unul după altul. Verifică emailul și telefonul de recuperare, activează autentificarea în 2 pași (2FA). Dacă nu mai poți intra — recuperează contul doar prin suportul oficial al rețelei.",
      "Anunță clienții și prietenii despre spargere și restabilește datele reale de plată.",
    ],
  },
};

export const HACKED_PROFILE_SPOTS: ProfileXraySpot[] = [
  {
    id: "spot-old-reviews",
    label: {
      ru: "«TehnoCahul» ✓ · 4.9 ★ (240 отзывов)",
      ro: "«TehnoCahul» ✓ · 4.9 ★ (240 recenzii)",
    },
    sublabel: {
      ru: "Репутация профиля за прошлые годы",
      ro: "Reputația profilului din anii trecuți",
    },
    isFlag: false,
    findingTitle: {
      ru: "Старые отзывы настоящие — но это приманка!",
      ro: "Recenziile vechi sunt reale — dar servesc drept momeală!",
    },
    findingDesc: {
      ru: "Мошенники специально взламывают старые аккаунты с хорошей репутацией, чтобы покупатели доверяли объявлению без проверки. Ищи свежие аномалии ниже!",
      ro: "Escrocii sparg intenționat conturi vechi cu reputație bună pentru ca oamenii să aibă încredere oarbă. Caută anomaliile recente mai jos!",
    },
  },
  {
    id: "spot-urgency-prepay",
    label: {
      ru: "Пост: «Смартфон −50%! Аванс 1500 леев»",
      ro: "Postare: «Telefon −50%! Avans 1500 lei»",
    },
    sublabel: {
      ru: "Условие: «Самовывоза сегодня нет — переводи сейчас, иначе заберут»",
      ro: "Condiție: «Fără ridicare personală azi — transferă acum sau îl ia altul»",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 1/3: Аномальная скидка + отказ от личной встречи",
      ro: "Indiciul 1/3: Reducere anormală + refuzul întâlnirii personale",
    },
    findingDesc: {
      ru: "Раньше продавец всегда приглашал в магазин в центре Кагула. Внезапный отказ от личной встречи и требование срочного аванса за «товар в полцены» — почерк взломщика!",
      ro: "Anterior, vânzătorul invita mereu clienții în magazinul din centrul Cahulului. Refuzul brusc al întâlnirii și cererea unui avans urgent sunt semnătura hackerului!",
    },
  },
  {
    id: "spot-card-change",
    label: {
      ru: "Оплата в посте: на карту 4111 **** 8892",
      ro: "Plata în postare: card 4111 **** 8892",
    },
    sublabel: {
      ru: "Получатель: физлицо из другого региона (не счёт магазина)",
      ro: "Beneficiar: persoană fizică din altă regiune (nu contul magazinului)",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 2/3: Деньги просят перевести на карту частного лица, а не на счёт магазина.",
      ro: "Indiciul 2/3: Banii se cer pe cardul unei persoane fizice, nu în contul magazinului.",
    },
    findingDesc: {
      ru: "Улика 2/3: Деньги просят перевести на карту частного лица, а не на счёт магазина. Раньше магазин принимал оплату в кассе или при получении — внезапная смена способа оплаты — сигнал тревоги.",
      ro: "Indiciul 2/3: Banii se cer pe cardul unei persoane fizice, nu în contul magazinului. Înainte magazinul primea plata la casă sau la livrare — schimbarea bruscă a modului de plată este un semnal de alarmă.",
    },
  },
  {
    id: "spot-external-chat",
    label: {
      ru: "Связь: «Писать только в @tehnocahul_1»",
      ro: "Contact: «Scrieți doar pe @tehnocahul_1»",
    },
    sublabel: {
      ru: "Комментарии к посту закрыты",
      ro: "Comentariile la postare sunt închise",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 3/3: Увод в сторонний мессенджер и закрытые комментарии!",
      ro: "Indiciul 3/3: Redirecționare în chat extern și comentarii închise!",
    },
    findingDesc: {
      ru: "Взломщик закрыл комментарии, чтобы настоящие знакомые продавца не написали «Это взлом!», и уводит жертву в поддельный чат с единицей на конце.",
      ro: "Hackerul a închis comentariile ca prietenii vânzătorului să nu poată scrie «Cont spart!» și mută discuția într-un chat fals.",
    },
  },
  {
    id: "spot-address-info",
    label: {
      ru: "Адрес: г. Кагул, ул. Штефан чел Маре",
      ro: "Adresa: or. Cahul, str. Ștefan cel Mare",
    },
    sublabel: {
      ru: "Не менялся с момента создания страницы",
      ro: "Neschimbată de la crearea paginii",
    },
    isFlag: false,
    findingTitle: {
      ru: "Старая шапка профиля осталась прежней",
      ro: "Antetul vechi al profilului a rămas neschimbat",
    },
    findingDesc: {
      ru: "Хакеры специально не трогают старое название и адрес магазина, чтобы профиль выглядел привычно. Проверь свежий пост, реквизиты и контакты!",
      ro: "Hackerii păstrează intenționat numele și adresa veche pentru ca profilul să pară autentic. Verifică postarea recentă, cardul și contactele!",
    },
  },
];

export const HACKED_LOGIN_TRAPS: LoginTrapCase[] = [
  {
    id: "trap-1",
    attackerMessage: {
      ru: "Ловушка А: «Я уже оплатил ваш телефон через Курьер-Доставку! Перейдите на cahul-pay-order.top и введите логин и пароль от своего аккаунта, чтобы получить 3000 леев»",
      ro: "Capcana A: «Am plătit deja telefonul prin Livrare-Curier! Accesați cahul-pay-order.top și introduceți loginul și parola contului dvs. pentru a încasa 3000 lei»",
    },
    trapMechanism: {
      ru: "Как обманывают: Поддельная страница входа",
      ro: "Cum te păcălesc: Pagina falsă de intrare",
    },
    correctBlockerIndex: 0,
    successFeedback: {
      ru: "Перехвачено! Для получения перевода никогда не нужно вводить пароль от аккаунта на стороннем сайте — это поддельная страница входа.",
      ro: "Interceptat! Pentru a primi bani nu trebuie niciodată să introduci parola contului pe un site extern — este o pagină falsă de intrare.",
    },
    wrongFeedback: {
      ru: "Не та защита! Здесь мошенник подсунул поддельную страницу входа для кражи логина и пароля. Подумай: какая защита остановит именно эту уловку?",
      ro: "Măsură greșită! Aici escrocul folosește o pagină falsă de intrare pentru a fura parola. Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
  {
    id: "trap-2",
    attackerMessage: {
      ru: "Ловушка Б: «Система оплаты просит верификацию продавца: откройте Настройки → Устройства → Привязать устройство и отсканируйте этот QR-код камерой!»",
      ro: "Capcana B: «Sistemul de plată cere verificarea vânzătorului: deschideți Setări → Dispozitive → Asociază dispozitiv și scanați acest cod QR!»",
    },
    trapMechanism: {
      ru: "Как обманывают: Вход с чужого компьютера по QR-коду",
      ro: "Cum te păcălesc: Conectarea unui calculator străin prin cod QR",
    },
    correctBlockerIndex: 1,
    successFeedback: {
      ru: "Блестяще! QR-код в разделе «Устройства» нужен только для входа в твой аккаунт с компьютера. Сканировать чужой QR — значит впустить хакера во все чаты!",
      ro: "Excelent! Codul QR din «Dispozitive» servește doar la conectarea contului tău pe calculator. Scanarea unui QR străin îi oferă hackerului acces complet!",
    },
    wrongFeedback: {
      ru: "Ошибка! Здесь обман идёт через сканирование чужого QR-кода. Подумай: какая защита остановит именно эту уловку?",
      ro: "Greșit! Aici escrocul încearcă să conecteze un calculator străin prin cod QR. Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
  {
    id: "trap-3",
    attackerMessage: {
      ru: "Ловушка В: В мессенджер пришёл системный код 739-104 («Код входа с нового устройства»). Мошенник пишет: «Назовите 6 цифр — это код курьерской накладной!»",
      ro: "Capcana C: A venit codul de sistem 739-104 («Cod de conectare de pe dispozitiv nou»). Escrocul scrie: «Spuneți cele 6 cifre — e codul facturii de curierat!»",
    },
    trapMechanism: {
      ru: "Как обманывают: Выманивание кода из SMS",
      ro: "Cum te păcălesc: Cererea codului din SMS",
    },
    correctBlockerIndex: 2,
    successFeedback: {
      ru: `Точно в цель! ${SAFETY_PHRASES.ru.smsCode}`,
      ro: `Exact la țintă! ${SAFETY_PHRASES.ro.smsCode}`,
    },
    wrongFeedback: {
      ru: `Неверно! ${SAFETY_PHRASES.ru.smsCode} Подумай: какая защита остановит именно эту уловку?`,
      ro: `Incorect! ${SAFETY_PHRASES.ro.smsCode} Gândește-te: ce protecție oprește exact această capcană?`,
    },
  },
];

export const HACKED_SESSIONS: ActiveSessionItem[] = [
  {
    id: "sess-owner-phone",
    deviceTitle: {
      ru: "Смартфон владельца (официальное приложение)",
      ro: "Telefonul proprietarului (aplicația oficială)",
    },
    locationMeta: {
      ru: "Молдова, г. Кагул · Текущее устройство (в сети с 2023 г.)",
      ro: "Moldova, or. Cahul · Dispozitivul curent (activ din 2023)",
    },
    liveActivity: {
      ru: "Статус: Вы просматриваете раздел «Безопасность и устройства»",
      ro: "Stare: Vizualizați secțiunea «Securitate și dispozitive»",
    },
    isHacker: false,
    explanation: {
      ru: "Это настоящий телефон продавца в Кагуле, с которого мы сейчас спасаем аккаунт. Его отключать не нужно!",
      ro: "Acesta este telefonul real al vânzătorului din Cahul de pe care salvăm contul. Nu trebuie deconectat!",
    },
  },
  {
    id: "sess-hacker-linux",
    deviceTitle: {
      ru: "Незнакомый компьютер в другой стране",
      ro: "Calculator necunoscut în altă țară",
    },
    locationMeta: {
      ru: "Вход: 19 минут назад · Неизвестное место",
      ro: "Conectat: acum 19 minute · Locație necunoscută",
    },
    liveActivity: {
      ru: "⚠️ АКТИВНОСТЬ: Опубликовал пост о распродаже за 50% и закрыл комментарии",
      ro: "⚠️ ACTIVITATE: A publicat postarea cu reducere 50% și a închis comentariile",
    },
    isHacker: true,
    explanation: {
      ru: "Сессия взломщика принудительно завершена! Хакер больше не может редактировать посты с чужого компьютера.",
      ro: "Sesiunea atacatorului a fost închisă forțat! Hackerul nu mai poate modifica postările de pe calculatorul străin.",
    },
  },
  {
    id: "sess-hacker-qr",
    deviceTitle: {
      ru: "Чужой компьютер (вход по QR-коду)",
      ro: "Calculator străin (conectat prin cod QR)",
    },
    locationMeta: {
      ru: "Вход: 18 минут назад · Подключено по поддельному QR-коду",
      ro: "Conectat: acum 18 minute · Asociat prin cod QR fals",
    },
    liveActivity: {
      ru: "⚠️ АКТИВНОСТЬ: Подменил номер банковской карты в профиле на 4111 **** 8892",
      ro: "⚠️ ACTIVITATE: A schimbat cardul bancar din profil cu 4111 **** 8892",
    },
    isHacker: true,
    explanation: {
      ru: "Чужой компьютер отключён! Злоумышленник потерял доступ к настройкам реквизитов и личным сообщениям магазина.",
      ro: "Calculatorul străin a fost deconectat! Infractorul a pierdut accesul la setările de plată și mesajele magazinului.",
    },
  },
  {
    id: "sess-hacker-bot",
    deviceTitle: {
      ru: "Программа для рассылки",
      ro: "Program de trimitere automată",
    },
    locationMeta: {
      ru: "Вход: 14 минут назад · Массовая рассылка (48 чатов/мин)",
      ro: "Conectat: acum 14 minute · Trimitere în masă (48 chaturi/min)",
    },
    liveActivity: {
      ru: "⚠️ АКТИВНОСТЬ: Рассылает клиентам сообщения «Срочно кидай аванс 1500 леев!»",
      ro: "⚠️ ACTIVITATE: Trimite clienților mesaje «Transferă urgent avans 1500 lei!»",
    },
    isHacker: true,
    explanation: {
      ru: "Программа для рассылки отключена! Автоматическая рассылка фейковых счетов покупателям полностью остановлена.",
      ro: "Programul de trimitere automată a fost oprit! Trimiterea automată de mesaje false către clienți a fost oprită.",
    },
  },
];

export const HACKED_SHIELD_LAYERS: DefenseLayerRound[] = [
  {
    id: "layer-password",
    layerBadge: {
      ru: "Рубеж 1/3 · Смена скомпрометированного пароля",
      ro: "Linia 1/3 · Schimbarea parolei compromise",
    },
    shadowThreat: {
      ru: "Тень: «Я уже знаю старый пароль продавца (magazin2021)! Сейчас снова войду в аккаунт!»",
      ro: "Umbra: «Cunosc deja parola veche a vânzătorului (magazin2021)! Intru imediat înapoi în cont!»",
    },
    cards: [
      {
        id: "pwd-strong",
        title: {
          ru: "Уникальная парольная фраза (16+ символов)",
          ro: "Frază-parolă unică (16+ caractere)",
        },
        desc: {
          ru: "Задать новую длинную парольную фразу из 4–5 случайных слов, не связанных с магазином, городом или датами (например, «nor-lingura-tramvai-cactus» — латиницей и без диакритики, чтобы её можно было набрать на любой клавиатуре), и нигде больше её не использовать. Не копируй пример — придумай свою. Если сайт требует цифру или заглавную букву — добавь их.",
          ro: "Setează o frază-parolă nouă, lungă, din 4–5 cuvinte la întâmplare, fără legătură cu magazinul, orașul sau date (de ex. «nor-lingura-tramvai-cactus» — cu litere latine, fără diacritice, ca să poată fi scrisă pe orice tastatură), folosită doar aici. Nu copia exemplul — inventează-ți propria frază. Dacă site-ul cere o cifră sau o literă mare — adaug-o.",
        },
        correct: true,
        feedback: {
          ru: "Старый украденный пароль больше не работает, а длинную фразу из случайных слов очень трудно подобрать.",
          ro: "Parola veche furată nu mai funcționează, iar o frază lungă din cuvinte întâmplătoare este foarte greu de ghicit.",
        },
      },
      {
        id: "pwd-weak",
        title: {
          ru: "Поменять последнюю цифру (magazin2022)",
          ro: "Schimbă doar ultima cifră (magazin2022)",
        },
        desc: {
          ru: "Чуть-чуть изменить старый пароль, чтобы продавцу было легко его запомнить.",
          ro: "Modifică puțin parola veche ca să fie ușor de ținut minte.",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Хакерские программы проверяют замену одной цифры на конце в первую же секунду.",
          ro: "Periculos! Programele de hacking testează schimbarea ultimei cifre în prima secundă.",
        },
      },
      {
        id: "pwd-keep",
        title: {
          ru: "Оставить старый пароль (сессии же закрыты)",
          ro: "Lasă parola veche (sesiunile au fost închise)",
        },
        desc: {
          ru: "Мы уже выкинули хакера из устройств, зачем менять пароль?",
          ro: "Am scos deja hackerul din dispozitive, de ce să mai schimbăm parola?",
        },
        correct: false,
        feedback: {
          ru: "Ловушка! Если не сменить пароль сразу после закрытия сессий, взломщик войдёт обратно через минуту.",
          ro: "Capcană! Dacă nu schimbi parola imediat după închiderea sesiunilor, hackerul se reconectează într-un minut.",
        },
      },
    ],
  },
  {
    id: "layer-2fa",
    layerBadge: {
      ru: "Рубеж 2/3 · Двухфакторная защита входа",
      ro: "Linia 2/3 · Autentificare în doi pași (2FA)",
    },
    shadowThreat: {
      ru: "Тень: «Даже с новым паролем я попробую снова подсунуть поддельную страницу входа!»",
      ro: "Umbra: «Chiar și cu parolă nouă, voi încerca din nou o pagină falsă de intrare!»",
    },
    cards: [
      {
        id: "2fa-enable",
        title: {
          ru: "Включить двухфакторную защиту (код из приложения или SMS при каждом новом входе)",
          ro: "Activează 2FA (cod din aplicație sau SMS la fiecare conectare nouă)",
        },
        desc: {
          ru: "Потребовать второй фактор при входе с любого нового устройства и проверить привязанную почту восстановления.",
          ro: "Solicită al doilea factor la conectarea de pe orice dispozitiv nou și verifică emailul de recuperare.",
        },
        correct: true,
        feedback: {
          ru: "Рубеж 2 установлен! Теперь одного пароля мало — нужен ещё код. Но помни: код 2FA никогда никому не сообщай и не вводи по ссылкам из чата — иначе защита не сработает.",
          ro: "Linia 2 instalată! Acum parola singură nu ajunge — e nevoie și de cod. Dar ține minte: codul 2FA nu-l spui nimănui și nu-l introduci pe linkuri din chat — altfel protecția nu funcționează.",
        },
      },
      {
        id: "2fa-none",
        title: {
          ru: "Отключить защиту входа, чтобы входить быстрее",
          ro: "Dezactivează verificarea la intrare pentru acces rapid",
        },
        desc: {
          ru: "Лишние коды только мешают быстро отвечать покупателям.",
          ro: "Codurile suplimentare doar încetinesc răspunsurile către clienți.",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Без двухфакторной защиты любой перехваченный пароль сразу открывает злоумышленнику весь аккаунт.",
          ro: "Greșeală! Fără 2FA, orice parolă interceptată îi oferă atacatorului acces instantaneu la cont.",
        },
      },
      {
        id: "2fa-chat-save",
        title: {
          ru: "Записать резервные коды в открытом посте профиля",
          ro: "Publică codurile de rezervă într-o postare pe profil",
        },
        desc: {
          ru: "Сохранить секретные коды прямо на стене магазина, чтобы не потерять.",
          ro: "Salvează codurile secrete chiar pe pagina magazinului ca să nu le pierzi.",
        },
        correct: false,
        feedback: {
          ru: "Ни в коем случае! Резервные коды двухфакторной защиты хранят только в защищённом месте офлайн или в менеджере паролей.",
          ro: "Sub nicio formă! Codurile de rezervă 2FA se păstrează doar offline sau într-un manager de parole securizat.",
        },
      },
    ],
  },
  {
    id: "layer-warn",
    layerBadge: {
      ru: "Рубеж 3/3 · Защита покупателей и возврат реквизитов",
      ro: "Linia 3/3 · Protecția clienților și restaurarea datelor",
    },
    shadowThreat: {
      ru: "Тень: «Некоторые покупатели уже скопировали мою подставную карту и сейчас переведут аванс!»",
      ro: "Umbra: «Unii clienți au copiat deja cardul meu fals și sunt gata să transfere avansul!»",
    },
    cards: [
      {
        id: "warn-publish",
        title: {
          ru: "Удалить фейковый пост и опубликовать предупреждение о взломе",
          ro: "Șterge postarea falsă și publică o alertă de cont spart",
        },
        desc: {
          ru: "Убрать чужую карту, открыть комментарии и закрепить объявление: «Аккаунт взламывали! Никакой предоплаты на карты не переводите!».",
          ro: "Șterge cardul străin, redeschide comentariile și fixează anunțul: «Contul a fost vizat de hackeri! Nu transferați niciun avans!».",
        },
        correct: true,
        feedback: {
          ru: "Рубеж 3 установлен! Тень полностью повержена (Жизни: 0%), а все покупатели вовремя предупреждены и защищены!",
          ro: "Linia 3 instalată! Umbra este complet învinsă (Vieți: 0%), iar toți clienții au fost avertizați la timp!",
        },
      },
      {
        id: "warn-silent",
        title: {
          ru: "Промолчать о взломе, чтобы не портить имидж магазина",
          ro: "Păstrează tăcerea despre spargere pentru a nu afecta imaginea",
        },
        desc: {
          ru: "Никому ничего не писать — вдруг клиенты решат, что магазин ненадёжный.",
          ro: "Nu anunța pe nimeni — clienții ar putea crede că magazinul nu e sigur.",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Если промолчать, люди, которым бот уже успел написать в личку, переведут деньги мошенникам.",
          ro: "Periculos! Dacă taci, clienții cărora botul le-a scris deja în privat vor transfera bani escrocilor.",
        },
      },
      {
        id: "warn-delete-account",
        title: {
          ru: "Бросить старый аккаунт с фейковым постом как есть",
          ro: "Abandonează contul vechi cu postarea falsă activă",
        },
        desc: {
          ru: "Просто выйти из аккаунта и оставить подставную карту мошенника висеть на странице.",
          ro: "Ieși pur și simplu din cont și lasă cardul escrocului afișat pe pagină.",
        },
        correct: false,
        feedback: {
          ru: "Нельзя оставлять фальшивые реквизиты на странице! Нужно удалить пост мошенника и предупредить подписчиков.",
          ro: "Nu poți lăsa datele false pe pagină! Postarea escrocului trebuie ștearsă, iar urmăritorii avertizați.",
        },
      },
    ],
  },
];
