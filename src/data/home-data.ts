export type Lang = "ro" | "ru";

export type Mission = {
  id: number;
  status: "playable" | "soon";
  color: string;
  icon:
    | "user-lock"
    | "phone-call"
    | "gift"
    | "scan-face"
    | "languages"
    | "map-pin"
    | "shield-alert"
    | "link-2-off";
  title: Record<Lang, string>;
  teaser: Record<Lang, string>;
  side: "left" | "right";
};

export const missions: Mission[] = [
  {
    id: 1,
    status: "playable",
    color: "var(--neon)",
    icon: "phone-call",
    side: "left",
    title: { ro: "Apelul fals de la operator", ru: "Фальшивый звонок оператора" },
    teaser: {
      ro: "Un «operator» te sună și cere codul din SMS.",
      ru: "«Оператор» звонит и просит код из SMS.",
    },
  },
  {
    id: 2,
    status: "soon",
    color: "var(--gold)",
    icon: "link-2-off",
    side: "left",
    title: { ro: "Capcana linkului fals", ru: "Ловушка фальшивой ссылки" },
    teaser: {
      ro: "Un QR duce la o pagină de autentificare aproape identică cu cea reală.",
      ru: "QR-код ведёт на страницу входа, почти неотличимую от настоящей.",
    },
  },
  {
    id: 3,
    status: "soon",
    color: "var(--danger)",
    icon: "user-lock",
    side: "left",
    title: { ro: "Contul compromis", ru: "Взломанный аккаунт" },
    teaser: {
      ro: "Parola ta a apărut într-o scurgere de date. Vei învăța să recunoști și să protejezi un cont compromis.",
      ru: "Твой пароль попал в утечку. Ты научишься распознавать взлом и защищать аккаунт.",
    },
  },
  {
    id: 4,
    status: "soon",
    color: "var(--gold)",
    icon: "gift",
    side: "left",
    title: { ro: "Scam sau ofertă reală?", ru: "Скам или реальное предложение?" },
    teaser: {
      ro: "Un premiu, un job și un grant îți apar în aceeași zi. Doar unul este real.",
      ru: "Приз, вакансия и грант приходят в один день. Реален только один.",
    },
  },
  {
    id: 5,
    status: "soon",
    color: "var(--violet)",
    icon: "scan-face",
    side: "right",
    title: { ro: "Deepfake Detective", ru: "Детектив дипфейков" },
    teaser: {
      ro: "Un video manipulat circulă în oraș.",
      ru: "По городу разошлось поддельное видео.",
    },
  },
  {
    id: 6,
    status: "soon",
    color: "var(--success)",
    icon: "languages",
    side: "right",
    title: { ro: "Detectivul bilingv", ru: "Двуязычный детектив" },
    teaser: {
      ro: "Același mesaj, două limbi, alte emoții.",
      ru: "Одно сообщение, два языка, разные эмоции.",
    },
  },
  {
    id: 7,
    status: "soon",
    color: "var(--neon-soft)",
    icon: "map-pin",
    side: "right",
    title: { ro: "Orașul sub asediul zvonurilor", ru: "Город под осадой слухов" },
    teaser: {
      ro: "Un zvon pornește dintr-un grup de cartier și ajunge în tot orașul.",
      ru: "Слух стартует в районном чате и быстро охватывает весь город.",
    },
  },
  {
    id: 8,
    status: "soon",
    color: "var(--violet)",
    icon: "shield-alert",
    side: "right",
    title: { ro: "Apără comunitatea de troli", ru: "Защити сообщество от троллей" },
    teaser: {
      ro: "Învață să răspunzi la agresiune fără să alimentezi conflictul.",
      ru: "Научись отвечать на агрессию, не разжигая конфликт.",
    },
  },
];

