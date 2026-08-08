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
      bookletText: "Скачать буклет (PDF)",
      bookletFile: "/ghid_ru.pdf",
    },
    videoExplanation: {
      title: "Как распознать социальную инженерию",
      placeholder: "Место для видеообъяснения",
      hint: "Видео будет подключено отдельным MP4. Пока используй краткий конспект.",
      points: ["Не доверяй номеру на экране — его можно подменить.", "Код из SMS, пароль и PIN никогда не называют по телефону.", "Срочность и угрозы — повод остановить разговор.", "Проверяй информацию самостоятельно, а не по ссылке звонящего."],
      videoUrl: "/video/2-video_ru.mp4"
    },
    videoExample: {
      title: "Учебный звонок от вымышленного оператора MinTel",
      placeholder: "Место для видеопримера",
      hint: "Никакой сотовый оператор не просит подтверждение СМС. В примере нет реальных телефонов, брендов или данных.",
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
      prompt: "Выстраивай шаги в правильном хронологическом порядке. Спеши, время идет! Ошибка отнимет 3 секунды.",
      levelText: "Уровень",
      win: "Бомба обезврежена! Отличная работа.",
      fail: "Время вышло! Вы не успели.",
      levels: [
        {
          id: 1,
          time: 30,
          steps: [
            { id: "s1", text: "Положить трубку." },
            { id: "s2", text: "Никому не сообщать код из SMS." },
            { id: "s3", text: "Заблокировать номер звонившего." }
          ]
        },
        {
          id: 2,
          time: 35,
          steps: [
            { id: "s1", text: "Отказаться от быстрого решения по телефону." },
            { id: "s2", text: "Завершить звонок." },
            { id: "s3", text: "Открыть официальное приложение «MinTel»." },
            { id: "s4", text: "Самостоятельно проверить наличие новых тарифов." }
          ]
        },
        {
          id: 3,
          time: 40,
          steps: [
            { id: "s1", text: "Не поддаваться панике." },
            { id: "s2", text: "Прервать телефонный разговор." },
            { id: "s3", text: "Найти официальный номер поддержки MinTel." },
            { id: "s4", text: "Позвонить настоящему оператору." },
            { id: "s5", text: "Уточнить реальный статус своего номера." }
          ]
        },
        {
          id: 4,
          time: 45,
          steps: [
            { id: "s1", text: "Отказаться от установки любых программ." },
            { id: "s2", text: "Положить трубку." },
            { id: "s3", text: "Удалить SMS со странными ссылками." },
            { id: "s4", text: "Проверить телефон встроенным антивирусом." },
            { id: "s5", text: "Сменить пароль от личного кабинета MinTel." },
            { id: "s6", text: "Включить двухфакторную авторизацию." }
          ]
        },
        {
          id: 5,
          time: 55,
          steps: [
            { id: "s1", text: "Немедленно завершить разговор." },
            { id: "s2", text: "Зайти в официальное приложение оператора." },
            { id: "s3", text: "Завершить все активные сессии (выйти со всех устройств)." },
            { id: "s4", text: "Изменить пароль для входа." },
            { id: "s5", text: "Связаться с банком, чтобы заблокировать переводы с баланса телефона." },
            { id: "s6", text: "Позвонить в настоящую поддержку MinTel." },
            { id: "s7", text: "Сообщить о факте утечки данных." }
          ]
        }
      ]
    },
    final: {
      intro: "Финальная схватка. У тебя 3 жизни (HP) на все фазы. Ошибка = минус 1 жизнь.",
      gameOver: "Увы, твои жизни иссякли... Тень победила. Начни сначала!",
      win: "Победа! Тень повержена, а твой номер в безопасности.",
      phase1Intro: "Фаза 1: Визуальный тест. Кликни на деталь, которая выдает мошенника.",
      phase2Intro: "Фаза 2: Блиц. У тебя 12 секунд на ответ!",
      phase3Intro: "Фаза 3: Битва с Боссом. Парируй его уловки!",
      phase1: [
        { id: "p1_1", type: "sms", sender: "MinTel", text: "Ваш тариф истекает. Продлите по ссылке:", fakeLink: "mintei-support.com", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_2", type: "call", caller: "Служба безопасности MinTel", number: "+44 20 7123 4567", correctTargets: ["number"] },
        { id: "p1_3", type: "profile", name: "Поддержка MinTel", accountType: "Обычный аккаунт", correctTargets: ["accountType"] },
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Ваша SIM-карта заблокирована. Подтвердите данные:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_5", type: "call", caller: "Техподдержка (WhatsApp)", number: "+44 77 00 900077", correctTargets: ["caller", "number"] },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Бизнес-аккаунт (без галочки)", correctTargets: ["name", "accountType"] },
        { id: "p1_7", type: "sms", sender: "Info", text: "Вам одобрен кредит от MinTel Bank. Срочно перейдите:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTargets: ["text", "fakeLink"] },
        { id: "p1_8", type: "call", caller: "Полиция", number: "+373 999 999 999", correctTargets: ["avatar", "caller", "number"] },
        { id: "p1_9", type: "profile", name: "Поддержка абонентов", accountType: "Скрытый номер", correctTargets: ["avatar", "name", "accountType"] },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Срочно! Вы выиграли iPhone 16! Перейдите для получения:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTargets: ["sender", "text", "fakeLink"] }
      ],
      phase2: [
        { id: "p2_1", text: "Оператор срочно просит код из SMS для отмены блокировки.", options: ["Назвать", "Сбросить вызов", "Продиктовать половину"], answer: 1 },
        { id: "p2_2", text: "Номер звонящего совпадает с номером на сайте. Можно верить?", options: ["Да", "Нет, номер можно подменить", "Только если это +373"], answer: 1 },
        { id: "p2_3", text: "Куда переходить для проверки состояния счета?", options: ["По ссылке из SMS", "Самому открыть оф. приложение", "Ввести в Google и кликнуть первую ссылку"], answer: 1
        },
        { id: "p2_4", text: "Кто должен инициировать звонок для безопасного решения проблем?", options: ["Сам абонент", "Оператор", "Робот"], answer: 0 },
        { id: "p2_5", text: "Если вам звонят и торопят принять решение, это...", options: ["Стандартная процедура", "Манипуляция мошенников", "Сбой в системе"], answer: 1 },
        { id: "p2_6", text: "Где лучше всего проверять статус своего тарифа?", options: ["В SMS", "В официальном приложении", "В Google"], answer: 1 },
        { id: "p2_7", text: "Может ли настоящий оператор попросить продиктовать SMS-код?", options: ["Да, для верификации", "Никогда", "Только при блокировке"], answer: 1 },
        { id: "p2_8", text: "Что делать, если позвонил «сотрудник спецслужб» и просит помочь в поимке вора?", options: ["Помочь", "Положить трубку", "Спросить его звание"], answer: 1 },
        { id: "p2_9", text: "Если ссылка выглядит как mintel-support.com, она...", options: ["Официальная", "Фальшивая", "Резервная"], answer: 1 },
        { id: "p2_10", text: "Какую информацию безопасно сообщать по телефону?", options: ["Номер паспорта", "Свой текущий тариф", "Код из SMS"], answer: 1 }
      ],
      phase3: [
        { 
          id: "p3_1", 
          bossText: "Если не назовешь код, через 5 минут спишутся все деньги с баланса!", 
          options: [
            "Я сейчас сам перезвоню в поддержку.", 
            "Хорошо, диктую: 4-5-2..."
          ], 
          answer: 0 
        },
        { 
          id: "p3_2", 
          bossText: "Я следователь. Оператор MinTel украл ваши данные, помогите следствию поимке преступника!", 
          options: [
            "Что мне нужно сделать для помощи?", 
            "Вызывайте меня официальной повесткой. До свидания."
          ], 
          answer: 1 
        },
        { 
          id: "p3_3", 
          bossText: "Ладно, просто скачайте наше защитное приложение по ссылке, чтобы обезопасить телефон!", 
          options: [
            "Ничего скачивать не буду, мой телефон защищен.", 
            "Давайте ссылку, я установлю."
          ], 
          answer: 0
        },
        { id: "p3_4", bossText: "Ваш номер пытаются переоформить в другом городе. Срочно назовите код отмены!", options: ["Повешу трубку и позвоню в поддержку.", "Код 4521"], answer: 0 },
        { id: "p3_5", bossText: "Мы уже выслали к вам наряд полиции за соучастие в мошенничестве, если вы не подтвердите личность!", options: ["Вызывайте, я буду ждать.", "Ой, что нужно сказать?"], answer: 0 },
        { id: "p3_6", bossText: "У вас подключена платная услуга на 500 лей в день. Чтобы отключить, нужен код.", options: ["Я отключу её сам через приложение.", "Конечно, код 9912."], answer: 0 },
        { id: "p3_7", bossText: "Я ваш персональный менеджер. Вижу, у вас плохая связь, давайте я обновлю вышки удаленно.", options: ["У меня всё работает, до свидания.", "Да, давайте обновим."], answer: 0 },
        { id: "p3_8", bossText: "Вы выиграли в лотерее от MinTel! Для зачисления денег перейдите по ссылке, которую я вам сейчас скину.", options: ["Спасибо, я проверю это на сайте MinTel.", "Жду ссылку!"], answer: 0 },
        { id: "p3_9", bossText: "Я из банка. Ваш телефон взломан, мошенники снимают деньги. Быстро скажите код!", options: ["Я сам сейчас позвоню в свой банк.", "Какой кошмар, код 1234!"], answer: 0 },
        { id: "p3_10", bossText: "Это последняя попытка. Не скажете код — сим-карта сгорит прямо сейчас!", options: ["Пусть горит.", "Только не сим-карта, вот код!"], answer: 0
        },
        { id: "p3_4", bossText: "Cineva încearcă să vă reînregistreze numărul în alt oraș. Dictați codul de anulare!", options: ["Voi închide și voi suna la suport.", "Codul este 4521"], answer: 0 },
        { id: "p3_5", bossText: "Am trimis deja poliția pentru complicitate la fraudă, dacă nu vă confirmați identitatea!", options: ["Chemați-i, îi voi aștepta.", "Oh, ce trebuie să spun?"], answer: 0 },
        { id: "p3_6", bossText: "Aveți un serviciu cu plată de 500 de lei pe zi. Pentru dezactivare, e nevoie de un cod.", options: ["Îl voi dezactiva singur din aplicație.", "Sigur, codul 9912."], answer: 0 },
        { id: "p3_7", bossText: "Sunt managerul dvs. personal. Aveți o conexiune slabă, haideți să o actualizăm.", options: ["Totul funcționează perfect, la revedere.", "Da, haideți să actualizăm."], answer: 0 },
        { id: "p3_8", bossText: "Ați câștigat la loteria MinTel! Pentru transferul banilor, accesați link-ul meu.", options: ["Mulțumesc, voi verifica pe site-ul MinTel.", "Aștept link-ul!"], answer: 0 },
        { id: "p3_9", bossText: "Sunt de la bancă. Telefonul vă este spart. Spuneți rapid codul!", options: ["Voi suna eu imediat la banca mea.", "Ce coșmar, codul 1234!"], answer: 0 },
        { id: "p3_10", bossText: "Aceasta este ultima încercare. Dacă nu ziceți codul, cartela SIM va arde acum!", options: ["Las-o să ardă.", "Numai nu cartela SIM, iată codul!"], answer: 0 }
      ]
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
      bookletText: "Descarcă pliantul (PDF)",
      bookletFile: "/ghid_ro.pdf",
    },
    videoExplanation: {
      title: "Cum recunoști ingineria socială",
      placeholder: "Loc pentru explicația video",
      hint: "Videoclipul va fi conectat ca MP4 separat. Până atunci folosește rezumatul.",
      points: ["Nu te baza pe numărul afișat — acesta poate fi falsificat.", "Codul SMS, parola și PIN-ul nu se comunică telefonic.", "Urgența și amenințările sunt motive să oprești conversația.", "Verifică independent, nu prin linkul apelantului."],
      videoUrl: "/video/2-video_ro.mp4"
    },
    videoExample: {
      title: "Apel educațional de la operatorul fictiv MinTel",
      placeholder: "Loc pentru exemplul video",
      hint: "Niciun operator de telefonie mobilă nu cere confirmare prin SMS. Exemplul nu folosește telefoane, mărci sau date reale.",
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
    final: {
      intro: "Confruntarea finală. Ai 3 vieți (HP) pentru toate fazele. O greșeală = minus 1 viață.",
      gameOver: "Din păcate, ai rămas fără vieți... Umbra a învins. Începe din nou!",
      win: "Victorie! Umbra a fost învinsă, iar numărul tău este în siguranță.",
      phase1Intro: "Faza 1: Test vizual. Dă click pe detaliul care trădează escrocul.",
      phase2Intro: "Faza 2: Blitz. Ai 12 secunde pentru a răspunde!",
      phase3Intro: "Faza 3: Lupta cu Boss-ul. Parează atacurile lui!",
      phase1: [
        {
          id: "p1_1",
          type: "sms",
          sender: "MinTel",
          text: "Tariful dvs. expiră. Prelungiți accesând linkul:",
          fakeLink: "mintei-support.com",
          realLink: "mintel.md",
          correctTarget: "fakeLink"
        },
        {
          id: "p1_2",
          type: "call",
          caller: "Serviciul de securitate MinTel",
          number: "+44 20 7123 4567",
          correctTarget: "number"
        },
        {
          id: "p1_3",
          type: "profile",
          name: "Suport MinTel",
          accountType: "Cont obișnuit",
          correctTarget: "accountType"
        },
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Cartela SIM este blocată. Confirmați datele:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_5", type: "call", caller: "Suport Tehnic (WhatsApp)", number: "+44 77 00 900077", correctTarget: "number" },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Cont de afaceri (fără bifă)", correctTarget: "accountType" },
        { id: "p1_7", type: "sms", sender: "Info", text: "Credit aprobat de MinTel Bank:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_8", type: "call", caller: "Poliția", number: "+373 999 999 999", correctTarget: "number" },
        { id: "p1_9", type: "profile", name: "Suport Clienți", accountType: "Număr ascuns", correctTarget: "accountType" },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Ați câștigat un iPhone 16! Accesați:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTarget: "fakeLink" }
      ],
      phase2: [
        { id: "p2_1", text: "Operatorul vă cere urgent codul din SMS pentru a anula blocarea.", options: ["Îl dictez", "Închid apelul", "Dictez doar o jumătate"], answer: 1 },
        { id: "p2_2", text: "Numărul apelantului coincide cu cel de pe site. E de încredere?", options: ["Da", "Nu, numărul poate fi falsificat", "Doar dacă este +373"], answer: 1 },
        { id: "p2_3", text: "Unde accesați pentru a verifica starea contului?", options: ["Pe linkul din SMS", "Deschid singur aplicația oficială", "Caut pe Google și dau click pe prima reclamă"], answer: 1
        },
        { id: "p2_4", text: "Cine ar trebui să inițieze apelul pentru rezolvarea sigură a problemelor?", options: ["Abonatul însuși", "Operatorul", "Robotul"], answer: 0 },
        { id: "p2_5", text: "Dacă sunteți sunat și grăbit să luați o decizie, aceasta este...", options: ["O procedură standard", "O manipulare a escrocilor", "O eroare de sistem"], answer: 1 },
        { id: "p2_6", text: "Unde este cel mai bine să verificați starea planului tarifar?", options: ["În SMS", "În aplicația oficială", "Pe Google"], answer: 1 },
        { id: "p2_7", text: "Poate un operator real să vă ceară să dictați un cod SMS?", options: ["Da, pentru verificare", "Niciodată", "Doar la blocare"], answer: 1 },
        { id: "p2_8", text: "Ce faceți dacă sună un «angajat al serviciilor speciale» și cere ajutor?", options: ["Îl ajut", "Închid apelul", "Îi întreb gradul"], answer: 1 },
        { id: "p2_9", text: "Dacă link-ul arată ca mintel-support.com, acesta este...", options: ["Oficial", "Fals", "De rezervă"], answer: 1 },
        { id: "p2_10", text: "Ce informații sunt sigure de comunicat la telefon?", options: ["Numărul pașaportului", "Planul tarifar curent", "Codul din SMS"], answer: 1 }
      ],
      phase3: [
        { 
          id: "p3_1", 
          bossText: "Dacă nu-mi spui codul, în 5 minute ți se vor retrage toți banii de pe cont!", 
          options: [
            "Voi suna eu însumi la suport acum.", 
            "Bine, dictez: 4-5-2..."
          ], 
          answer: 0 
        },
        { 
          id: "p3_2", 
          bossText: "Sunt anchetator. Operatorul MinTel v-a furat datele, ajutați ancheta să prindă infractorul!", 
          options: [
            "Ce trebuie să fac pentru a vă ajuta?", 
            "Chemați-mă oficial prin citație. La revedere."
          ], 
          answer: 1 
        },
        { 
          id: "p3_3", 
          bossText: "Bine, doar descărcați aplicația noastră de protecție de pe link pentru a vă securiza telefonul!", 
          options: [
            "Nu descarc nimic, telefonul meu este protejat.", 
            "Dați-mi linkul, o instalez."
          ], 
          answer: 0
        },
        { id: "p3_4", bossText: "Cineva încearcă să vă reînregistreze numărul în alt oraș. Dictați codul de anulare!", options: ["Voi închide și voi suna la suport.", "Codul este 4521"], answer: 0 },
        { id: "p3_5", bossText: "Am trimis deja poliția pentru complicitate la fraudă, dacă nu vă confirmați identitatea!", options: ["Chemați-i, îi voi aștepta.", "Oh, ce trebuie să spun?"], answer: 0 },
        { id: "p3_6", bossText: "Aveți un serviciu cu plată de 500 de lei pe zi. Pentru dezactivare, e nevoie de un cod.", options: ["Îl voi dezactiva singur din aplicație.", "Sigur, codul 9912."], answer: 0 },
        { id: "p3_7", bossText: "Sunt managerul dvs. personal. Aveți o conexiune slabă, haideți să o actualizăm.", options: ["Totul funcționează perfect, la revedere.", "Da, haideți să actualizăm."], answer: 0 },
        { id: "p3_8", bossText: "Ați câștigat la loteria MinTel! Pentru transferul banilor, accesați link-ul meu.", options: ["Mulțumesc, voi verifica pe site-ul MinTel.", "Aștept link-ul!"], answer: 0 },
        { id: "p3_9", bossText: "Sunt de la bancă. Telefonul vă este spart. Spuneți rapid codul!", options: ["Voi suna eu imediat la banca mea.", "Ce coșmar, codul 1234!"], answer: 0 },
        { id: "p3_10", bossText: "Aceasta este ultima încercare. Dacă nu ziceți codul, cartela SIM va arde acum!", options: ["Las-o să ardă.", "Numai nu cartela SIM, iată codul!"], answer: 0 }
      ]
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
      prompt: "Apasă acțiunile în ordinea cronologică corectă. Grăbește-te, timpul trece! O greșeală scade 3 secunde.",
      levelText: "Nivelul",
      win: "Bomba a fost dezamorsată! O treabă excelentă.",
      fail: "Timpul a expirat! Nu ai reușit.",
      levels: [
        {
          id: 1,
          time: 30,
          steps: [
            { id: "s1", text: "Închideți apelul." },
            { id: "s2", text: "Nu comunicați nimănui codul din SMS." },
            { id: "s3", text: "Blocați numărul apelantului." }
          ]
        },
        {
          id: 2,
          time: 35,
          steps: [
            { id: "s1", text: "Refuzați luarea unei decizii rapide la telefon." },
            { id: "s2", text: "Încheiați apelul." },
            { id: "s3", text: "Deschideți aplicația oficială «MinTel»." },
            { id: "s4", text: "Verificați personal dacă există tarife noi." }
          ]
        },
        {
          id: 3,
          time: 40,
          steps: [
            { id: "s1", text: "Nu intrați în panică." },
            { id: "s2", text: "Întrerupeți conversația telefonică." },
            { id: "s3", text: "Găsiți numărul oficial de suport MinTel." },
            { id: "s4", text: "Sunați operatorul real." },
            { id: "s5", text: "Clarificați statutul real al numărului dvs." }
          ]
        },
        {
          id: 4,
          time: 45,
          steps: [
            { id: "s1", text: "Refuzați instalarea oricăror programe." },
            { id: "s2", text: "Închideți apelul." },
            { id: "s3", text: "Ștergeți SMS-urile cu linkuri dubioase." },
            { id: "s4", text: "Verificați telefonul cu antivirusul integrat." },
            { id: "s5", text: "Schimbați parola contului personal MinTel." },
            { id: "s6", text: "Activați autentificarea cu doi factori." }
          ]
        },
        {
          id: 5,
          time: 55,
          steps: [
            { id: "s1", text: "Încheiați imediat conversația." },
            { id: "s2", text: "Accesați aplicația oficială a operatorului." },
            { id: "s3", text: "Închideți toate sesiunile active (ieșiți de pe toate dispozitivele)." },
            { id: "s4", text: "Schimbați parola de acces." },
            { id: "s5", text: "Contactați banca pentru a bloca transferurile de pe soldul telefonului." },
            { id: "s6", text: "Sunați la suportul real MinTel." },
            { id: "s7", text: "Raportați scurgerea de date." }
          ]
        }
      ]
    }
  }
} as const;
