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
    nextStageBtn: string;
    finishBtn: string;
    stageNames: [string, string, string, string];
    stage1Title: string;
    stage1Subtitle: string;
    stage1ScanHint: string;
    stage2Title: string;
    stage2Subtitle: string;
    stage2Blockers: [string, string, string];
    stage3Title: string;
    stage3Subtitle: string;
    stage3KillBtn: string;
    stage3KilledBadge: string;
    stage3OwnerBadge: string;
    stage4Title: string;
    stage4Subtitle: string;
    victoryTitle: string;
    victorySubtitle: string;
    victoryRules: string[];
  }
> = {
  ru: {
    categoryBadge: "КАТЕГОРИЯ · ВЗЛОМАННЫЙ АККАУНТ И ЗАЩИТА ПРОФИЛЯ",
    npcBadge: "Продавец · Район Магазина · 4 этапа спасения аккаунта (Phaser 3)",
    progressLabel: "Прогресс спасения",
    remainingLabel: "Осталось шагов",
    allDoneLabel: "Аккаунт полностью защищён!",
    closeLabel: "Закрыть [Esc]",
    nextStageBtn: "Перейти к следующему этапу →",
    finishBtn: "Вернуть аккаунт Продавцу и выйти в город ✓",
    stageNames: [
      "1. Рентген профиля",
      "2. Ловушка входа",
      "3. Активные сессии",
      "4. 3 рубежа защиты",
    ],
    stage1Title: "Этап 1/4 · «Рентген профиля»: Распознай взломанный аккаунт продавца",
    stage1Subtitle:
      "Проверенный магазин в Кагуле вдруг требует срочную предоплату за телефон. Просвети рентгеном карточку профиля и найди 3 улики взлома:",
    stage1ScanHint: "Нажми рентген-прицелом на подозрительные элементы профиля слева (найдено улик: ",
    stage2Title: "Этап 2/4 · «Ловушка фейкового входа и QR-кода»: Как угнали доступ?",
    stage2Subtitle:
      "Разбери 3 уловки, которыми мошенник выманил доступ у продавца. Выбирай правильный кибер-барьер внизу для каждой ловушки:",
    stage2Blockers: [
      "Барьер 1 · Стоп фишинг-домен (не вводить пароль по ссылкам)",
      "Барьер 2 · Блок QR-привязки чужого устройства",
      "Барьер 3 · Защита кода входа (никому не диктовать OTP/2FA)",
    ],
    stage3Title: "Этап 3/4 · «Диспетчер активных сессий»: Выброси хакера из аккаунта",
    stage3Subtitle:
      "Хакер прямо сейчас сидит внутри аккаунта и рассылает реквизиты! Отключи 3 чужие сессии и не трогай настоящее устройство владельца:",
    stage3KillBtn: "Завершить чужую сессию ⚡",
    stage3KilledBadge: "Отключено ✓",
    stage3OwnerBadge: "Устройство владельца 🛡️",
    stage4Title: "Этап 4/4 · «Щит восстановления»: 3 рубежа защиты (Пароль + 2FA + Оповещение)",
    stage4Subtitle:
      "Тень пытается вернуться в профиль! Установи по очереди 3 рубежа защиты (100% → 0% власти Тени), чтобы окончательно защитить аккаунт и покупателей:",
    victoryTitle: "Взломанный аккаунт спасён! Продавец и покупатели под защитой!",
    victorySubtitle:
      "Ты прошёл все 4 этапа расследования на Phaser 3: выявил признаки взлома профиля, разобрал схему QR/OAuth-угона, выбросил хакера из активных сессий и установил 3 рубежа защиты.",
    victoryRules: [
      "Даже старый профиль с отличными отзывами может быть взломан: требование срочной предоплаты на чужую карту — главный сигнал тревоги.",
      "Никогда не вводи логин/пароль по ссылкам из чата («получить оплату за доставку») и не сканируй QR-коды для «привязки устройства».",
      "При подозрении на взлом первым делом открой «Настройки → Устройства (Активные сессии)» и заверши все неизвестные сеансы.",
      "Сразу после очистки сессий смени пароль на уникальный, включи двухфакторную аутентификацию (2FA) и предупреди клиентов/друзей о взломе.",
    ],
  },
  ro: {
    categoryBadge: "CATEGORIE · CONT SPART ȘI PROTECȚIA PROFILULUI",
    npcBadge: "Vânzătorul · Cartierul Magazinului · 4 etape de salvare (Phaser 3)",
    progressLabel: "Progresul salvării",
    remainingLabel: "Pași rămași",
    allDoneLabel: "Contul este complet securizat!",
    closeLabel: "Închide [Esc]",
    nextStageBtn: "Treci la etapa următoare →",
    finishBtn: "Redă contul Vânzătorului și revino în oraș ✓",
    stageNames: [
      "1. Raze X profil",
      "2. Capcana login",
      "3. Sesiuni active",
      "4. 3 scuturi",
    ],
    stage1Title: "Etapa 1/4 · «Raze X pe profil»: Recunoaște contul spart al vânzătorului",
    stage1Subtitle:
      "Un magazin verificat din Cahul cere brusc avans urgent pentru un telefon. Scanează profilul și găsește 3 indicii că a fost spart:",
    stage1ScanHint: "Apasă cu scanerul pe zonele suspecte ale profilului din stânga (indicii găsite: ",
    stage2Title: "Etapa 2/4 · «Capcana de login fals și cod QR»: Cum a fost furat accesul?",
    stage2Subtitle:
      "Analizează cele 3 trucuri prin care escrocul a furat contul. Alege bariera cibernetică corectă de jos pentru fiecare capcană:",
    stage2Blockers: [
      "Bariera 1 · Stop domeniu phishing (nu introduce parola prin link)",
      "Bariera 2 · Blocare asociere QR a unui dispozitiv străin",
      "Bariera 3 · Protecție cod de acces (nu dicta OTP/2FA nimănui)",
    ],
    stage3Title: "Etapa 3/4 · «Manager sesiuni active»: Scoate hackerul din cont",
    stage3Subtitle:
      "Hackerul este chiar acum în cont și trimite mesaje! Închide cele 3 sesiuni străine fără a deconecta dispozitivul real al proprietarului:",
    stage3KillBtn: "Închide sesiunea străină ⚡",
    stage3KilledBadge: "Deconectat ✓",
    stage3OwnerBadge: "Dispozitiv proprietar 🛡️",
    stage4Title: "Etapa 4/4 · «Scutul de recuperare»: 3 linii de apărare (Parolă + 2FA + Alertă)",
    stage4Subtitle:
      "Umbra încearcă să revină în profil! Instalează pe rând cele 3 linii de apărare (100% → 0% puterea Umbrei) pentru a securiza contul:",
    victoryTitle: "Contul spart a fost salvat! Vânzătorul și clienții sunt în siguranță!",
    victorySubtitle:
      "Ai parcurs toate cele 4 etape Phaser 3: ai depistat semnele contului compromis, ai blocat capcanele QR/OAuth, ai eliminat sesiunile hackerului și ai activat cele 3 linii de apărare.",
    victoryRules: [
      "Chiar și un profil vechi cu recenzii excelente poate fi spart: cererea unui avans urgent pe un card străin este semnalul principal de alarmă.",
      "Nu introduce niciodată parola pe linkuri din chat («încasează plata») și nu scana coduri QR pentru «asocierea dispozitivului».",
      "La orice suspiciune de spargere, intră imediat în «Setări → Dispozitive (Sesiuni active)» și închide toate sesiunile necunoscute.",
      "După curățarea sesiunilor, schimbă parola cu una unică, activează autentificarea în 2 pași (2FA) și anunță clienții/prietenii.",
    ],
  },
};

