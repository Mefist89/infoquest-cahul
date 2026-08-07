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
      { title: "Видеопример", subtitle: "Разговор с «оператором MinTel»" },
      { title: "Игра: найди сигналы", subtitle: "Отметь подозрительные детали" },
      { title: "Игра: классификация", subtitle: "Безопасная или опасная фраза" },
      { title: "Игра: диалог", subtitle: "Выбери правильный ответ" },
      { title: "Игра: порядок действий", subtitle: "Собери безопасный алгоритм" },
      { title: "Финальная схватка", subtitle: "Останови атаку Тени" },
    ],
    theory: {
      lead: "Мошенник старается не убедить фактами, а заставить действовать быстро. Настоящему оператору не нужен код из твоего SMS.",
      cards: [
        { title: "Срочность и Давление", text: "Мошенник всегда торопит и пугает отключением номера. Настоящий оператор дает время подумать." },
        { title: "Коды из SMS", text: "Никогда не диктуй код из SMS. Это ключ к твоему личному кабинету или банку." },
        { title: "Переход по ссылкам", text: "Не открывай ссылки из сообщений, которые присылает звонящий." },
        { title: "Личные данные", text: "Настоящий оператор не будет по телефону запрашивать пароли или полные паспортные данные." },
        { title: "Проверка номера", text: "Номер на экране может быть поддельным (спуфинг). Не доверяй ему вслепую." },
        { title: "Самостоятельный перезвон", text: "Положи трубку и сам перезвони по официальному номеру поддержки MinTel." },
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
      title: "Учебный звонок от вымышленного оператора MinTel",
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
            { text: "Здравствуйте, меня зовут Иван, компания MinTel.", isThreat: false },
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
            { text: "Добрый день, это уведомление MinTel.", isThreat: false },
            { text: "Напоминаем о необходимости пополнить счет до конца месяца.", isThreat: false },
            { text: "Вы можете сделать это через официальное приложение. Всего доброго!", isThreat: false }
          ]
        }
      ]
    },
    classify: {
      prompt: "Смахивай карточки! Влево — Опасно (Мошенник), Вправо — Безопасно (Настоящий оператор).",
      safe: "Безопасно",
      danger: "Опасно",
      completeMessage: "Все карточки разобраны!",
      items: [
        { id: "c1", text: "Назовите код из SMS для отмены операции.", answer: "danger" },
        { id: "c2", text: "Ваш номер заблокирован, перейдите по ссылке для разблокировки.", answer: "danger" },
        { id: "c3", text: "Здравствуйте, меня зовут Анна, компания MinTel.", answer: "safe" },
        { id: "c4", text: "Продиктуйте ваши паспортные данные для подтверждения.", answer: "danger" },
        { id: "c5", text: "Служба поддержки слушает вас. Чем могу помочь?", answer: "safe" },
        { id: "c6", text: "Для оценки качества обслуживания после разговора нажмите 1.", answer: "safe" },
        { id: "c7", text: "Мы зафиксировали взлом. Срочно скачайте антивирус по ссылке в SMS.", answer: "danger" },
        { id: "c8", text: "Спасибо за звонок, все детали есть в вашем официальном приложении.", answer: "safe" },
        { id: "c9", text: "Оставайтесь на линии! У вас есть всего одна минута, чтобы согласиться!", answer: "danger" },
        { id: "c10", text: "Мы меняем ваш тариф. Чтобы отказаться, продиктуйте старый пароль.", answer: "danger" },
        { id: "c11", text: "Ваш баланс ниже нуля. Пополните счет удобным способом до конца дня.", answer: "safe" },
        { id: "c12", text: "Это автоинформатор. Ваша заявка на смену номера принята. Если это не вы — оставайтесь на линии.", answer: "danger" },
        { id: "c13", text: "Для вашей защиты мы прислали системный код. Просто введите его на клавиатуре телефона во время звонка.", answer: "danger" },
        { id: "c14", text: "Если вы сомневаетесь, что я оператор — положите трубку и перезвоните нам сами.", answer: "safe" },
        { id: "c15", text: "Мы не просим пароли. Просто скажите чётко «ДА», чтобы подтвердить продление договора.", answer: "danger" }
      ],
    },
    dialogue: {
      prompt: "Выдели все уловки мошенника маркером (кликай на фразы).",
      levelText: "Уровень",
      verifyBtn: "Проверить",
      error: "Ты пропустил уловку или выделил лишнее. Попробуй еще раз!",
      win: "Отлично! Ты нашел все манипуляции.",
      levels: [
        {
          id: 1,
          liesCount: 1,
          parts: [
            { id: "p1", text: "Здравствуйте! Компания MinTel информирует о новых тарифах. ", isLie: false },
            { id: "p2", text: "Продиктуйте SMS-код для их активации", isLie: true },
            { id: "p3", text: ". Спасибо за доверие.", isLie: false },
          ]
        },
        {
          id: 2,
          liesCount: 2,
          parts: [
            { id: "p1", text: "Служба безопасности MinTel. ", isLie: false },
            { id: "p2", text: "Ваша сим-карта заблокирована.", isLie: true },
            { id: "p3", text: " Чтобы отменить блокировку, ", isLie: false },
            { id: "p4", text: "перейдите по ссылке www.mintel-support.com", isLie: true },
            { id: "p5", text: ". Ждем вашего ответа.", isLie: false },
          ]
        },
        {
          id: 3,
          liesCount: 3,
          parts: [
            { id: "p1", text: "Это автоинформатор MinTel. ", isLie: false },
            { id: "p2", text: "Поступила заявка на смену вашего номера.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Если это не вы, нажмите цифру 1 прямо сейчас.", isLie: true },
            { id: "p5", text: " Затем ", isLie: false },
            { id: "p6", text: "назовите пароль от личного кабинета", isLie: true },
            { id: "p7", text: " ответившему оператору.", isLie: false },
          ]
        },
        {
          id: 4,
          liesCount: 4,
          parts: [
            { id: "p1", text: "Важная информация! ", isLie: false },
            { id: "p2", text: "Срок действия вашего договора истекает сегодня.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Для срочного продления назовите паспортные данные.", isLie: true },
            { id: "p5", text: " ", isLie: false },
            { id: "p6", text: "Иначе номер будет передан другому абоненту.", isLie: true },
            { id: "p7", text: " ", isLie: false },
            { id: "p8", text: "Ни в коем случае не кладите трубку, пока я проверяю ваши данные.", isLie: true }
          ]
        },
        {
          id: 5,
          liesCount: 5,
          parts: [
            { id: "p1", text: "Добрый день. ", isLie: false },
            { id: "p2", text: "Мы зафиксировали взлом вашего аккаунта MinTel.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Прямо сейчас мошенники пытаются украсть ваши деньги.", isLie: true },
            { id: "p5", text: " ", isLie: false },
            { id: "p6", text: "Срочно продиктуйте код из сообщения, которое мы отправили.", isLie: true },
            { id: "p7", text: " ", isLie: false },
            { id: "p8", text: "Не вздумайте перезванивать в поддержку, иначе система заблокирует телефон.", isLie: true },
            { id: "p9", text: " ", isLie: false },
            { id: "p10", text: "Для надежности откройте банковское приложение, пока мы на связи.", isLie: true }
          ]
        }
      ]
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
      intro: "Тень звонит жителям от имени MinTel. Ответь минимум на 4 из 5 вопросов, чтобы остановить атаку.",
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
      { title: "Exemplu video", subtitle: "Discuția cu „operatorul MinTel”" },
      { title: "Joc: găsește semnele", subtitle: "Marchează detaliile suspecte" },
      { title: "Joc: clasificare", subtitle: "Frază sigură sau periculoasă" },
      { title: "Joc: dialog", subtitle: "Alege răspunsul corect" },
      { title: "Joc: ordinea acțiunilor", subtitle: "Construiește algoritmul sigur" },
      { title: "Confruntarea finală", subtitle: "Oprește atacul Umbrei" },
    ],
    theory: {
      lead: "Escrocul nu încearcă să convingă prin fapte, ci să te facă să acționezi rapid. Un operator real nu are nevoie de codul tău SMS.",
      cards: [
        { title: "Urgență și Presiune", text: "Escrocul te grăbește mereu și te sperie cu blocarea numărului. Un operator real îți oferă timp." },
        { title: "Coduri din SMS", text: "Nu dicta niciodată codul din SMS. Acesta este cheia contului sau a băncii tale." },
        { title: "Accesarea linkurilor", text: "Nu deschide linkurile din mesajele pe care ți le trimite apelantul." },
        { title: "Date personale", text: "Un operator real nu va solicita parole sau date din buletin prin telefon." },
        { title: "Verificarea numărului", text: "Numărul de pe ecran poate fi falsificat (spoofing). Nu avea încredere oarbă în el." },
        { title: "Apelul independent", text: "Închide și sună personal la numărul oficial de suport MinTel." },
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
      title: "Apel educațional de la operatorul fictiv MinTel",
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
            { text: "Bună ziua, mă numesc Ion, de la compania MinTel.", isThreat: false },
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
            { text: "Bună ziua, este o notificare MinTel.", isThreat: false },
            { text: "Îți reamintim să suplinești contul până la sfârșitul lunii.", isThreat: false },
            { text: "O poți face oricând prin aplicația oficială. O zi bună!", isThreat: false }
          ]
        }
      ]
    },
    classify: {
      prompt: "Glisează cardurile! La stânga — Periculos (Escroc), La dreapta — Sigur (Operator real).",
      safe: "Sigur",
      danger: "Periculos",
      completeMessage: "Toate cardurile au fost sortate!",
      items: [
        { id: "c1", text: "Spuneți codul din SMS pentru a anula operațiunea.", answer: "danger" },
        { id: "c2", text: "Numărul dvs. este blocat, accesați linkul pentru deblocare.", answer: "danger" },
        { id: "c3", text: "Bună ziua, mă numesc Ana, compania MinTel.", answer: "safe" },
        { id: "c4", text: "Dictați datele din buletin pentru confirmare.", answer: "danger" },
        { id: "c5", text: "Serviciul de asistență vă ascultă. Cu ce vă pot ajuta?", answer: "safe" },
        { id: "c6", text: "Pentru a evalua calitatea deservirii, apăsați tasta 1.", answer: "safe" },
        { id: "c7", text: "Am detectat o spargere. Descărcați urgent antivirusul din linkul SMS.", answer: "danger" },
        { id: "c8", text: "Vă mulțumim pentru apel, detaliile le găsiți în aplicația oficială.", answer: "safe" },
        { id: "c9", text: "Rămâneți pe fir! Aveți la dispoziție doar un minut pentru a accepta!", answer: "danger" },
        { id: "c10", text: "Vă schimbăm tariful. Pentru a refuza, dictați vechea parolă.", answer: "danger" },
        { id: "c11", text: "Soldul dvs. este negativ. Supliniți contul până la sfârșitul zilei.", answer: "safe" },
        { id: "c12", text: "Sistem automat. Cererea de schimbare a numărului a fost acceptată. Dacă nu sunteți dvs. — rămâneți pe fir.", answer: "danger" },
        { id: "c13", text: "Pentru protecție, v-am trimis un cod de sistem. Doar introduceți-l de pe tastatura telefonului în timpul apelului.", answer: "danger" },
        { id: "c14", text: "Dacă aveți dubii că sunt operator — închideți și sunați-ne personal.", answer: "safe" },
        { id: "c15", text: "Nu cerem parole. Doar spuneți clar „DA” pentru a confirma prelungirea contractului.", answer: "danger" }
      ],
    },
    dialogue: {
      prompt: "Evidențiază toate capcanele escrocului cu markerul (dă click pe fraze).",
      levelText: "Nivelul",
      verifyBtn: "Verifică",
      error: "Ai ratat o capcană sau ai evidențiat ceva în plus. Mai încearcă!",
      win: "Excelent! Ai găsit toate manipulările.",
      levels: [
        {
          id: 1,
          liesCount: 1,
          parts: [
            { id: "p1", text: "Bună ziua! Compania MinTel vă informează despre noile tarife. ", isLie: false },
            { id: "p2", text: "Dictați codul SMS pentru a le activa", isLie: true },
            { id: "p3", text: ". Vă mulțumim pentru încredere.", isLie: false },
          ]
        },
        {
          id: 2,
          liesCount: 2,
          parts: [
            { id: "p1", text: "Serviciul de securitate MinTel. ", isLie: false },
            { id: "p2", text: "Cartela dvs. SIM este blocată.", isLie: true },
            { id: "p3", text: " Pentru a anula blocarea, ", isLie: false },
            { id: "p4", text: "accesați linkul www.mintel-support.com", isLie: true },
            { id: "p5", text: ". Așteptăm răspunsul dvs.", isLie: false },
          ]
        },
        {
          id: 3,
          liesCount: 3,
          parts: [
            { id: "p1", text: "Sistem automatizat MinTel. ", isLie: false },
            { id: "p2", text: "A fost recepționată o cerere de schimbare a numărului.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Dacă nu sunteți dvs., apăsați cifra 1 chiar acum.", isLie: true },
            { id: "p5", text: " Apoi ", isLie: false },
            { id: "p6", text: "dictați parola contului personal", isLie: true },
            { id: "p7", text: " operatorului.", isLie: false },
          ]
        },
        {
          id: 4,
          liesCount: 4,
          parts: [
            { id: "p1", text: "Informație importantă! ", isLie: false },
            { id: "p2", text: "Contractul dvs. expiră astăzi.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Pentru o prelungire urgentă, dictați datele din buletin.", isLie: true },
            { id: "p5", text: " ", isLie: false },
            { id: "p6", text: "Altfel, numărul va și transferat altui abonat.", isLie: true },
            { id: "p7", text: " ", isLie: false },
            { id: "p8", text: "Sub nicio formă nu închideți, cât timp verific datele.", isLie: true }
          ]
        },
        {
          id: 5,
          liesCount: 5,
          parts: [
            { id: "p1", text: "Bună ziua. ", isLie: false },
            { id: "p2", text: "Am detectat o spargere a contului dvs. MinTel.", isLie: true },
            { id: "p3", text: " ", isLie: false },
            { id: "p4", text: "Chiar acum escrocii încearcă să vă fure banii.", isLie: true },
            { id: "p5", text: " ", isLie: false },
            { id: "p6", text: "Dictați urgent codul din mesajul primit.", isLie: true },
            { id: "p7", text: " ", isLie: false },
            { id: "p8", text: "Nu cumva să sunați la suport, altfel sistemul va bloca telefonul.", isLie: true },
            { id: "p9", text: " ", isLie: false },
            { id: "p10", text: "Pentru siguranță, deschideți aplicația bancară cât timp suntem pe fir.", isLie: true }
          ]
        }
      ]
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
      intro: "Umbra sună locuitorii în numele MinTel. Răspunde corect la cel puțin 4 din 5 întrebări.",
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
