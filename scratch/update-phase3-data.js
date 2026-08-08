const fs = require('fs');
const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

const phase3Ru = `phase3: [
        { id: "p3_1", bossText: "Если не назовешь код, через 5 минут спишутся все деньги с баланса!", options: ["Я сейчас сам перезвоню в поддержку.", "Хорошо, диктую: 4-5-2..."], answers: [0] },
        { id: "p3_2", bossText: "Я следователь. Оператор MinTel украл ваши данные, помогите следствию поимке преступника!", options: ["Что мне нужно сделать для помощи?", "Вызывайте меня официальной повесткой. До свидания."], answers: [1] },
        { id: "p3_3", bossText: "Ладно, просто скачайте наше защитное приложение по ссылке, чтобы обезопасить телефон!", options: ["Ничего скачивать не буду, мой телефон защищен.", "Давайте ссылку, я установлю."], answers: [0] },
        { id: "p3_4", bossText: "Ваш номер пытаются переоформить в другом городе. Срочно назовите код отмены!", options: ["Повешу трубку и позвоню в поддержку.", "Код 4521"], answers: [0] },
        { id: "p3_5", bossText: "Мы уже выслали к вам наряд полиции за соучастие в мошенничестве, если вы не подтвердите личность!", options: ["Вызывайте, я буду ждать.", "Ой, что нужно сказать?", "А можно договориться без полиции?"], answers: [0] },
        { id: "p3_6", bossText: "У вас подключена платная услуга на 500 лей в день. Чтобы отключить, нужен код.", options: ["Я отключу её сам через приложение.", "Конечно, код 9912.", "Продиктуйте мне ваши ФИО, я запишу."], answers: [0] },
        { id: "p3_7", bossText: "Я ваш персональный менеджер. Вижу, у вас плохая связь, давайте я обновлю вышки удаленно.", options: ["У меня всё работает, до свидания.", "Да, давайте обновим.", "Какая связь? Я на Wi-Fi."], answers: [0] },
        { id: "p3_8", bossText: "Вы выиграли в лотерее от MinTel! Для зачисления денег перейдите по ссылке, которую я вам сейчас скину.", options: ["Спасибо, я проверю это на сайте MinTel.", "Жду ссылку!", "Зайду в личный кабинет и посмотрю там.", "Продиктуйте номер карты."], answers: [0, 2] },
        { id: "p3_9", bossText: "Я из банка. Ваш телефон взломан, мошенники снимают деньги. Быстро скажите код!", options: ["Я сам сейчас позвоню в свой банк.", "Какой кошмар, код 1234!", "Сброшу вызов и заблокирую карту через приложение.", "Переведите мои деньги на безопасный счет."], answers: [0, 2] },
        { id: "p3_10", bossText: "Это последняя попытка. Не скажете код — сим-карта сгорит прямо сейчас!", options: ["Пусть горит.", "Только не сим-карта, вот код!", "Позвоню настоящему оператору с другого телефона.", "Я сейчас приеду к вам в офис разбираться."], answers: [0, 2] }
      ]`;

const phase3Ro = `phase3: [
        { id: "p3_1", bossText: "Dacă nu zici codul, în 5 minute se vor retrage toți banii din cont!", options: ["Voi suna eu la suport.", "Bine, dictez: 4-5-2..."], answers: [0] },
        { id: "p3_2", bossText: "Sunt anchetator. Operatorul MinTel v-a furat datele, ajutați-ne să-l prindem!", options: ["Ce trebuie să fac?", "Citați-mă oficial. La revedere."], answers: [1] },
        { id: "p3_3", bossText: "Bine, doar descărcați aplicația noastră prin link pentru a proteja telefonul!", options: ["Nu descarc nimic, telefonul e protejat.", "Dați link-ul, instalez."], answers: [0] },
        { id: "p3_4", bossText: "Cineva încearcă să vă reînregistreze numărul în alt oraș. Dictați codul de anulare!", options: ["Voi închide și voi suna la suport.", "Codul este 4521"], answers: [0] },
        { id: "p3_5", bossText: "Am trimis deja poliția pentru complicitate la fraudă, dacă nu vă confirmați identitatea!", options: ["Chemați-i, îi voi aștepta.", "Oh, ce trebuie să spun?", "Putem rezolva fără poliție?"], answers: [0] },
        { id: "p3_6", bossText: "Aveți un serviciu cu plată de 500 de lei pe zi. Pentru dezactivare, e nevoie de un cod.", options: ["Îl voi dezactiva singur din aplicație.", "Sigur, codul 9912.", "Cum vă numiți, să notez?"], answers: [0] },
        { id: "p3_7", bossText: "Sunt managerul dvs. personal. Aveți o conexiune slabă, haideți să o actualizăm.", options: ["Totul funcționează perfect, la revedere.", "Da, haideți să actualizăm.", "Ce conexiune? Sunt pe Wi-Fi."], answers: [0] },
        { id: "p3_8", bossText: "Ați câștigat la loteria MinTel! Pentru transferul banilor accesați link-ul...", options: ["Mulțumesc, voi verifica pe site-ul MinTel.", "Aștept link-ul!", "Voi intra în contul meu personal și voi verifica.", "Dictați numărul cardului."], answers: [0, 2] },
        { id: "p3_9", bossText: "Sunt de la bancă. Telefonul vă este spart. Spuneți rapid codul!", options: ["Voi suna eu imediat la banca mea.", "Ce coșmar, codul 1234!", "Resping apelul și blochez cardul din aplicație.", "Transferați banii într-un cont sigur."], answers: [0, 2] },
        { id: "p3_10", bossText: "Aceasta este ultima încercare. Dacă nu ziceți codul, cartela SIM va arde acum!", options: ["Las-o să ardă.", "Numai nu cartela SIM, iată codul!", "Voi suna operatorul real de pe alt telefon.", "Vin acum la voi la birou să ne lămurim."], answers: [0, 2] }
      ]`;

// Replace RU phase3
code = code.replace(/phase3: \[\s*\{[\s\S]*?\}\s*\]/, (match, offset) => {
    if (offset < 20000) return phase3Ru;
    return match;
});

// Replace RO phase3
code = code.replace(/phase3: \[\s*\{[\s\S]*?\}\s*\]/, (match, offset) => {
    if (offset > 20000) return phase3Ro;
    return match;
});

fs.writeFileSync(path, code);
console.log("Updated phase 3 data successfully!");
