const fs = require('fs');
const html = fs.readFileSync('sheet.html', 'utf8');
const regex = /"name":"([^"]+)","sheetId":(\d+)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[1] + " -> " + match[2]);
}
