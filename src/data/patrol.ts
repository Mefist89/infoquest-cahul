import type { ModuleDefinition } from "./module-catalog";
import { SAFETY_PHRASES } from "./safety-phrases";

export type PatrolLocale = "ru" | "ro";
export type PatrolNpcId = "post-maria" | "bank-operator" | "school-friend" | "shop-seller";
export type PatrolModuleRoute = NonNullable<ModuleDefinition["route"]>;

export type PatrolNpc = {
  id: PatrolNpcId;
  moduleRoute: PatrolModuleRoute;
  sprite: "npc-female" | "npc-male";
  tint?: number;
  x: number;
  y: number;
  name: { ru: string; ro: string };
  situation: { ru: string; ro: string };
  options: { text: { ru: string; ro: string }; correct: boolean }[];
  success: { ru: string; ro: string };
  fail: { ru: string; ro: string };
};

export const PATROL_NPCS: PatrolNpc[] = [
  {
    id: "post-maria",
    moduleRoute: "/modules/fake-link",
    sprite: "npc-female",
    x: 350,
    y: 700,
    name: { ru: "Мария", ro: "Maria" },
    situation: {
      ru: "Мария получила SMS: «Посылка задержана. Оплати 20 леев: posta-md-livrare.top». Что ей делать?",
      ro: "Maria a primit SMS: «Coletul e reținut. Plătește 20 de lei: posta-md-livrare.top». Ce să facă?",
    },
    options: [
      {
        text: { ru: "Удалить SMS и проверить трек на posta.md", ro: "Șterge SMS-ul și verifică trackingul pe posta.md" },
        correct: true,
      },
      {
        text: { ru: "Оплатить по ссылке, чтобы не потерять посылку", ro: "Plătește prin link, ca să nu piardă coletul" },
        correct: false,
      },
    ],
    success: {
      ru: "Верно! Не плати по ссылке из SMS — проверь посылку сам на posta.md.",
      ro: "Corect! Nu plăti prin linkul din SMS — verifică singur coletul pe posta.md.",
    },
    fail: {
      ru: "Мимо! Ссылка ведёт мошенникам — трек проверяют только на официальном сайте.",
      ro: "Greșit! Linkul duce la escroci — trackingul se verifică doar pe site-ul oficial.",
    },
  },
  {
    id: "bank-operator",
    moduleRoute: "/modules/operator-call",
    sprite: "npc-male",
    x: 1250,
    y: 500,
    name: { ru: "Звонок из банка", ro: "Apel de la bancă" },
    situation: {
      ru: "«Это служба безопасности. Карта заблокирована! Назовите код из SMS». Твои действия?",
      ro: "«Sunt de la securitatea băncii. Cardul e blocat! Spuneți codul din SMS». Ce faci?",
    },
    options: [
      {
        text: { ru: SAFETY_PHRASES.ru.bankCall, ro: SAFETY_PHRASES.ro.bankCall },
        correct: true,
      },
      {
        text: { ru: "Продиктую код — сотрудник же представился", ro: "Dictez codul — angajatul s-a prezentat" },
        correct: false,
      },
    ],
    success: {
      ru: `Верно! ${SAFETY_PHRASES.ru.smsCode} Национальный банк Молдовы вообще не работает с картами граждан — звонок «от Нацбанка» всегда обман.`,
      ro: `Corect! ${SAFETY_PHRASES.ro.smsCode} Banca Națională a Moldovei nu lucrează cu cardurile cetățenilor — un apel «de la BNM» este mereu o fraudă.`,
    },
    fail: {
      ru: `Мимо! Код из SMS — ключ от денег. ${SAFETY_PHRASES.ru.bankCall}`,
      ro: `Greșit! Codul din SMS e cheia banilor. ${SAFETY_PHRASES.ro.bankCall}`,
    },
  },
  {
    id: "school-friend",
    moduleRoute: "/modules/operator-call",
    sprite: "npc-male",
    x: 350,
    y: 500,
    name: { ru: "Максим", ro: "Maxim" },
    situation: {
      ru: "Максим звонит в мессенджере с нового номера: «Я попал в беду, срочно скинь 500 леев!»",
      ro: "Maxim sună pe messenger de pe un număr nou: «Am dat de necaz, trimite-mi urgent 500 de lei!»",
    },
    options: [
      {
        text: { ru: "Позвоню другу на известный номер и проверю", ro: "Îl sun pe prieten la numărul cunoscut și verific" },
        correct: true,
      },
      {
        text: { ru: "Переведу — друг же просит срочно", ro: "Transfer — prietenul cere urgent" },
        correct: false,
      },
    ],
    success: {
      ru: "Верно! Денежные просьбы проверяют вторым каналом связи.",
      ro: "Corect! Cererile de bani se verifică printr-un al doilea canal.",
    },
    fail: {
      ru: "Мимо! Аккаунт друга могли взломать — всегда проверяй.",
      ro: "Greșit! Contul prietenului putea fi spart — verifică mereu.",
    },
  },
  {
    id: "shop-seller",
    moduleRoute: "/modules/hacked-account",
    sprite: "npc-male",
    tint: 0xd9e8ff,
    x: 1250,
    y: 700,
    name: { ru: "Продавец", ro: "Vânzătorul" },
    situation: {
      ru: "Продавец: «Телефон за полцены! Переводи предоплату, а то уйдёт другому!» Твой ход?",
      ro: "Vânzătorul: «Telefon la jumătate de preț! Transferă avansul, altfel îl ia altul!» Ce faci?",
    },
    options: [
      {
        text: {
          ru: "Проверю продавца и заплачу только при получении — лично или наложенным платежом на почте",
          ro: "Verific vânzătorul și plătesc doar la primire — personal sau cu plata la livrare prin poștă",
        },
        correct: true,
      },
      {
        text: { ru: "Переведу предоплату, пока не упустил", ro: "Transfer avansul, până nu-l pierd" },
        correct: false,
      },
    ],
    success: {
      ru: "Верно! Спешка и предоплата — признаки обмана.",
      ro: "Corect! Graba și avansul — semnele înșelătoriei.",
    },
    fail: {
      ru: "Мимо! Предоплата незнакомцу исчезает вместе с продавцом.",
      ro: "Greșit! Avansul unui străin dispare odată cu vânzătorul.",
    },
  },
];

