export type LegalLocale = "ro" | "ru";
export type LegalKind = "privacy" | "terms";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  eyebrow: string;
  updated: string;
  summary: string;
  backHome: string;
  sections: LegalSection[];
  linksTitle: string;
  links: { label: string; href: string }[];
  notice: string;
};

const sharedLinks = {
  ro: [
    { label: "Centrul Național pentru Protecția Datelor cu Caracter Personal", href: "https://datepersonale.md/" },
    { label: "Politica de confidențialitate Vercel", href: "https://vercel.com/legal/privacy-policy" },
    { label: "Proiectul InfoQuest Cahul pe GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
  ],
  ru: [
    { label: "Национальный центр защиты персональных данных Молдовы", href: "https://datepersonale.md/" },
    { label: "Политика конфиденциальности Vercel", href: "https://vercel.com/legal/privacy-policy" },
    { label: "Проект InfoQuest Cahul на GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
  ],
} satisfies Record<LegalLocale, { label: string; href: string }[]>;

export const legalContent: Record<LegalLocale, Record<LegalKind, LegalDocument>> = {
  ro: {
    privacy: {
      title: "Politica de confidențialitate",
      eyebrow: "InfoQuest Cahul · Protecția datelor",
      updated: "Ultima actualizare: 7 august 2026",
      summary:
        "Această politică explică, într-un limbaj clar, ce informații pot fi prelucrate când folosești InfoQuest Cahul și ce control ai asupra lor.",
      backHome: "Înapoi la pagina principală",
      sections: [
        {
          title: "1. Cine administrează proiectul",
          paragraphs: [
            "InfoQuest Cahul este un prototip educațional bilingv realizat de echipa proiectului InfoQuest Cahul pentru Hackathonul Regional pentru coeziune socială și reziliență informațională.",
            "Versiunea publică actuală nu permite crearea unui cont și nu solicită numele, adresa de e-mail, numărul de telefon sau date de plată.",
          ],
        },
        {
          title: "2. Ce informații sunt prelucrate",
          bullets: [
            "Limba aleasă (RO sau RU) este salvată local în browser, sub cheia «infoquest.lang», pentru a păstra preferința la următoarea vizită.",
            "O imagine selectată în blocul «Sigla echipei» este citită numai în memoria browserului. Nu este încărcată pe server și dispare după reîncărcarea sau închiderea paginii.",
            "Codul QR este generat direct în browser din adresa publică a site-ului; conținutul său nu este trimis de aplicație către un serviciu extern de generare QR.",
            "Furnizorul de găzduire poate prelucra automat date tehnice precum adresa IP, tipul browserului, data și ora cererii, pagina solicitată și jurnalele de securitate necesare livrării site-ului.",
          ],
        },
        {
          title: "3. Ce nu facem",
          bullets: [
            "Nu folosim conturi de utilizator, publicitate comportamentală sau profilare.",
            "Nu instalăm cookie-uri proprii de marketing și nu folosim instrumente de analiză a audienței în versiunea actuală.",
            "Nu vindem și nu închiriem date personale.",
            "Nu solicităm încărcarea conversațiilor private, a documentelor de identitate sau a imaginilor sensibile.",
          ],
        },
        {
          title: "4. Scopuri și temeiuri",
          paragraphs: [
            "Preferința de limbă este folosită pentru furnizarea funcției solicitate de utilizator. Datele tehnice de găzduire pot fi prelucrate pentru funcționarea, securitatea și prevenirea abuzurilor, în baza interesului legitim și a obligațiilor tehnice ale furnizorului.",
            "Dacă proiectul va introduce în viitor conturi, formulare, analiză de audiență, servicii AI sau stocare online a progresului, această politică va fi actualizată înainte de activarea lor.",
          ],
        },
        {
          title: "5. Păstrarea și ștergerea datelor",
          bullets: [
            "Preferința de limbă rămâne în browser până când utilizatorul șterge datele site-ului sau schimbă setarea.",
            "Imaginea siglei nu este păstrată după reîncărcarea paginii.",
            "Jurnalele tehnice sunt păstrate de furnizorul de găzduire conform termenelor și măsurilor sale de securitate.",
          ],
        },
        {
          title: "6. Furnizori și transferuri",
          paragraphs: [
            "Site-ul este găzduit prin Vercel. În măsura necesară furnizării și protejării site-ului, datele tehnice pot fi prelucrate pe infrastructura furnizorului și în alte jurisdicții, cu garanțiile descrise în politica sa de confidențialitate.",
          ],
        },
        {
          title: "7. Copii și adolescenți",
          paragraphs: [
            "Proiectul are scop educațional și poate fi folosit de elevi. Nu solicităm minorilor date personale. Recomandăm utilizarea împreună cu un profesor, părinte sau tutore și evitarea introducerii datelor reale în exemplele de joc.",
          ],
        },
        {
          title: "8. Drepturile tale",
          paragraphs: [
            "În condițiile legislației aplicabile din Republica Moldova, poți solicita informații despre prelucrare, acces, rectificare, ștergere sau restricționare și poți formula o opoziție ori o plângere la autoritatea de supraveghere. Legea nr. 195/2024 privind protecția datelor cu caracter personal se aplică de la data intrării sale în vigoare.",
          ],
        },
        {
          title: "9. Securitate, modificări și contact",
          paragraphs: [
            "Aplicăm principiul minimizării datelor și evităm colectarea datelor care nu sunt necesare. Nicio metodă tehnică nu poate garanta securitate absolută.",
            "Putem actualiza această politică atunci când se schimbă funcțiile proiectului sau cerințele legale. Pentru întrebări tehnice sau privind confidențialitatea, contactează echipa prin depozitul public GitHub al proiectului, fără a publica acolo date sensibile.",
          ],
        },
      ],
      linksTitle: "Resurse și contacte",
      links: sharedLinks.ro,
      notice:
        "Această pagină descrie funcționarea tehnică actuală a prototipului și nu înlocuiește consultanța juridică individuală.",
    },
    terms: {
      title: "Termeni și condiții",
      eyebrow: "InfoQuest Cahul · Reguli de utilizare",
      updated: "Ultima actualizare: 7 august 2026",
      summary:
        "Acești termeni stabilesc regulile de folosire a prototipului educațional InfoQuest Cahul.",
      backHome: "Înapoi la pagina principală",
      sections: [
        {
          title: "1. Acceptarea termenilor",
          paragraphs: [
            "Prin accesarea și folosirea InfoQuest Cahul confirmi că ai citit și accepți acești termeni. Dacă nu ești de acord, nu continua utilizarea site-ului.",
          ],
        },
        {
          title: "2. Scopul serviciului",
          paragraphs: [
            "InfoQuest Cahul este un prototip educațional bilingv despre fraude online, linkuri false, conturi compromise, oferte înșelătoare, deepfake-uri și dezinformare.",
            "Conținutul are caracter informativ și educațional. Nu reprezintă consultanță juridică, financiară, psihologică sau de securitate cibernetică pentru un incident concret.",
          ],
        },
        {
          title: "3. Utilizarea de către minori",
          paragraphs: [
            "Elevii pot folosi jocul în scop educațional. Pentru utilizatorii minori recomandăm îndrumarea unui profesor, părinte sau tutore. Nu introduce date personale reale în scenarii sau în elementele demonstrative.",
          ],
        },
        {
          title: "4. Reguli de utilizare acceptabilă",
          bullets: [
            "Folosește proiectul numai în scopuri legale, educaționale și de demonstrație.",
            "Nu încerca să afectezi funcționarea site-ului, să ocolești măsurile de securitate sau să distribui cod malițios.",
            "Nu folosi exemplele educaționale pentru a imita instituții, a înșela persoane sau a colecta date reale.",
            "Nu încărca materiale ilegale, confidențiale ori care încalcă drepturile altor persoane.",
          ],
        },
        {
          title: "5. Conținut, personaje și proprietate intelectuală",
          paragraphs: [
            "Scenariile, personajele și organizațiile prezentate sunt educaționale și, dacă nu se precizează altfel, fictive. Asemănările cu persoane sau situații reale sunt întâmplătoare.",
            "Codul, identitatea vizuală, textele și materialele originale ale proiectului sunt protejate de legislația aplicabilă. Componentele terțe rămân supuse licențelor autorilor lor.",
          ],
        },
        {
          title: "6. Servicii și legături externe",
          paragraphs: [
            "Site-ul poate folosi servicii de găzduire sau poate afișa legături către resurse externe. Aceste servicii au propriii termeni și politici, iar echipa InfoQuest Cahul nu controlează conținutul ori disponibilitatea lor.",
          ],
        },
        {
          title: "7. Disponibilitate și versiune MVP",
          paragraphs: [
            "Proiectul este oferit în stadiu MVP și poate conține funcții incomplete, erori sau perioade de indisponibilitate. Putem modifica, suspenda sau retrage funcții pentru testare, securitate ori dezvoltare.",
          ],
        },
        {
          title: "8. Limitarea răspunderii",
          paragraphs: [
            "În limitele permise de lege, proiectul este furnizat «ca atare». Echipa nu garantează că materialele vor preveni orice fraudă sau incident și nu răspunde pentru decizii luate exclusiv pe baza simulărilor educaționale. Drepturile obligatorii acordate consumatorilor și persoanelor vizate nu sunt limitate prin acești termeni.",
          ],
        },
        {
          title: "9. Modificări, lege aplicabilă și contact",
          paragraphs: [
            "Putem actualiza acești termeni pe măsură ce proiectul evoluează. Versiunea nouă va indica data ultimei actualizări.",
            "Termenii sunt interpretați conform legislației Republicii Moldova. Pentru întrebări despre proiect, folosește depozitul public GitHub și nu publica informații sensibile.",
          ],
        },
      ],
      linksTitle: "Informații suplimentare",
      links: [
        { label: "Proiectul InfoQuest Cahul pe GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
        { label: "Politica de confidențialitate", href: "/ro/privacy" },
      ],
      notice:
        "Acești termeni sunt adaptați versiunii MVP actuale și ar trebui revizuiți juridic înainte de utilizarea comercială sau colectarea datelor personale.",
    },
  },
  ru: {
    privacy: {
      title: "Политика конфиденциальности",
      eyebrow: "InfoQuest Cahul · Защита данных",
      updated: "Последнее обновление: 7 августа 2026 года",
      summary:
        "Эта политика простым языком объясняет, какие сведения могут обрабатываться при использовании InfoQuest Cahul и как пользователь может ими управлять.",
      backHome: "Вернуться на главную",
      sections: [
        {
          title: "1. Кто управляет проектом",
          paragraphs: [
            "InfoQuest Cahul — двуязычный образовательный прототип, созданный командой проекта InfoQuest Cahul для Регионального хакатона по социальной сплочённости и информационной устойчивости.",
            "Текущая публичная версия не позволяет создавать аккаунты и не запрашивает имя, электронную почту, номер телефона или платёжные данные.",
          ],
        },
        {
          title: "2. Какие сведения обрабатываются",
          bullets: [
            "Выбранный язык (RO или RU) сохраняется локально в браузере под ключом «infoquest.lang», чтобы запомнить настройку для следующего посещения.",
            "Изображение, выбранное в блоке «Логотип команды», читается только в памяти браузера. Оно не отправляется на сервер и исчезает после перезагрузки или закрытия страницы.",
            "QR-код создаётся непосредственно в браузере из публичного адреса сайта; приложение не отправляет его содержимое внешнему сервису генерации QR-кодов.",
            "Хостинг-провайдер может автоматически обрабатывать технические данные: IP-адрес, тип браузера, дату и время запроса, запрошенную страницу и журналы безопасности, необходимые для доставки и защиты сайта.",
          ],
        },
        {
          title: "3. Чего мы не делаем",
          bullets: [
            "Не используем пользовательские аккаунты, поведенческую рекламу или профилирование.",
            "Не устанавливаем собственные маркетинговые cookie-файлы и не используем системы веб-аналитики в текущей версии.",
            "Не продаём и не сдаём в аренду персональные данные.",
            "Не просим загружать личную переписку, документы или чувствительные изображения.",
          ],
        },
        {
          title: "4. Цели и основания обработки",
          paragraphs: [
            "Настройка языка используется для предоставления выбранной пользователем функции. Технические данные хостинга могут обрабатываться для работы сайта, обеспечения безопасности и предотвращения злоупотреблений на основании законного интереса и технических обязанностей провайдера.",
            "Если в будущем появятся аккаунты, формы, веб-аналитика, AI-сервисы или онлайн-хранение прогресса, политика будет обновлена до включения этих функций.",
          ],
        },
        {
          title: "5. Срок хранения и удаление",
          bullets: [
            "Настройка языка хранится в браузере, пока пользователь не очистит данные сайта или не изменит язык.",
            "Изображение логотипа не сохраняется после перезагрузки страницы.",
            "Технические журналы хранятся хостинг-провайдером в соответствии с его сроками хранения и мерами безопасности.",
          ],
        },
        {
          title: "6. Поставщики и международная обработка",
          paragraphs: [
            "Сайт размещён на Vercel. В объёме, необходимом для работы и защиты сайта, технические данные могут обрабатываться на инфраструктуре провайдера и в других юрисдикциях с гарантиями, описанными в его политике конфиденциальности.",
          ],
        },
        {
          title: "7. Дети и подростки",
          paragraphs: [
            "Проект имеет образовательную направленность и может использоваться школьниками. Мы не просим несовершеннолетних предоставлять персональные данные. Рекомендуем пользоваться проектом вместе с учителем, родителем или опекуном и не вводить реальные данные в игровые примеры.",
          ],
        },
        {
          title: "8. Права пользователя",
          paragraphs: [
            "В соответствии с применимым законодательством Республики Молдова пользователь может запросить информацию об обработке, доступ, исправление, удаление или ограничение данных, заявить возражение и обратиться с жалобой в надзорный орган. Закон №195/2024 о защите персональных данных применяется с даты его вступления в силу.",
          ],
        },
        {
          title: "9. Безопасность, изменения и связь",
          paragraphs: [
            "Мы придерживаемся принципа минимизации и не собираем сведения, которые не нужны для работы прототипа. Ни один технический метод не гарантирует абсолютную безопасность.",
            "Политика может обновляться при изменении функций или законодательства. По техническим вопросам и вопросам конфиденциальности свяжитесь с командой через публичный GitHub-репозиторий проекта, не публикуя там чувствительные данные.",
          ],
        },
      ],
      linksTitle: "Ресурсы и контакты",
      links: sharedLinks.ru,
      notice:
        "Эта страница описывает фактическую работу текущего прототипа и не заменяет индивидуальную юридическую консультацию.",
    },
    terms: {
      title: "Условия использования",
      eyebrow: "InfoQuest Cahul · Правила использования",
      updated: "Последнее обновление: 7 августа 2026 года",
      summary: "Эти условия определяют правила использования образовательного прототипа InfoQuest Cahul.",
      backHome: "Вернуться на главную",
      sections: [
        {
          title: "1. Принятие условий",
          paragraphs: [
            "Открывая и используя InfoQuest Cahul, вы подтверждаете, что прочитали и принимаете эти условия. Если вы не согласны, прекратите использование сайта.",
          ],
        },
        {
          title: "2. Назначение сервиса",
          paragraphs: [
            "InfoQuest Cahul — двуязычный образовательный прототип о телефонном мошенничестве, поддельных ссылках, взломанных аккаунтах, сомнительных предложениях, дипфейках и дезинформации.",
            "Материалы носят информационный и образовательный характер и не являются юридической, финансовой, психологической или профессиональной консультацией по кибербезопасности для конкретного инцидента.",
          ],
        },
        {
          title: "3. Использование несовершеннолетними",
          paragraphs: [
            "Школьники могут пользоваться игрой в образовательных целях. Несовершеннолетним рекомендуется делать это под руководством учителя, родителя или опекуна. Не вводите реальные персональные данные в сценарии или демонстрационные элементы.",
          ],
        },
        {
          title: "4. Правила допустимого использования",
          bullets: [
            "Используйте проект только в законных образовательных и демонстрационных целях.",
            "Не нарушайте работу сайта, не обходите меры безопасности и не распространяйте вредоносный код.",
            "Не применяйте образовательные примеры для имитации учреждений, обмана людей или сбора реальных данных.",
            "Не загружайте незаконные, конфиденциальные материалы или контент, нарушающий права других лиц.",
          ],
        },
        {
          title: "5. Контент, персонажи и интеллектуальная собственность",
          paragraphs: [
            "Сценарии, персонажи и организации являются образовательными и, если не указано обратное, вымышленными. Совпадения с реальными людьми или событиями случайны.",
            "Код, визуальная идентичность, тексты и оригинальные материалы проекта охраняются применимым законодательством. Сторонние компоненты используются по лицензиям их авторов.",
          ],
        },
        {
          title: "6. Внешние сервисы и ссылки",
          paragraphs: [
            "Сайт может использовать услуги хостинга и содержать ссылки на внешние ресурсы. У них есть собственные условия и политики; команда InfoQuest Cahul не контролирует их содержание и доступность.",
          ],
        },
        {
          title: "7. Доступность и статус MVP",
          paragraphs: [
            "Проект предоставляется как MVP и может содержать незавершённые функции, ошибки или временно быть недоступен. Мы можем изменять, приостанавливать или удалять функции для тестирования, обеспечения безопасности и развития проекта.",
          ],
        },
        {
          title: "8. Ограничение ответственности",
          paragraphs: [
            "В пределах, разрешённых законом, проект предоставляется «как есть». Команда не гарантирует, что материалы предотвратят любое мошенничество или инцидент, и не отвечает за решения, принятые исключительно на основании учебных симуляций. Эти условия не ограничивают обязательные права потребителей и субъектов данных.",
          ],
        },
        {
          title: "9. Изменения, применимое право и связь",
          paragraphs: [
            "Условия могут обновляться по мере развития проекта. Новая версия будет содержать актуальную дату обновления.",
            "Условия толкуются по законодательству Республики Молдова. По вопросам проекта используйте публичный GitHub-репозиторий и не публикуйте чувствительную информацию.",
          ],
        },
      ],
      linksTitle: "Дополнительная информация",
      links: [
        { label: "Проект InfoQuest Cahul на GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
        { label: "Политика конфиденциальности", href: "/ru/privacy" },
      ],
      notice:
        "Условия подготовлены для текущей MVP-версии и требуют юридической проверки перед коммерческим запуском или началом сбора персональных данных.",
    },
  },
};
