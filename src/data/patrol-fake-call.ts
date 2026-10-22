import type { PatrolLocale } from "./patrol";

export type ScannerSpot = {
  id: string;
  label: { ru: string; ro: string };
  sublabel: { ru: string; ro: string };
  isFlag: boolean;
  findingTitle: { ru: string; ro: string };
  findingDesc: { ru: string; ro: string };
};

export type WaveAttack = {
  id: string;
  callerQuote: { ru: string; ro: string };
  manipulationType: { ru: string; ro: string };
  correctShieldIndex: number;
  successFeedback: { ru: string; ro: string };
  wrongFeedback: { ru: string; ro: string };
};

export type SwitchNode = {
  id: string;
  title: { ru: string; ro: string };
  unsafeState: { ru: string; ro: string };
  safeState: { ru: string; ro: string };
  explanation: { ru: string; ro: string };
};

export type DuelRound = {
  id: string;
  shadowAttack: { ru: string; ro: string };
  cards: {
    id: string;
    title: { ru: string; ro: string };
    desc: { ru: string; ro: string };
    correct: boolean;
    feedback: { ru: string; ro: string };
  }[];
};

export const FAKE_CALL_STAGES_META: Record<
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
    stage2Shields: [string, string, string];
    stage3Title: string;
    stage3Subtitle: string;
    stage3SwitchBtn: string;
    stage3SwitchedBadge: string;
    stage4Title: string;
    stage4Subtitle: string;
    victoryTitle: string;
    victorySubtitle: string;
    victoryRules: string[];
  }
