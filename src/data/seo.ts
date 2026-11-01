export const siteSeo = {
  ro: {
    title: "InfoQuest — Scutul comunității digitale",
    description: "Joc educațional bilingv despre siguranță digitală, fraudă, dezinformare și protecția comunității.",
    locale: "ro_MD",
    alternateLocale: "ru_MD",
  },
  ru: {
    title: "InfoQuest — Щит цифрового сообщества",
    description: "Двуязычная образовательная игра о цифровой безопасности, мошенничестве, дезинформации и защите сообщества.",
    locale: "ru_MD",
    alternateLocale: "ro_MD",
  },
} as const;

export const moduleSeo = {
  "operator-call": {
    "ru": {
      "title": "Мошеннический звонок: что делать, если просят код",
      "description": "Звонят от имени банка или оператора и просят код? Научитесь замечать уловки и выбирать безопасные действия в учебных играх InfoQuest.",
      "phrases": [
        "позвонили из банка просят код",
        "мошенники звонят от оператора",
        "просят назвать код из СМС",
        "как распознать мошеннический звонок",
        "что делать после звонка мошенников"
      ]
    },
    "ro": {
      "title": "Apel fals: ce faci dacă ți se cere codul din SMS",
      "description": "Cineva sună în numele băncii sau al operatorului și cere un cod? Învață să recunoști capcanele și să alegi acțiuni sigure în jocurile InfoQuest.",
      "phrases": [
        "apel fals de la bancă",
        "escroci la telefon",
        "cineva cere codul din SMS",
        "apel suspect de la operator",
        "ce fac după un apel fraudulos"
      ]
    }
  },
  "fake-link": {
    "ru": {
      "title": "Как проверить ссылку и распознать фишинг",
      "description": "Получили подозрительную ссылку в SMS или сообщении? Учитесь проверять адрес сайта, распознавать фишинг и действовать, если уже ввели данные.",
      "phrases": [
        "как проверить ссылку",
        "подозрительная ссылка в СМС",
        "как распознать фишинг",
        "поддельный сайт банка",
        "ввёл данные по ссылке что делать"
      ]
    },
    "ro": {
      "title": "Cum verifici un link și recunoști phishingul",
      "description": "Ai primit un link suspect prin SMS sau mesaj? Învață să verifici adresa site-ului, să recunoști phishingul și ce să faci dacă ai introdus deja date.",
      "phrases": [
        "cum verific un link",
        "link suspect în SMS",
        "cum recunosc phishingul",
        "site fals al băncii",
        "am introdus date pe un site fals"
      ]
    }
  },
  "hacked-account": {
    "ru": {
      "title": "Взломали аккаунт: как вернуть доступ и защитить его",
      "description": "Чужой вход, изменённый пароль или сообщения от вашего имени? Разберите действия для восстановления аккаунта и защиты почты и мессенджеров.",
      "phrases": [
        "взломали аккаунт что делать",
        "как вернуть доступ к аккаунту",
        "украли аккаунт WhatsApp",
        "чужой вход в аккаунт",
        "как защитить аккаунт от взлома"
      ]
    },
    "ro": {
      "title": "Cont spart: cum recuperezi accesul și îl protejezi",
      "description": "O conectare străină, parola schimbată sau mesaje trimise în numele tău? Învață pașii pentru recuperarea contului și protejarea e-mailului și mesageriei.",
      "phrases": [
        "cont spart ce fac",
        "cum recuperez un cont",
        "cont WhatsApp furat",
        "conectare necunoscută în cont",
        "cum protejez contul de hackeri"
      ]
    }
  },
  "scam-or-real": {
    "ru": {
      "title": "Как проверить продавца и избежать обмана при покупке",
      "description": "Слишком выгодная цена, предоплата или просьба назвать код? Учитесь проверять продавца, искать независимые отзывы и замечать опасные предложения.",
      "phrases": [
        "как проверить продавца",
        "мошенники в интернет-магазине",
        "просят предоплату на карту",
        "как безопасно купить с рук",
        "перевёл деньги мошеннику что делать"
      ]
    },
    "ro": {
      "title": "Cum verifici un vânzător și eviți fraudele la cumpărături",
      "description": "Un preț avantajos, un avans sau o cerere de a spune un cod? Învață să verifici vânzătorul, să cauți recenzii independente și să observi ofertele suspecte.",
      "phrases": [
        "cum verific un vânzător",
        "magazin online fals",
        "avans pe card personal",
        "cumpărături sigure de la persoane fizice",
        "am transferat bani unui escroc"
      ]
    }
  }
} as const;

export type SeoLocale = "ro" | "ru";
export type SeoModule = keyof typeof moduleSeo;

export const guestModuleLabels = {
  ru: { start: "Начать — войти", back: "На главную", rules: "Что важно помнить" },
  ro: { start: "Începe — intră în cont", back: "Acasă", rules: "Ce e important să reții" },
} as const;

export const publicPageSeo = {
  privacy: {
    ru: { title: "Политика конфиденциальности", description: "Как InfoQuest защищает данные и конфиденциальность пользователей." },
    ro: { title: "Politica de confidențialitate", description: "Cum protejează InfoQuest datele și confidențialitatea utilizatorilor." },
  },
  terms: {
    ru: { title: "Условия использования", description: "Правила использования образовательного прототипа InfoQuest." },
    ro: { title: "Termeni și condiții", description: "Regulile de utilizare a prototipului educațional InfoQuest." },
  },
  patrol: {
    ru: { title: "Патруль цифрового города", description: "Мини-игра 2D: патрулируй город и останавливай угрозы." },
    ro: { title: "Patrula orașului digital", description: "Mini-joc 2D: patrulează orașul și oprește amenințările." },
  },
} as const;
