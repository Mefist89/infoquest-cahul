export type FlashcardItem = {
  term: string;
  definition: string;
};

export type FlashcardModuleKey = "operator-call" | "fake-link" | "hacked-account" | "scam-or-real";

export const MODULE_FLASHCARDS: Record<FlashcardModuleKey, Record<"ru" | "ro", readonly FlashcardItem[]>> = {
  "operator-call": {
    ru: [
      {
        term: "Вишинг",
        definition: "Телефонное мошенничество, когда злоумышленник звонит и притворяется сотрудником банка, оператора или полиции.",
      },
      {
        term: "Социальная инженерия",
        definition: "Психологические приёмы (страх, спешка, авторитет), чтобы заставить человека самого выдать секретные данные.",
      },
      {
        term: "Код из SMS",
        definition: "Одноразовый ключ, который вводишь только ты сам на официальном сайте. Никому нельзя его диктовать или пересылать.",
      },
      {
        term: "Искусственная срочность",
        definition: "Фразы «осталось 2 минуты» или «номер заблокируют прямо сейчас» — уловка, чтобы ты не успел подумать и проверить.",
      },
    ],
    ro: [
      {
        term: "Vishing",
        definition: "Fraudă telefonică în care escrocul sună și se dă drept angajat al băncii, al operatorului mobil sau al poliției.",
      },
      {
        term: "Inginerie socială",
        definition: "Trucuri psihologice (frică, grabă, autoritate falsă) folosite pentru a te convinge să oferi singur date secrete.",
      },
      {
        term: "Codul din SMS",
        definition: "O cheie unică pe care o introduci doar tu pe site-ul oficial. Nu îl dicta și nu îl trimite nimănui.",
      },
      {
        term: "Urgență artificială",
        definition: "Expresii ca «mai ai 2 minute» sau «numărul va fi blocat acum» — o capcană ca să nu ai timp să verifici.",
      },
    ],
  },
  "fake-link": {
    ru: [
      {
        term: "Фишинг",
        definition: "Поддельные письма, сообщения и сайты-копии, созданные для кражи паролей, кодов и данных банковских карт.",
      },
      {
        term: "Домен",
        definition: "Главный адрес сайта (часть между «//» и первым «/»). Даже одна лишняя буква или другое окончание ведёт на чужой сайт.",
      },
      {
        term: "HTTPS и замок",
        definition: "Означают только шифрование соединения, но не честность сайта. У фишинговых страниц тоже часто есть значок замка.",
      },
      {
        term: "PIN и CVV",
        definition: "Секретные коды карты. PIN на сайтах не вводят вообще, а CVV — только при оплате на проверенном сайте, который ты открыл сам.",
      },
    ],
    ro: [
      {
        term: "Phishing",
        definition: "Mesaje, e-mailuri și site-uri-copie false, create pentru a fura parole, coduri și datele cardului bancar.",
      },
      {
        term: "Domeniu",
        definition: "Adresa principală a site-ului (partea dintre «//» și primul «/»). O singură literă schimbată duce pe alt site.",
      },
      {
        term: "HTTPS și lacătul",
        definition: "Arată doar că conexiunea este criptată, nu că site-ul este real. Și paginile de phishing au adesea lacăt.",
      },
      {
        term: "PIN și CVV",
        definition: "Coduri secrete ale cardului. PIN-ul nu se introduce pe site-uri, iar CVV-ul doar la plată pe un site oficial deschis de tine.",
      },
    ],
  },
  "hacked-account": {
    ru: [
      {
        term: "2FA (двухэтапная проверка)",
        definition: "Дополнительная защита входа: кроме пароля нужен код из приложения или SMS, поэтому одного пароля злоумышленнику недостаточно.",
      },
      {
        term: "Активные сессии",
        definition: "Список устройств, на которых выполнен вход в твой аккаунт. При взломе нужно сразу завершить все чужие сессии.",
      },
      {
        term: "Утечка пароля",
        definition: "Ситуация, когда старый пароль попал в руки мошенников. Если он один на все сайты — под угрозой все аккаунты сразу.",
      },
      {
        term: "Резервная почта и телефон",
        definition: "Контакты для восстановления доступа. После взлома проверь, не подменил ли их злоумышленник на свои.",
      },
    ],
    ro: [
      {
        term: "2FA (verificare în doi pași)",
        definition: "Protecție suplimentară: pe lângă parolă, ai nevoie de un cod dintr-o aplicație sau SMS, astfel parola singură nu ajunge.",
      },
      {
        term: "Sesiuni active",
        definition: "Lista dispozitivelor conectate la contul tău. În caz de spargere, trebuie să închizi imediat toate sesiunile străine.",
      },
      {
        term: "Scurgere de parolă",
        definition: "Momentul în care parola ajunge la escroci. Dacă folosești aceeași parolă peste tot, toate conturile sunt în pericol.",
      },
      {
        term: "E-mail și telefon de recuperare",
        definition: "Datele prin care îți recuperezi contul. După un incident, verifică să nu fi fost înlocuite cu datele atacatorului.",
      },
    ],
  },
  "scam-or-real": {
    ru: [
      {
        term: "Предоплата",
        definition: "Перевод денег до получения товара. Незнакомый продавец после предоплаты на личную карту может просто исчезнуть.",
      },
      {
        term: "Цена-ловушка",
        definition: "Слишком низкая цена (например, телефон за полцены), чтобы выключить критическое мышление и заставить спешить.",
      },
      {
        term: "Магазин-однодневка",
        definition: "Фейковый сайт или аккаунт, созданный несколько дней назад без реального адреса, контактов и условий возврата.",
      },
      {
        term: "Фейковые отзывы",
        definition: "Хвалебные комментарии на самой странице продавца легко подделать — всегда ищи отзывы на независимых сайтах.",
      },
    ],
    ro: [
      {
        term: "Plată în avans",
        definition: "Transferul banilor înainte de a vedea produsul. Un vânzător necunoscut poate dispărea imediat după ce primește banii.",
      },
      {
        term: "Preț-capcană",
        definition: "Un preț nerealist de mic (de exemplu, un telefon la jumătate de preț) menit să te facă să acționezi în grabă.",
      },
      {
        term: "Magazin-fantomă",
        definition: "Un site sau cont creat acum câteva zile, fără adresă reală, date de contact sau politică de retur.",
      },
      {
        term: "Recenzii false",
        definition: "Comentariile pozitive de pe pagina vânzătorului pot fi inventate — caută mereu păreri pe site-uri independente.",
      },
    ],
  },
};
