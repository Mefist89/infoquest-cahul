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
    { label: "Politica de confidențialitate Supabase", href: "https://supabase.com/privacy" },
    { label: "Politica de confidențialitate Google", href: "https://policies.google.com/privacy" },
    { label: "Politica de confidențialitate Vercel", href: "https://vercel.com/legal/privacy-policy" },
    { label: "Informații despre furnizorul AI BotHub", href: "https://bothub.chat/" },
    { label: "Proiectul InfoQuest pe GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
  ],
  ru: [
    { label: "Национальный центр защиты персональных данных Молдовы", href: "https://datepersonale.md/" },
    { label: "Политика конфиденциальности Supabase", href: "https://supabase.com/privacy" },
    { label: "Политика конфиденциальности Google", href: "https://policies.google.com/privacy" },
    { label: "Политика конфиденциальности Vercel", href: "https://vercel.com/legal/privacy-policy" },
    { label: "Информация об AI-провайдере BotHub", href: "https://bothub.chat/" },
    { label: "Проект InfoQuest на GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
  ],
} satisfies Record<LegalLocale, { label: string; href: string }[]>;

export const legalContent: Record<LegalLocale, Record<LegalKind, LegalDocument>> = {
  ro: {
    privacy: {
      title: "Politica de confidențialitate",
      eyebrow: "InfoQuest · Protecția datelor",
      updated: "Ultima actualizare: 9 august 2026",
      summary:
        "Această politică explică, într-un limbaj clar, ce informații pot fi prelucrate când folosești InfoQuest și ce control ai asupra lor.",
      backHome: "Înapoi la pagina principală",
      sections: [
        {
          title: "1. Cine administrează proiectul",
          paragraphs: [
            "InfoQuest este un prototip educațional bilingv realizat de echipa proiectului InfoQuest pentru Hackathonul Regional pentru coeziune socială și reziliență informațională.",
            "Pentru acces la investigație, utilizatorul poate crea un cont prin autentificarea Google administrată de Supabase. Nu solicităm numărul de telefon sau date de plată.",
          ],
        },
        {
          title: "2. Ce informații sunt prelucrate",
          bullets: [
            "La autentificarea cu Google, primim prin Supabase datele de bază aprobate de utilizator: identificatorul contului, numele, adresa de e-mail și, dacă există, imaginea de profil. InfoQuest nu primește parola contului Google.",
            "Supabase folosește cookie-uri strict necesare pentru păstrarea și securizarea sesiunii de autentificare.",
            "Limba aleasă (RO sau RU) este salvată local în browser, sub cheia «infoquest.lang», pentru a păstra preferința la următoarea vizită.",
            "Dacă folosești asistentul Chrono, textul introdus este trimis prin serverul InfoQuest către un furnizor AI extern pentru analiza solicitată.",
            "Chrono este disponibil numai utilizatorilor autentificați cu rolul de elev, profesor sau administrator. Identificatorul contului și rolul sunt verificate de InfoQuest pentru controlul accesului și limitarea solicitărilor, dar nu sunt incluse în textul sau fișierul audio transmis furnizorului AI.",
            "Pentru aplicarea limitei de 3 analize audio pe zi, a limitelor zilnice și lunare pentru utilizator și proiect și a blocării solicitărilor simultane, Supabase păstrează identificatorul contului, perioada, numărul solicitărilor și o blocare tehnică temporară. Aceste înregistrări nu conțin textul, audio-ul sau transcrierea.",
            "Dacă înregistrezi sau atașezi un fișier audio, browserul solicită acces la microfon numai după acțiunea ta, iar fișierul este trimis prin serverul InfoQuest către serviciul extern de transcriere. Transcrierea și întrebarea sunt apoi analizate de modelul AI.",
            "InfoQuest primește de la furnizor transcrierea și răspunsul structurat al analizei, inclusiv nivelul orientativ de risc, semnalele observate și pașii recomandați.",
            "Codul QR este generat direct în browser din adresa publică a site-ului; conținutul său nu este trimis de aplicație către un serviciu extern de generare QR.",
            "Furnizorul de găzduire poate prelucra automat date tehnice precum adresa IP, tipul browserului, data și ora cererii, pagina solicitată și jurnalele de securitate necesare livrării site-ului.",
            "Pentru prevenirea abuzurilor și aplicarea unei blocări stabilite de administrator, InfoQuest poate transforma adresa IP într-o amprentă criptografică nereversibilă, folosind un secret păstrat numai pe server. Adresa IP în clar nu este salvată de InfoQuest; amprenta, data ultimei utilizări și starea blocării sunt păstrate în Supabase.",
          ],
        },
        {
          title: "3. Ce nu facem",
          bullets: [
            "Nu folosim datele contului pentru publicitate comportamentală sau profilare.",
            "Nu instalăm cookie-uri proprii de marketing și nu folosim instrumente de analiză a audienței în versiunea actuală.",
            "Nu vindem și nu închiriem date personale.",
            "Nu cerem și nu recomandăm trimiterea conversațiilor private, parolelor, codurilor SMS, datelor bancare, documentelor de identitate ori a înregistrărilor altor persoane fără acordul lor. Folosește exemple fictive sau anonimizate.",
          ],
        },
        {
          title: "4. Scopuri și temeiuri",
          paragraphs: [
            "Datele contului și cookie-urile de sesiune sunt folosite pentru autentificare, controlul accesului și, când funcția este activă, asocierea progresului cu utilizatorul. Prelucrarea este necesară pentru furnizarea serviciului solicitat și securitatea contului.",
            "Preferința de limbă este folosită pentru furnizarea funcției solicitate. Datele tehnice de găzduire pot fi prelucrate pentru funcționarea, securitatea și prevenirea abuzurilor, în baza interesului legitim și a obligațiilor tehnice ale furnizorului.",
            "Textul, fișierul audio și transcrierea sunt prelucrate numai pentru a furniza analiza Chrono cerută de utilizator. Trimiterea către furnizorul extern are loc numai după confirmarea afișată în interfața AI.",
          ],
        },
        {
          title: "5. Păstrarea și ștergerea datelor",
          bullets: [
            "Datele contului sunt păstrate în Supabase cât timp contul este activ sau cât este necesar pentru furnizarea și securizarea serviciului; utilizatorul poate solicita ștergerea lor.",
            "Cookie-urile de autentificare sunt păstrate până la expirarea sesiunii, deconectare sau ștergerea datelor site-ului, în funcție de situație.",
            "Preferința de limbă rămâne în browser până când utilizatorul șterge datele site-ului sau schimbă setarea.",
            "InfoQuest nu înscrie în Supabase textul, fișierul audio, transcrierea sau răspunsul Chrono în versiunea actuală. Conversația rămâne temporar în memoria paginii până la reîncărcare sau închidere.",
            "Amprentele IP folosite pentru controlul accesului sunt păstrate cât timp sunt necesare prevenirii abuzurilor ori cât timp blocarea este activă. Deblocarea poate fi efectuată de un administrator, iar ștergerea poate fi solicitată conform drepturilor descrise mai jos.",
            "Contoarele zilnice și lunare de utilizare Chrono, precum și contoarele agregate ale proiectului, sunt păstrate în Supabase pentru controlul limitelor, securitate, prevenirea abuzurilor și controlul costurilor. Ele nu conțin conținutul solicitării și pot fi șterse conform procedurii de retenție aprobate de echipa proiectului.",
            "Furnizorul AI și furnizorii modelelor pot prelucra sau păstra date tehnice și conținutul transmis potrivit propriilor condiții, politicilor și configurației contului proiectului. Echipa InfoQuest trebuie să verifice periodic aceste condiții și nu promite un termen de ștergere pe care nu îl controlează.",
            "Jurnalele tehnice sunt păstrate de furnizorul de găzduire conform termenelor și măsurilor sale de securitate.",
          ],
        },
        {
          title: "6. Furnizori și transferuri",
          paragraphs: [
            "Site-ul este găzduit prin Vercel. În măsura necesară furnizării și protejării site-ului, datele tehnice pot fi prelucrate pe infrastructura furnizorului și în alte jurisdicții, cu garanțiile descrise în politica sa de confidențialitate.",
            "Autentificarea și stocarea contului sunt furnizate de Supabase, iar verificarea identității este realizată de Google. Acești furnizori pot prelucra datele în conformitate cu propriile politici și garanții privind transferurile internaționale.",
            "În configurația curentă, funcția Chrono folosește API-ul agregatorului AI BotHub pentru transcriere și analiză. BotHub poate transmite cererea furnizorului modelului selectat. Datele pot fi prelucrate în afara Republicii Moldova; înainte de utilizare trebuie consultate condițiile actuale ale furnizorului.",
          ],
        },
        {
          title: "7. Copii și adolescenți",
          paragraphs: [
            "Proiectul are scop educațional și poate fi folosit de elevi. Minorii trebuie să folosească autentificarea și funcția AI cu acordul și îndrumarea părintelui, tutorelui sau instituției de învățământ, atunci când legea o cere. Nu introduce date reale, nu înregistra alte persoane și folosește numai exemple fictive sau anonimizate.",
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
      eyebrow: "InfoQuest · Reguli de utilizare",
      updated: "Ultima actualizare: 9 august 2026",
      summary:
        "Acești termeni stabilesc regulile de folosire a prototipului educațional InfoQuest.",
      backHome: "Înapoi la pagina principală",
      sections: [
        {
          title: "1. Acceptarea termenilor",
          paragraphs: [
            "Prin accesarea și folosirea InfoQuest confirmi că ai citit și accepți acești termeni. Dacă nu ești de acord, nu continua utilizarea site-ului.",
          ],
        },
        {
          title: "2. Scopul serviciului",
          paragraphs: [
            "InfoQuest este un prototip educațional bilingv despre fraude online, linkuri false, conturi compromise, oferte înșelătoare, deepfake-uri și dezinformare.",
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
            "Site-ul poate folosi servicii de găzduire sau poate afișa legături către resurse externe. Aceste servicii au propriii termeni și politici, iar echipa InfoQuest nu controlează conținutul ori disponibilitatea lor.",
            "Asistentul Chrono este o funcție opțională bazată pe un furnizor AI extern. Textul sau audio-ul este transmis numai după confirmarea utilizatorului. Răspunsul este orientativ, poate conține erori și nu reprezintă o constatare definitivă că o persoană sau o înregistrare este frauduloasă.",
            "Nu trimite parole, coduri SMS, date bancare, documente sau înregistrări ale altor persoane fără drept și acord.",
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
        { label: "Proiectul InfoQuest pe GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
        { label: "Politica de confidențialitate", href: "/ro/privacy" },
      ],
      notice:
        "Acești termeni sunt adaptați versiunii MVP actuale și ar trebui revizuiți juridic înainte de utilizarea comercială sau colectarea datelor personale.",
    },
  },
  ru: {
    privacy: {
      title: "Политика конфиденциальности",
      eyebrow: "InfoQuest · Защита данных",
      updated: "Последнее обновление: 9 августа 2026 года",
      summary:
        "Эта политика простым языком объясняет, какие сведения могут обрабатываться при использовании InfoQuest и как пользователь может ими управлять.",
      backHome: "Вернуться на главную",
      sections: [
        {
          title: "1. Кто управляет проектом",
          paragraphs: [
            "InfoQuest — двуязычный образовательный прототип, созданный командой проекта InfoQuest для Регионального хакатона по социальной сплочённости и информационной устойчивости.",
            "Для доступа к расследованию пользователь может создать аккаунт через Google-вход, обслуживаемый Supabase. Мы не запрашиваем номер телефона или платёжные данные.",
          ],
        },
        {
          title: "2. Какие сведения обрабатываются",
          bullets: [
            "При входе через Google мы получаем через Supabase одобренные пользователем основные данные: идентификатор аккаунта, имя, адрес электронной почты и, при наличии, изображение профиля. InfoQuest не получает пароль от Google.",
            "Supabase использует строго необходимые cookie-файлы для сохранения и защиты сеанса авторизации.",
            "Выбранный язык (RO или RU) сохраняется локально в браузере под ключом «infoquest.lang», чтобы запомнить настройку для следующего посещения.",
            "При использовании помощника Chrono введённый текст передаётся через сервер InfoQuest внешнему AI-провайдеру для выполнения запрошенного анализа.",
            "Chrono доступен только авторизованным пользователям с ролью ученика, учителя или администратора. InfoQuest проверяет идентификатор аккаунта и роль для контроля доступа и ограничения запросов, но не добавляет их в текст или аудиофайл, передаваемый AI-провайдеру.",
            "Для применения лимита в 3 аудиоанализа в день, дневных и месячных лимитов пользователя и проекта, а также блокировки одновременных запросов Supabase хранит идентификатор аккаунта, период, количество запросов и временную техническую блокировку. Эти записи не содержат текст, аудио или расшифровку.",
            "Если пользователь записывает или прикрепляет аудиофайл, браузер запрашивает доступ к микрофону только после действия пользователя, а файл передаётся через сервер InfoQuest внешнему сервису распознавания речи. Затем расшифровка и вопрос анализируются AI-моделью.",
            "InfoQuest получает от провайдера расшифровку и структурированный результат: ориентировочный уровень риска, замеченные признаки и рекомендуемые действия.",
            "QR-код создаётся непосредственно в браузере из публичного адреса сайта; приложение не отправляет его содержимое внешнему сервису генерации QR-кодов.",
            "Хостинг-провайдер может автоматически обрабатывать технические данные: IP-адрес, тип браузера, дату и время запроса, запрошенную страницу и журналы безопасности, необходимые для доставки и защиты сайта.",
            "Для предотвращения злоупотреблений и применения блокировки, установленной администратором, InfoQuest может преобразовать IP-адрес в необратимый криптографический отпечаток с использованием секрета, хранящегося только на сервере. InfoQuest не сохраняет IP-адрес в открытом виде; отпечаток, дата последнего использования и состояние блокировки хранятся в Supabase.",
          ],
        },
        {
          title: "3. Чего мы не делаем",
          bullets: [
            "Не используем данные аккаунта для поведенческой рекламы или профилирования.",
            "Не устанавливаем собственные маркетинговые cookie-файлы и не используем системы веб-аналитики в текущей версии.",
            "Не продаём и не сдаём в аренду персональные данные.",
            "Не просим и не рекомендуем отправлять личную переписку, пароли, SMS-коды, банковские данные, документы или записи других людей без их согласия. Используйте вымышленные или обезличенные примеры.",
          ],
        },
        {
          title: "4. Цели и основания обработки",
          paragraphs: [
            "Данные аккаунта и cookie-файлы сеанса используются для авторизации, контроля доступа и, когда функция будет включена, привязки игрового прогресса к пользователю. Обработка необходима для предоставления запрошенного сервиса и защиты аккаунта.",
            "Настройка языка используется для предоставления выбранной функции. Технические данные хостинга могут обрабатываться для работы сайта, обеспечения безопасности и предотвращения злоупотреблений на основании законного интереса и технических обязанностей провайдера.",
            "Текст, аудиофайл и расшифровка обрабатываются только для предоставления запрошенного пользователем анализа Chrono. Передача внешнему провайдеру происходит только после подтверждения, показанного в AI-интерфейсе.",
          ],
        },
        {
          title: "5. Срок хранения и удаление",
          bullets: [
            "Данные аккаунта хранятся в Supabase, пока аккаунт активен или пока это необходимо для предоставления и защиты сервиса; пользователь может запросить их удаление.",
            "Cookie-файлы авторизации хранятся до завершения срока сеанса, выхода из аккаунта или удаления данных сайта — в зависимости от ситуации.",
            "Настройка языка хранится в браузере, пока пользователь не очистит данные сайта или не изменит язык.",
            "В текущей версии InfoQuest не записывает текст, аудиофайл, расшифровку или ответ Chrono в Supabase. Диалог временно остаётся в памяти страницы до её перезагрузки или закрытия.",
            "IP-отпечатки для контроля доступа хранятся, пока это необходимо для предотвращения злоупотреблений или пока действует блокировка. Администратор может снять блокировку, а пользователь может запросить удаление в соответствии с правами, описанными ниже.",
            "Дневные и месячные счётчики использования Chrono, а также агрегированные счётчики проекта хранятся в Supabase для контроля лимитов, безопасности, предотвращения злоупотреблений и расходов. Они не содержат содержание запроса и могут быть удалены по утверждённой командой процедуре хранения.",
            "AI-провайдер и поставщики используемых моделей могут обрабатывать или сохранять технические данные и переданный контент в соответствии со своими условиями, политиками и настройками аккаунта проекта. Команда InfoQuest должна регулярно проверять эти условия и не обещает срок удаления, который не может контролировать.",
            "Технические журналы хранятся хостинг-провайдером в соответствии с его сроками хранения и мерами безопасности.",
          ],
        },
        {
          title: "6. Поставщики и международная обработка",
          paragraphs: [
            "Сайт размещён на Vercel. В объёме, необходимом для работы и защиты сайта, технические данные могут обрабатываться на инфраструктуре провайдера и в других юрисдикциях с гарантиями, описанными в его политике конфиденциальности.",
            "Авторизацию и хранение аккаунта обеспечивает Supabase, а проверку личности выполняет Google. Эти поставщики могут обрабатывать данные согласно собственным политикам и гарантиям международной передачи данных.",
            "В текущей конфигурации Chrono использует API AI-агрегатора BotHub для распознавания речи и анализа. BotHub может передавать запрос поставщику выбранной модели. Данные могут обрабатываться за пределами Республики Молдова; перед использованием необходимо ознакомиться с актуальными условиями провайдера.",
          ],
        },
        {
          title: "7. Дети и подростки",
          paragraphs: [
            "Проект имеет образовательную направленность и может использоваться школьниками. Несовершеннолетним следует использовать авторизацию и AI-функцию с согласием и под руководством родителя, опекуна или образовательного учреждения, когда этого требует закон. Не вводите реальные данные, не записывайте других людей и используйте только вымышленные или обезличенные примеры.",
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
      eyebrow: "InfoQuest · Правила использования",
      updated: "Последнее обновление: 9 августа 2026 года",
      summary: "Эти условия определяют правила использования образовательного прототипа InfoQuest.",
      backHome: "Вернуться на главную",
      sections: [
        {
          title: "1. Принятие условий",
          paragraphs: [
            "Открывая и используя InfoQuest, вы подтверждаете, что прочитали и принимаете эти условия. Если вы не согласны, прекратите использование сайта.",
          ],
        },
        {
          title: "2. Назначение сервиса",
          paragraphs: [
            "InfoQuest — двуязычный образовательный прототип о телефонном мошенничестве, поддельных ссылках, взломанных аккаунтах, сомнительных предложениях, дипфейках и дезинформации.",
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
            "Сайт может использовать услуги хостинга и содержать ссылки на внешние ресурсы. У них есть собственные условия и политики; команда InfoQuest не контролирует их содержание и доступность.",
            "Помощник Chrono — необязательная функция на основе внешнего AI-провайдера. Текст или аудио передаются только после подтверждения пользователя. Ответ носит ориентировочный характер, может содержать ошибки и не является окончательным доказательством того, что человек или запись связаны с мошенничеством.",
            "Не отправляйте пароли, SMS-коды, банковские данные, документы или записи других людей без законного права и согласия.",
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
        { label: "Проект InfoQuest на GitHub", href: "https://github.com/Mefist89/infoquest-cahul" },
        { label: "Политика конфиденциальности", href: "/ru/privacy" },
      ],
      notice:
        "Условия подготовлены для текущей MVP-версии и требуют юридической проверки перед коммерческим запуском или началом сбора персональных данных.",
    },
  },
};
