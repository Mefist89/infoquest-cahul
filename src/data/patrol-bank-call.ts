import { SAFETY_PHRASES } from "./safety-phrases";
import type { PatrolLocale } from "./patrol";

export type BankCallSpot = {
  id: string;
  label: { ru: string; ro: string };
  sublabel: { ru: string; ro: string };
  isFlag: boolean;
  findingTitle: { ru: string; ro: string };
  findingDesc: { ru: string; ro: string };
};

export type BankPressureTrap = {
  id: string;
  attackerMessage: { ru: string; ro: string };
  trapMechanism: { ru: string; ro: string };
  correctBlockerIndex: number;
  successFeedback: { ru: string; ro: string };
  wrongFeedback: { ru: string; ro: string };
};

export type BankActionItem = {
  id: string;
  deviceTitle: { ru: string; ro: string };
  locationMeta: { ru: string; ro: string };
  liveActivity: { ru: string; ro: string };
  isHacker: boolean;
  explanation: { ru: string; ro: string };
};

export type BankDefenseRound = {
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

export const BANK_CALL_META: Record<
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
    categoryBadge: "КАТЕГОРИЯ · ЗВОНОК «ИЗ БАНКА» И ЗАЩИТА КАРТЫ",
    npcBadge: "Звонок из банка · Район Банка · 4 этапа расследования",
    progressLabel: "Прогресс защиты",
    remainingLabel: "Осталось шагов",
    allDoneLabel: "Банковская карта защищена!",
    closeLabel: "Закрыть",
    introActionBtn: "Разобраться",
    nextStageBtn: "Перейти к следующему этапу →",
    finishBtn: "Защитить банковскую карту и вернуться в город ✓",
    stageNames: [
      "1. Проверка звонка",
      "2. Ловушки разговора",
      "3. Фильтр операций",
      "4. Отпор лже-банкиру",
    ],
    stage1Title: "Этап 1/4 · «Проверка звонка»: Найди улики телефонного мошенника",
    stage1Subtitle:
      "Звонящий представляется «службой безопасности банка» и пугает списанием денег. Проверь детали разговора и найди улики обмана:",
    stage1ScanHint: "Нажми на подозрительные детали звонка слева (найдено улик: ",
    stage1HeaderBadge: "📞 ВХОДЯЩИЙ ЗВОНОК · «СЛУЖБА БЕЗОПАСНОСТИ БАНКА»",
    stage1SelectHint: "Нажми на любую деталь звонка слева для проверки...",
    stage1BehaviorHint:
      "Обрати внимание, кто именно звонит и какие данные или действия он требует прямо по телефону.",
    stage1HiddenClueLabel: "Скрытая улика обмана (проверь детали звонка)",
    stage1ClueTag: "⚠️ УЛИКА",
    stage1CheckTag: "ПРОВЕРИТЬ",
    stage1NormTag: "✓ ДЕТАЛЬ",
    stage2Title: "Этап 2/4 · «Ловушки разговора»: Отрази давление лже-оператора",
    stage2Subtitle:
      "Мошенник торопит и требует секретные данные. Выбери правильный защитный барьер для каждой уловки:",
    stage2Blockers: [
      "Барьер · Никому не называть код из SMS и CVV",
      "Барьер · «Безопасного счёта» не существует",
      "Барьер · Положить трубку и перезвонить по номеру с карты",
    ],
    stage2TrapBadge: (current: number) => `Уловка ${current}/3`,
    stage2FeedbackDefault: "Выбери защитный барьер внизу, чтобы заблокировать уловку...",
    stage2NextTrapBtn: "Следующая уловка →",
    stage3Title: "Этап 3/4 · «Фильтр операций»: Заблокируй опасные требования",
    stage3Subtitle:
      "Отключи 3 опасных требования мошенников, но не трогай безопасный способ связи с настоящим банком:",
    stage3KillBtn: "ЗАБЛОКИРОВАТЬ ТРЕБОВАНИЕ ✕",
    stage3KilledBadge: "✓ ЗАБЛОКИРОВАНО",
    stage3OwnerBadge: "🛡️ НАСТОЯЩИЙ БАНК (НЕ ТРОГАТЬ)",
    stage3AllKilledNotice:
      "Все 3 опасных требования заблокированы! Остался только официальный канал связи с банком.",
    stage3KilledCounter: (done: number, total: number) =>
      `Заблокировано опасных требований: ${done}/${total} (не блокируй самостоятельный звонок в банк)`,
    stage4Title: "Этап 4/4 · «Отпор лже-банкиру»: 3 рубежа защиты карты",
    stage4Subtitle:
      "Выбери верное действие на каждом из 3 рубежей, чтобы полностью разрушить сценарий телефонного мошенника:",
    stage4HpLabel: (hp: number) => `Маскировка Тени: ${hp}%`,
    stage4StepHint: (step: number) =>
      `Рубеж ${step}/3: выбери правильную карточку ответа внизу`,
    stage4ActivateBtn: "ПРИМЕНИТЬ ЗАЩИТУ →",
    victoryTitle: "Звонок лже-банкира обезврежен!",
    victoryRetryNotice: "Ты справился, но с ошибками. Пройди ещё раз",
    victorySubtitle:
      "Ты распознал уловки телефонных мошенников и сохранил деньги на карте. Запомни главные правила:",
    victoryRules: [
      SAFETY_PHRASES.ru.bankCall,
      SAFETY_PHRASES.ru.smsCode,
      "Национальный банк Молдовы (BNM) не обслуживает карты граждан и не звонит физическим лицам.",
      "Никаких «безопасных» или «резервных» счетов не существует — перевод на них уходит мошенникам.",
    ],
  },
  ro: {
    categoryBadge: "CATEGORIE · APEL «DE LA BANCĂ» ȘI PROTECȚIA CARDULUI",
    npcBadge: "Apel de la bancă · Cartierul Băncii · 4 etape de investigație",
    progressLabel: "Progresul protecției",
    remainingLabel: "Pași rămași",
    allDoneLabel: "Cardul bancar este protejat!",
    closeLabel: "Închide",
    introActionBtn: "Investighează",
    nextStageBtn: "Treci la etapa următoare →",
    finishBtn: "Protejează cardul bancar și întoarce-te în oraș ✓",
    stageNames: [
      "1. Verificarea apelului",
      "2. Capcanele discuției",
      "3. Filtrul operațiunilor",
      "4. Riposta finală",
    ],
    stage1Title: "Etapa 1/4 · «Verificarea apelului»: Găsește indiciile escrocului telefonic",
    stage1Subtitle:
      "Apelantul se prezintă drept «securitatea băncii» și te sperie cu o tranzacție suspectă. Verifică detaliile apelului și găsește indiciile fraudei:",
    stage1ScanHint: "Apasă pe detaliile suspecte ale apelului din stânga (indicii găsite: ",
    stage1HeaderBadge: "📞 APEL PRIMIT · «SERVICIUL DE SECURITATE AL BĂNCII»",
    stage1SelectHint: "Apasă pe orice detaliu al apelului din stânga pentru verificare...",
    stage1BehaviorHint:
      "Observă cine pretinde că sună și ce date sau acțiuni îți cere direct la telefon.",
    stage1HiddenClueLabel: "Indiciu ascuns de fraudă (verifică detaliile apelului)",
    stage1ClueTag: "⚠️ INDICIU",
    stage1CheckTag: "VERIFICĂ",
    stage1NormTag: "✓ DETALIU",
    stage2Title: "Etapa 2/4 · «Capcanele discuției»: Respinge presiunea falsului operator",
    stage2Subtitle:
      "Escrocul te grăbește și cere date secrete. Alege bariera de protecție corectă pentru fiecare capcană:",
    stage2Blockers: [
      "Barieră · Nu spune nimănui codul din SMS și CVV",
      "Barieră · «Contul sigur» de rezervă nu există",
      "Barieră · Închide și sună la numărul de pe spatele cardului",
    ],
    stage2TrapBadge: (current: number) => `Capcana ${current}/3`,
    stage2FeedbackDefault: "Alege bariera de protecție de jos pentru a bloca capcana...",
    stage2NextTrapBtn: "Capcana următoare →",
    stage3Title: "Etapa 3/4 · «Filtrul operațiunilor»: Blochează cererile periculoase",
    stage3Subtitle:
      "Blochează cele 3 cereri periculoase ale escrocilor, dar păstrează canalul oficial de legătură cu banca:",
    stage3KillBtn: "BLOCHEAZĂ CEREREA ✕",
    stage3KilledBadge: "✓ BLOCAT",
    stage3OwnerBadge: "🛡️ CANAL OFICIAL (PĂSTREAZĂ)",
    stage3AllKilledNotice:
      "Toate cele 3 cereri periculoase au fost blocate! A rămas doar canalul oficial de comunicare cu banca.",
    stage3KilledCounter: (done: number, total: number) =>
      `Cereri periculoase blocate: ${done}/${total} (nu bloca apelul direct la numărul de pe card)`,
    stage4Title: "Etapa 4/4 · «Riposta finală»: 3 linii de apărare a cardului",
    stage4Subtitle:
      "Alege acțiunea corectă la fiecare dintre cele 3 linii pentru a opri complet scenariul escrocului telefonic:",
    stage4HpLabel: (hp: number) => `Mascarea Umbrei: ${hp}%`,
    stage4StepHint: (step: number) =>
      `Linia ${step}/3: alege cardul corect de răspuns de mai jos`,
    stage4ActivateBtn: "APLICĂ PROTECȚIA →",
    victoryTitle: "Apelul falsului bancher a fost oprit!",
    victoryRetryNotice: "Ai reușit, dar cu greșeli. Mai încearcă",
    victorySubtitle:
      "Ai recunoscut capcanele escrocilor telefonici și ai păstrat banii în siguranță. Reține regulile principale:",
    victoryRules: [
      SAFETY_PHRASES.ro.bankCall,
      SAFETY_PHRASES.ro.smsCode,
      "Banca Națională a Moldovei (BNM) nu deservește cardurile cetățenilor și nu sună persoanele fizice.",
      "Nu există niciun «cont sigur» sau «cont de rezervă» — banii transferați acolo ajung direct la escroci.",
    ],
  },
};

