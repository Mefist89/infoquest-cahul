const fs = require('fs');

const dataPath = 'src/data/fake-link.ts';
let code = fs.readFileSync(dataPath, 'utf8');

// Update stages for RU
code = code.replace(
  /stages: \[\n\s*\{\s*title: "Вступление", subtitle: "Знакомство"\s*\},.*Анатомия фальшивой ссылки"\s*\}\n\s*\],/s,
  `stages: [
      { title: "Вступление", subtitle: "Знакомство" },
      { title: "Теория", subtitle: "Анатомия фальшивой ссылки" },
      { title: "Видеообъяснение", subtitle: "Как отличить подделку" },
      { title: "Видеопример", subtitle: "Опасное сообщение" },
      { title: "Игра: найди сигналы", subtitle: "Проверь сайт на подлинность" },
      { title: "Игра: классификация", subtitle: "Безопасная или фишинговая ссылка" },
      { title: "Игра: диалог", subtitle: "Как правильно реагировать" },
      { title: "Игра: порядок действий", subtitle: "Алгоритм проверки ссылки" },
      { title: "Финальная схватка", subtitle: "Останови атаку Тени" },
    ],`
);

// Update stages for RO
code = code.replace(
  /stages: \[\n\s*\{\s*title: "Introducere", subtitle: "Cunoaștere"\s*\},.*Anatomia unui link fals"\s*\}\n\s*\],/s,
  `stages: [
      { title: "Introducere", subtitle: "Cunoaștere" },
      { title: "Teorie", subtitle: "Anatomia unui link fals" },
      { title: "Explicație video", subtitle: "Cum să recunoști un fals" },
      { title: "Exemplu video", subtitle: "Un mesaj periculos" },
      { title: "Joc: găsește semnalele", subtitle: "Verifică autenticitatea site-ului" },
      { title: "Joc: clasificare", subtitle: "Link sigur sau phishing" },
      { title: "Joc: dialog", subtitle: "Cum să reacționezi corect" },
      { title: "Joc: ordinea acțiunilor", subtitle: "Algoritmul de verificare a linkului" },
      { title: "Lupta finală", subtitle: "Oprește atacul Umbrei" },
    ],`
);

fs.writeFileSync(dataPath, code);
console.log("Updated fake-link.ts stages");
