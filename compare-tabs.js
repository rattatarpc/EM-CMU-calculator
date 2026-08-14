// เปรียบเทียบ Common Antidotes กับ BAK Antidotes (A15:F46) แบบแถวต่อแถว
const { execSync } = require('child_process');
const fs = require('fs');

function readSheet(sheet) {
    const out = execSync(`node sheet-sync.js read "'${sheet}'!A15:F46"`, { encoding: 'utf8' });
    return JSON.parse(out);
}

const cur = readSheet('Common Antidotes');
const bak = readSheet('BAK Antidotes');
const n = Math.max(cur.length, bak.length);
for (let i = 0; i < n; i++) {
    const a = JSON.stringify(cur[i] || []);
    const b = JSON.stringify(bak[i] || []);
    if (a !== b) {
        console.log(`A1 row ${15 + i}:`);
        console.log(`  CURRENT: ${a}`);
        console.log(`  BACKUP : ${b}`);
    }
}
console.log('Done.');
