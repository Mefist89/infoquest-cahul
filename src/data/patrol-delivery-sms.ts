import type { PatrolLocale } from "./patrol";

export type SmsSegment = {
  id: string;
  text: { ru: string; ro: string };
  isFlag: boolean;
  flagTitle?: { ru: string; ro: string };
  explanation: { ru: string; ro: string };
};

export type SmsOption = {
  id: string;
  text: { ru: string; ro: string };
  correct: boolean;
  feedback: { ru: string; ro: string };
};

export type DeliverySmsCase = {
  id: string;
  badge: { ru: string; ro: string };
  sender: string;
  time: string;
  context: { ru: string; ro: string };
  segments: SmsSegment[];
  question: { ru: string; ro: string };
  options: SmsOption[];
};

export type DeliveryTheoryRule = {
  id: string;
  title: { ru: string; ro: string };
  description: { ru: string; ro: string };
  example: { ru: string; ro: string };
};

export const DELIVERY_SMS_THEORY: {
  categoryBadge: { ru: string; ro: string };
  title: { ru: string; ro: string };
  subtitle: { ru: string; ro: string };
  rules: DeliveryTheoryRule[];
  goldenRule: { ru: string; ro: string };
} = {
  categoryBadge: {
    ru: "Категория SMS · Доставка и почта",
    ro: "Categorie SMS · Livrare și poștă",
  },
  title: {
    ru: "Как распознать фальшивые SMS о посылках",
    ro: "Cum recunoști SMS-urile false despre colete",
  },
  subtitle: {
    ru: "У почтового отделения Мария получила сразу 3 подозрительных SMS. Изучи 4 приёма мошенников и помоги ей разобрать каждое сообщение.",
    ro: "Lângă oficiul poștal, Maria a primit 3 SMS-uri suspecte. Studiază cele 4 trucuri ale escrocilor și ajut-o să analizeze fiecare mesaj.",
  },
  rules: [
    {
      id: "urgency",
      title: {
        ru: "1. Искусственная срочность и таймер",
        ro: "1. Urgență artificială și cronometru",
      },
      description: {
        ru: "Мошенники пугают, что посылка «будет возвращена через 2 часа» или «начисляется штраф», чтобы вы не успели проверить информацию.",
        ro: "Escrocii te sperie că «coletul va fi returnat în 2 ore» sau că «se aplică penalități», ca să nu ai timp să verifici.",
      },
      example: {
        ru: "Пример уловки: «СРОЧНО! Через 2 часа заказ вернётся на склад»",
        ro: "Exemplu de capcană: «URGENT! În 2 ore comanda se întoarce la depozit»",
      },
    },
    {
      id: "small-fee",
      title: {
        ru: "2. Ловушка «копеечной доплаты» (15–30 леев)",
        ro: "2. Capcana «taxei mici» (15–30 lei)",
      },
      description: {
        ru: "Сумма специально маленькая, чтобы человек не задумываясь ввёл данные банковской карты и код из SMS на поддельной странице.",
        ro: "Suma este intenționat mică, pentru ca victima să introducă fără ezitare datele cardului și codul SMS pe pagina falsă.",
      },
      example: {
        ru: "Пример уловки: «Оплатите пошлину 20 леев для выдачи»",
        ro: "Exemplu de capcană: «Plătiți taxa vamală de 20 lei pentru livrare»",
      },
    },
    {
      id: "fake-domain",
      title: {
        ru: "3. Поддельный домен вместо официального сайта",
        ro: "3. Domeniu fals în locul site-ului oficial",
      },
      description: {
        ru: "Вместо настоящего домена posta.md в SMS подставляют похожие адреса с дефисами и дешёвыми зонами (.top, .click, .site, .info).",
        ro: "În locul domeniului real posta.md, în SMS apar adrese similare cu cratime și extensii suspecte (.top, .click, .site, .info).",
      },
      example: {
        ru: "Пример уловки: posta-md-livrare.top вместо posta.md",
        ro: "Exemplu de capcană: posta-md-livrare.top în loc de posta.md",
      },
    },
    {
      id: "card-cvv",
      title: {
        ru: "4. Выманивание CVV и кодов под видом «возврата»",
        ro: "4. Cererea CVV și a codurilor sub pretextul «rambursării»",
      },
      description: {
        ru: "Для получения посылки или возврата денег почта и курьеры НИКОГДА не запрашивают 3 цифры CVV с оборота карты или одноразовый SMS-код.",
        ro: "Pentru primirea unui colet sau rambursare, poșta și curierii NU cer NICIODATĂ codul CVV sau codul unic din SMS.",
      },
      example: {
        ru: "Пример уловки: «Для возврата 450 леев укажите карту и CVV»",
        ro: "Exemplu de capcană: «Pentru rambursarea a 450 lei introduceți cardul și CVV»",
      },
    },
  ],
  goldenRule: {
    ru: "Золотое правило: никогда не переходите по ссылкам оплаты из SMS. Проверяйте трек-номер только вручную на официальном сайте или в отделении почты.",
    ro: "Regula de aur: nu accesa niciodată linkuri de plată din SMS. Verifică numărul de urmărire doar manual pe site-ul oficial sau la oficiul poștal.",
  },
};