> = {
  ru: {
    categoryBadge: "КАТЕГОРИЯ · ЛОЖНЫЕ ВЫЗОВЫ И ПОДМЕНА НОМЕРА",
    npcBadge: "Друг · Школьный район · 4 этапа расследования (Phaser 3)",
    progressLabel: "Прогресс расследования",
    remainingLabel: "Осталось шагов",
    allDoneLabel: "Расследование завершено!",
    closeLabel: "Закрыть [Esc]",
    nextStageBtn: "Перейти к следующему этапу →",
    finishBtn: "Защитить Друга и вернуться в город ✓",
    stageNames: [
      "1. Сканер вызова",
      "2. Перехват волн",
      "3. Коммутатор",
      "4. Дуэль с Тенью",
    ],
    stage1Title: "Этап 1/4 · Сканер подмены номера (Caller ID Инспектор)",
    stage1Subtitle:
      "Наведи прицел сканера мышкой и нажми на зоны входящего звонка, чтобы просветить 3 скрытые улики подделки:",
    stage1ScanHint: "Кликни сканером по подозрительным зонам экрана телефона слева (найдено улик: ",
    stage2Title: "Этап 2/4 · Перехват радиоволн: Сбей манипуляцию в разговоре",
    stage2Subtitle:
      "Мошенник давит голосом! Выбирай правильный частотный щит внизу, чтобы разрушить все 3 звуковые волны обмана:",
    stage2Shields: [
      "Щит 1 · Стоп-паника (против срочности)",
      "Щит 2 · Против секретности и изоляции",
      "Щит 3 · Блок перевода денег и кодов",
    ],
    stage3Title: "Этап 3/4 · Коммутатор безопасности: Двухканальная проверка",
    stage3Subtitle:
      "Переключи все 3 узла телефонной цепи в безопасный режим, чтобы заблокировать фальшивый вызов и проверить друга по настоящему каналу:",
    stage3SwitchBtn: "Переключить узел в защиту ⚡",
    stage3SwitchedBadge: "Защищено ✓",
    stage4Title: "Этап 4/4 · Дуэль с телефонным мошенником: Контрольный вопрос",
    stage4Subtitle:
      "Тень-имитатор пытается дожать! Разыграй 2 верные карты подряд, чтобы обнулить маскировку мошенника (100 HP → 0 HP):",
    victoryTitle: "Ложный вызов разоблачён! Друг в безопасности!",
    victorySubtitle:
      "Ты прошёл все 4 этапа тренажёра на движке Phaser 3: проверил Caller ID, отбил голосовые манипуляции, настроил двухканальную проверку и победил Тень контрольным вопросом.",
    victoryRules: [
      "Имя и номер на экране можно подменить (спуфинг) — никогда не верь срочным просьбам о деньгах на слово.",
      "Мошенники всегда требуют двух вещей: «Быстрее!» (паника) и «Никому не говори!» (изоляция).",
      "При любом подозрительном звонке положи трубку и сам перезвони человеку по старому известному номеру.",
      "Используй личный контрольный вопрос, ответ на который знает только настоящий друг или член семьи.",
    ],
  },
  ro: {
    categoryBadge: "CATEGORIE · APELURI FALSE ȘI SPOOFING",
    npcBadge: "Prietenul · Cartierul Școlii · 4 etape de investigație (Phaser 3)",
    progressLabel: "Progresul investigației",
    remainingLabel: "Pași rămași",
    allDoneLabel: "Investigație finalizată!",
    closeLabel: "Închide [Esc]",
    nextStageBtn: "Treci la etapa următoare →",
    finishBtn: "Protejează Prietenul și revino în oraș ✓",
    stageNames: [
      "1. Scaner apel",
      "2. Scut unde",
      "3. Comutator",
      "4. Duel cu Umbra",
    ],
    stage1Title: "Etapa 1/4 · Scaner Caller ID (Inspectorul apelului)",
    stage1Subtitle:
      "Mișcă scanerul cu mouse-ul și apasă pe zonele apelului primit pentru a descoperi cele 3 indicii ascunse:",
    stage1ScanHint: "Apasă cu scanerul pe zonele suspecte ale telefonului din stânga (indicii găsite: ",
    stage2Title: "Etapa 2/4 · Interceptarea undelor: Oprește manipularea",
    stage2Subtitle:
      "Escrocul pune presiune! Alege scutul corect de jos pentru a distruge toate cele 3 unde sonore de manipulare:",
    stage2Shields: [
      "Scut 1 · Stop-panică (contra urgenței)",
      "Scut 2 · Contra secretomaniei și izolării",
      "Scut 3 · Blocare bani și coduri SMS",
    ],
    stage3Title: "Etapa 3/4 · Comutatorul de siguranță: Verificare prin 2 canale",
    stage3Subtitle:
      "Comută toate cele 3 noduri ale rețelei în modul sigur pentru a bloca apelul fals și a verifica prietenul pe canalul real:",
    stage3SwitchBtn: "Comută nodul în protecție ⚡",
    stage3SwitchedBadge: "Protejat ✓",
    stage4Title: "Etapa 4/4 · Duel cu escrocul telefonic: Întrebarea de control",
    stage4Subtitle:
      "Umbra încearcă să te păcălească! Joacă 2 cărți corecte la rând pentru a distruge masca escrocului (100 HP → 0 HP):",
    victoryTitle: "Apelul fals a fost demascat! Prietenul este în siguranță!",
    victorySubtitle:
      "Ai parcurs toate cele 4 etape Phaser 3: ai scanat Caller ID, ai blocat manipulările vocale, ai activat verificarea dublă și ai învins Umbra cu întrebarea de control.",
    victoryRules: [
      "Numele și numărul afișat pot fi falsificate (spoofing) — nu crede pe cuvânt cererile urgente de bani.",
      "Escrocii cer mereu două lucruri: «Repede!» (panică) și «Nu spune nimănui!» (izolare).",
      "La orice apel suspect, închide și sună tu înapoi pe numărul vechi, salvat în agendă.",
      "Folosește o întrebare de control personală, la care doar prietenul real știe răspunsul.",
    ],
  },
};

