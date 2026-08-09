export type ModuleLocale = "ro" | "ru";

export type ModuleIcon =
  | "user-lock"
  | "phone-call"
  | "gift"
  | "scan-face"
  | "languages"
  | "map-pin"
  | "shield-alert"
  | "link-2-off";

export const MODULE_STAGES = [
  { index: 1, kind: "theory", xp: 8, title: { ru: "Теория", ro: "Teorie" } },
  { index: 2, kind: "video_explanation", xp: 8, title: { ru: "Видеообъяснение", ro: "Explicație video" } },
  { index: 3, kind: "video_example", xp: 8, title: { ru: "Видеопример", ro: "Exemplu video" } },
  { index: 4, kind: "game_1", xp: 12, title: { ru: "Игра: выбор", ro: "Joc: alegere" } },
  { index: 5, kind: "game_2", xp: 12, title: { ru: "Игра: анализ", ro: "Joc: analiză" } },
  { index: 6, kind: "game_3", xp: 12, title: { ru: "Игра: проверка", ro: "Joc: verificare" } },
  { index: 7, kind: "game_4", xp: 12, title: { ru: "Игра: решение", ro: "Joc: decizie" } },
  { index: 8, kind: "final_battle", xp: 28, title: { ru: "Финальная схватка", ro: "Confruntarea finală" } },
] as const;

