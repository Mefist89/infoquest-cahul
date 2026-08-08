const fs = require('fs');
const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /transcript: \[\s*\{\s*speaker: "Звонящий",\s*text: "Здравствуйте! Ваш номер будет заблокирован через десять минут\."\s*\},/g,
  `audioText: "Прослушать текст",
      audioFile: "/module/3_exemple_ru.mp3",
      transcript: [
        { speaker: "Звонящий", text: "Здравствуйте! Ваш номер будет заблокирован через десять минут." },`
);

fs.writeFileSync(path, code);