export const FAKE_CALL_SCANNER_SPOTS: ScannerSpot[] = [
  {
    id: "spot-avatar",
    label: {
      ru: "Профиль: «Максим (Школа)»",
      ro: "Profil: «Maxim (Școală)»",
    },
    sublabel: {
      ru: "Аватарка и карточка абонента",
      ro: "Avatarul și cardul apelantului",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 1: Дубликат аккаунта",
      ro: "Indiciul 1: Cont duplicat",
    },
    findingDesc: {
      ru: "Сканер показал: аккаунт создан 15 минут назад, фото скопировано из соцсети, а переписки с настоящим другом в нём нет!",
      ro: "Scanerul arată: contul a fost creat acum 15 minute, poza e copiată, iar istoricul conversațiilor lipsește!",
    },
  },
  {
    id: "spot-number",
    label: {
      ru: "Линия: +373 (???) → Шлюз SIP",
      ro: "Linie: +373 (???) → Gateway SIP",
    },
    sublabel: {
      ru: "Маршрут входящего номера",
      ro: "Ruta numărului apelant",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 2: Подмена номера (Spoofing)",
      ro: "Indiciul 2: Falsificarea numărului (Spoofing)",
    },
    findingDesc: {
      ru: "Под подписью «Друг» скрывается одноразовый интернет-шлюз +44 7911 ***. Настоящая SIM-карта друга не звонила!",
      ro: "Sub numele «Prieten» se ascunde un gateway online +44 7911 ***. Cartela SIM reală a prietenului nu a apelat!",
    },
  },
  {
    id: "spot-voice",
    label: {
      ru: "Аудиопоток: «Абонент в панике»",
      ro: "Flux audio: «Apelant în panică»",
    },
    sublabel: {
      ru: "Спектр голоса и фоновых помех",
      ro: "Spectrul vocii și zgomotul de fond",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 3: Искусственные помехи и чужой тембр",
      ro: "Indiciul 3: Zgomot artificial și timbru străin",
    },
    findingDesc: {
      ru: "Мошенники специально добавляют шум улицы или сирены, чтобы ты не заметил подделку голоса.",
      ro: "Escrocii adaugă intenționat zgomot de fond pentru a masca faptul că vocea nu este a prietenului tău.",
    },
  },
  {
    id: "spot-clock",
    label: {
      ru: "Индикатор связи: 00:18 · LTE",
      ro: "Indicator rețea: 00:18 · LTE",
    },
    sublabel: {
      ru: "Системные часы смартфона",
      ro: "Ceasul de sistem al telefonului",
    },
    isFlag: false,
    findingTitle: {
      ru: "Нейтральная зона: системный статус",
      ro: "Zonă neutră: status de sistem",
    },
    findingDesc: {
      ru: "Это обычный индикатор уровня сети твоего телефона. Наведи сканер на профиль, маршрут номера и аудиопоток!",
      ro: "Acesta este doar indicatorul de semnal al telefonului tău. Scanează profilul, ruta numărului și fluxul audio!",
    },
  },
];

export const FAKE_CALL_WAVES: WaveAttack[] = [
  {
    id: "wave-panic",
    callerQuote: {
      ru: "«СРОЧНО! Я разбил чужой ноутбук в школе, у меня есть 3 минуты, иначе вызовут полицию!»",
      ro: "«URGENT! Am spart un laptop străin la școală, am doar 3 minute, altfel cheamă poliția!»",
    },
    manipulationType: {
      ru: "Тип атаки: Искусственная паника и цейтнот",
      ro: "Tipul atacului: Panică artificială și presiune de timp",
    },
    correctShieldIndex: 0,
    successFeedback: {
      ru: "Волна паники сбита! Когда тебя торопят со словами «осталось 3 минуты» — это главный приём отключения критического мышления.",
      ro: "Unda de panică a fost oprită! Când cineva te grăbește cu «ai 3 minute», încearcă să-ți blocheze gândirea critică.",
    },
    wrongFeedback: {
      ru: "Не тот щит! Здесь мошенник давит именно на срочность и панику («3 минуты до полиции»). Выбери Щит 1!",
      ro: "Scut greșit! Aici escrocul folosește urgența și panica («3 minute»). Alege Scutul 1!",
    },
  },
  {
    id: "wave-secrecy",
    callerQuote: {
      ru: "«Только умоляю: НЕ звони моим родителям и никому из учителей не говори, это тайна!»",
      ro: "«Te implor: NU-mi suna părinții și nu spune niciunui profesor, trebuie să rămână secret!»",
    },
    manipulationType: {
      ru: "Тип атаки: Изоляция жертвы от проверенных взрослых",
      ro: "Tipul atacului: Izolarea victimei de adulții de încredere",
    },
    correctShieldIndex: 1,
    successFeedback: {
      ru: "Волна изоляции разрушена! Мошенники запрещают звонить родителям или друзьям, потому что один звонок сразу вскроет обман.",
      ro: "Unda de izolare a fost distrusă! Escrocii interzic apelarea părinților fiindcă o singură verificare demască minciuna.",
    },
    wrongFeedback: {
      ru: "Посмотри на смысл фразы: мошенник запрещает рассказывать взрослым и изолирует тебя. Выбери Щит 2!",
      ro: "Privește sensul frazei: escrocul încearcă să te izoleze și îți cere secretomanie. Alege Scutul 2!",
    },
  },
  {
    id: "wave-money",
    callerQuote: {
      ru: "«Переведи 500 леев на эту чужую карту прямо сейчас и продиктуй код подтверждения!»",
      ro: "«Transferă 500 de lei pe acest card străin chiar acum și dictează-mi codul de confirmare!»",
    },
    manipulationType: {
      ru: "Тип атаки: Выманивание перевода на подставное лицо (дропа)",
      ro: "Tipul atacului: Cererea de bani pe un card străin și codul SMS",
    },
    correctShieldIndex: 2,
    successFeedback: {
      ru: "Все 3 волны манипуляций отбиты! Требование перевода на чужую карту и кода из SMS — финальная цель любого ложного звонка.",
      ro: "Toate cele 3 unde au fost oprite! Cererea de bani pe un card străin și codul SMS reprezintă scopul final al apelului fals.",
    },
    wrongFeedback: {
      ru: "Здесь мошенник напрямую требует перевод денег и код из SMS. Активируй Щит 3!",
      ro: "Aici escrocul cere direct bani și codul din SMS. Activează Scutul 3!",
    },
  },
];

