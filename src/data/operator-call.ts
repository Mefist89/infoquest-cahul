export type OperatorLocale = "ru" | "ro";

export const operatorCallContent = {
  ru: {
    title: "Фальшивый звонок оператора",
    eyebrow: "Модуль 1 · Телефонное мошенничество",
    description: "Научись распознавать давление, защищать коды из SMS и безопасно проверять звонящего.",
    back: "На главную",
    profile: "Профиль",
    progress: "Прогресс модуля",
    xp: "XP модуля",
    completed: "Пройдено",
    locked: "Сначала заверши предыдущий этап",
    continue: "Завершить этап",
    next: "Следующий этап",
    retry: "Попробовать ещё раз",
    check: "Проверить ответ",
    saved: "Прогресс сохранён в Supabase",
    saveError: "Не удалось сохранить прогресс. Проверь соединение и повтори.",
    intro: {
      title: "Вступление",
      subtitle: "Знакомство с наставником",
      name: "Наталья",
      role: "Наставник по цифровой безопасности",
      next: "Дальше",
      start: "Начать теорию",
      listen: "Прослушать текст",
      listening: "Воспроизведение…",
      lines: [
        "Привет! Я Наталья, и сегодня мы разберём опасный телефонный звонок.",
        "Мошенник представится сотрудником оператора и попробует заставить тебя спешить.",
        "Запомни: настоящий сотрудник никогда не просит пароль или код из SMS.",
        "Будь внимателен, проверяй каждую деталь — и останови атаку Тени.",
      ],
    },
    stages: [
      { title: "Теория", subtitle: "Как устроен звонок мошенника" },
      { title: "Видеообъяснение", subtitle: "Пять признаков опасного звонка" },
      { title: "Видеопример", subtitle: "Разговор с «оператором CahulTel»" },
      { title: "Игра: найди сигналы", subtitle: "Отметь подозрительные детали" },
      { title: "Игра: классификация", subtitle: "Безопасная или опасная фраза" },
      { title: "Игра: диалог", subtitle: "Выбери правильный ответ" },
      { title: "Игра: порядок действий", subtitle: "Собери безопасный алгоритм" },
      { title: "Финальная схватка", subtitle: "Останови атаку Тени" },
    ],
    theory: {
      lead: "Мошенник старается не убедить фактами, а заставить действовать быстро. Настоящему оператору не нужен код из твоего SMS.",
      cards: [
        { title: "Срочность и Давление", text: "«Сейчас отключим номер» — мошенник давит, чтобы ты не успел подумать. Настоящий оператор не торопит." },
        { title: "Коды и Ссылки", text: "Код из SMS — это ключ от аккаунта. Никогда не сообщай его и не открывай ссылки от звонящего." },
      ],
      rule: "Главное правило: положи трубку, ничего не сообщай и проверь информацию через официальный канал.",
    },
    videoExplanation: {
      title: "Как распознать социальную инженерию",
      placeholder: "Место для видеообъяснения",
      hint: "Видео будет подключено отдельным MP4. Пока используй краткий конспект.",
      points: ["Не доверяй номеру на экране — его можно подменить.", "Код из SMS, пароль и PIN никогда не называют по телефону.", "Срочность и угрозы — повод остановить разговор.", "Проверяй информацию самостоятельно, а не по ссылке звонящего."],
    },
    videoExample: {
      title: "Учебный звонок от вымышленного оператора CahulTel",
      placeholder: "Место для видеопримера",
      hint: "В примере нет реальных телефонов, брендов или данных.",
      transcript: [
        { speaker: "Звонящий", text: "Здравствуйте! Ваш номер будет заблокирован через десять минут." },
        { speaker: "Мария", text: "Почему? Как я могу это проверить?" },
        { speaker: "Звонящий", text: "Сейчас придёт SMS. Назовите код и откройте ссылку — иначе номер отключится." },
        { speaker: "Мария", text: "Я завершу звонок и сама свяжусь с оператором по официальному номеру." },
      ],
    },
    callSimulator: {
      prompt: "Выслушай звонящего. Если фраза подозрительная — жми ТРЕВОГА. Если обычная — ВСЁ НОРМАЛЬНО.",
      safeBtn: "Всё нормально",
      dangerBtn: "ТРЕВОГА! (Сброс)",
      startBtn: "Начать звонок",
      retryBtn: "Попробовать снова",
      levelText: "Уровень",
      win: "Отличная реакция! Ты отбил все атаки.",
      loseThreat: "Ошибка! Это был мошенник. Нужно было сбросить звонок.",
      loseSafe: "Ошибка! Ты сбросил звонок реального оператора. Здесь не было угрозы.",
      timeout: "Время вышло! Мошенник успел тебя запутать.",
      levels: [
        {
          id: 1,
          phrases: [
            { text: "Ваш номер блокируется через 5 минут, срочно назовите код из SMS!", isThreat: true }
          ]
        },
        {
          id: 2,
          phrases: [
            { text: "Здравствуйте, меня зовут Иван, компания CahulTel.", isThreat: false },
            { text: "Мы зафиксировали сбой. Для безопасности продиктуйте пароль от личного кабинета.", isThreat: true }
          ]
        },
        {
          id: 3,
          phrases: [
            { text: "Добрый день. Служба поддержки.", isThreat: false },
            { text: "Мы меняем вышки связи в вашем районе.", isThreat: false },
            { text: "Нужно обновить договор. Перейдите по ссылке, которую я вам скинул.", isThreat: true }
          ]
        },
        {
          id: 4,
          phrases: [
            { text: "Здравствуйте! Это техподдержка. Ваш номер работает нормально?", isThreat: false },
            { text: "Отлично. Хотите подключить бесплатный антиспам?", isThreat: false },
            { text: "Тогда не кладите трубку, сейчас придет SMS-код подтверждения, назовите его.", isThreat: true }
          ]
        },
        {
          id: 5,
          phrases: [
            { text: "Добрый день, это уведомление CahulTel.", isThreat: false },
            { text: "Напоминаем о необходимости пополнить счет до конца месяца.", isThreat: false },
            { text: "Вы можете сделать это через официальное приложение. Всего доброго!", isThreat: false }
          ]
        }
      ]
    },
    classify: {
      prompt: "Для каждой фразы выбери категорию.",
      safe: "Безопасно",
      danger: "Опасно",
      items: [
        { id: "a", text: "Назовите шестизначный код, чтобы сохранить номер", answer: "danger" },
        { id: "b", text: "Завершите звонок и свяжитесь с нами по номеру из приложения", answer: "safe" },
        { id: "c", text: "Не кладите трубку — предложение действует две минуты", answer: "danger" },
        { id: "d", text: "Мы никогда не запрашиваем пароль или код из SMS", answer: "safe" },
      ],
    },
    dialogue: {
      prompt: "«Оператор» говорит: “Продиктуйте код, иначе SIM-карта будет заблокирована”. Что ответить?",
      choices: [
        { id: "give", label: "Назвать код, чтобы не потерять номер", score: 0 },
        { id: "delay", label: "Попросить перезвонить через час", score: 30 },
        { id: "safe", label: "Завершить звонок и самому набрать официальный номер", score: 100 },
      ],
      result: "Безопасное решение — прекратить разговор и начать независимую проверку.",
    },
    ordering: {
      prompt: "Нажимай действия в правильном порядке.",
      actions: [
        { id: "end", label: "Завершить подозрительный звонок" },
        { id: "open", label: "Самостоятельно открыть официальное приложение" },
        { id: "contact", label: "Связаться с оператором через официальный канал" },
        { id: "secure", label: "Если код уже сообщён — сменить пароль и обратиться в поддержку" },
      ],
      correct: ["end", "open", "contact", "secure"],
    },
    final: {
      intro: "Тень звонит жителям от имени CahulTel. Ответь минимум на 4 из 5 вопросов, чтобы остановить атаку.",
      questions: [
        { id: "q1", text: "Кто может попросить код из SMS?", options: ["Сотрудник оператора", "Никто", "Только курьер"], answer: 1 },
        { id: "q2", text: "Что делать при угрозе срочной блокировки?", options: ["Поторопиться", "Завершить звонок и проверить отдельно", "Назвать паспортные данные"], answer: 1 },
        { id: "q3", text: "Можно ли доверять номеру на экране?", options: ["Всегда", "Только местному", "Нет, номер можно подменить"], answer: 2 },
        { id: "q4", text: "Куда переходить для проверки аккаунта?", options: ["По ссылке звонящего", "В официальное приложение, открытое самостоятельно", "В первый результат рекламы"], answer: 1 },
        { id: "q5", text: "Ты уже сообщил код. Первое действие?", options: ["Ждать", "Удалить SMS", "Срочно сменить пароль и связаться с поддержкой"], answer: 2 },
      ],
      win: "Атака остановлена! Ты получаешь награду «Безопасная линия».",
      lose: "Тень пока сильнее. Повтори правила и попробуй ещё раз.",
    },
  },
  ro: {
    title: "Apelul fals de la operator",
    eyebrow: "Modulul 1 · Fraude telefonice",
    description: "Învață să recunoști presiunea, să protejezi codurile SMS și să verifici apelantul în siguranță.",
    back: "Pagina principală",
    profile: "Profil",
    progress: "Progresul modulului",
    xp: "XP în modul",
    completed: "Finalizate",
    locked: "Finalizează mai întâi etapa precedentă",
    continue: "Finalizează etapa",
    next: "Etapa următoare",
    retry: "Încearcă din nou",
    check: "Verifică răspunsul",
    saved: "Progres salvat în Supabase",
    saveError: "Progresul nu a putut fi salvat. Verifică conexiunea și repetă.",
    intro: {
      title: "Introducere",
      subtitle: "Cunoaște mentorul",
      name: "Natalia",
      role: "Mentor în siguranță digitală",
      next: "Continuă",
      start: "Începe teoria",
      listen: "Ascultă textul",
      listening: "Se redă…",
      lines: [
        "Salut! Sunt Natalia și astăzi vom analiza un apel telefonic periculos.",
        "Escrocul se va prezenta drept operator și va încerca să te facă să te grăbești.",
        "Reține: un angajat real nu solicită niciodată parola sau codul din SMS.",
        "Fii atent, verifică fiecare detaliu și oprește atacul Umbrei.",
      ],
    },
    stages: [
      { title: "Teorie", subtitle: "Cum funcționează apelul fraudulos" },
      { title: "Explicație video", subtitle: "Cinci semne ale unui apel periculos" },
      { title: "Exemplu video", subtitle: "Discuția cu „operatorul CahulTel”" },
      { title: "Joc: găsește semnele", subtitle: "Marchează detaliile suspecte" },
      { title: "Joc: clasificare", subtitle: "Frază sigură sau periculoasă" },
      { title: "Joc: dialog", subtitle: "Alege răspunsul corect" },
      { title: "Joc: ordinea acțiunilor", subtitle: "Construiește algoritmul sigur" },
      { title: "Confruntarea finală", subtitle: "Oprește atacul Umbrei" },
    ],
    theory: {
      lead: "Escrocul nu încearcă să convingă prin fapte, ci să te facă să acționezi rapid. Un operator real nu are nevoie de codul tău SMS.",
      cards: [
        { title: "Urgență și Presiune", text: "„Numărul va fi dezactivat acum” — escrocul te presează să nu gândești rațional. Un operator real nu te grăbește." },
        { title: "Coduri și Linkuri", text: "Codul SMS este cheia contului tău. Nu-l comunica niciodată și nu accesa linkuri primite de la apelant." },
      ],
      rule: "Regula principală: închide, nu comunica nimic și verifică informația printr-un canal oficial.",
    },
    videoExplanation: {
      title: "Cum recunoști ingineria socială",
      placeholder: "Loc pentru explicația video",
      hint: "Videoclipul va fi conectat ca MP4 separat. Până atunci folosește rezumatul.",
      points: ["Nu te baza pe numărul afișat — acesta poate fi falsificat.", "Codul SMS, parola și PIN-ul nu se comunică telefonic.", "Urgența și amenințările sunt motive să oprești conversația.", "Verifică independent, nu prin linkul apelantului."],
    },
    videoExample: {
      title: "Apel educațional de la operatorul fictiv CahulTel",
      placeholder: "Loc pentru exemplul video",
      hint: "Exemplul nu folosește telefoane, mărci sau date reale.",
      transcript: [
        { speaker: "Apelant", text: "Bună ziua! Numărul dvs. va fi blocat în zece minute." },
        { speaker: "Maria", text: "De ce? Cum pot verifica acest lucru?" },
        { speaker: "Apelant", text: "Veți primi un SMS. Spuneți codul și deschideți linkul, altfel numărul va fi dezactivat." },
        { speaker: "Maria", text: "Închei apelul și contactez singură operatorul la numărul oficial." },
      ],
    },
    callSimulator: {
      prompt: "Ascultă apelantul. Dacă fraza este suspectă — apasă ALARMĂ. Dacă este normală — TOTUL E BINE.",
      safeBtn: "Totul e bine",
      dangerBtn: "ALARMĂ! (Închide)",
      startBtn: "Începe apelul",
      retryBtn: "Încearcă din nou",
      levelText: "Nivelul",
      win: "Reacție excelentă! Ai respins toate atacurile.",
      loseThreat: "Greșeală! Era un escroc. Trebuia să închizi apelul.",
      loseSafe: "Greșeală! Ai închis unui operator real. Aici nu era nicio amenințare.",
      timeout: "Timpul a expirat! Escrocul a reușit să te deruteze.",
      levels: [
        {
          id: 1,
          phrases: [
            { text: "Numărul tău va fi blocat în 5 minute, spune-mi urgent codul din SMS!", isThreat: true }
          ]
        },
        {
          id: 2,
          phrases: [
            { text: "Bună ziua, mă numesc Ion, de la compania CahulTel.", isThreat: false },
            { text: "Am detectat o eroare. Pentru siguranță, dictați parola contului personal.", isThreat: true }
          ]
        },
        {
          id: 3,
          phrases: [
            { text: "Bună ziua. Serviciul de asistență.", isThreat: false },
            { text: "Schimbăm turnurile de comunicație din zona ta.", isThreat: false },
            { text: "Trebuie să actualizăm contractul. Accesează linkul pe care ți l-am trimis.", isThreat: true }
          ]
        },
        {
          id: 4,
          phrases: [
            { text: "Bună ziua! Suport tehnic. Numărul funcționează normal?", isThreat: false },
            { text: "Perfect. Vrei să activezi un sistem anti-spam gratuit?", isThreat: false },
            { text: "Atunci nu închide, vei primi acum un cod SMS de confirmare, spune-mi-l.", isThreat: true }
          ]
        },
        {
          id: 5,
          phrases: [
            { text: "Bună ziua, este o notificare CahulTel.", isThreat: false },
            { text: "Îți reamintim să suplinești contul până la sfârșitul lunii.", isThreat: false },
            { text: "O poți face oricând prin aplicația oficială. O zi bună!", isThreat: false }
          ]
        }
      ]
    },
    classify: {
      prompt: "Alege categoria pentru fiecare frază.",
      safe: "Sigur",
      danger: "Periculos",
      items: [
        { id: "a", text: "Spuneți codul din șase cifre pentru a păstra numărul", answer: "danger" },
        { id: "b", text: "Încheiați apelul și contactați-ne la numărul din aplicație", answer: "safe" },
        { id: "c", text: "Nu închideți — oferta este valabilă două minute", answer: "danger" },
        { id: "d", text: "Nu solicităm niciodată parola sau codul SMS", answer: "safe" },
      ],
    },
    dialogue: {
      prompt: "„Operatorul” spune: «Dictați codul sau cartela SIM va fi blocată». Ce răspunzi?",
      choices: [
        { id: "give", label: "Spun codul ca să nu pierd numărul", score: 0 },
        { id: "delay", label: "Îl rog să sune din nou peste o oră", score: 30 },
        { id: "safe", label: "Închei apelul și sun singur la numărul oficial", score: 100 },
      ],
      result: "Decizia sigură este să oprești discuția și să începi o verificare independentă.",
    },
    ordering: {
      prompt: "Apasă acțiunile în ordinea corectă.",
      actions: [
        { id: "end", label: "Încheie apelul suspect" },
        { id: "open", label: "Deschide singur aplicația oficială" },
        { id: "contact", label: "Contactează operatorul prin canalul oficial" },
        { id: "secure", label: "Dacă ai spus codul, schimbă parola și contactează suportul" },
      ],
      correct: ["end", "open", "contact", "secure"],
    },
    final: {
      intro: "Umbra sună locuitorii în numele CahulTel. Răspunde corect la cel puțin 4 din 5 întrebări.",
      questions: [
        { id: "q1", text: "Cine poate solicita codul SMS?", options: ["Operatorul", "Nimeni", "Doar curierul"], answer: 1 },
        { id: "q2", text: "Ce faci la amenințarea unei blocări urgente?", options: ["Mă grăbesc", "Închei și verific separat", "Spun datele din buletin"], answer: 1 },
        { id: "q3", text: "Poți avea încredere în numărul afișat?", options: ["Întotdeauna", "Doar dacă este local", "Nu, poate fi falsificat"], answer: 2 },
        { id: "q4", text: "Unde verifici contul?", options: ["În linkul apelantului", "În aplicația oficială deschisă personal", "În prima reclamă"], answer: 1 },
        { id: "q5", text: "Ai comunicat deja codul. Ce faci prima dată?", options: ["Aștept", "Șterg SMS-ul", "Schimb urgent parola și contactez suportul"], answer: 2 },
      ],
      win: "Atacul a fost oprit! Primești recompensa „Linie sigură”.",
      lose: "Umbra este încă puternică. Recitește regulile și încearcă din nou.",
    },
  },
} as const;
