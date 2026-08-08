const fs = require('fs');
const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

const phase1Ru = `phase1: [
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
      ],`;

const phase1Ro = `phase1: [
        { id: "p1_1", type: "sms", sender: "MinTel", text: "Tariful expiră. Prelungiți pe link:", fakeLink: "mintei-support.com", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_2", type: "call", caller: "Securitatea MinTel", number: "+44 20 7123 4567", correctTargets: ["number"] },
        { id: "p1_3", type: "profile", name: "Suport MinTel", accountType: "Cont obișnuit", correctTargets: ["accountType"] },
        { id: "p1_4", type: "sms", sender: "MinTel-Security", text: "Cartela SIM este blocată. Confirmați datele:", fakeLink: "minteI-id.md", realLink: "mintel.md", correctTargets: ["fakeLink"] },
        { id: "p1_5", type: "call", caller: "Suport Tehnic (WhatsApp)", number: "+44 77 00 900077", correctTargets: ["caller", "number"] },
        { id: "p1_6", type: "profile", name: "MinTeI Official", accountType: "Cont de afaceri (fără bifă)", correctTargets: ["name", "accountType"] },
        { id: "p1_7", type: "sms", sender: "Info", text: "Credit aprobat de MinTel Bank. Accesați urgent:", fakeLink: "mint.el-bank.com", realLink: "mintel.md", correctTargets: ["text", "fakeLink"] },
        { id: "p1_8", type: "call", caller: "Poliția", number: "+373 999 999 999", correctTargets: ["avatar", "caller", "number"] },
        { id: "p1_9", type: "profile", name: "Suport Clienți", accountType: "Număr ascuns", correctTargets: ["avatar", "name", "accountType"] },
        { id: "p1_10", type: "sms", sender: "MinTel", text: "Urgent! Ați câștigat un iPhone 16! Accesați pentru primire:", fakeLink: "mintel-prize.com", realLink: "mintel.md", correctTargets: ["sender", "text", "fakeLink"] }
      ],`;

code = code.replace(/phase1: \[\s*\{[\s\S]*?\}\s*\],/, (match, offset) => {
    if (offset < 20000) return phase1Ru;
    return match;
});

code = code.replace(/phase1: \[\s*\{[\s\S]*?\}\s*\],/, (match, offset) => {
    if (offset > 20000) return phase1Ro;
    return match;
});

fs.writeFileSync(path, code);
console.log("Replaced Phase 1 data successfully!");