export const HACKED_PROFILE_SPOTS: ProfileXraySpot[] = [
  {
    id: "spot-old-reviews",
    label: {
      ru: "Магазин «TehnoCahul» ✓ · 4.9 ★ (240 отзывов с 2021 г.)",
      ro: "Magazin «TehnoCahul» ✓ · 4.9 ★ (240 recenzii din 2021)",
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
      ru: "Пост (12 мин назад): «Смартфон за 50% цены! Срочно аванс 1500 леев!»",
      ro: "Postare (acum 12 min): «Telefon la 50% preț! Urgent avans 1500 lei!»",
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
      ru: "Реквизиты: Карта 4111 **** 8892 (изменено 18 мин назад)",
      ro: "Detalii plată: Card 4111 **** 8892 (modificat acum 18 min)",
    },
    sublabel: {
      ru: "Получатель: физлицо из другого региона (не счёт магазина)",
      ro: "Beneficiar: persoană fizică din altă regiune (nu contul magazinului)",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 2/3: Тихая подмена реквизитов оплаты 18 минут назад!",
      ro: "Indiciul 2/3: Înlocuirea tacită a cardului de plată acum 18 minute!",
    },
    findingDesc: {
      ru: "Рентген истории профиля показал: сразу после взлома хакер заменил расчётный счёт магазина на подставную карту («дропа»), чтобы мгновенно вывести предоплату.",
      ro: "Razele X asupra istoricului arată: imediat după spargere, hackerul a înlocuit contul magazinului cu un card străin pentru a fura avansul.",
    },
  },
  {
    id: "spot-external-chat",
    label: {
      ru: "Кнопка связи: «Писать только в сторонний чат @tehnocahul_1»",
      ro: "Buton contact: «Scrieți doar pe chatul extern @tehnocahul_1»",
    },
    sublabel: {
      ru: "Комментарии к посту отключены автором 15 минут назад",
      ro: "Comentariile la postare au fost dezactivate acum 15 minute",
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
      ru: "Старый адрес в шапке: г. Кагул, ул. Штефан чел Маре",
      ro: "Adresa veche în antet: or. Cahul, str. Ștefan cel Mare",
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
      ru: "Вектор атаки: Поддельная страница входа (OAuth / Phishing форма)",
      ro: "Vector de atac: Pagină falsă de autentificare (formular Phishing)",
    },
    correctBlockerIndex: 0,
    successFeedback: {
      ru: "Перехвачено! Для получения перевода никогда не нужно вводить пароль от аккаунта на стороннем сайте — это фишинговая ловушка.",
      ro: "Interceptat! Pentru a primi bani nu trebuie niciodată să introduci parola contului pe un site extern — este phishing.",
    },
    wrongFeedback: {
      ru: "Не тот барьер! Здесь мошенник подсунул фальшивый сайт для кражи логина и пароля — используй «Барьер 1 · Стоп фишинг-домен».",
      ro: "Barieră greșită! Aici escrocul folosește un site fals pentru a fura parola — alege «Bariera 1 · Stop domeniu phishing».",
    },
  },
  {
    id: "trap-2",
    attackerMessage: {
      ru: "Ловушка Б: «Система оплаты просит верификацию продавца: откройте Настройки → Устройства → Привязать устройство и отсканируйте этот QR-код камерой!»",
      ro: "Capcana B: «Sistemul de plată cere verificarea vânzătorului: deschideți Setări → Dispozitive → Asociază dispozitiv și scanați acest cod QR!»",
    },
    trapMechanism: {
      ru: "Вектор атаки: Угон активной сессии через QR-код привязки браузера",
      ro: "Vector de atac: Deturnarea sesiunii prin cod QR de asociere Web",
    },
    correctBlockerIndex: 1,
    successFeedback: {
      ru: "Блестяще! QR-код в разделе «Устройства» нужен только для входа в твой аккаунт с компьютера. Сканировать чужой QR — значит впустить хакера во все чаты!",
      ro: "Excelent! Codul QR din «Dispozitive» servește doar la conectarea contului tău pe PC. Scanarea unui QR străin îi oferă hackerului acces complet!",
    },
    wrongFeedback: {
      ru: "Ошибка! Здесь атака идёт через сканирование QR-кода привязки сессии — выбери «Барьер 2 · Блок QR-привязки чужого устройства».",
      ro: "Greșit! Atacatorul încearcă să asocieze propriul browser prin QR — alege «Bariera 2 · Blocare asociere QR».",
    },
  },
  {
    id: "trap-3",
    attackerMessage: {
      ru: "Ловушка В: В мессенджер пришёл системный код 739-104 («Код входа с нового устройства»). Мошенник пишет: «Назовите 6 цифр — это код курьерской накладной!»",
      ro: "Capcana C: A venit codul de sistem 739-104 («Cod de conectare de pe dispozitiv nou»). Escrocul scrie: «Spuneți cele 6 cifre — e codul facturii de curierat!»",
    },
    trapMechanism: {
      ru: "Вектор атаки: Перехват одноразового кода входа (OTP / 2FA)",
      ro: "Vector de atac: Furtul codului unic de autentificare (OTP / 2FA)",
    },
    correctBlockerIndex: 2,
    successFeedback: {
      ru: "Точно в цель! 6-значный код входа нельзя называть ни под каким предлогом — ни «курьеру», ни «техподдержке», ни «покупателю».",
      ro: "Exact la țintă! Codul de autentificare din 6 cifre nu se comunică nimănui — nici «curierului», nici «suportului», nici «cumpărătorului».",
    },
    wrongFeedback: {
      ru: "Неверно! Мошенник выманивает одноразовый код входа в аккаунт — активируй «Барьер 3 · Защита кода входа (OTP/2FA)».",
      ro: "Incorect! Escrocul încearcă să obțină codul unic de conectare — activează «Bariera 3 · Protecție cod de acces (OTP/2FA)».",
    },
  },
];

