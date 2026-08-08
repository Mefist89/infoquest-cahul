const fs = require('fs');
const path = 'src/data/operator-call.ts';
let code = fs.readFileSync(path, 'utf8');

// Fix ru theory
code = code.replace(
  /bookletText: "Скачать буклет \(PDF\)",\s*bookletFile: "\/ghid_ru\.pdf",\s*audioText: "Прослушать текст",\s*audioFile: "\/audio\/1_teoria_ru\.mp3",/,
  `bookletText: "Скачать буклет (PDF)",
      bookletFile: "/ghid_ru.pdf",
      audioText: "Прослушать текст",
      audioFile: "/module/1_teoria_ru.mp3",`
);

// Fix ru videoExplanation
code = code.replace(
  /videoUrl: "\/video\/2-video_ru\.mp4"\s*\},/g,
  `videoUrl: "/video/2-video_ru.mp4",
      audioText: "Прослушать текст",
      audioFile: "/module/2_video_ru.mp3",
    },`
);

// Fix ro theory
code = code.replace(
  /rule: "Regula principală: închide, nu comunica nimic și verifică informația printr-un canal oficial.",\s*bookletFile: "\/ghid_ro\.pdf",\s*audioText: "Ascultă textul",\s*audioFile: "\/module\/1_teorie_ro\.mp3",/,
  `rule: "Regula principală: închide, nu comunica nimic și verifică informația printr-un canal oficial.",
      bookletText: "Descarcă pliantul (PDF)",
      bookletFile: "/ghid_ro.pdf",
      audioText: "Ascultă textul",
      audioFile: "/module/1_teorie_ro.mp3",`
);

fs.writeFileSync(path, code);