export const DELIVERY_SMS_CASES: DeliverySmsCase[] = [
  {
    id: "sms-customs",
    badge: {
      ru: "SMS 1 из 3 · Таможенный сбор",
      ro: "SMS 1 din 3 · Taxă vamală",
    },
    sender: "Posta-Info",
    time: "10:14",
    context: {
      ru: "Мария ждёт посылку с книгами. Первое SMS пришло от имени «Posta-Info». Найди в тексте 3 красных флага мошенников:",
      ro: "Maria așteaptă un colet cu cărți. Primul SMS a venit de la «Posta-Info». Găsește în text cele 3 semnale de alarmă:",
    },
    segments: [
      {
        id: "s1-intro",
        text: {
          ru: "Уведомление по отправлению #MD-4821.",
          ro: "Notificare pentru trimiterea #MD-4821.",
        },
        isFlag: false,
        explanation: {
          ru: "Нейтральная фраза: сам по себе номер отправления используется для правдоподобности, ищи главные улики дальше.",
          ro: "Frază neutră: numărul coletului este folosit doar pentru credibilitate, caută indiciile principale mai departe.",
        },
      },
      {
        id: "s1-urgency",
        text: {
          ru: "СРОЧНО: посылка задержана и через 2 часа вернётся отправителю!",
          ro: "URGENT: coletul este reținut și în 2 ore va fi returnat expeditorului!",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 1: Давление срочностью",
          ro: "Indiciul 1: Presiune prin urgență",
        },
        explanation: {
          ru: "Почта хранит посылки в отделении много дней и никогда не ставит ультиматум «2 часа до возврата».",
          ro: "Poșta păstrează coletele în oficiu mai multe zile și nu impune niciodată un ultimatum de «2 ore».",
        },
      },
      {
        id: "s1-fee",
        text: {
          ru: "Оплатите пошлину 20 леев по ссылке:",
          ro: "Plătiți taxa de 20 lei accesând linkul:",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 2: Оплата мелкого сбора по SMS-ссылке",
          ro: "Indiciul 2: Plata unei taxe mici prin link SMS",
        },
        explanation: {
          ru: "Мелкая сумма (20 леев) — наживка, чтобы жертва ввела реквизиты карты на фишинговой форме.",
          ro: "Suma mică (20 lei) este o momeală pentru ca victima să introducă datele cardului pe formularul fals.",
        },
      },
      {
        id: "s1-domain",
        text: {
          ru: "http://posta-md-livrare.top/pay",
          ro: "http://posta-md-livrare.top/pay",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 3: Поддельный домен и HTTP без защиты",
          ro: "Indiciul 3: Domeniu fals și HTTP nesecurizat",
        },
        explanation: {
          ru: "Домен .top и дефисы «posta-md-livrare» не имеют отношения к официальному сайту posta.md.",
          ro: "Domeniul .top și cratimele «posta-md-livrare» nu au nicio legătură cu site-ul oficial posta.md.",
        },
      },
    ],
    question: {
      ru: "Все 3 улики найдены! Что Марии сделать с этим SMS?",
      ro: "Toate cele 3 indicii au fost găsite! Ce trebuie să facă Maria cu acest SMS?",
    },
    options: [
      {
        id: "s1-opt-correct",
        text: {
          ru: "Удалить SMS, не переходить по ссылке и проверить реальный трек-номер на официальном сайте posta.md",
          ro: "Să șteargă SMS-ul, să nu deschidă linkul și să verifice codul real de tracking pe site-ul oficial posta.md",
        },
        correct: true,
        feedback: {
          ru: "Отлично! Трек-номер проверяется только вручную на официальном сайте posta.md или в самом отделении.",
          ro: "Excelent! Codul de urmărire se verifică doar manual pe site-ul oficial posta.md sau direct la oficiul poștal.",
        },
      },
      {
        id: "s1-opt-pay",
        text: {
          ru: "Быстро оплатить 20 леев по ссылке, пока посылку не отправили обратно",
          ro: "Să plătească rapid 20 lei prin link, până nu se returnează coletul",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Ввод карты на сайте posta-md-livrare.top приведёт к списанию всех денег со счёта.",
          ro: "Periculos! Introducerea cardului pe posta-md-livrare.top va duce la furtul banilor din cont.",
        },
      },
      {
        id: "s1-opt-reply",
        text: {
          ru: "Ответить в SMS своим домашним адресом и номером паспорта",
          ro: "Să răspundă prin SMS cu adresa de acasă și numărul buletinului",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Отправка паспортных данных и адреса даёт мошенникам материал для новых атак.",
          ro: "Periculos! Trimiterea datelor din buletin și a adresei oferă escrocilor date pentru noi atacuri.",
        },
      },
    ],
  },
  {
    id: "sms-address",
    badge: {
      ru: "SMS 2 из 3 · «Ошибка в адресе курьера»",
      ro: "SMS 2 din 3 · «Eroare în adresa curierului»",
    },
    sender: "+373 68 914 203",
    time: "12:38",
    context: {
      ru: "Через два часа Марии пришло второе SMS — уже с обычного мобильного номера. Найди 3 красных флага:",
      ro: "După două ore, Maria a primit al doilea SMS — de pe un număr mobil obișnuit. Găsește cele 3 semnale de alarmă:",
    },
    segments: [
      {
        id: "s2-sender",
        text: {
          ru: "[Отправитель: личный номер +373 68 914 203] Курьерская служба доставки:",
          ro: "[Expeditor: număr personal +373 68 914 203] Serviciul de curierat:",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 1: SMS от «службы доставки» с обычного мобильного номера",
          ro: "Indiciul 1: SMS de la «curierat» de pe un număr mobil personal",
        },
        explanation: {
          ru: "Крупные почтовые и курьерские службы используют официальные сервисные каналы, а не случайные личные SIM-карты для сбора оплат.",
          ro: "Serviciile oficiale de poștă și curierat nu trimit linkuri de plată de pe cartele SIM personale.",
        },
      },
      {
        id: "s2-neutral",
        text: {
          ru: "Не удалось вручить посылку из-за неполного номера дома.",
          ro: "Coletul nu a putut fi livrat din cauza numărului de casă incomplet.",
        },
        isFlag: false,
        explanation: {
          ru: "Это классическая легенда-приманка, но посмотри, что именно мошенники требуют сделать дальше.",
          ro: "Aceasta este povestea-momeală, dar privește ce anume cer escrocii în continuare.",
        },
      },
      {
        id: "s2-fee",
        text: {
          ru: "Подтвердите адрес и оплатите повторный выезд курьера (15 леев):",
          ro: "Confirmați adresa și achitați relivrarea curierului (15 lei):",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 2: Выманивание оплаты за «повторный выезд»",
          ro: "Indiciul 2: Cererea unei plăți pentru «relivrare»",
        },
        explanation: {
          ru: "Под предлогом «уточнения адреса за 15 леев» мошенники собирают полный адрес жертвы и данные её банковской карты.",
          ro: "Sub pretextul «confirmării adresei pentru 15 lei», escrocii colectează adresa victimei și datele cardului bancar.",
        },
      },
      {
        id: "s2-link",
        text: {
          ru: "https://md-express-track.click/id99",
          ro: "https://md-express-track.click/id99",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 3: Подозрительная ссылка в зоне .click",
          ro: "Indiciul 3: Link suspect în zona .click",
        },
        explanation: {
          ru: "Даже наличие https:// не делает сайт настоящим: домен md-express-track.click создан мошенниками.",
          ro: "Chiar dacă are https://, domeniul md-express-track.click este creat de escroci.",
        },
      },
    ],
    question: {
      ru: "Все 3 улики найдены! Как правильно поступить Марии в этой ситуации?",
      ro: "Toate cele 3 indicii au fost găsite! Cum trebuie să procedeze Maria în această situație?",
    },
    options: [
      {
        id: "s2-opt-correct",
        text: {
          ru: "Заблокировать номер и проверить статус заказа прямо в том магазине, где реально делалась покупка",
          ro: "Să blocheze numărul și să verifice statusul comenzii direct în magazinul de unde a cumpărat",
        },
        correct: true,
        feedback: {
          ru: "Верно! Статус доставки всегда проверяется в личном кабинете магазина или по официальному трек-номеру.",
          ro: "Corect! Statusul livrării se verifică mereu în contul magazinului sau după codul oficial de tracking.",
        },
      },
      {
        id: "s2-opt-click",
        text: {
          ru: "Перейти по ссылке — там же написано https://, значит сайт защищённый",
          ro: "Să deschidă linkul — scrie https://, deci site-ul este sigur",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Значок https:// означает лишь шифрование соединения, мошенники получают его бесплатно за минуту.",
          ro: "Greșit! Simbolul https:// înseamnă doar conexiune criptată; escrocii îl obțin gratuit într-un minut.",
        },
      },
      {
        id: "s2-opt-call",
        text: {
          ru: "Перезвонить на этот номер и продиктовать данные карты по телефону",
          ro: "Să sune la acest număr și să dicteze datele cardului la telefon",
        },
        correct: false,
        feedback: {
          ru: "Опасно! На другом конце провода фальшивый «оператор» выманит данные карты и код из SMS.",
          ro: "Periculos! La celălalt capăt al firului, un fals «operator» va încerca să obțină datele cardului și codul SMS.",
        },
      },
    ],
  },
  {
    id: "sms-refund",
    badge: {
      ru: "SMS 3 из 3 · Ловушка с «возвратом средств»",
      ro: "SMS 3 din 3 · Capcana «rambursării banilor»",
    },
    sender: "MD-Livrare",
    time: "15:05",
    context: {
      ru: "Когда Мария не поддалась на первые два сообщения, мошенники сменили тактику и пообещали ей деньги. Найди 3 красных флага:",
      ro: "Când Maria nu a căzut în primele două capcane, escrocii au schimbat tactica și i-au promis bani. Găsește cele 3 semnale de alarmă:",
    },
    segments: [
      {
        id: "s3-bait",
        text: {
          ru: "Вам назначена компенсация и возврат 450 леев за утерянную посылку.",
          ro: "Vi s-a aprobat o compensație și rambursarea a 450 lei pentru coletul pierdut.",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 1: Приманка неожиданными деньгами",
          ro: "Indiciul 1: Momeală cu bani neașteptați",
        },
        explanation: {
          ru: "Когда запугивание не сработало, мошенники обещают «компенсацию», чтобы жертва сама захотела перейти по ссылке.",
          ro: "Când intimidarea nu funcționează, escrocii promit o «compensație» pentru a convinge victima să deschidă linkul.",
        },
      },
      {
        id: "s3-neutral",
        text: {
          ru: "Заявка обработана отделом претензий №14.",
          ro: "Cererea a fost procesată de departamentul reclamații nr. 14.",
        },
        isFlag: false,
        explanation: {
          ru: "Официально звучащая фраза для создания доверия. Главная опасность — в том, какие данные они просят дальше.",
          ro: "Frază cu ton oficial pentru a inspira încredere. Pericolul real este în datele cerute mai jos.",
        },
      },
      {
        id: "s3-cvv",
        text: {
          ru: "Для зачисления денег введите номер карты, срок действия и 3 цифры CVV:",
          ro: "Pentru primirea banilor introduceți numărul cardului, data expirării și codul CVV:",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 2: Запрос CVV-кода для «получения» перевода",
          ro: "Indiciul 2: Cererea codului CVV pentru «primirea» banilor",
        },
        explanation: {
          ru: "CVV-код и коды из SMS нужны ТОЛЬКО для списания денег с вашей карты, для зачисления они никогда не требуются!",
          ro: "Codul CVV și codurile SMS sunt necesare DOAR pentru retragerea banilor de pe card, niciodată pentru încasare!",
        },
      },
      {
        id: "s3-domain",
        text: {
          ru: "https://retur-posta-md.site/claim",
          ro: "https://retur-posta-md.site/claim",
        },
        isFlag: true,
        flagTitle: {
          ru: "Улика 3: Фальшивый сайт возврата (retur-posta-md.site)",
          ro: "Indiciul 3: Site fals de rambursare (retur-posta-md.site)",
        },
        explanation: {
          ru: "Поддельный домен .site маскируется под почту, чтобы украсть данные карты сразу после ввода.",
          ro: "Domeniul fals .site imită poșta pentru a fura datele cardului imediat ce sunt introduse.",
        },
      },
    ],
    question: {
      ru: "Все 3 улики найдены! Какое правило поможет Марии никогда не попасться на «возврат»?",
      ro: "Toate cele 3 indicii au fost găsite! Ce regulă o va ajuta pe Maria să nu cadă în capcana «rambursării»?",
    },
    options: [
      {
        id: "s3-opt-correct",
        text: {
          ru: "Никогда не вводить CVV и коды из SMS для «получения» денег — это 100% кража со счёта",
          ro: "Să nu introducă niciodată CVV-ul și codurile SMS pentru «primirea» banilor — este 100% furt din cont",
        },
        correct: true,
        feedback: {
          ru: "Безупречно! Любой сайт, который просит CVV и SMS-код якобы для выплаты вам денег, — мошеннический.",
          ro: "Impecabil! Orice site care cere CVV-ul și codul SMS sub pretextul unei plăți către tine este fraudulos.",
        },
      },
      {
        id: "s3-opt-try",
        text: {
          ru: "Ввести данные карты — ведь мне должны начислить 450 леев, а не списать",
          ro: "Să introducă datele cardului — doar trebuie să primească 450 lei, nu să plătească",
        },
        correct: false,
        feedback: {
          ru: "Ловушка! Как только вы введёте CVV и код из SMS, мошенники спишут деньги с вашей карты.",
          ro: "Capcană! Imediat ce introduci CVV-ul și codul SMS, escrocii vor retrage banii de pe card.",
        },
      },
      {
        id: "s3-opt-friend",
        text: {
          ru: "Попросить подругу ввести её карту, чтобы получить компенсацию на её счёт",
          ro: "Să roage o prietenă să introducă cardul ei pentru a primi compensația",
        },
        correct: false,
        feedback: {
          ru: "Опасно! Так мошенники украдут деньги уже с карты подруги.",
          ro: "Periculos! Astfel escrocii vor fura banii de pe cardul prietenei.",
        },
      },
    ],
  },
];

