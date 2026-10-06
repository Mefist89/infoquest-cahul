const fs = require('fs');
let c = fs.readFileSync('src/components/modules/FakeLinkModule.tsx', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/components/modules/FakeLinkModule.tsx', c);