export const caseSlides = [
  {
    id: 1,
    description: {
      ro: "Umbra sună locuitorii în numele operatorului și cere codul primit prin SMS.",
      ru: "Тень звонит жителям от имени оператора и просит сообщить код из SMS.",
    },
    objective: {
      ro: "Recunoaște presiunea, protejează codurile și verifică apelul prin canalul oficial.",
      ru: "Распознай давление, защити коды и проверь звонок через официальный канал.",
    },
  },
  {
    id: 2,
    description: {
      ro: "Un link sau un cod QR conduce spre o copie aproape perfectă a unei pagini cunoscute.",
      ru: "Ссылка или QR-код ведёт на почти идеальную копию знакомой страницы.",
    },
    objective: {
      ro: "Verifică domeniul, adresa și semnele unei pagini create pentru furtul datelor.",
      ru: "Проверь домен, адрес и признаки страницы, созданной для кражи данных.",
    },
  },
  {
    id: 3,
    description: {
      ro: "Parola unui membru al comunității apare într-o scurgere, iar contul începe să trimită mesaje stranii.",
      ru: "Пароль участника сообщества попадает в утечку, а аккаунт начинает отправлять странные сообщения.",
    },
    objective: {
      ro: "Recuperează contul, schimbă parola și activează autentificarea în doi pași.",
      ru: "Верни доступ, смени пароль и включи двухэтапную проверку.",
    },
  },
  {
    id: 4,
    description: {
      ro: "Un premiu, un loc de muncă și un grant apar în aceeași zi, dar numai o ofertă este reală.",
      ru: "Приз, вакансия и грант появляются в один день, но настоящее предложение только одно.",
    },
    objective: {
      ro: "Compară sursele și separă oportunitatea reală de promisiunile frauduloase.",
      ru: "Сравни источники и отличи реальную возможность от мошеннических обещаний.",
    },
  },
  {
    id: 5,
    description: {
      ro: "În oraș circulă un videoclip în care o persoană cunoscută pare să facă o declarație șocantă.",
      ru: "По городу распространяется видео, где известный человек будто бы делает шокирующее заявление.",
    },
    objective: {
      ro: "Caută artefacte vizuale, verifică sursa și confirmă contextul videoclipului.",
      ru: "Найди визуальные артефакты, проверь источник и контекст видео.",
    },
  },
  {
    id: 6,
    description: {
      ro: "Același mesaj este distribuit în română și rusă, dar traducerile provoacă reacții foarte diferite.",
      ru: "Одно сообщение распространяют на русском и румынском, но переводы вызывают разные реакции.",
    },
    objective: {
      ro: "Compară sensul, tonul și formulările pentru a descoperi manipularea prin traducere.",
      ru: "Сравни смысл, тон и формулировки, чтобы раскрыть манипуляцию переводом.",
    },
  },
  {
    id: 7,
    description: {
      ro: "Un zvon pornit într-un grup local se răspândește rapid și începe să influențeze întregul oraș.",
      ru: "Слух из местного чата быстро распространяется и начинает влиять на весь город.",
    },
    objective: {
      ro: "Urmărește traseul informației și oprește distribuirea înainte ca zvonul să devină panică.",
      ru: "Проследи путь информации и останови распространение до того, как слух вызовет панику.",
    },
  },
  {
    id: 8,
    description: {
      ro: "Conturi coordonate atacă discuțiile comunității și încearcă să transforme dezacordul în conflict.",
      ru: "Скоординированные аккаунты атакуют обсуждения сообщества и превращают разногласия в конфликт.",
    },
    objective: {
      ro: "Răspunde calm, documentează atacul și protejează comunitatea fără să alimentezi provocarea.",
      ru: "Отвечай спокойно, фиксируй атаку и защищай сообщество, не поддаваясь на провокацию.",
    },
  },
] as const;