export const BANK_CALL_SPOTS: BankCallSpot[] = [
  {
    id: "spot-bnm-badge",
    label: {
      ru: "Представился: «Инспектор Национального банка Молдовы (BNM)»",
      ro: "S-a prezentat: «Inspector al Băncii Naționale a Moldovei (BNM)»",
    },
    sublabel: {
      ru: "Грозит блокировкой всех счетов и присылает фото «удостоверения» в мессенджер",
      ro: "Amenință cu blocarea conturilor și trimite poza unei «legitimații» pe messenger",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 1: Нацбанк Молдовы не звонит гражданам",
      ro: "Indiciul 1: BNM nu sună cetățenii",
    },
    findingDesc: {
      ru: "Национальный банк Молдовы вообще не работает со счетами и картами физических лиц. Звонок «из Нацбанка» и фото удостоверений в чате — всегда обман.",
      ro: "Banca Națională a Moldovei nu lucrează cu conturile și cardurile persoanelor fizice. Un apel «de la BNM» și legitimațiile trimise în chat sunt mereu o fraudă.",
    },
  },
  {
    id: "spot-caller-name",
    label: {
      ru: "Обращение по имени и последние 4 цифры карты",
      ro: "Se adresează pe nume și știe ultimele 4 cifre ale cardului",
    },
    sublabel: {
      ru: "Звонящий уверенно называет твоё имя и маску номера карты",
      ro: "Apelantul îți spune sigur numele și ultimele cifre ale cardului",
    },
    isFlag: false,
    findingTitle: {
      ru: "Обычная деталь: знание имени не доказывает, что звонит банк",
      ro: "Detaliu obișnuit: cunoașterea numelui nu dovedește că sună banca",
    },
    findingDesc: {
      ru: "Имя и последние 4 цифры карты могут быть известны и банку, и мошенникам из утечек магазинов. Проверяй не то, что знает звонящий, а то, что он просит сделать.",
      ro: "Numele și ultimele 4 cifre ale cardului pot fi cunoscute atât de bancă, cât și de escroci din scurgeri de date. Verifică ce îți cere apelantul să faci.",
    },
  },
  {
    id: "spot-sms-request",
    label: {
      ru: "Требование: «Назовите 6-значный код из SMS для отмены перевода»",
      ro: "Cerință: «Spuneți codul din 6 cifre din SMS pentru anularea plății»",
    },
    sublabel: {
      ru: "На телефон приходит SMS от банка с кодом подтверждения операции",
      ro: "Pe telefon vine un SMS de la bancă cu un cod de confirmare a operațiunii",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 2: Запрос секретного кода из SMS",
      ro: "Indiciul 2: Cererea codului secret din SMS",
    },
    findingDesc: {
      ru: SAFETY_PHRASES.ru.smsCode,
      ro: SAFETY_PHRASES.ro.smsCode,
    },
  },
  {
    id: "spot-safe-account",
    label: {
      ru: "Инструкция: «Срочно переведите деньги на безопасный счёт»",
      ro: "Instrucțiune: «Transferați urgent banii într-un cont sigur»",
    },
    sublabel: {
      ru: "Обещает, что после «перевыпуска защиты» деньги вернутся обратно",
      ro: "Promite că după «actualizarea protecției» banii vor reveni în cont",
    },
    isFlag: true,
    findingTitle: {
      ru: "Улика 3: Миф о «безопасном счёте»",
      ro: "Indiciul 3: Mitul «contului sigur»",
    },
    findingDesc: {
      ru: "В банках не существует «безопасных» или «резервных» счетов для спасения денег. Любой такой перевод отправляет деньги прямо на карту преступников.",
      ro: "În bănci nu există «conturi sigure» sau «de rezervă» pentru salvarea banilor. Orice astfel de transfer trimite banii direct pe cardul infractorilor.",
    },
  },
  {
    id: "spot-polite-tone",
    label: {
      ru: "Официальный тон и фоновый шум колл-центра",
      ro: "Ton oficial și zgomot de fond de call-center",
    },
    sublabel: {
      ru: "Звучат банковские термины, номер заявки и голоса операторов на фоне",
      ro: "Se aud termeni bancari, un număr de sesizare și voci de operatori pe fundal",
    },
    isFlag: false,
    findingTitle: {
      ru: "Обычная деталь: вежливый тон и шум легко имитировать",
      ro: "Detaliu obișnuit: tonul politicos și zgomotul sunt ușor de imitat",
    },
    findingDesc: {
      ru: "Фоновый шум офиса включают в записи, а деловую речь читают по готовому сценарию. Ориентируйся только на суть требований.",
      ro: "Zgomotul de birou este redat dintr-o înregistrare, iar discursul oficial este citit după un scenariu. Orientează-te doar după esența cerințelor.",
    },
  },
];

