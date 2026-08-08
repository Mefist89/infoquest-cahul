const fs = require('fs');

const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

// I will just use regex to extract the phase arrays, append to them, and write it back.
// But it's easier to just do it via AST or simple string replacement.

const newPhase1Ru = `,
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Ваша SIM-карта заблокирована. Подтвердите данные:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_5", type: "call", caller: "Техподдержка (WhatsApp)", number: "+44 77 00 900077", correctTarget: "number" },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Бизнес-аккаунт (без галочки)", correctTarget: "accountType" },
        { id: "p1_7", type: "sms", sender: "Info", text: "Вам одобрен кредит от MinTel Bank:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_8", type: "call", caller: "Полиция", number: "+373 999 999 999", correctTarget: "number" },
        { id: "p1_9", type: "profile", name: "Поддержка абонентов", accountType: "Скрытый номер", correctTarget: "accountType" },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Вы выиграли iPhone 16! Перейдите:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTarget: "fakeLink" }`;

const newPhase2Ru = `,
        { id: "p2_4", text: "Кто должен инициировать звонок для безопасного решения проблем?", options: ["Сам абонент", "Оператор", "Робот"], answer: 0 },
        { id: "p2_5", text: "Если вам звонят и торопят принять решение, это...", options: ["Стандартная процедура", "Манипуляция мошенников", "Сбой в системе"], answer: 1 },
        { id: "p2_6", text: "Где лучше всего проверять статус своего тарифа?", options: ["В SMS", "В официальном приложении", "В Google"], answer: 1 },
        { id: "p2_7", text: "Может ли настоящий оператор попросить продиктовать SMS-код?", options: ["Да, для верификации", "Никогда", "Только при блокировке"], answer: 1 },
        { id: "p2_8", text: "Что делать, если позвонил «сотрудник спецслужб» и просит помочь в поимке вора?", options: ["Помочь", "Положить трубку", "Спросить его звание"], answer: 1 },
        { id: "p2_9", text: "Если ссылка выглядит как mintel-support.com, она...", options: ["Официальная", "Фальшивая", "Резервная"], answer: 1 },
        { id: "p2_10", text: "Какую информацию безопасно сообщать по телефону?", options: ["Номер паспорта", "Свой текущий тариф", "Код из SMS"], answer: 1 }`;

const newPhase3Ru = `,
        { id: "p3_4", bossText: "Ваш номер пытаются переоформить в другом городе. Срочно назовите код отмены!", options: ["Повешу трубку и позвоню в поддержку.", "Код 4521"], answer: 0 },
        { id: "p3_5", bossText: "Мы уже выслали к вам наряд полиции за соучастие в мошенничестве, если вы не подтвердите личность!", options: ["Вызывайте, я буду ждать.", "Ой, что нужно сказать?"], answer: 0 },
        { id: "p3_6", bossText: "У вас подключена платная услуга на 500 лей в день. Чтобы отключить, нужен код.", options: ["Я отключу её сам через приложение.", "Конечно, код 9912."], answer: 0 },
        { id: "p3_7", bossText: "Я ваш персональный менеджер. Вижу, у вас плохая связь, давайте я обновлю вышки удаленно.", options: ["У меня всё работает, до свидания.", "Да, давайте обновим."], answer: 0 },
        { id: "p3_8", bossText: "Вы выиграли в лотерее от MinTel! Для зачисления денег перейдите по ссылке, которую я вам сейчас скину.", options: ["Спасибо, я проверю это на сайте MinTel.", "Жду ссылку!"], answer: 0 },
        { id: "p3_9", bossText: "Я из банка. Ваш телефон взломан, мошенники снимают деньги. Быстро скажите код!", options: ["Я сам сейчас позвоню в свой банк.", "Какой кошмар, код 1234!"], answer: 0 },
        { id: "p3_10", bossText: "Это последняя попытка. Не скажете код — сим-карта сгорит прямо сейчас!", options: ["Пусть горит.", "Только не сим-карта, вот код!"], answer: 0 }`;

const newPhase1Ro = `,
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Cartela SIM este blocată. Confirmați datele:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_5", type: "call", caller: "Suport Tehnic (WhatsApp)", number: "+44 77 00 900077", correctTarget: "number" },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Cont de afaceri (fără bifă)", correctTarget: "accountType" },
        { id: "p1_7", type: "sms", sender: "Info", text: "Credit aprobat de MinTel Bank:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTarget: "fakeLink" },
        { id: "p1_8", type: "call", caller: "Poliția", number: "+373 999 999 999", correctTarget: "number" },
        { id: "p1_9", type: "profile", name: "Suport Clienți", accountType: "Număr ascuns", correctTarget: "accountType" },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Ați câștigat un iPhone 16! Accesați:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTarget: "fakeLink" }`;