export const strings = {
  ro: {
    tagline: "Scutul comunității digitale",
    motto: "Observă. Verifică. Protejează comunitatea.",
    startInvestigation: "Începe investigația",
    aiHelp: "Ajutor online AI",
    openMission: "Deschide",
    xp: "XP",
    playable: "Disponibil",
    soon: "În curând",
    shieldProgress: "Integritatea scutului orașului",
    storyTitle: "Dosarul: Umbra",
    story:
      "Orașul s-a conectat la Rețeaua Comunității. Dar în rețea a apărut un actor anonim — Umbra: sparge conturi, sună locuitorii în numele operatorilor, publică video falsificate și seamănă zvonuri între vorbitorii de română și de rusă.",
    story2:
      "Protocolul-străjer VIG (Vigilent) s-a trezit, dar nu poate lupta singur. Patrula InfoQuest — șase mentori ai comunității — te recrutează ca detectiv-stagiar. Închide cele 5 fisuri principale ale scutului și alungă Umbra din rețea.",
    badges: "Insigne",
    badgeNames: [
      "Insigna «Linie sigură»",
      "Insigna «Expert în linkuri»",
      "Insigna «Gardianul contului»",
      "Insigna «Analistul ofertelor»",
      "Insigna «Ochi digital»",
      "Insigna «Pod lingvistic»",
      "Insigna «Detector de zvonuri»",
      "Insigna «Scutul comunității»",
    ],
    finalBadge: "Scutul complet",
    finalBadgeHint:
      "Finalizează cele 8 misiuni și colectează toate cele 8 insigne pentru a reface scutul orașului.",
    heroLead: "Un joc educațional bilingv pentru elevi, profesori, familii și întreaga comunitate.",
    heroSub: "Învață să recunoști fraudele, dezinformarea, deepfake-urile și pericolele digitale.",
    teamLogo: "Sigla echipei",
    qrCode: "Cod QR",
    projectTeam: "Membrii echipei",
    demo: "Demonstrația jocului",
    projectMaterials: "Materialele proiectului",
    projectMaterialsHint: "Resurse pentru prezentarea echipei și demonstrarea jocului.",
    close: "Închide",
    missionReady: "Scenariul de bază este disponibil. Parcursul complet al misiunii va fi conectat în etapa următoare.",
    missionSoon: "Misiunea se deschide în curând.",
    logoHint: "Alege o imagine pentru sigla echipei.",
    qrHint: "Scanează pentru a deschide jocul.",
    teamHint: "Membrii echipei InfoQuest.",
    demoHint: "Videoclip demonstrativ în limba română.",
    footerCopyright: "© 2026 InfoQuest. Toate drepturile rezervate.",
    footerHackathon: "Hackathonul Regional pentru coeziune socială și reziliență informațională",
    footerAi: "AI fără granițe",
    footerPrivacy: "Politica de confidențialitate",
    footerTerms: "Termeni și condiții",
  },
  ru: {
    tagline: "Щит цифрового сообщества",
    motto: "Наблюдай. Проверяй. Защищай сообщество.",
    startInvestigation: "Начать расследование",
    aiHelp: "Онлайн-помощник AI",
    openMission: "Открыть",
    xp: "XP",
    playable: "Доступно",
    soon: "Скоро",
    shieldProgress: "Целостность щита города",
    storyTitle: "Дело: Тень",
    story:
      "Город подключился к Сети Сообщества. Но в сети завёлся анонимный актор — Тень: взламывает аккаунты, звонит жителям от имени операторов, публикует поддельные видео и сеет слухи между русско- и румыноязычными жителями.",
    story2:
      "Страж-протокол VIG («Бдительный») пробудился, но в одиночку не справится. Патруль InfoQuest — шесть наставников сообщества — набирает тебя детективом-стажёром. Закрой 5 главных трещин щита и вытесни Тень из сети.",
    badges: "Бейджи",
    badgeNames: [
      "Бейдж «Безопасная линия»",
      "Бейдж «Эксперт по ссылкам»",
      "Бейдж «Страж аккаунта»",
      "Бейдж «Аналитик предложений»",
      "Бейдж «Цифровой глаз»",
      "Бейдж «Языковой мост»",
      "Бейдж «Детектор слухов»",
      "Бейдж «Защитник сообщества»",
    ],
    finalBadge: "Полный щит",
    finalBadgeHint:
      "Пройди 8 миссий и собери все 8 бейджей, чтобы восстановить щит города.",
    heroLead: "Двуязычная образовательная игра для школьников, учителей, семей и всего сообщества.",
    heroSub: "Научись распознавать мошенничество, дезинформацию, дипфейки и цифровые угрозы.",
    teamLogo: "Логотип команды",
    qrCode: "QR-код",
    projectTeam: "Команда проекта",
    demo: "Демонстрация игры",
    projectMaterials: "Материалы проекта",
    projectMaterialsHint: "Ресурсы для презентации команды и демонстрации игры.",
    close: "Закрыть",
    missionReady: "Основной сценарий доступен. Полное прохождение миссии подключим на следующем этапе.",
    missionSoon: "Миссия откроется скоро.",
    logoHint: "Выбери изображение для логотипа команды.",
    qrHint: "Отсканируй, чтобы открыть игру.",
    teamHint: "Участники команды InfoQuest.",
    demoHint: "Демонстрационное видео на русском языке.",
    footerCopyright: "© 2026 InfoQuest. Все права защищены.",
    footerHackathon: "Региональный хакатон по социальной сплоченности и информационной устойчивости",
    footerAi: "ИИ без границ",
    footerPrivacy: "Политика конфиденциальности",
    footerTerms: "Условия использования",
  },
} as const;

export const teamMembers = {
  ru: ["Икизли Михаил", "Пукал Мария", "Хицюк Елена", "Чебанова Анна", "Бортник Евгений"],
  ro: ["Ichizli Mihail", "Pucal Maria", "Hițiuc Elena", "Cebanova Ana", "Bortnic Eugeniu"],
} as const;