export const BANK_PRESSURE_TRAPS: BankPressureTrap[] = [
  {
    id: "trap-sms-code",
    attackerMessage: {
      ru: "«Робот уже отправляет вам SMS! Быстро продиктуйте 6 цифр кода, иначе списание 8 000 леев уйдёт мошенникам!»",
      ro: "«Robotul vă trimite acum un SMS! Dictați rapid cele 6 cifre ale codului, altfel plata de 8 000 de lei va pleca la escroci!»",
    },
    trapMechanism: {
      ru: "Выманивание кода 3D-Secure / входа под видом «отмены перевода»",
      ro: "Extragerea codului 3D-Secure / de autentificare sub pretextul «anulării plății»",
    },
    correctBlockerIndex: 0,
    successFeedback: {
      ru: `Верно! ${SAFETY_PHRASES.ru.smsCode}`,
      ro: `Corect! ${SAFETY_PHRASES.ro.smsCode}`,
    },
    wrongFeedback: {
      ru: "Подумай: какая защита остановит именно эту уловку?",
      ro: "Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
  {
    id: "trap-safe-account",
    attackerMessage: {
      ru: "«Ваш основной счёт скомпрометирован! Переведите все средства на временный защищённый счёт Национального банка!»",
      ro: "«Contul dumneavoastră principal este compromis! Transferați toate fondurile în contul temporar securizat al Băncii Naționale!»",
    },
    trapMechanism: {
      ru: "Легенда о «защищённом резервном счёте» для кражи денег собственными руками жертвы",
      ro: "Legenda «contului securizat de rezervă» pentru a convinge victima să transfere singură banii",
    },
    correctBlockerIndex: 1,
    successFeedback: {
      ru: "Отлично! Никаких «безопасных счетов» в банках и в BNM не существует — настоящий банк защищает счёт сам без переводов клиента.",
      ro: "Excelent! Nu există «conturi sigure» în bănci sau la BNM — o bancă reală protejează contul fără ca tu să transferi banii.",
    },
    wrongFeedback: {
      ru: "Подумай: какая защита остановит именно эту уловку?",
      ro: "Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
  {
    id: "trap-no-hangup",
    attackerMessage: {
      ru: "«Не кладите трубку и никому не говорите о звонке! Если прервёте линию, банк заблокирует все карты на 90 дней!»",
      ro: "«Nu închideți telefonul și nu spuneți nimănui despre apel! Dacă întrerupeți linia, banca vă va bloca toate cardurile pe 90 de zile!»",
    },
    trapMechanism: {
      ru: "Запрет положить трубку, чтобы жертва не перезвонила в настоящий банк",
      ro: "Interdicția de a închide, ca victima să nu poată suna la banca reală",
    },
    correctBlockerIndex: 2,
    successFeedback: {
      ru: `Точно! ${SAFETY_PHRASES.ru.bankCall}`,
      ro: `Exact! ${SAFETY_PHRASES.ro.bankCall}`,
    },
    wrongFeedback: {
      ru: "Подумай: какая защита остановит именно эту уловку?",
      ro: "Gândește-te: ce protecție oprește exact această capcană?",
    },
  },
];

export const BANK_ACTIONS: BankActionItem[] = [
  {
    id: "act-3ds-code",
    deviceTitle: {
      ru: "Передача кода из SMS и CVV-кода",
      ro: "Comunicarea codului din SMS și a codului CVV",
    },
    locationMeta: {
      ru: "Входящий звонок · Запрос под видом «отмены списания»",
      ro: "Apel primit · Cerere sub pretextul «anulării tranzacției»",
    },
    liveActivity: {
      ru: "Опасность: даёт мошеннику полный доступ к списанию денег с карты",
      ro: "Pericol: îi oferă escrocului acces complet pentru a retrage banii de pe card",
    },
    isHacker: true,
    explanation: {
      ru: "Запрос кода и CVV заблокирован — банк никогда не спрашивает эти данные.",
      ro: "Cererea codului și a CVV-ului a fost blocată — banca nu cere niciodată aceste date.",
    },
  },
  {
    id: "act-official-call",
    deviceTitle: {
      ru: "Звонок по номеру с оборота своей карты",
      ro: "Apel la numărul de pe spatele propriului card",
    },
    locationMeta: {
      ru: "Официальная горячая линия твоего банка · Набрано вручную",
      ro: "Linia fierbinte oficială a băncii tale · Format manual",
    },
    liveActivity: {
      ru: "Безопасно: единственный надёжный способ проверить состояние счёта",
      ro: "Sigur: singura metodă de încredere pentru a verifica starea contului",
    },
    isHacker: false,
    explanation: {
      ru: "Это официальный и безопасный канал связи с банком! Блокировать его не нужно — блокируй только уловки мошенников.",
      ro: "Acesta este canalul oficial și sigur de comunicare cu banca! Nu trebuie blocat — blochează doar cererile escrocilor.",
    },
  },
  {
    id: "act-remote-access",
    deviceTitle: {
      ru: "Установка программы удалённого доступа (AnyDesk / RustDesk)",
      ro: "Instalarea unei aplicații de acces la distanță (AnyDesk / RustDesk)",
    },
    locationMeta: {
      ru: "По ссылке из чата · Под видом «антивирусной проверки счёта»",
      ro: "Prin link din chat · Sub pretextul «verificării antivirus a contului»",
    },
    liveActivity: {
      ru: "Опасность: мошенник увидит экран телефона и все входящие SMS-коды",
      ro: "Pericol: escrocul va vedea ecranul telefonului și toate codurile SMS primite",
    },
    isHacker: true,
    explanation: {
      ru: "Удалённый доступ заблокирован — сотрудники банка никогда не просят ставить такие программы.",
      ro: "Accesul la distanță a fost blocat — angajații băncii nu cer niciodată instalarea unor astfel de aplicații.",
    },
  },
  {
    id: "act-safe-transfer",
    deviceTitle: {
      ru: "Перевод денег на «резервный защищённый счёт»",
      ro: "Transferul banilor într-un «cont securizat de rezervă»",
    },
    locationMeta: {
      ru: "Через банкомат или приложение · На реквизиты, продиктованные по телефону",
      ro: "Prin bancomat sau aplicație · În contul dictat la telefon",
    },
    liveActivity: {
      ru: "Опасность: перевод уходит напрямую на подставную карту преступников",
      ro: "Pericol: transferul pleacă direct pe cardul interpus al infractorilor",
    },
    isHacker: true,
    explanation: {
      ru: "Перевод на «безопасный счёт» заблокирован — деньги остались на твоей настоящей карте.",
      ro: "Transferul în «contul sigur» a fost blocat — banii au rămas pe cardul tău real.",
    },
  },
];

export const BANK_DEFENSE_ROUNDS: BankDefenseRound[] = [
  {
    id: "round-1-hangup",
    layerBadge: {
      ru: "РУБЕЖ 1 ИЗ 3 · ПЕРВОЕ ДЕЙСТВИЕ ПРИ ПОДОЗРИТЕЛЬНОМ ЗВОНКЕ",
      ro: "LINIA 1 DIN 3 · PRIMA ACȚIUNE LA UN APEL SUSPECT",
    },
    shadowThreat: {
      ru: "Тень: «С вашей карты прямо сейчас списывают 5 000 леев! Немедленно назовите код из SMS!»",
      ro: "Umbra: «De pe cardul tău se retrag chiar acum 5 000 de lei! Spune imediat codul din SMS!»",
    },
    cards: [
      {
        id: "r1-call-bank",
        title: {
          ru: "Положить трубку и позвонить самому",
          ro: "Închide și sună singur la bancă",
        },
        desc: {
          ru: SAFETY_PHRASES.ru.bankCall,
          ro: SAFETY_PHRASES.ro.bankCall,
        },
        correct: true,
        feedback: {
          ru: "Верно! Прервав разговор и набрав номер с оборота карты вручную, ты полностью отсекаешь мошенника.",
          ro: "Corect! Închizând apelul și formând manual numărul de pe spatele cardului, îl blochezi complet pe escroc.",
        },
      },
      {
        id: "r1-tell-code",
        title: {
          ru: "Назвать код из SMS для отмены",
          ro: "Spune codul din SMS pentru anulare",
        },
        desc: {
          ru: "Продиктовать цифры звонящему, чтобы он «остановил перевод».",
          ro: "Dictează cifrele apelantului ca el «să oprească transferul».",
        },
        correct: false,
        feedback: {
          ru: `Ошибка! ${SAFETY_PHRASES.ru.smsCode}`,
          ro: `Greșeală! ${SAFETY_PHRASES.ro.smsCode}`,
        },
      },
      {
        id: "r1-ask-badge",
        title: {
          ru: "Попросить прислать удостоверение в чат",
          ro: "Cere să trimită legitimația în chat",
        },
        desc: {
          ru: "Поверить звонящему, если он пришлёт фото документа с печатью.",
          ro: "Crede apelantul dacă trimite poza unui document cu ștampilă.",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Настоящие банки не присылают удостоверения в мессенджеры — такие картинки рисуют мошенники.",
          ro: "Greșeală! Băncile reale nu trimit legitimații pe messenger — astfel de imagini sunt fabricate de escroci.",
        },
      },
    ],
  },
  {
    id: "round-2-sms-rule",
    layerBadge: {
      ru: "РУБЕЖ 2 ИЗ 3 · ЗАЩИТА КОДА ИЗ SMS",
      ro: "LINIA 2 DIN 3 · PROTECȚIA CODULUI DIN SMS",
    },
    shadowThreat: {
      ru: "Тень: «Хорошо, не говорите код мне — просто введите его в форму по ссылке, которую я прислал в SMS!»",
      ro: "Umbra: «Bine, nu-mi spuneți codul mie — doar introduceți-l în formularul de pe linkul pe care l-am trimis prin SMS!»",
    },
    cards: [
      {
        id: "r2-self-app",
        title: {
          ru: "Вводить код только там, что открыл сам",
          ro: "Introdu codul doar unde ai deschis singur",
        },
        desc: {
          ru: SAFETY_PHRASES.ru.smsCode,
          ro: SAFETY_PHRASES.ro.smsCode,
        },
        correct: true,
        feedback: {
          ru: "Отлично! Код из SMS никогда нельзя называть вслух или вводить на страницах из присланных ссылок.",
          ro: "Excelent! Codul din SMS nu trebuie spus niciodată cu voce tare sau introdus pe pagini deschise din linkuri primite.",
        },
      },
      {
        id: "r2-enter-link",
        title: {
          ru: "Ввести код на сайте по ссылке из чата",
          ro: "Introdu codul pe site-ul din linkul primit",
        },
        desc: {
          ru: "Перейти по присланной ссылке и ввести 6 цифр в форму «отмены».",
          ro: "Accesează linkul primit și introdu cele 6 cifre în formularul de «anulare».",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Фишинговый сайт по ссылке мгновенно передаст введённый код мошенникам.",
          ro: "Greșeală! Site-ul de phishing din link va transmite instantaneu codul introdus către escroci.",
        },
      },
      {
        id: "r2-forward-sms",
        title: {
          ru: "Переслать SMS «роботу безопасности»",
          ro: "Redirecționează SMS-ul către «robotul de securitate»",
        },
        desc: {
          ru: "Отправить сообщение с кодом в ответном чате без звонка.",
          ro: "Trimite mesajul cu codul în chat, fără a-l spune la telefon.",
        },
        correct: false,
        feedback: {
          ru: `Ошибка! ${SAFETY_PHRASES.ru.smsCode}`,
          ro: `Greșeală! ${SAFETY_PHRASES.ro.smsCode}`,
        },
      },
    ],
  },
  {
    id: "round-3-already-told",
    layerBadge: {
      ru: "РУБЕЖ 3 ИЗ 3 · ЧТО ДЕЛАТЬ, ЕСЛИ УЖЕ НАЗВАЛ ДАННЫЕ КАРТЫ",
      ro: "LINIA 3 DIN 3 · CE FACI DACĂ AI SPUS DEJA DATELE CARDULUI",
    },
    shadowThreat: {
      ru: "Тень: «Что делать человеку, если он растерялся и уже успел назвать мошеннику данные карты или код?»",
      ro: "Umbra: «Ce trebuie să facă o persoană dacă s-a pierdut cu firea și a spus deja escrocului datele cardului sau codul?»",
    },
    cards: [
      {
        id: "r3-block-immediately",
        title: {
          ru: "Сразу заблокировать карту в приложении или банке",
          ro: "Blochează imediat cardul în aplicație sau la bancă",
        },
        desc: {
          ru: "Немедленно заблокировать карту в официальном приложении банка, позвонить по номеру с оборота карты и сообщить в полицию (112).",
          ro: "Blochează imediat cardul în aplicația oficială a băncii, sună la numărul de pe spatele cardului și anunță poliția (112).",
        },
        correct: true,
        feedback: {
          ru: "Победа! Мгновенная блокировка карты в официальном приложении и обращение в свой банк и полицию останавливают кражу.",
          ro: "Victorie! Blocarea imediată a cardului în aplicația oficială și contactarea băncii și a poliției opresc furtul.",
        },
      },
      {
        id: "r3-wait-sms",
        title: {
          ru: "Подождать до завтра и проверить баланс",
          ro: "Așteaptă până mâine și verifică soldul",
        },
        desc: {
          ru: "Ничего не предпринимать, пока не придут новые уведомления.",
          ro: "Nu face nimic până nu apar notificări noi.",
        },
        correct: false,
        feedback: {
          ru: "Ошибка! Мошенники списывают деньги за считанные минуты — карту нужно блокировать немедленно.",
          ro: "Greșeală! Escrocii retrag banii în câteva minute — cardul trebuie blocat imediat.",
        },
      },
      {
        id: "r3-call-back-scammer",
        title: {
          ru: "Перезвонить на номер, с которого звонили",
          ro: "Sună înapoi la numărul de pe care ai fost apelat",
        },
        desc: {
          ru: "Попросить звонившего отменить операцию и вернуть деньги.",
          ro: "Cere apelantului să anuleze operațiunea și să returneze banii.",
        },
        correct: false,
        feedback: {
          ru: `Ошибка! Звонить нужно только в настоящий банк. ${SAFETY_PHRASES.ru.bankCall}`,
          ro: `Greșeală! Trebuie să suni doar la banca reală. ${SAFETY_PHRASES.ro.bankCall}`,
        },
      },
    ],
  },
];
