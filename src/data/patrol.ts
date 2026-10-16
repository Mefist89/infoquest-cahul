export type PatrolLocale = "ru" | "ro";

export type PatrolNpc = {
  id: string;
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
      ru: "Верно! Почта не просит оплату по ссылкам из SMS.",
      ro: "Corect! Poșta nu cere plăți prin linkuri din SMS.",
    },
    fail: {
      ru: "Мимо! Ссылка ведёт мошенникам — трек проверяют только на официальном сайте.",
      ro: "Greșit! Linkul duce la escroci — trackingul se verifică doar pe site-ul oficial.",
    },
  },
  {
    id: "bank-operator",
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
        text: { ru: "Положу трубку и перезвоню в банк по номеру на карте", ro: "Închid și sun înapoi la bancă la numărul de pe card" },
        correct: true,
      },
      {
        text: { ru: "Продиктую код — сотрудник же представился", ro: "Dictez codul — angajatul s-a prezentat" },
        correct: false,
      },
    ],
    success: {
      ru: "Верно! Банк никогда не просит коды по телефону.",
      ro: "Corect! Banca nu cere niciodată coduri la telefon.",
    },
    fail: {
      ru: "Мимо! Код из SMS — ключ от денег. Клади трубку и перезванивай сам.",
      ro: "Greșit! Codul din SMS e cheia banilor. Închizi și suni tu înapoi.",
    },
  },
  {
    id: "school-friend",
    sprite: "npc-female",
    tint: 0xffd9e8,
    x: 350,
    y: 500,
    name: { ru: "Друг", ro: "Prietenul" },
    situation: {
      ru: "Друг с нового аккаунта просит: «Срочно переведи 500 леев, завтра верну!» Что ответишь?",
      ro: "Prietenul de pe cont nou cere: «Transferă urgent 500 de lei, mâine îți întorc!» Ce răspunzi?",
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
        text: { ru: "Проверю продавца и встречусь лично", ro: "Verific vânzătorul și mă întâlnesc personal" },
        correct: true,
      },
      {
        text: { ru: "Переведу предоплату, пока не упустил", ro: "Transfer avansul, până nu-l pierd" },
        correct: false,
      },
    ],
    success: {
      ru: "Верно! Спешка и предоплата — метки скама.",
      ro: "Corect! Graba și avansul — marca scamului.",
    },
    fail: {
      ru: "Мимо! Предоплата незнакомцу исчезает вместе с продавцом.",
      ro: "Greșit! Avansul unui străin dispare odată cu vânzătorul.",
    },
  },
];
