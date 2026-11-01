export type OperatorLocale = "ru" | "ro";

type FinalVisualScenario = {
  id: string;
  type: "sms" | "call" | "profile";
  sender?: string;
  text?: string;
  fakeLink?: string;
  realLink?: string;
  caller?: string;
  number?: string;
  name?: string;
  accountType?: string;
  correctTargets: readonly string[];
};

type FinalQuizScenario = {
  id: string;
  text: string;
  options: readonly string[];
  answer: number;
  explain: string;
};

type FinalBossScenario = {
  id: string;
  bossText: string;
  options: readonly string[];
  answers: readonly number[];
  explain: string;
};

type OperatorFinalContent = {
  intro: string;
  gameOver: string;
  win: string;
  clues: string;
  phase1Intro: string;
  phase2Intro: string;
  phase3Intro: string;
  phase1: readonly FinalVisualScenario[];
  phase2: readonly FinalQuizScenario[];
  phase3: readonly FinalBossScenario[];
};

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
      { title: "Видеопример", subtitle: "Звонок мошенника" },
      { title: "Игра: найди сигналы", subtitle: "Отметь подозрительные детали" },
      { title: "Игра: классификация", subtitle: "Безопасная или опасная фраза" },
      { title: "Игра: диалог", subtitle: "Выбери правильный ответ" },
      { title: "Игра: порядок действий", subtitle: "Собери безопасный алгоритм" },
      { title: "Финальная схватка", subtitle: "Останови атаку Тени" },
    ],
    theory: {
      lead: "Мошенник старается не убедить фактами, а заставить действовать быстро. Настоящему оператору не нужен код из твоего SMS.",
      cards: [
        { title: "Срочность и Давление", text: "Мошенник чаще всего торопит и пугает отключением номера. Но бывает и вежливым — проверяй, о чём просят." },
        { title: "Коды из SMS", text: "Никогда не диктуй код из SMS. Это ключ к твоему личному кабинету или банку." },
        { title: "Переход по ссылкам", text: "Не открывай ссылки из сообщений, которые присылает звонящий." },
        { title: "Личные данные", text: "Если звонят тебе — не называй пароли и данные удостоверения (IDNP, серию, номер), даже частично. Проверку личности проходят, только когда ты сам звонишь на официальный номер." },
        { title: "Проверка номера", text: "Номер на экране может быть поддельным (спуфинг). Не доверяй ему вслепую." },
        { title: "Самостоятельный перезвон", text: "Положи трубку и сам перезвони по официальному номеру поддержки MinTel." },
      ],
      notes: [
        "Галочка у профиля не гарантирует, что это оператор. Если в мессенджере просят код, данные или перейти по ссылке — это мошенник.",
        "В Молдове это Orange, Moldcell, Unite. Номер поддержки — в договоре, на сайте или в приложении оператора. Номер банка — на обороте карты. О мошенничестве сообщай в полицию: 112.",
      ],
      rule: "Главное правило: положи трубку, ничего не сообщай и проверь информацию через официальный канал.",
      bookletText: "Скачать буклет (PDF)",
      bookletFile: "/ghid_ru.pdf",
      audioText: "Прослушать текст",
      audioFile: "/module/1_teoria_ru.mp3",
    },
    videoExplanation: {
      title: "Как распознать социальную инженерию",
      placeholder: "Место для видеообъяснения",
      points: ["Не доверяй номеру на экране — его можно подменить.", "Код из SMS, пароль и PIN никогда не называют по телефону.", "Срочность и угрозы — повод остановить разговор.", "Проверяй информацию самостоятельно, а не по ссылке звонящего."],
      videoUrl: "/video/2-video_ru.mp4",
      audioText: "Прослушать текст",
      audioFile: "/module/2_video_ru.mp3",
    },
    videoExample: {
      title: "Пример звонка мошенника (видео из интернета)",
      hint: "Номер и код в видео скрыты. Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник.",
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
      loseSafe: "Положить трубку — никогда не ошибка: потом сам позвони на официальный номер оператора. Но в этой фразе уловки пока нет: послушай дальше и найди момент, где начинается обман.",
      timeout: "Время вышло. Прочитай объяснение и попробуй эту фразу ещё раз",
      levels: [
        {
          id: 1,
          phrases: [
            { text: "Ваш номер блокируется через 5 минут, срочно назовите код из SMS!", isThreat: true, explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." }
          ]
        },
        {
          id: 2,
          phrases: [
            { text: "Здравствуйте, меня зовут Иван, компания MinTel.", isThreat: false, explain: "Обычное приветствие не содержит опасной просьбы. Название компании ещё не подтверждает личность звонящего" },
            { text: "Мы зафиксировали сбой. Для безопасности продиктуйте пароль от личного кабинета.", isThreat: true, explain: "Пароль открывает доступ к аккаунту. Не диктуй его звонящему" }
          ]
        },
        {
          id: 3,
          phrases: [
            { text: "Добрый день. Служба поддержки.", isThreat: false, explain: "Представиться службой поддержки — обычное начало разговора. Пока здесь нет просьбы раскрыть данные или открыть ссылку" },
            { text: "Хотим рассказать вам о новом тарифе.", isThreat: false, explain: "Сообщение о работах само по себе не требует опасных действий. Проверить его можно в официальном приложении" },
            { text: "Нужно обновить договор. Перейдите по ссылке, которую я вам скинул.", isThreat: true, explain: "Ссылка от незнакомого звонящего может вести на поддельный сайт. Открой официальный сайт или приложение самостоятельно" }
          ]
        },
        {
          id: 4,
          phrases: [
            { text: "Здравствуйте! Это техподдержка. Ваш номер работает нормально?", isThreat: false, explain: "Вопрос о качестве связи сам по себе обычный. Не сообщай секретные данные, если их попросят дальше" },
            { text: "Отлично. У нас появился новый тариф, могу рассказать.", isThreat: false, explain: "Предложение услуги само по себе не требует передачи секретов. Условия можно проверить самостоятельно в официальном приложении" },
            { text: "Тогда не кладите трубку, сейчас придет SMS-код подтверждения, назовите его.", isThreat: true, explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." }
          ]
        },
        {
          id: 5,
          phrases: [
            { text: "Добрый день, это уведомление MinTel.", isThreat: false, explain: "Это обычное уведомление без опасной просьбы. Имя компании само по себе не доказывает подлинность звонка" },
            { text: "Напоминаем о необходимости пополнить счет до конца месяца.", isThreat: false, explain: "Напоминание о пополнении не просит сообщить пароль или код. Проверь баланс самостоятельно в официальном приложении" },
            { text: "Вы можете сделать это через официальное приложение. Всего доброго!", isThreat: false, explain: "Самостоятельно открыть официальное приложение — безопасный способ проверить и пополнить счёт" }
          ]
        }
      ]
    },
    classify: {
      prompt: "Смахивай карточки! Влево — Опасно (в фразе есть уловка), Вправо — Безопасно (уловки нет).",
      safe: "Безопасно",
      danger: "Опасно",
      completeMessage: "Все карточки разобраны!",
      items: [
        { id: "c1", text: "Назовите код из SMS для отмены операции.", answer: "danger" },
        { id: "c2", text: "Ваш номер заблокирован, перейдите по ссылке для разблокировки.", answer: "danger" },
        { id: "c3", text: "Здравствуйте, меня зовут Анна, компания MinTel.", answer: "safe" },
        { id: "c4", text: "Продиктуйте ваши паспортные данные для подтверждения.", answer: "danger" },
        { id: "c5", text: "Служба поддержки слушает вас. Чем могу помочь?", answer: "safe" },
        { id: "c6", text: "Вы позвонили на официальный номер. После разговора можно оценить качество обслуживания, нажав 1.", answer: "safe" },
        { id: "c7", text: "Мы зафиксировали взлом. Срочно скачайте антивирус по ссылке в SMS.", answer: "danger" },
        { id: "c8", text: "Спасибо за звонок, все детали есть в вашем официальном приложении.", answer: "safe" },
        { id: "c9", text: "Оставайтесь на линии! У вас есть всего одна минута, чтобы согласиться!", answer: "danger" },
        { id: "c10", text: "Мы меняем ваш тариф. Чтобы отказаться, продиктуйте старый пароль.", answer: "danger" },
        { id: "c11", text: "Напоминаем: баланс ниже нуля. Пополнить счёт можно в приложении или в терминале.", answer: "safe" },
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
            { id: "p1", text: "Здравствуйте, это MinTel. ", isLie: false },
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
      prompt: "Выстраивай шаги в правильном порядке. Ошибка не отнимает время.",
      levelText: "Уровень",
      win: "Бомба обезврежена! Отличная работа.",
      fail: "Время вышло! Вы не успели.",
      levels: [
        {
          id: 1,
          time: 45,
          steps: [
            { id: "s1", text: "Положить трубку." },
            { id: "s2", text: "Никому не сообщать код из SMS." },
            { id: "s3", text: "Заблокировать номер звонившего." }
          ]
        },
        {
          id: 2,
          time: 53,
          steps: [
            { id: "s1", text: "Отказаться от быстрого решения по телефону." },
            { id: "s2", text: "Завершить звонок." },
            { id: "s3", text: "Открыть официальное приложение «MinTel»." },
            { id: "s4", text: "Самостоятельно проверить наличие новых тарифов." }
          ]
        },
        {
          id: 3,
          time: 60,
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
          time: 68,
          steps: [
            { id: "s1", text: "Отказаться от установки любых программ." },
            { id: "s2", text: "Положить трубку." },
            { id: "s3", text: "Удалить SMS со странными ссылками." },
            { id: "s4", text: "Проверить телефон встроенным антивирусом." },
            { id: "s5", text: "Сменить пароль от личного кабинета MinTel." },
            { id: "s6", text: "Включить вход с подтверждением по коду (двухэтапную проверку)" }
          ]
        },
        {
          id: 5,
          time: 83,
          steps: [
            { id: "s1", text: "Немедленно завершить разговор." },
            { id: "s2", text: "Зайти в официальное приложение оператора." },
            { id: "s3", text: "Выйти из аккаунта на всех других устройствах" },
            { id: "s4", text: "Изменить пароль для входа." },
            { id: "s5", text: "Если называл код или данные карты — положи трубку и сам позвони в банк по номеру на обороте карты или с официального сайта." },
            { id: "s6", text: "Позвонить в настоящую поддержку MinTel." },
            { id: "s7", text: "Сообщить о факте утечки данных." }
          ]
        }
      ]
    },
    final: {
      intro: "Финальная схватка. У тебя 3 жизни (HP) на все фазы. Ошибка = минус 1 жизнь.",
      gameOver: "Жизни закончились. Начни эту фазу заново — пройденные фазы сохранены.",
      win: "Победа! Тень повержена, а твой номер в безопасности.",
      clues: "Улики",
      phase1Intro: "Фаза 1: Визуальный тест. Кликни на деталь, которая выдает мошенника.",
      phase2Intro: "Фаза 2: Блиц. У тебя 25 секунд на ответ!",
      phase3Intro: "Фаза 3: Битва с Боссом. Парируй его уловки!",
      phase1: [
        { id: "p1_1", type: "sms", sender: "MinTel", text: "Ваш тариф истекает. Продлите по ссылке:", fakeLink: "mintei-support.com", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_2", type: "call", caller: "Служба безопасности MinTel", number: "+44 20 7123 4567", correctTargets: ["number"] },
        { id: "p1_3", type: "profile", name: "Поддержка MinTel", accountType: "Написал первым в WhatsApp и просит подтвердить данные", correctTargets: ["accountType"] },
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Ваша SIM-карта заблокирована. Подтвердите данные:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_5", type: "call", caller: "Техподдержка (WhatsApp)", number: "+44 77 00 900077", correctTargets: ["caller", "number"] },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Написал первым в WhatsApp и просит подтвердить данные", correctTargets: ["name", "accountType"] },
        { id: "p1_7", type: "sms", sender: "Info", text: "Вам одобрен кредит от MinTel Bank. Срочно перейдите:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTargets: ["text", "fakeLink"] },
        { id: "p1_8", type: "call", caller: "Полиция", number: "+373 999 999 999", correctTargets: ["avatar", "caller", "number"] },
        { id: "p1_9", type: "profile", name: "Поддержка абонентов", accountType: "Скрытый номер", correctTargets: ["avatar", "name", "accountType"] },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Срочно! Вы выиграли iPhone 16! Перейдите для получения:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTargets: ["sender", "text", "fakeLink"] }
      ],
      phase2: [
        { id: "p2_1", text: "Оператор срочно просит код из SMS для отмены блокировки.", options: ["Назвать", "Сбросить вызов", "Продиктовать половину"], answer: 1, explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." },
        { id: "p2_2", text: "Номер звонящего совпадает с номером на сайте. Можно верить?", options: ["Да", "Нет, номер можно подменить", "Только если это +373"], answer: 1, explain: "Номер звонящего можно подменить. Положи трубку и сам позвони по официальному номеру, а не по номеру из звонка или SMS" },
        { id: "p2_3", text: "Куда переходить для проверки состояния счета?", options: ["По ссылке из SMS", "Самому открыть оф. приложение", "Найти в Google и нажать на первую рекламу"], answer: 1, explain: "Открой официальное приложение самостоятельно. Ссылка из SMS и первое объявление в поиске могут вести на поддельный сайт"
        },
        { id: "p2_4", text: "Кто должен инициировать звонок для безопасного решения проблем?", options: ["Сам абонент", "Оператор", "Робот"], answer: 0, explain: "Для проверки подозрительного звонка положи трубку и сам позвони по официальному номеру. Не используй номер из звонка или SMS" },
        { id: "p2_5", text: "Если вам звонят и торопят принять решение, это...", options: ["Стандартная процедура", "Манипуляция мошенников", "Сбой в системе"], answer: 1, explain: "Спешка мешает спокойно проверить информацию. Прерви разговор и проверь предложение самостоятельно" },
        { id: "p2_6", text: "Где лучше всего проверять статус своего тарифа?", options: ["В SMS", "В официальном приложении", "В Google"], answer: 1, explain: "Актуальный тариф проверь в официальном приложении, которое открыл сам" },
        { id: "p2_7", text: "Может ли настоящий оператор попросить продиктовать SMS-код?", options: ["Да, для верификации", "Никогда", "Только при блокировке"], answer: 1, explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." },
        { id: "p2_8", text: "Что делать, если позвонил «сотрудник спецслужб» и просит помочь в поимке вора?", options: ["Помочь", "Положить трубку", "Спросить его звание"], answer: 1, explain: "Звание и просьба о секретной помощи не подтверждают личность. Положи трубку и проверь обращение по официальному номеру ведомства" },
        { id: "p2_9", text: "Официальный сайт — mintel.md. Ссылка mintel-support.com — это...", options: ["Официальная", "Фальшивая", "Резервная"], answer: 1, explain: "Похожее название сайта не делает его официальным. Открой известный тебе официальный сайт самостоятельно" },
        { id: "p2_10", text: "Что можно сообщить незнакомцу, который сам позвонил?", options: ["Номер паспорта", "Ничего — положу трубку и сам позвоню на официальный номер", "Код из SMS"], answer: 1, explain: "Название тарифа не даёт доступа к аккаунту. Паспортные данные и SMS-код не сообщай незнакомому звонящему" }
      ],
      phase3: [
        { id: "p3_1", bossText: "Если не назовешь код, через 5 минут спишутся все деньги с баланса!", options: ["Я сейчас сам перезвоню в поддержку.", "Хорошо, диктую: 4-5-2..."], answers: [0], explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." },
        { id: "p3_2", bossText: "Я следователь. Оператор MinTel украл ваши данные, помогите следствию поимке преступника!", options: ["Что мне нужно сделать для помощи?", "Вызывайте меня официальной повесткой. До свидания."], answers: [1], explain: "Звание и просьба о секретной помощи не подтверждают личность. Положи трубку и проверь обращение по официальному номеру ведомства" },
        { id: "p3_3", bossText: "Ладно, просто скачайте наше защитное приложение по ссылке, чтобы обезопасить телефон!", options: ["Ничего скачивать по ссылке не буду. До свидания.", "Давайте ссылку, я установлю."], answers: [0], explain: "Программа из ссылки звонящего может дать доступ к телефону. Не устанавливай её; проверь обращение через официальный канал" },
        { id: "p3_4", bossText: "Ваш номер пытаются переоформить в другом городе. Срочно назовите код отмены!", options: ["Повешу трубку и позвоню в поддержку.", "Код 4521"], answers: [0], explain: "Код из SMS вводишь только ты сам — на сайте или в приложении, которые открыл сам. Кто просит назвать или переслать код — мошенник." },
        { id: "p3_5", bossText: "Мы уже выслали к вам наряд полиции за соучастие в мошенничестве, если вы не подтвердите личность!", options: ["Вызывайте, я буду ждать.", "Ой, что нужно сказать?", "А можно договориться без полиции?"], answers: [0], explain: "Угроза полицией используется для давления. Не передавай данные; проверь обращение по официальному номеру ведомства" },
        { id: "p3_6", bossText: "У вас подключена платная услуга на 500 лей в день. Чтобы отключить, нужен код.", options: ["Я отключу её сам через приложение.", "Конечно, код 9912.", "Продиктуйте мне ваши ФИО, я запишу."], answers: [0], explain: "Проверь платные услуги самостоятельно в официальном приложении. Для этого не нужно сообщать код звонящему" },
        { id: "p3_7", bossText: "Я ваш персональный менеджер. Вижу, у вас плохая связь, давайте я обновлю вышки удаленно.", options: ["У меня всё работает, до свидания.", "Да, давайте обновим.", "Какая связь? Я на Wi-Fi."], answers: [0], explain: "Обещание улучшить связь не подтверждает личность звонящего. Можно завершить разговор и проверить предложение через официальный канал" },
        { id: "p3_8", bossText: "Вы выиграли в лотерее от MinTel! Для зачисления денег перейдите по ссылке, которую я вам сейчас скину.", options: ["Спасибо, я проверю это на сайте MinTel.", "Жду ссылку!", "Зайду в личный кабинет и посмотрю там.", "Продиктуйте номер карты."], answers: [0, 2], explain: "Приз проверь на официальном сайте или в личном кабинете, которые открыл сам. Не переходи по ссылке звонящего" },
        { id: "p3_9", bossText: "Я из банка. Ваш телефон взломан, мошенники снимают деньги. Быстро скажите код!", options: ["Я сам сейчас позвоню в свой банк.", "Какой кошмар, код 1234!", "Сброшу вызов и заблокирую карту через приложение.", "Переведите мои деньги на безопасный счет."], answers: [0, 2], explain: "Положи трубку и сам позвони в банк по официальному номеру, а не по номеру из звонка или SMS. При необходимости заблокируй карту в официальном приложении" },
        { id: "p3_10", bossText: "Это последняя попытка. Не скажете код — сим-карта сгорит прямо сейчас!", options: ["Пусть горит.", "Только не сим-карта, вот код!", "Позвоню настоящему оператору с другого телефона.", "Я сейчас приеду к вам в офис разбираться."], answers: [0, 2], explain: "Угроза уничтожить SIM-карту подталкивает к спешке. Заверши разговор и сам позвони оператору по официальному номеру, а не по номеру из звонка или SMS" }
      ]
    } satisfies OperatorFinalContent,
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
      { title: "Exemplu video", subtitle: "Apelul unui escroc" },
      { title: "Joc: găsește semnele", subtitle: "Marchează detaliile suspecte" },
      { title: "Joc: clasificare", subtitle: "Frază sigură sau periculoasă" },
      { title: "Joc: dialog", subtitle: "Alege răspunsul corect" },
      { title: "Joc: ordinea acțiunilor", subtitle: "Construiește algoritmul sigur" },
      { title: "Confruntarea finală", subtitle: "Oprește atacul Umbrei" },
    ],
    theory: {
      lead: "Escrocul nu încearcă să convingă prin fapte, ci să te facă să acționezi rapid. Un operator real nu are nevoie de codul tău SMS.",
      cards: [
        { title: "Urgență și Presiune", text: "Escrocul de cele mai multe ori te grăbește și te sperie cu blocarea numărului. Dar poate fi și politicos — verifică ce ți se cere." },
        { title: "Coduri din SMS", text: "Nu dicta niciodată codul din SMS. Acesta este cheia contului sau a băncii tale." },
        { title: "Accesarea linkurilor", text: "Nu deschide linkurile din mesajele pe care ți le trimite apelantul." },
        { title: "Date personale", text: "Dacă te sună cineva — nu spune parole sau date din buletin (IDNP, seria, numărul), nici măcar parțial. Identitatea se confirmă doar când suni tu la numărul oficial." },
        { title: "Verificarea numărului", text: "Numărul de pe ecran poate fi falsificat (spoofing). Nu avea încredere oarbă în el." },
        { title: "Apelul independent", text: "Închide și sună personal la numărul oficial de suport MinTel." },
      ],
      notes: [
        "Bifa de lângă profil nu garantează că e operatorul. Dacă pe mesagerie ți se cere un cod, date sau să deschizi un link — e un escroc.",
        "În Moldova aceștia sunt Orange, Moldcell, Unite. Numărul de suport e în contract, pe site sau în aplicația operatorului. Numărul băncii e pe spatele cardului. Frauda se raportează la poliție: 112.",
      ],
      rule: "Regula principală: închide, nu comunica nimic și verifică informația printr-un canal oficial.",
      bookletText: "Descarcă pliantul (PDF)",
      bookletFile: "/ghid_ro.pdf",
      audioText: "Ascultă textul",
      audioFile: "/module/1_teorie_ro.mp3",
    },
    videoExplanation: {
      title: "Cum recunoști ingineria socială",
      placeholder: "Loc pentru explicația video",
      points: ["Nu te baza pe numărul afișat — acesta poate fi falsificat.", "Codul SMS, parola și PIN-ul nu se comunică telefonic.", "Urgența și amenințările sunt motive să oprești conversația.", "Verifică independent, nu prin linkul apelantului."],
      videoUrl: "/video/2-video_ro.mp4",
      audioText: "Ascultă textul",
      audioFile: "/module/2_video_ro.mp3",
    },
    videoExample: {
      title: "Exemplu de apel al unui escroc (video de pe internet)",
      hint: "Numărul și codul din video sunt ascunse. Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc.",
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
      loseSafe: "Să închizi nu e niciodată o greșeală: apoi sună tu la numărul oficial al operatorului. Dar în această frază încă nu e nicio capcană: ascultă mai departe și găsește momentul în care începe înșelătoria.",
      timeout: "Timpul a expirat. Citește explicația și încearcă din nou această frază",
      levels: [
        {
          id: 1,
          phrases: [
            { text: "Numărul tău va fi blocat în 5 minute, spune-mi urgent codul din SMS!", isThreat: true, explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc." }
          ]
        },
        {
          id: 2,
          phrases: [
            { text: "Bună ziua, mă numesc Ion, de la compania MinTel.", isThreat: false, explain: "Un salut obișnuit nu conține o cerere periculoasă. Numele companiei nu confirmă încă identitatea apelantului" },
            { text: "Am detectat o eroare. Pentru siguranță, dictați parola contului personal.", isThreat: true, explain: "Parola oferă acces la cont. Nu o dicta apelantului" }
          ]
        },
        {
          id: 3,
          phrases: [
            { text: "Bună ziua. Serviciul de asistență.", isThreat: false, explain: "Prezentarea ca serviciu de asistență este un început obișnuit de conversație. Deocamdată nu ți se cere să divulgi date sau să deschizi un link" },
            { text: "Vrem să vă spunem despre un tarif nou.", isThreat: false, explain: "Anunțul despre lucrări nu cere în sine acțiuni periculoase. Îl poți verifica în aplicația oficială" },
            { text: "Trebuie să actualizăm contractul. Accesează linkul pe care ți l-am trimis.", isThreat: true, explain: "Linkul trimis de un apelant necunoscut poate duce la un site fals. Deschide singur site-ul sau aplicația oficială" }
          ]
        },
        {
          id: 4,
          phrases: [
            { text: "Bună ziua! Suport tehnic. Numărul funcționează normal?", isThreat: false, explain: "O întrebare despre calitatea conexiunii este în sine obișnuită. Nu divulga date secrete dacă ți se cer mai târziu" },
            { text: "Perfect. Avem un tarif nou, vă pot povesti despre el.", isThreat: false, explain: "Oferta unui serviciu nu cere în sine transmiterea secretelor. Poți verifica singur condițiile în aplicația oficială" },
            { text: "Atunci nu închide, vei primi acum un cod SMS de confirmare, spune-mi-l.", isThreat: true, explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc." }
          ]
        },
        {
          id: 5,
          phrases: [
            { text: "Bună ziua, este o notificare MinTel.", isThreat: false, explain: "Este o notificare obișnuită, fără o cerere periculoasă. Numele companiei nu dovedește singur autenticitatea apelului" },
            { text: "Îți reamintim să suplinești contul până la sfârșitul lunii.", isThreat: false, explain: "Reamintirea despre suplinirea contului nu cere parola sau codul. Verifică singur soldul în aplicația oficială" },
            { text: "O poți face oricând prin aplicația oficială. O zi bună!", isThreat: false, explain: "Deschiderea aplicației oficiale din proprie inițiativă este o metodă sigură de a verifica și suplini contul" }
          ]
        }
      ]
    },
    classify: {
      prompt: "Glisează cardurile! La stânga — Periculos (fraza conține o capcană), La dreapta — Sigur (fără capcană).",
      safe: "Sigur",
      danger: "Periculos",
      completeMessage: "Toate cardurile au fost sortate!",
      items: [
        { id: "c1", text: "Spuneți codul din SMS pentru a anula operațiunea.", answer: "danger" },
        { id: "c2", text: "Numărul dvs. este blocat, accesați linkul pentru deblocare.", answer: "danger" },
        { id: "c3", text: "Bună ziua, mă numesc Ana, compania MinTel.", answer: "safe" },
        { id: "c4", text: "Dictați datele din buletin pentru confirmare.", answer: "danger" },
        { id: "c5", text: "Serviciul de asistență vă ascultă. Cu ce vă pot ajuta?", answer: "safe" },
        { id: "c6", text: "Ați sunat la numărul oficial. După convorbire puteți evalua calitatea deservirii apăsând tasta 1.", answer: "safe" },
        { id: "c7", text: "Am detectat o spargere. Descărcați urgent antivirusul din linkul SMS.", answer: "danger" },
        { id: "c8", text: "Vă mulțumim pentru apel, detaliile le găsiți în aplicația oficială.", answer: "safe" },
        { id: "c9", text: "Rămâneți pe fir! Aveți la dispoziție doar un minut pentru a accepta!", answer: "danger" },
        { id: "c10", text: "Vă schimbăm tariful. Pentru a refuza, dictați vechea parolă.", answer: "danger" },
        { id: "c11", text: "Vă reamintim: soldul este negativ. Puteți alimenta contul din aplicație sau de la terminal.", answer: "safe" },
        { id: "c12", text: "Sistem automat. Cererea de schimbare a numărului a fost acceptată. Dacă nu sunteți dvs. — rămâneți pe fir.", answer: "danger" },
        { id: "c13", text: "Pentru protecție, v-am trimis un cod de sistem. Doar introduceți-l de pe tastatura telefonului în timpul apelului.", answer: "danger" },
        { id: "c14", text: "Dacă aveți dubii că sunt operator — închideți și sunați-ne personal.", answer: "safe" },
        { id: "c15", text: "Nu cerem parole. Doar spuneți clar „DA” pentru a confirma prelungirea contractului.", answer: "danger" }
      ],
    },
    final: {
      intro: "Confruntarea finală. Ai 3 vieți (HP) pentru toate fazele. O greșeală = minus 1 viață.",
      gameOver: "Ai rămas fără vieți. Reia această fază — fazele trecute rămân salvate.",
      win: "Victorie! Umbra a fost învinsă, iar numărul tău este în siguranță.",
      clues: "Indicii",
      phase1Intro: "Faza 1: Test vizual. Dă click pe detaliul care trădează escrocul.",
      phase2Intro: "Faza 2: Blitz. Ai 25 de secunde pentru a răspunde!",
      phase3Intro: "Faza 3: Lupta cu Boss-ul. Parează atacurile lui!",
      phase1: [
        {
          id: "p1_1",
          type: "sms",
          sender: "MinTel",
          text: "Tariful dvs. expiră. Prelungiți accesând linkul:",
          fakeLink: "mintei-support.com",
          realLink: "mintel.md",
          correctTargets: ["fakeLink"]
        },
        {
          id: "p1_2",
          type: "call",
          caller: "Serviciul de securitate MinTel",
          number: "+44 20 7123 4567",
          correctTargets: ["number"]
        },
        {
          id: "p1_3",
          type: "profile",
          name: "Suport MinTel",
          accountType: "V-a scris primul pe WhatsApp și cere confirmarea datelor",
          correctTargets: ["accountType"]
        },
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Cartela SIM este blocată. Confirmați datele:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_5", type: "call", caller: "Suport Tehnic (WhatsApp)", number: "+44 77 00 900077", correctTargets: ["caller", "number"] },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "V-a scris primul pe WhatsApp și cere confirmarea datelor", correctTargets: ["name", "accountType"] },
        { id: "p1_7", type: "sms", sender: "Info", text: "Vi s-a aprobat un credit de la MinTel Bank. Accesați urgent:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTargets: ["text", "fakeLink"] },
        { id: "p1_8", type: "call", caller: "Poliția", number: "+373 999 999 999", correctTargets: ["avatar", "caller", "number"] },
        { id: "p1_9", type: "profile", name: "Suport Clienți", accountType: "Număr ascuns", correctTargets: ["avatar", "name", "accountType"] },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Urgent! Ați câștigat un iPhone 16! Accesați:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTargets: ["sender", "text", "fakeLink"] }
      ],
      phase2: [
        { id: "p2_1", text: "Operatorul vă cere urgent codul din SMS pentru a anula blocarea.", options: ["Îl dictez", "Închid apelul", "Dictez doar o jumătate"], answer: 1, explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc." },
        { id: "p2_2", text: "Numărul apelantului coincide cu cel de pe site. E de încredere?", options: ["Da", "Nu, numărul poate fi falsificat", "Doar dacă este +373"], answer: 1, explain: "Numărul apelantului poate fi falsificat. Închide și sună tu la numărul oficial, nu la cel din apel sau SMS" },
        { id: "p2_3", text: "Unde accesați pentru a verifica starea contului?", options: ["Pe linkul din SMS", "Deschid singur aplicația oficială", "Caut pe Google și dau click pe prima reclamă"], answer: 1, explain: "Deschide singur aplicația oficială. Linkul din SMS și primul anunț din căutare pot duce la un site fals"
        },
        { id: "p2_4", text: "Cine ar trebui să inițieze apelul pentru rezolvarea sigură a problemelor?", options: ["Abonatul însuși", "Operatorul", "Robotul"], answer: 0, explain: "Pentru a verifica un apel suspect, închide și sună tu la numărul oficial. Nu folosi numărul din apel sau SMS" },
        { id: "p2_5", text: "Dacă sunteți sunat și grăbit să luați o decizie, aceasta este...", options: ["O procedură standard", "O manipulare a escrocilor", "O eroare de sistem"], answer: 1, explain: "Graba te împiedică să verifici informația în liniște. Încheie conversația și verifică singur oferta" },
        { id: "p2_6", text: "Unde este cel mai bine să verificați starea planului tarifar?", options: ["În SMS", "În aplicația oficială", "Pe Google"], answer: 1, explain: "Verifică tariful actual în aplicația oficială pe care ai deschis-o singur" },
        { id: "p2_7", text: "Poate un operator real să vă ceară să dictați un cod SMS?", options: ["Da, pentru verificare", "Niciodată", "Doar la blocare"], answer: 1, explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc." },
        { id: "p2_8", text: "Ce faceți dacă sună un «angajat al serviciilor speciale» și cere ajutor?", options: ["Îl ajut", "Închid apelul", "Îi întreb gradul"], answer: 1, explain: "Gradul și cererea de ajutor secret nu confirmă identitatea. Închide și verifică solicitarea la numărul oficial al instituției" },
        { id: "p2_9", text: "Site-ul oficial este mintel.md. Linkul mintel-support.com este...", options: ["Oficial", "Fals", "De rezervă"], answer: 1, explain: "Un nume de site asemănător nu îl face oficial. Deschide singur site-ul oficial pe care îl cunoști" },
        { id: "p2_10", text: "Ce îi puteți spune unui necunoscut care v-a sunat?", options: ["Numărul pașaportului", "Nimic — închid și sun eu la numărul oficial", "Codul din SMS"], answer: 1, explain: "Numele tarifului nu oferă acces la cont. Nu comunica datele din buletin sau codul SMS unui apelant necunoscut" }
      ],
      phase3: [
        { 
          id: "p3_1", 
          bossText: "Dacă nu-mi spui codul, în 5 minute ți se vor retrage toți banii de pe cont!", 
          options: [
            "Voi suna eu însumi la suport acum.", 
            "Bine, dictez: 4-5-2..."
          ], 
          answers: [0], explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc."
        },
        { 
          id: "p3_2", 
          bossText: "Sunt anchetator. Operatorul MinTel v-a furat datele, ajutați ancheta să prindă infractorul!", 
          options: [
            "Ce trebuie să fac pentru a vă ajuta?", 
            "Chemați-mă oficial prin citație. La revedere."
          ], 
          answers: [1], explain: "Gradul și cererea de ajutor secret nu confirmă identitatea. Închide și verifică solicitarea la numărul oficial al instituției"
        },
        { 
          id: "p3_3", 
          bossText: "Bine, doar descărcați aplicația noastră de protecție de pe link pentru a vă securiza telefonul!", 
          options: [
            "Nu descarc nimic de pe link. La revedere.",
            "Dați-mi linkul, o instalez."
          ], 
          answers: [0], explain: "Aplicația din linkul apelantului poate oferi acces la telefon. Nu o instala; verifică solicitarea printr-un canal oficial"
        },
        { id: "p3_4", bossText: "Cineva încearcă să vă reînregistreze numărul în alt oraș. Dictați codul de anulare!", options: ["Voi închide și voi suna la suport.", "Codul este 4521"], answers: [0], explain: "Codul din SMS îl introduci doar tu, pe site-ul sau în aplicația pe care le-ai deschis singur. Cine îți cere să-i spui sau să-i trimiți codul este un escroc." },
        { id: "p3_5", bossText: "Am trimis deja poliția pentru complicitate la fraudă, dacă nu vă confirmați identitatea!", options: ["Chemați-i, îi voi aștepta.", "Oh, ce trebuie să spun?"], answers: [0], explain: "Amenințarea cu poliția este folosită pentru presiune. Nu transmite date; verifică solicitarea la numărul oficial al instituției" },
        { id: "p3_6", bossText: "Aveți un serviciu cu plată de 500 de lei pe zi. Pentru dezactivare, e nevoie de un cod.", options: ["Îl voi dezactiva singur din aplicație.", "Sigur, codul 9912."], answers: [0], explain: "Verifică singur serviciile cu plată în aplicația oficială. Nu trebuie să comunici codul apelantului pentru aceasta" },
        { id: "p3_7", bossText: "Sunt managerul dvs. personal. Aveți o conexiune slabă, haideți să o actualizăm.", options: ["Totul funcționează perfect, la revedere.", "Da, haideți să actualizăm."], answers: [0], explain: "Promisiunea de a îmbunătăți conexiunea nu confirmă identitatea apelantului. Poți încheia conversația și verifica oferta printr-un canal oficial" },
        { id: "p3_8", bossText: "Ați câștigat la loteria MinTel! Pentru transferul banilor, accesați link-ul meu.", options: ["Mulțumesc, voi verifica pe site-ul MinTel.", "Aștept link-ul!"], answers: [0], explain: "Verifică premiul pe site-ul oficial sau în contul pe care l-ai deschis singur. Nu accesa linkul apelantului" },
        { id: "p3_9", bossText: "Sunt de la bancă. Telefonul vă este spart. Spuneți rapid codul!", options: ["Voi suna eu imediat la banca mea.", "Ce coșmar, codul 1234!"], answers: [0], explain: "Închide și sună tu la bancă la numărul oficial, nu la cel din apel sau SMS. Dacă este necesar, blochează cardul în aplicația oficială" },
        { id: "p3_10", bossText: "Aceasta este ultima încercare. Dacă nu ziceți codul, cartela SIM va arde acum!", options: ["Las-o să ardă.", "Numai nu cartela SIM, iată codul!"], answers: [0], explain: "Amenințarea de a distruge cartela SIM te împinge să te grăbești. Încheie apelul și sună tu operatorul la numărul oficial, nu la cel din apel sau SMS" }
      ]
    } satisfies OperatorFinalContent,
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
            { id: "p1", text: "Bună ziua, aici MinTel. ", isLie: false },
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
            { id: "p6", text: "Altfel, numărul va fi transferat altui abonat.", isLie: true },
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
      prompt: "Apasă acțiunile în ordinea cronologică corectă. O greșeală nu scade din timp.",
      levelText: "Nivelul",
      win: "Bomba a fost dezamorsată! O treabă excelentă.",
      fail: "Timpul a expirat! Nu ai reușit.",
      levels: [
        {
          id: 1,
          time: 45,
          steps: [
            { id: "s1", text: "Închideți apelul." },
            { id: "s2", text: "Nu comunicați nimănui codul din SMS." },
            { id: "s3", text: "Blocați numărul apelantului." }
          ]
        },
        {
          id: 2,
          time: 53,
          steps: [
            { id: "s1", text: "Refuzați luarea unei decizii rapide la telefon." },
            { id: "s2", text: "Încheiați apelul." },
            { id: "s3", text: "Deschideți aplicația oficială «MinTel»." },
            { id: "s4", text: "Verificați personal dacă există tarife noi." }
          ]
        },
        {
          id: 3,
          time: 60,
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
          time: 68,
          steps: [
            { id: "s1", text: "Refuzați instalarea oricăror programe." },
            { id: "s2", text: "Închideți apelul." },
            { id: "s3", text: "Ștergeți SMS-urile cu linkuri dubioase." },
            { id: "s4", text: "Verificați telefonul cu antivirusul integrat." },
            { id: "s5", text: "Schimbați parola contului personal MinTel." },
            { id: "s6", text: "Activați confirmarea intrării prin cod (verificarea în doi pași)" }
          ]
        },
        {
          id: 5,
          time: 83,
          steps: [
            { id: "s1", text: "Încheiați imediat conversația." },
            { id: "s2", text: "Accesați aplicația oficială a operatorului." },
            { id: "s3", text: "Ieșiți din cont pe toate celelalte dispozitive" },
            { id: "s4", text: "Schimbați parola de acces." },
            { id: "s5", text: "Dacă ai spus codul sau datele cardului — închide și sună tu la bancă, la numărul de pe spatele cardului sau de pe site-ul oficial." },
            { id: "s6", text: "Sunați la suportul real MinTel." },
            { id: "s7", text: "Raportați scurgerea de date." }
          ]
        }
      ]
    }
  }
} as const;