export const PATROL_SCENE_META: Record<
  PatrolLocale,
  {
    touchTalkPrompt: string;
    keyTalkPrompt: string;
    settingsTitle: string;
    soundLabel: string;
    fullscreenLabel: string;
    closeLabel: string;
    moveHint: string;
    emblemAlt: string;
    startBtn: string;
    loadingLabel: string;
    guestLoginPrompt: string;
    shadowTitle: string;
    shadowPowerAria: string;
    rotatePhonePrompt: string;
    saveErrorNotice: string;
    victoryBanner: string;
    retryWinBtn: string;
    defeatBanner: string;
    retryLossBtn: string;
    shadowExplain: string;
    dialogueNextBtn: string;
    dialogueRetryBtn: string;
    firstTrySummary: (passed: number, total: number) => string;
    rememberTitle: string;
    playCaseBtn: (title: string) => string;
    askChronoBtn: string;
    desktopOnlyNotice: string;
    pageControlsHint: string;
  }
> = {
  ru: {
    touchTalkPrompt: "Нажми, чтобы поговорить",
    keyTalkPrompt: "[E] Поговорить",
    settingsTitle: "Настройки",
    soundLabel: "Звук",
    fullscreenLabel: "На весь экран",
    closeLabel: "Закрыть",
    moveHint: "WASD / стрелки — движение, E — разговор",
    emblemAlt: "Эмблема патруля цифрового города",
    startBtn: "Старт",
    loadingLabel: "Подготовка к патрулированию...",
    guestLoginPrompt: "Войди, чтобы сохранить прогресс",
    shadowTitle: "Тень",
    shadowPowerAria: "Сила Тени",
    rotatePhonePrompt: "Поверни телефон горизонтально, чтобы играть",
    saveErrorNotice: "Не удалось сохранить прогресс",
    victoryBanner: "Патруль удался!",
    retryWinBtn: "Играть снова",
    defeatBanner: "Тень захватила город…",
    retryLossBtn: "Играть снова",
    shadowExplain: "Тень — это мошенники в городе. Помогаешь жителю правильно — Тень слабеет. Ошибаешься — растёт.",
    dialogueNextBtn: "Дальше",
    dialogueRetryBtn: "Попробовать ещё раз",
    firstTrySummary: (passed: number, total: number) => `С первого раза: ${passed} из ${total}`,
    rememberTitle: "Что запомнить",
    playCaseBtn: (title: string) => `Пройти Дело «${title}»`,
    askChronoBtn: "Спросить Chrono",
    desktopOnlyNotice:
      "Игра пока работает только на компьютере с клавиатурой. На телефоне пройди Дела — там те же истории:",
    pageControlsHint:
      "Ходи по районам на WASD или стрелках, подходи к жителям и жми E для разговора.",
  },
  ro: {
    touchTalkPrompt: "Atinge ca să vorbești",
    keyTalkPrompt: "[E] Vorbește",
    settingsTitle: "Setări",
    soundLabel: "Sunet",
    fullscreenLabel: "Ecran complet",
    closeLabel: "Închide",
    moveHint: "WASD / săgeți — mișcare, E — dialog",
    emblemAlt: "Emblema patrului orașului digital",
    startBtn: "Pornește",
    loadingLabel: "Pregătire pentru patrulare...",
    guestLoginPrompt: "Intră în cont ca să-ți salvezi progresul",
    shadowTitle: "Umbra",
    shadowPowerAria: "Puterea Umbrei",
    rotatePhonePrompt: "Rotește telefonul orizontal ca să joci",
    saveErrorNotice: "Progresul nu a fost salvat",
    victoryBanner: "Patrula reușită!",
    retryWinBtn: "Joacă din nou",
    defeatBanner: "Umbra a pus stăpânire pe oraș…",
    retryLossBtn: "Joacă din nou",
    shadowExplain: "Umbra sunt escrocii din oraș. Ajuți corect un locuitor — Umbra slăbește. Greșești — crește.",
    dialogueNextBtn: "Mai departe",
    dialogueRetryBtn: "Încearcă din nou",
    firstTrySummary: (passed: number, total: number) => `Din prima încercare: ${passed} din ${total}`,
    rememberTitle: "Ce trebuie să reții",
    playCaseBtn: (title: string) => `Parcurge Dosarul «${title}»`,
    askChronoBtn: "Întreabă-l pe Chrono",
    desktopOnlyNotice:
      "Deocamdată jocul merge doar pe calculator cu tastatură. Pe telefon parcurge Dosarele — aceleași povești:",
    pageControlsHint:
      "Mergi prin cartiere cu WASD sau săgeți, apropie-te de locuitori și apasă E pentru dialog.",
  },
};