export const FAKE_CALL_SWITCH_NODES: SwitchNode[] = [
  {
    id: "node-quarantine",
    title: {
      ru: "Узел 1 · Входящий подозрительный звонок",
      ro: "Nodul 1 · Apelul suspect primit",
    },
    unsafeState: {
      ru: "Режим: Продолжать слушать и верить на слово",
      ro: "Mod: Continuă conversația și crede pe cuvânt",
    },
    safeState: {
      ru: "Режим: Сбросить вызов и отправить линию в карантин ✓",
      ro: "Mod: Închide apelul și trimite linia în carantină ✓",
    },
    explanation: {
      ru: "Первый шаг против телефонного мошенника — разорвать контакт, чтобы он не мог продолжать психологическое давление.",
      ro: "Primul pas contra escrocului telefonic este întreruperea apelului pentru a opri presiunea psihologică.",
    },
  },
  {
    id: "node-callback",
    title: {
      ru: "Узел 2 · Проверка по известному номеру из контактов",
      ro: "Nodul 2 · Verificare pe numărul cunoscut din agendă",
    },
    unsafeState: {
      ru: "Режим: Перезвонить в тот же подозрительный чат",
      ro: "Mod: Sună înapoi în același chat suspect",
    },
    safeState: {
      ru: "Режим: Набрать старый проверенный номер друга вручную ✓",
      ro: "Mod: Apelează manual numărul vechi și verificat al prietenului ✓",
    },
    explanation: {
      ru: "Звонок по сохранённому ранее номеру соединит тебя с настоящим другом, а не с подставным аккаунтом мошенников.",
      ro: "Apelul pe numărul salvat anterior te conectează cu prietenul real, nu cu contul fals al escrocilor.",
    },
  },
  {
    id: "node-adults",
    title: {
      ru: "Узел 3 · Подтверждение через второго свидетеля",
      ro: "Nodul 3 · Confirmare printr-un al doilea canal",
    },
    unsafeState: {
      ru: "Режим: Держать ситуацию в секрете, как просил звонящий",
      ro: "Mod: Păstrează secretul, așa cum a cerut apelantul",
    },
    safeState: {
      ru: "Режим: Сообщить родителям или классному руководителю ✓",
      ro: "Mod: Anunță părinții sau dirigintele ✓",
    },
    explanation: {
      ru: "Обсуждение со взрослыми или общими друзьями за 1 минуту разрушает любую легенду про «аварию» или «полицию».",
      ro: "Discuția cu părinții sau profesorii distruge în 1 minut orice poveste falsă despre «accident» sau «poliție».",
    },
  },
];

