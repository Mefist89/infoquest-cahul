const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /if \(nextHp <= 0\) \{\s*setStatus\("win"\);\s*\} else \{\s*advanceLevel\(\);\s*\}/,
  `setTimeout(() => {
              if (nextHp <= 0) {
                setStatus("win");
              } else {
                advanceLevel();
              }
            }, 300);`
);

fs.writeFileSync(path, code);
console.log("Added setTimeout to handleBossClick successfully");
