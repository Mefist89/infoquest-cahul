const fs = require('fs');

const dataPath = 'src/data/fake-link.ts';
let code = fs.readFileSync(dataPath, 'utf8');

// Update stages and add theory for ru
code = code.replace(
  /stages: \[\s*\{\s*title: "Вступление", subtitle: "Знакомство"\s*\}\s*\]/g,
  `stages: [
      { title: "Вступление", subtitle: "Знакомство" },
      { title: "Теория", subtitle: "Анатомия фальшивой ссылки" }
    ],
    theory: {
      lead: "Сайты-подделки создаются с одной целью: заставить вас ввести свои данные (логин, пароль или данные карты) на странице, которая выглядит как настоящая.",
      cards: [
        { title: "Незнакомый домен", text: "Мошенники меняют одну-две буквы в адресе: go0gle.com вместо google.com, или instagran.com." },
        { title: "Отсутствие защитного сертификата", text: "Иногда на поддельных сайтах нет HTTPS (хотя его наличие не всегда гарантирует безопасность)." },
        { title: "Срочный призыв", text: "Сообщения «Ваш аккаунт взломан, войдите немедленно» часто содержат вредоносные ссылки." },
        { title: "Нестандартный дизайн", text: "Ошибки в верстке, размытые логотипы, неработающие кнопки (кроме кнопки входа)." }
      ],
      rule: "Всегда проверяйте адрес в строке браузера перед тем, как ввести свои данные. При малейших сомнениях вводите адрес сайта вручную.",
    }`
);

// Update stages and add theory for ro
code = code.replace(
  /stages: \[\s*\{\s*title: "Introducere", subtitle: "Cunoaștere"\s*\}\s*\]/g,
  `stages: [
      { title: "Introducere", subtitle: "Cunoaștere" },
      { title: "Teorie", subtitle: "Anatomia unui link fals" }
    ],
    theory: {
      lead: "Site-urile false sunt create cu un singur scop: să vă determine să introduceți datele dvs. (login, parolă sau datele cardului) pe o pagină care arată ca una reală.",
      cards: [
        { title: "Domeniu necunoscut", text: "Escrocii schimbă o literă sau două în adresă: go0gle.com în loc de google.com, sau instagran.com." },
        { title: "Lipsa certificatului de securitate", text: "Uneori site-urile false nu au HTTPS (deși prezența lui nu garantează întotdeauna securitatea)." },
        { title: "Apel urgent", text: "Mesajele de tipul «Contul dvs. a fost spart, conectați-vă imediat» conțin adesea linkuri malițioase." },
        { title: "Design neobișnuit", text: "Erori de aspect, logo-uri neclare, butoane nefuncționale (cu excepția butonului de conectare)." }
      ],
      rule: "Verificați mereu adresa din bara browserului înainte de a introduce datele. Dacă aveți cea mai mică îndoială, introduceți manual adresa site-ului.",
    }`
);

fs.writeFileSync(dataPath, code);

console.log("Updated data successfully");
