const fs = require('fs');
const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

// Fix ru videoExample
code = code.replace(
  /transcript: \[\s*\{\s*speaker: "Звонящий",\s*text: "Алло! Ваш номер заблокируют через десять минут\."\s*\},/g,
  `audioText: "Прослушать текст",
      audioFile: "/module/3_exemple_ru.mp3",
      transcript: [
        { speaker: "Звонящий", text: "Алло! Ваш номер заблокируют через десять минут." },`
);

// Fix ro videoExample
code = code.replace(
  /transcript: \[\s*\{\s*speaker: "Apelant",\s*text: "Bună ziua! Numărul dvs\. va fi blocat în zece minute\."\s*\},/g,
  `audioText: "Ascultă textul",
      audioFile: "/module/3_exemple_ro.mp3",
      transcript: [
        { speaker: "Apelant", text: "Bună ziua! Numărul dvs. va fi blocat în zece minute." },`
);

fs.writeFileSync(path, code);