export const HACKED_SESSIONS: ActiveSessionItem[] = [
  {
    id: "sess-owner-phone",
    deviceTitle: {
      ru: "Смартфон владельца · Android 14 (Официальное приложение)",
      ro: "Telefonul proprietarului · Android 14 (Aplicația oficială)",
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
      ru: "Неизвестный ПК · Linux Chrome 122 (Анонимный прокси)",
      ro: "PC necunoscut · Linux Chrome 122 (Proxy anonim)",
    },
    locationMeta: {
      ru: "Вход: 19 минут назад · IP скрыт (Tor / VPN узел)",
      ro: "Conectat: acum 19 minute · IP ascuns (nod Tor / VPN)",
    },
    liveActivity: {
      ru: "⚠️ АКТИВНОСТЬ: Опубликовал пост о распродаже за 50% и закрыл комментарии",
      ro: "⚠️ ACTIVITATE: A publicat postarea cu reducere 50% și a închis comentariile",
    },
    isHacker: true,
    explanation: {
      ru: "Сессия взломщика принудительно завершена! Хакер больше не может редактировать посты с анонимного браузера.",
      ro: "Sesiunea atacatorului a fost închisă forțat! Hackerul nu mai poate modifica postările din browserul anonim.",
    },
  },
  {
    id: "sess-hacker-qr",
    deviceTitle: {
      ru: "Web-сессия (QR-мост) · Desktop Web Client",
      ro: "Sesiune Web (Punte QR) · Desktop Web Client",
    },
    locationMeta: {
      ru: "Вход: 18 минут назад · Привязано через фишинговый QR-код",
      ro: "Conectat: acum 18 minute · Asociat prin cod QR de phishing",
    },
    liveActivity: {
      ru: "⚠️ АКТИВНОСТЬ: Подменил номер банковской карты в профиле на 4111 **** 8892",
      ro: "⚠️ ACTIVITATE: A schimbat cardul bancar din profil cu 4111 **** 8892",
    },
    isHacker: true,
    explanation: {
      ru: "QR-мост разорван! Злоумышленник потерял доступ к настройкам реквизитов и личным сообщениям магазина.",
      ro: "Puntea QR a fost întreruptă! Infractorul a pierdut accesul la setările de plată și mesajele magazinului.",
    },
  },
  {
    id: "sess-hacker-bot",
    deviceTitle: {
      ru: "Авто-скрипт рассылки · Headless Bot API v2.4",
      ro: "Script auto-mesaje · Headless Bot API v2.4",
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
      ru: "Вредоносный бот-токен отозван! Автоматическая рассылка фейковых счетов покупателям полностью остановлена.",
      ro: "Tokenul botului malițios a fost revocat! Trimiterea automată de mesaje false către clienți a fost oprită.",
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
          ru: "Задать новый сложный пароль (например, Cahul$Tehno#Scut2026!), который не используется больше нигде.",
          ro: "Setează o parolă complexă nouă (ex. Cahul$Tehno#Scut2026!) care nu mai este folosită pe niciun alt site.",
        },
        correct: true,
        feedback: {
          ru: "Рубеж 1 установлен! Старый украденный пароль больше не работает, а новый невозможно подобрать по словарю.",
          ro: "Linia 1 instalată! Parola veche furată a devenit inutilă, iar noua parolă nu poate fi ghicită.",
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
      ru: "Рубеж 2/3 · Двухфакторная аутентификация (2FA)",
      ro: "Linia 2/3 · Autentificare în doi pași (2FA)",
    },
    shadowThreat: {
      ru: "Тень: «Даже с новым паролем я попробую снова подсунуть фишинговую форму входа!»",
      ro: "Umbra: «Chiar și cu parolă nouă, voi încerca din nou o pagină falsă de login!»",
    },
    cards: [
      {
        id: "2fa-enable",
        title: {
          ru: "Включить 2FA (Приложение-аутентификатор + облачный пароль)",
          ro: "Activează 2FA (Aplicație Authenticator + parolă cloud)",
        },
        desc: {
          ru: "Потребовать второй фактор при входе с любого нового устройства и проверить привязанную почту восстановления.",
          ro: "Solicită al doilea factor la conectarea de pe orice dispozitiv nou și verifică emailul de recuperare.",
        },
        correct: true,
        feedback: {
          ru: "Рубеж 2 установлен! Двухфакторная защита (2FA) блокирует 99% автоматических взломов аккаунтов.",
          ro: "Linia 2 instalată! Autentificarea în 2 pași (2FA) blochează 99% dintre atacurile automate asupra conturilor.",
        },
      },
      {
        id: "2fa-none",
        title: {
          ru: "Отключить защиту входа, чтобы входить быстрее",
          ro: "Dezactivează verificarea la login pentru acces rapid",
        },
        desc: {
          ru: "Лишние коды только мешают быстро отвечать покупателям.",
          ro: "Codurile suplimentare doar încetinesc răspunsurile către clienți.",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Без 2FA любой перехваченный пароль сразу открывает злоумышленнику весь аккаунт.",
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
          ru: "Ни в коем случае! Резервные коды 2FA хранят только в защищённом месте офлайн или в менеджере паролей.",
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
          ru: "Рубеж 3 установлен! Тень полностью повержена (0% HP), а все покупатели вовремя предупреждены и защищены!",
          ro: "Linia 3 instalată! Umbra este complet învinsă (0% HP), iar toți clienții au fost avertizați la timp!",
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