export const FAKE_CALL_DUEL_ROUNDS: DuelRound[] = [
  {
    id: "duel-1",
    shadowAttack: {
      ru: "Тень-Имитатор: «Да это точно я, Максим! Просто связь плохая и голос сел. Не задавай вопросов, скинь 500 леев!»",
      ro: "Umbra-Imitator: «Sunt chiar eu, Maxim! Doar că e semnalul slab și sunt răgușit. Nu pune întrebări, trimite 500 lei!»",
    },
    cards: [
      {
        id: "c1-control-q",
        title: {
          ru: "Карта: Контрольный вопрос другу",
          ro: "Carte: Întrebare de control",
        },
        desc: {
          ru: "«Раз это ты — скажи, на каком уроке мы сидели вчера за одной партой и как зовут твоего пса?»",
          ro: "«Dacă ești tu — spune la ce lecție am stat ieri în aceeași bancă și cum îl cheamă pe câinele tău?»",
        },
        correct: true,
        feedback: {
          ru: "КРИТИЧЕСКИЙ УДАР (−50 HP)! Мошенник не знает личных деталей из вашей жизни и начинает путаться!",
          ro: "LOVITURĂ CRITICĂ (−50 HP)! Escrocul nu cunoaște detaliile voastre personale și începe să se încurce!",
        },
      },
      {
        id: "c1-believe",
        title: {
          ru: "Карта: Поверить, что голос просто охрип",
          ro: "Carte: Crede că doar a răgușit",
        },
        desc: {
          ru: "«Ладно, со связью всякое бывает, диктуй куда переводить деньги…»",
          ro: "«Bine, se mai întâmplă cu semnalul, spune unde să trimit banii…»",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Оправдание «плохой связью» и «простудой» — стандартная заготовка мошенников. Выбери карту контрольного вопроса!",
          ro: "Periculos! Scuza cu «semnalul slab» sau «răgușeala» este un truc clasic. Alege cartea cu întrebarea de control!",
        },
      },
      {
        id: "c1-half",
        title: {
          ru: "Карта: Отправить половину суммы (250 леев)",
          ro: "Carte: Trimite jumătate din sumă (250 lei)",
        },
        desc: {
          ru: "«Переведу пока 250 леев на всякий случай, вдруг правда беда»",
          ro: "«Trimit 250 lei pentru orice eventualitate»",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Любой перевод мошенникам уходит безвозвратно, а они тут же потребуют ещё. Используй контрольный вопрос!",
          ro: "Greșit! Orice sumă trimisă escrocilor este pierdută. Folosește întrebarea de control!",
        },
      },
    ],
  },
  {
    id: "duel-2",
    shadowAttack: {
      ru: "Тень-Имитатор (маскировка трещит): «Э-э… не помню про собаку! Быстрее назови код из SMS, иначе всё пропало!»",
      ro: "Umbra-Imitator (masca se destramă): «Ăă… nu-mi amintesc! Spune mai repede codul din SMS, altfel ești în pericol!»",
    },
    cards: [
      {
        id: "c2-hangup-call",
        title: {
          ru: "Карта: Сбросить вызов и набрать настоящий номер",
          ro: "Carte: Închide și sună pe numărul real",
        },
        desc: {
          ru: "Положить трубку, заблокировать самозванца и позвонить настоящему Максиму по сохранённому номеру",
          ro: "Închide apelul, blochează impostorul și sună-l pe Maxim pe numărul salvat în agendă",
        },
        correct: true,
        feedback: {
          ru: "ПОБЕДА (−50 HP → 0 HP)! Настоящий Максим спокойно сидит дома, а маскировка телефонного мошенника полностью уничтожена!",
          ro: "VICTORIE (−50 HP → 0 HP)! Adevăratul Maxim este acasă în siguranță, iar masca escrocului a fost complet distrusă!",
        },
      },
      {
        id: "c2-code",
        title: {
          ru: "Карта: Продиктовать код из SMS",
          ro: "Carte: Dictează codul din SMS",
        },
        desc: {
          ru: "Назвать 4 цифры кода, которые только что пришли на телефон",
          ro: "Spune cele 4 cifre primite prin SMS",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Код из SMS никогда нельзя называть ни «другу», ни «банку», ни «полиции». Разыграй карту сброса и перезвона!",
          ro: "Periculos! Codul din SMS nu se comunică nimănui. Joacă cartea de închidere și reapelare pe numărul real!",
        },
      },
      {
        id: "c2-argue",
        title: {
          ru: "Карта: Продолжать спорить с мошенником на линии",
          ro: "Carte: Continuă cearta cu escrocul la telefon",
        },
        desc: {
          ru: "Оставаться на линии и пытаться пристыдить звонящего",
          ro: "Rămâi pe linie și încearcă să te cerți cu apelantul",
        },
        correct: false,
        feedback: {
          ru: "Не трать время на разговор с мошенником (они могут записывать твой голос). Правильный ход — сбросить вызов и перезвонить другу!",
          ro: "Nu pierde timpul discutând cu escrocul (îți poate înregistra vocea). Închide și sună-ți prietenul pe numărul real!",
        },
      },
    ],
  },
];