export const MODULE_CATALOG = [
  {
    id: 1,
    moduleId: "operator-call",
    status: "playable",
    route: "/modules/operator-call",
    color: "var(--neon)",
    icon: "phone-call",
    side: "left",
    title: { ro: "Apelul fals de la operator", ru: "Фальшивый звонок оператора" },
    shortTitle: { ro: "Apel fals", ru: "Ложный звонок" },
    teaser: { ro: "Un «operator» te sună și cere codul din SMS.", ru: "«Оператор» звонит и просит код из SMS." },
    badge: { ro: "Insigna «Linie sigură»", ru: "Бейдж «Безопасная линия»" },
    caseDescription: { ro: "Umbra sună locuitorii în numele operatorului și cere codul primit prin SMS.", ru: "Тень звонит жителям от имени оператора и просит сообщить код из SMS." },
    caseObjective: { ro: "Recunoaște presiunea, protejează codurile și verifică apelul prin canalul oficial.", ru: "Распознай давление, защити коды и проверь звонок через официальный канал." },
  },
  {
    id: 2,
    moduleId: "fake-link",
    status: "soon",
    route: null,
    color: "var(--gold)",
    icon: "link-2-off",
    side: "left",
    title: { ro: "Capcana linkului fals", ru: "Ловушка фальшивой ссылки" },
    shortTitle: { ro: "Link fals", ru: "Фальшивая ссылка" },
    teaser: { ro: "Un QR duce la o pagină de autentificare aproape identică cu cea reală.", ru: "QR-код ведёт на страницу входа, почти неотличимую от настоящей." },
    badge: { ro: "Insigna «Expert în linkuri»", ru: "Бейдж «Эксперт по ссылкам»" },
    caseDescription: { ro: "Un link sau un cod QR conduce spre o copie aproape perfectă a unei pagini cunoscute.", ru: "Ссылка или QR-код ведёт на почти идеальную копию знакомой страницы." },
    caseObjective: { ro: "Verifică domeniul, adresa și semnele unei pagini create pentru furtul datelor.", ru: "Проверь домен, адрес и признаки страницы, созданной для кражи данных." },
  },
  {
    id: 3,
    moduleId: "hacked-account",
    status: "soon",
    route: null,
    color: "var(--danger)",
    icon: "user-lock",
    side: "left",
    title: { ro: "Contul compromis", ru: "Взломанный аккаунт" },
    shortTitle: { ro: "Cont compromis", ru: "Взломанный аккаунт" },
    teaser: { ro: "Parola ta a apărut într-o scurgere de date. Vei învăța să recunoști și să protejezi un cont compromis.", ru: "Твой пароль попал в утечку. Ты научишься распознавать взлом и защищать аккаунт." },
    badge: { ro: "Insigna «Gardianul contului»", ru: "Бейдж «Страж аккаунта»" },
    caseDescription: { ro: "Parola unui membru al comunității apare într-o scurgere, iar contul începe să trimită mesaje stranii.", ru: "Пароль участника сообщества попадает в утечку, а аккаунт начинает отправлять странные сообщения." },
    caseObjective: { ro: "Recuperează contul, schimbă parola și activează autentificarea în doi pași.", ru: "Верни доступ, смени пароль и включи двухэтапную проверку." },
  },
  {
    id: 4,
    moduleId: "scam-or-real",
    status: "soon",
    route: null,
    color: "var(--gold)",
    icon: "gift",
    side: "left",
    title: { ro: "Scam sau ofertă reală?", ru: "Скам или реальное предложение?" },
    shortTitle: { ro: "Scam sau real", ru: "Скам или реальность" },
    teaser: { ro: "Un premiu, un job și un grant îți apar în aceeași zi. Doar unul este real.", ru: "Приз, вакансия и грант приходят в один день. Реален только один." },
    badge: { ro: "Insigna «Analistul ofertelor»", ru: "Бейдж «Аналитик предложений»" },
    caseDescription: { ro: "Un premiu, un loc de muncă și un grant apar în aceeași zi, dar numai o ofertă este reală.", ru: "Приз, вакансия и грант появляются в один день, но настоящее предложение только одно." },
    caseObjective: { ro: "Compară sursele și separă oportunitatea reală de promisiunile frauduloase.", ru: "Сравни источники и отличи реальную возможность от мошеннических обещаний." },
  },
  {
    id: 5,
    moduleId: "deepfake-detective",
    status: "soon",
    route: null,
    color: "var(--violet)",
    icon: "scan-face",
    side: "right",
    title: { ro: "Deepfake Detective", ru: "Детектив дипфейков" },
    shortTitle: { ro: "Detectiv deepfake", ru: "Детектив дипфейков" },
    teaser: { ro: "Un video manipulat circulă în oraș.", ru: "По городу разошлось поддельное видео." },
    badge: { ro: "Insigna «Ochi digital»", ru: "Бейдж «Цифровой глаз»" },
    caseDescription: { ro: "În oraș circulă un videoclip în care o persoană cunoscută pare să facă o declarație șocantă.", ru: "По городу распространяется видео, где известный человек будто бы делает шокирующее заявление." },
    caseObjective: { ro: "Caută artefacte vizuale, verifică sursa și confirmă contextul videoclipului.", ru: "Найди визуальные артефакты, проверь источник и контекст видео." },
  },
  {
    id: 6,
    moduleId: "bilingual-detective",
    status: "soon",
    route: null,
    color: "var(--success)",
    icon: "languages",
    side: "right",
    title: { ro: "Detectivul bilingv", ru: "Двуязычный детектив" },
    shortTitle: { ro: "Detectivul bilingv", ru: "Двуязычный детектив" },
    teaser: { ro: "Același mesaj, două limbi, alte emoții.", ru: "Одно сообщение, два языка, разные эмоции." },
    badge: { ro: "Insigna «Pod lingvistic»", ru: "Бейдж «Языковой мост»" },
    caseDescription: { ro: "Același mesaj este distribuit în română și rusă, dar traducerile provoacă reacții foarte diferite.", ru: "Одно сообщение распространяют на русском и румынском, но переводы вызывают разные реакции." },
    caseObjective: { ro: "Compară sensul, tonul și formulările pentru a descoperi manipularea prin traducere.", ru: "Сравни смысл, тон и формулировки, чтобы раскрыть манипуляцию переводом." },
  },
  {
    id: 7,
    moduleId: "rumor-city",
    status: "soon",
    route: null,
    color: "var(--neon-soft)",
    icon: "map-pin",
    side: "right",
    title: { ro: "Orașul sub asediul zvonurilor", ru: "Город под осадой слухов" },
    shortTitle: { ro: "Orașul sub asediul zvonurilor", ru: "Город под осадой слухов" },
    teaser: { ro: "Un zvon pornește dintr-un grup de cartier și ajunge în tot orașul.", ru: "Слух стартует в районном чате и быстро охватывает весь город." },
    badge: { ro: "Insigna «Detector de zvonuri»", ru: "Бейдж «Детектор слухов»" },
    caseDescription: { ro: "Un zvon pornit într-un grup local se răspândește rapid și începe să influențeze întregul oraș.", ru: "Слух из местного чата быстро распространяется и начинает влиять на весь город." },
    caseObjective: { ro: "Urmărește traseul informației și oprește distribuirea înainte ca zvonul să devină panică.", ru: "Проследи путь информации и останови распространение до того, как слух вызовет панику." },
  },
  {
    id: 8,
    moduleId: "community-trolls",
    status: "soon",
    route: null,
    color: "var(--violet)",
    icon: "shield-alert",
    side: "right",
    title: { ro: "Apără comunitatea de troli", ru: "Защити сообщество от троллей" },
    shortTitle: { ro: "Apără comunitatea de troli", ru: "Защити сообщество от троллей" },
    teaser: { ro: "Învață să răspunzi la agresiune fără să alimentezi conflictul.", ru: "Научись отвечать на агрессию, не разжигая конфликт." },
    badge: { ro: "Insigna «Scutul comunității»", ru: "Бейдж «Защитник сообщества»" },
    caseDescription: { ro: "Conturi coordonate atacă discuțiile comunității și încearcă să transforme dezacordul în conflict.", ru: "Скоординированные аккаунты атакуют обсуждения сообщества и превращают разногласия в конфликт." },
    caseObjective: { ro: "Răspunde calm, documentează atacul și protejează comunitatea fără să alimentezi provocarea.", ru: "Отвечай спокойно, фиксируй атаку и защищай сообщество, не поддаваясь на провокацию." },
  },
] as const;

export type ModuleDefinition = (typeof MODULE_CATALOG)[number];
export type ModuleId = ModuleDefinition["moduleId"];
export type ModuleStage = (typeof MODULE_STAGES)[number];
export type StageKind = ModuleStage["kind"];

export const MODULE_COUNT = MODULE_CATALOG.length;
export const STAGE_COUNT = MODULE_STAGES.length;
export const MODULE_MAX_XP = MODULE_STAGES.reduce((total, stage) => total + stage.xp, 0);
export const TOTAL_STAGE_COUNT = MODULE_COUNT * STAGE_COUNT;
export const TOTAL_MAX_XP = MODULE_COUNT * MODULE_MAX_XP;

export const CASE_SLIDES = MODULE_CATALOG.map((module) => ({
  id: module.id,
  description: module.caseDescription,
  objective: module.caseObjective,
}));

export const MODULE_IDS = {
  operatorCall: "operator-call",
  fakeLink: "fake-link",
  hackedAccount: "hacked-account",
  scamOrReal: "scam-or-real",
  deepfakeDetective: "deepfake-detective",
  bilingualDetective: "bilingual-detective",
  rumorCity: "rumor-city",
  communityTrolls: "community-trolls",
} as const satisfies Record<string, ModuleId>;