export const DELIVERY_SMS_UI: Record<
  PatrolLocale,
  {
    stepTheory: string;
    stepPractice: string;
    stepSummary: string;
    startPracticeBtn: string;
    flagsCounter: string;
    clickHint: string;
    allFlagsFound: string;
    nextSmsBtn: string;
    finishTrainingBtn: string;
    completePatrolBtn: string;
    retryOptionHint: string;
    summaryTitle: string;
    summarySubtitle: string;
    summaryScoreLabel: string;
    summaryChecklistTitle: string;
    summaryChecklist: string[];
    closeLabel: string;
    incomingSmsLabel: string;
    timerLabel: string;
    timerLocked: string;
    timerPaused: string;
    pauseBtn: string;
    resumeBtn: string;
    bonusTimeNotice: string;
    penaltyTimeNotice: string;
    timeoutTitle: string;
    timeoutDesc: string;
    retryTimerBtn: string;
    hintBtn: string;
  }
> = {
  ru: {
    stepTheory: "Шаг 1 · Памятка",
    stepPractice: "Шаг 2 · Разбор 3 SMS",
    stepSummary: "Шаг 3 · Итог",
    startPracticeBtn: "Перейти к разбору SMS (3 кейса) →",
    flagsCounter: "Найдено красных флагов",
    clickHint: "Нажимай на подозрительные фразы в тексте SMS (верная улика +4 сек, промах −3 сек)",
    allFlagsFound: "Все 3 красных флага найдены! Таймер остановлен — выбери безопасное решение:",
    nextSmsBtn: "Следующее SMS →",
    finishTrainingBtn: "Перейти к итогам →",
    completePatrolBtn: "Защитить Марию и вернуться в город ✓",
    retryOptionHint: "Попробуй выбрать безопасное действие ещё раз:",
    summaryTitle: "Мария защищена от SMS-мошенников!",
    summarySubtitle: "Ты вовремя разобрал всю цепочку из 3 фальшивых SMS о доставке и помог жительнице Почтового района.",
    summaryScoreLabel: "Разобрано SMS-ловушек: 3 из 3 · Найдено улик: 9 из 9",
    summaryChecklistTitle: "Памятка по категории «SMS о доставке»:",
    summaryChecklist: [
      "Почта не требует срочной оплаты 15–20 леев по ссылкам из SMS.",
      "Всегда проверяй домен: posta-md-livrare.top и .click/.site — это ловушки.",
      "Для получения посылки или возврата денег никогда не нужны CVV и код из SMS.",
      "Проверяй статус заказа только на официальном сайте posta.md или в приложении магазина.",
    ],
    closeLabel: "Закрыть",
    incomingSmsLabel: "Входящее текстовое сообщение · SMS",
    timerLabel: "Время на поиск улик",
    timerLocked: "Улики собраны вовремя!",
    timerPaused: "На паузе",
    pauseBtn: "Пауза",
    resumeBtn: "Продолжить",
    bonusTimeNotice: "+4 сек за найденную улику!",
    penaltyTimeNotice: "−3 сек: это нейтральная фраза!",
    timeoutTitle: "Время вышло! Мошенники торопят Марию!",
    timeoutDesc: "Когда человек спешит, он легко нажимает на фальшивую ссылку. Перезапусти таймер и найди все 3 красных флага.",
    retryTimerBtn: "Попробовать снова (сбросить таймер) ↻",
    hintBtn: "Подсветить 1 улику (−5 сек)",
  },
  ro: {
    stepTheory: "Pasul 1 · Ghid",
    stepPractice: "Pasul 2 · Analiza a 3 SMS-uri",
    stepSummary: "Pasul 3 · Rezumat",
    startPracticeBtn: "Treci la analiza SMS-urilor (3 cazuri) →",
    flagsCounter: "Semnale de alarmă găsite",
    clickHint: "Apasă pe frazele suspecte din SMS (indiciu corect +4 sec, greșeală −3 sec)",
    allFlagsFound: "Toate cele 3 semnale au fost găsite! Cronometrul s-a oprit — alege decizia sigură:",
    nextSmsBtn: "Următorul SMS →",
    finishTrainingBtn: "Treci la rezumat →",
    completePatrolBtn: "Protejează-o pe Maria și revino în oraș ✓",
    retryOptionHint: "Încearcă din nou să alegi acțiunea sigură:",
    summaryTitle: "Maria este protejată de escrocii prin SMS!",
    summarySubtitle: "Ai analizat la timp întregul lanț de 3 SMS-uri false despre livrare și ai ajutat locuitoarea din cartierul Poștei.",
    summaryScoreLabel: "Capcane SMS analizate: 3 din 3 · Indicii găsite: 9 din 9",
    summaryChecklistTitle: "Reguli pentru categoria «SMS-uri de livrare»:",
    summaryChecklist: [
      "Poșta nu cere plăți urgente de 15–20 lei prin linkuri din SMS.",
      "Verifică mereu domeniul: posta-md-livrare.top și .click/.site sunt capcane.",
      "Pentru primirea unui colet sau rambursare nu sunt necesare niciodată CVV-ul și codul SMS.",
      "Verifică statusul comenzii doar pe site-ul oficial posta.md sau în aplicația magazinului.",
    ],
    closeLabel: "Închide",
    incomingSmsLabel: "Mesaj text primit · SMS",
    timerLabel: "Timp pentru găsirea indiciilor",
    timerLocked: "Indicii adunate la timp!",
    timerPaused: "În pauză",
    pauseBtn: "Pauză",
    resumeBtn: "Continuă",
    bonusTimeNotice: "+4 sec pentru indiciul găsit!",
    penaltyTimeNotice: "−3 sec: aceasta este o frază neutră!",
    timeoutTitle: "Timpul a expirat! Escrocii o grăbesc pe Maria!",
    timeoutDesc: "Când cineva se grăbește, apasă ușor pe un link fals. Repornește cronometrul și găsește cele 3 semnale.",
    retryTimerBtn: "Încearcă din nou (resetează timpul) ↻",
    hintBtn: "Evidențiază 1 indiciu (−5 sec)",
  },
};