export const PATROL_BUILDING_LABELS = {
  school: { ru: "ЛИЦЕЙ / ШКОЛА", ro: "LICEU / ȘCOALĂ" },
  bank: { ru: "БАНК", ro: "BANCA" },
  post: { ru: "ПОЧТА МОЛДОВЫ", ro: "POȘTA MOLDOVEI" },
  shop: { ru: "МАГАЗИН", ro: "MAGAZIN" },
} as const;

export type PatrolDistrict = {
  id: string;
  name: { ru: string; ro: string };
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
};

export const PATROL_DISTRICTS: PatrolDistrict[] = [
  { id: "school", name: { ru: "Район: Школа", ro: "Cartier: Școala" }, x: 80, y: 100, width: 640, height: 450, color: 0x1d4ed8 },
  { id: "bank", name: { ru: "Район: Банк", ro: "Cartier: Banca" }, x: 880, y: 100, width: 640, height: 450, color: 0x047857 },
  { id: "post", name: { ru: "Район: Почта", ro: "Cartier: Poșta" }, x: 80, y: 660, width: 640, height: 480, color: 0xb45309 },
  { id: "shop", name: { ru: "Район: Магазин", ro: "Cartier: Magazinul" }, x: 880, y: 660, width: 640, height: 480, color: 0xbe185d },
];

