import { SAFETY_PHRASES } from "./safety-phrases";

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
    introActionBtn: string;
    nextStageBtn: string;
    finishBtn: string;
    stageNames: [string, string, string, string];
    stage1Title: string;
    stage1Subtitle: string;
    stage1ScanHint: string;
    stage1IncomingBadge: string;
    stage1UnscannedClue: (n: number) => string;
    stage1FeedbackDefault: string;
    stage1ClueBadge: string;
    stage1ScanBadge: string;
    stage1NeutralBadge: string;
    stage2Title: string;
    stage2Subtitle: string;
    stage2Shields: [string, string, string];
    stage2WaveCounter: (current: number, total: number) => string;
    stage2FeedbackDefault: string;
    stage2NextWaveBtn: string;
    stage3Title: string;
    stage3Subtitle: string;
    stage3SwitchBtn: string;
    stage3SwitchedBadge: string;
    stage4Title: string;
    stage4Subtitle: string;
    stage4HpLabel: (hp: number) => string;
    stage4SelectCardHint: string;
    stage4PlayCardBtn: string;
    victoryTitle: string;
    victoryRetryNotice: string;
    victorySubtitle: string;
    victoryRules: string[];
  }
> = {
  ru: {
    categoryBadge: "КАТЕГОРИЯ · ЛОЖНЫЕ ВЫЗОВЫ И ПОДМЕНА НОМЕРА",
    npcBadge: "Максим · Школьный район · 4 этапа расследования",
    progressLabel: "Прогресс расследования",
    remainingLabel: "Осталось шагов",
    allDoneLabel: "Расследование завершено!",
    closeLabel: "Закрыть",
    introActionBtn: "Разобраться",
    nextStageBtn: "Перейти к следующему этапу →",
    finishBtn: "Защитить Максима и вернуться в город ✓",
    stageNames: [
      "1. Сканер вызова",
      "2. Перехват волн",
      "3. Коммутатор",
      "4. Дуэль с Тенью",
    ],
    stage1Title: "Этап 1/4 · Проверка входящего звонка",
    stage1Subtitle:
      "Важно: в реальной жизни такого сканера нет. Подменённый номер выглядит на экране точно как настоящий — даже с именем из твоих контактов. Единственная надёжная проверка — положить трубку и самому позвонить другу по сохранённому номеру.",
    stage1ScanHint: "Кликни сканером по подозрительным зонам экрана телефона слева (найдено улик: ",
    stage1IncomingBadge: "ВХОДЯЩИЙ ВЫЗОВ · ПРОВЕРКА",
    stage1UnscannedClue: (n: number) => `○ Улика №${n} (ещё не проверена)`,
    stage1FeedbackDefault: "Проверь зоны смартфона слева",
    stage1ClueBadge: "УЛИКА ✓",
    stage1ScanBadge: "🔍 ПРОВЕРИТЬ",
    stage1NeutralBadge: "НЕЙТРАЛЬНО",
    stage2Title: "Этап 2/4 · Перехват радиоволн: Сбей манипуляцию в разговоре",
    stage2Subtitle:
      "Мошенник давит голосом! Выбирай правильный частотный щит внизу, чтобы разрушить все 3 звуковые волны обмана:",
    stage2Shields: [
      "Щит 1 · Стоп-паника (против срочности)",
      "Щит 2 · Против секретности и изоляции",
      "Щит 3 · Блок перевода денег и кодов",
    ],
    stage2WaveCounter: (current: number, total: number) =>
      `Звуковая волна ${current} из ${total} · Манипуляция мошенника`,
    stage2FeedbackDefault: "Выбери ниже правильный защитный щит, чтобы погасить волну:",
    stage2NextWaveBtn: "Перейти к следующей звуковой волне →",
    stage3Title: "Этап 3/4 · Коммутатор безопасности: Двухканальная проверка",
    stage3Subtitle:
      "Переключи все 3 узла телефонной цепи в безопасный режим, чтобы заблокировать фальшивый вызов и проверить друга по настоящему каналу:",
    stage3SwitchBtn: "Переключить узел в защиту ⚡",
    stage3SwitchedBadge: "Защищено ✓",
    stage4Title: "Этап 4/4 · Дуэль с телефонным мошенником: Контрольный вопрос",
    stage4Subtitle:
      "Тень-имитатор пытается дожать! Разыграй 2 верные карты подряд, чтобы обнулить маскировку мошенника (Жизни: 100 → 0):",
    stage4HpLabel: (hp: number) => `Маскировка Тени · Жизни: ${hp}`,
    stage4SelectCardHint: "Выбери карту контр-приёма ниже:",
    stage4PlayCardBtn: "⚡ Разыграть карту",
    victoryTitle: "Ложный вызов разоблачён! Максим в безопасности!",
    victoryRetryNotice: "Ты справился, но с ошибками. Пройди ещё раз",
    victorySubtitle:
      "Ты прошёл все 4 этапа тренажёра: разобрал уловки звонка, отбил голосовые манипуляции, настроил двухканальную проверку и победил Тень контрольным вопросом.",
    victoryRules: [
      "Имя и номер звонящего на экране можно подменить (подмена номера) — никогда не верь срочным просьбам о деньгах на слово.",
      "Мошенники часто давят двумя приёмами: «Быстрее!» (паника) и «Никому не говори!» (изоляция). Но даже спокойная просьба о деньгах или коде требует проверки.",
      "При любом подозрительном звонке положи трубку и сам позвони человеку по старому известному номеру.",
      "Используй личный контрольный вопрос, ответ на который знает только настоящий друг или член семьи и ответ на который нельзя найти в соцсетях.",
    ],
  },
  ro: {
    categoryBadge: "CATEGORIE · APELURI FALSE ȘI FALSIFICAREA NUMĂRULUI",
    npcBadge: "Maxim · Cartierul Școlii · 4 etape de investigație",
    progressLabel: "Progresul investigației",
    remainingLabel: "Pași rămași",
    allDoneLabel: "Investigație finalizată!",
    closeLabel: "Închide",
    introActionBtn: "Să verificăm",
    nextStageBtn: "Treci la etapa următoare →",
    finishBtn: "Protejează-l pe Maxim și revino în oraș ✓",
    stageNames: [
      "1. Scaner apel",
      "2. Scut unde",
      "3. Comutator",
      "4. Duel cu Umbra",
    ],
    stage1Title: "Etapa 1/4 · Verificarea apelului primit",
    stage1Subtitle:
      "Atenție: în viața reală un astfel de scaner nu există. Numărul falsificat arată pe ecran exact ca cel real — chiar și cu numele din agenda ta. Singura verificare sigură este să închizi și să-l suni tu pe prieten la numărul salvat.",
    stage1ScanHint: "Apasă cu scanerul pe zonele suspecte ale telefonului din stânga (indicii găsite: ",
    stage1IncomingBadge: "APEL DE INTRARE · VERIFICARE",
    stage1UnscannedClue: (n: number) => `○ Indiciul #${n} (neverificat)`,
    stage1FeedbackDefault: "Verifică zonele telefonului din stânga",
    stage1ClueBadge: "INDICIU ✓",
    stage1ScanBadge: "🔍 VERIFICĂ",
    stage1NeutralBadge: "NEUTRU",
    stage2Title: "Etapa 2/4 · Interceptarea undelor: Oprește manipularea",
    stage2Subtitle:
      "Escrocul pune presiune! Alege scutul corect de jos pentru a distruge toate cele 3 unde sonore de manipulare:",
    stage2Shields: [
      "Scut 1 · Stop-panică (contra urgenței)",
      "Scut 2 · Contra secretomaniei și izolării",
      "Scut 3 · Blocare bani și coduri SMS",
    ],
    stage2WaveCounter: (current: number, total: number) =>
      `Unda sonoră ${current} din ${total} · Manipularea apelantului`,
    stage2FeedbackDefault: "Alege mai jos scutul potrivit pentru a opri unda:",
    stage2NextWaveBtn: "Următoarea undă sonoră →",
    stage3Title: "Etapa 3/4 · Comutatorul de siguranță: Verificare prin 2 canale",
    stage3Subtitle:
      "Comută toate cele 3 noduri ale rețelei în modul sigur pentru a bloca apelul fals și a verifica prietenul pe canalul real:",
    stage3SwitchBtn: "Comută nodul în protecție ⚡",
    stage3SwitchedBadge: "Protejat ✓",
    stage4Title: "Etapa 4/4 · Duel cu escrocul telefonic: Întrebarea de control",
    stage4Subtitle:
      "Umbra încearcă să te păcălească! Joacă 2 cărți corecte la rând pentru a distruge masca escrocului (Vieți: 100 → 0):",
    stage4HpLabel: (hp: number) => `Masca Umbrei · Vieți: ${hp}`,
    stage4SelectCardHint: "Alege o carte de contraatac mai jos:",
    stage4PlayCardBtn: "⚡ Joacă cartea",
    victoryTitle: "Apelul fals a fost demascat! Maxim este în siguranță!",
    victoryRetryNotice: "Ai reușit, dar cu greșeli. Mai încearcă",
    victorySubtitle:
      "Ai parcurs toate cele 4 etape: ai verificat apelul, ai blocat manipulările vocale, ai activat verificarea dublă și ai învins Umbra cu întrebarea de control.",
    victoryRules: [
      "Numele și numărul apelantului pot fi falsificate (falsificarea numărului) — nu crede pe cuvânt cererile urgente de bani.",
      "Escrocii folosesc des două trucuri: «Repede!» (panică) și «Nu spune nimănui!» (izolare). Dar și o cerere calmă de bani sau coduri trebuie verificată.",
      "La orice apel suspect, închide și sună tu pe numărul vechi, salvat în agendă.",
      "Folosește o întrebare de control personală, la care doar prietenul real știe răspunsul, al cărei răspuns nu poate fi găsit pe rețelele sociale.",
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
      ru: "Номер не из твоих контактов, звонок в мессенджере",
      ro: "Numărul nu e în agenda ta, apel prin messenger",
    },
    sublabel: {
      ru: "Неизвестное устройство",
      ro: "Dispozitiv necunoscut",
    },
    isFlag: true,
    findingTitle: {
      ru: "Номер не из твоих контактов, звонок в мессенджере",
      ro: "Numărul nu e în agenda ta, apel prin messenger",
    },
    findingDesc: {
      ru: "Друг звонит с нового номера и сразу просит деньги — повод проверить",
      ro: "Prietenul sună de pe un număr nou și cere imediat bani — motiv de verificare",
    },
  },
  {
    id: "spot-voice",
    label: {
      ru: "Аудиопоток: «Абонент в панике»",
      ro: "Flux audio: «Apelant în panică»",
    },
    sublabel: {
      ru: "Фоновый шум и паника в голосе",
      ro: "Zgomot de fond și panică în voce",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 3: Шум и паника мешают узнать голос",
      ro: "Indiciul 3: Zgomotul și panica împiedică recunoașterea vocii",
    },
    findingDesc: {
      ru: "Шум и паника мешают узнать голос, а голос можно подделать",
      ro: "Zgomotul și panica împiedică recunoașterea vocii, iar vocea poate fi falsificată",
    },
  },
  {
    id: "spot-clock",
    label: {
      ru: "Индикатор связи: 00:18",
      ro: "Indicator rețea: 00:18",
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
      ru: "Не тот щит! Здесь мошенник давит именно на срочность и панику («3 минуты до полиции»). Подумай: какая защита остановит именно эту уловку?",
      ro: "Scut greșit! Aici escrocul folosește urgența și panica («3 minute»). Gândește-te: ce protecție oprește exact această capcană?",
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
      ru: "Посмотри на смысл фразы: мошенник запрещает рассказывать взрослым и изолирует тебя. Подумай: какая защита остановит именно эту уловку?",
      ro: "Privește sensul frazei: escrocul încearcă să te izoleze și îți cere secretomanie. Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
  {
    id: "wave-money",
    callerQuote: {
      ru: "«Переведи 500 леев на эту чужую карту прямо сейчас и продиктуй код подтверждения!»",
      ro: "«Transferă 500 de lei pe acest card străin chiar acum și dictează-mi codul de confirmare!»",
    },
    manipulationType: {
      ru: "Тип атаки: Выманивание перевода на карту постороннего человека",
      ro: "Tipul atacului: Cererea de bani pe cardul unei persoane străine",
    },
    correctShieldIndex: 2,
    successFeedback: {
      ru: "Все 3 волны манипуляций отбиты! Требование перевода на чужую карту и кода из SMS — финальная цель любого ложного звонка.",
      ro: "Toate cele 3 unde au fost oprite! Cererea de bani pe un card străin și codul SMS reprezintă scopul final al apelului fals.",
    },
    wrongFeedback: {
      ru: "Здесь мошенник напрямую требует перевод денег и код из SMS. Подумай: какая защита остановит именно эту уловку?",
      ro: "Aici escrocul cere direct bani și codul din SMS. Gândește-te: ce protecție oprește exact această capcană?",
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
      ru: "Узел 3 · Рассказать взрослым, которым доверяешь",
      ro: "Nodul 3 · Spune unui adult de încredere",
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
      ru: "Обсуждение с теми, кому доверяешь (родители, учитель или общие друзья), за 1 минуту разрушает любую легенду про «аварию» или «полицию».",
      ro: "Discuția cu părinții, profesorii sau prietenii comuni distruge în 1 minut orice poveste falsă despre «accident» sau «poliție».",
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
          ru: "«Раз это ты — скажи, какое у нас с тобой секретное слово, о котором мы договорились заранее?»",
          ro: "«Dacă ești tu — spune care e cuvântul nostru secret, stabilit dinainte?»",
        },
        correct: true,
        feedback: {
          ru: "КРИТИЧЕСКИЙ УДАР (−50 жизней)! Мошенник не знает личных деталей из вашей жизни и начинает путаться!",
          ro: "LOVITURĂ CRITICĂ (−50 vieți)! Escrocul nu cunoaște detaliile voastre personale și începe să se încurce!",
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
          ru: "ПОБЕДА (Жизни: 0)! Настоящий Максим спокойно сидит дома, а маскировка телефонного мошенника полностью уничтожена!",
          ro: "VICTORIE (Vieți: 0)! Adevăratul Maxim este acasă în siguranță, iar masca escrocului a fost complet distrusă!",
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
          ru: `Опасно! ${SAFETY_PHRASES.ru.smsCode}`,
          ro: `Periculos! ${SAFETY_PHRASES.ro.smsCode}`,
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
          ru: "Не трать время на разговор с мошенником (они могут записывать твой голос). Правильный ход — сбросить вызов и самому позвонить другу по сохранённому номеру!",
          ro: "Nu pierde timpul discutând cu escrocul (îți poate înregistra vocea). Închide și sună-ți prietenul pe numărul real!",
        },
      },
    ],
  },
];