const newPhase2Ro = `,
        { id: "p2_4", text: "Cine ar trebui să inițieze apelul pentru rezolvarea sigură a problemelor?", options: ["Abonatul însuși", "Operatorul", "Robotul"], answer: 0 },
        { id: "p2_5", text: "Dacă sunteți sunat și grăbit să luați o decizie, aceasta este...", options: ["O procedură standard", "O manipulare a escrocilor", "O eroare de sistem"], answer: 1 },
        { id: "p2_6", text: "Unde este cel mai bine să verificați starea planului tarifar?", options: ["În SMS", "În aplicația oficială", "Pe Google"], answer: 1 },
        { id: "p2_7", text: "Poate un operator real să vă ceară să dictați un cod SMS?", options: ["Da, pentru verificare", "Niciodată", "Doar la blocare"], answer: 1 },
        { id: "p2_8", text: "Ce faceți dacă sună un «angajat al serviciilor speciale» și cere ajutor?", options: ["Îl ajut", "Închid apelul", "Îi întreb gradul"], answer: 1 },
        { id: "p2_9", text: "Dacă link-ul arată ca mintel-support.com, acesta este...", options: ["Oficial", "Fals", "De rezervă"], answer: 1 },
        { id: "p2_10", text: "Ce informații sunt sigure de comunicat la telefon?", options: ["Numărul pașaportului", "Planul tarifar curent", "Codul din SMS"], answer: 1 }`;

const newPhase3Ro = `,
        { id: "p3_4", bossText: "Cineva încearcă să vă reînregistreze numărul în alt oraș. Dictați codul de anulare!", options: ["Voi închide și voi suna la suport.", "Codul este 4521"], answer: 0 },
        { id: "p3_5", bossText: "Am trimis deja poliția pentru complicitate la fraudă, dacă nu vă confirmați identitatea!", options: ["Chemați-i, îi voi aștepta.", "Oh, ce trebuie să spun?"], answer: 0 },
        { id: "p3_6", bossText: "Aveți un serviciu cu plată de 500 de lei pe zi. Pentru dezactivare, e nevoie de un cod.", options: ["Îl voi dezactiva singur din aplicație.", "Sigur, codul 9912."], answer: 0 },
        { id: "p3_7", bossText: "Sunt managerul dvs. personal. Aveți o conexiune slabă, haideți să o actualizăm.", options: ["Totul funcționează perfect, la revedere.", "Da, haideți să actualizăm."], answer: 0 },
        { id: "p3_8", bossText: "Ați câștigat la loteria MinTel! Pentru transferul banilor, accesați link-ul meu.", options: ["Mulțumesc, voi verifica pe site-ul MinTel.", "Aștept link-ul!"], answer: 0 },
        { id: "p3_9", bossText: "Sunt de la bancă. Telefonul vă este spart. Spuneți rapid codul!", options: ["Voi suna eu imediat la banca mea.", "Ce coșmar, codul 1234!"], answer: 0 },
        { id: "p3_10", bossText: "Aceasta este ultima încercare. Dacă nu ziceți codul, cartela SIM va arde acum!", options: ["Las-o să ardă.", "Numai nu cartela SIM, iată codul!"], answer: 0 }`;

// Find insert points for RU
code = code.replace(/correctTarget: "accountType"\s*}\s*\]/g, (match, offset, string) => {
    if (offset < 20000) return `correctTarget: "accountType"\n        }${newPhase1Ru}\n      ]`;
    return match;
});

code = code.replace(/answer: 1\s*}\s*\]/g, (match, offset, string) => {
    if (offset < 20000) return `answer: 1\n        }${newPhase2Ru}\n      ]`;
    return match;
});

code = code.replace(/answer: 0\s*}\s*\]/g, (match, offset, string) => {
    if (offset < 20000) return `answer: 0\n        }${newPhase3Ru}\n      ]`;
    return match;
});


// Find insert points for RO (second half of file)
code = code.replace(/correctTarget: "accountType"\s*}\s*\]/g, (match, offset, string) => {
    if (offset > 20000) return `correctTarget: "accountType"\n        }${newPhase1Ro}\n      ]`;
    return match;
});

code = code.replace(/answer: 1\s*}\s*\]/g, (match, offset, string) => {
    if (offset > 20000) return `answer: 1\n        }${newPhase2Ro}\n      ]`;
    return match;
});

code = code.replace(/answer: 0\s*}\s*\]/g, (match, offset, string) => {
    if (offset > 20000) return `answer: 0\n        }${newPhase3Ro}\n      ]`;
    return match;
});

fs.writeFileSync(path, code);
console.log("Updated operator-call.ts successfully");
