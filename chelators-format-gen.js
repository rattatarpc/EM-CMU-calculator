const fs = require('fs');
const SID = 806262178;
const requests = [];
const purple = { red: 0.486, green: 0.227, blue: 0.929 };
const light = { red: 0.929, green: 0.914, blue: 0.996 };
const dark = { red: 0.357, green: 0.129, blue: 0.714 };

const tables = [
  { title: 209, end: 216 },
  { title: 218, end: 224 },
  { title: 226, end: 231 },
  { title: 233, end: 240 },
  { title: 242, end: 247 }
];

for (const t of tables) {
  const t0 = t.title - 1, h0 = t.title, e0 = t.end;
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: t0, endRowIndex: t0 + 1, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { backgroundColor: purple, horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 } } }, fields: 'userEnteredFormat' } });
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: h0, endRowIndex: h0 + 1, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { backgroundColor: light, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: dark, bold: true, fontSize: 10 } } }, fields: 'userEnteredFormat' } });
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: h0 + 1, endRowIndex: e0, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { fontSize: 10 } } }, fields: 'userEnteredFormat' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: t0, endIndex: t0 + 1 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: h0, endIndex: h0 + 1 }, properties: { pixelSize: 30 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: h0 + 1, endIndex: e0 }, properties: { pixelSize: 52 }, fields: 'pixelSize' } });
  requests.push({ updateBorders: { range: { sheetId: SID, startRowIndex: t0, endRowIndex: e0, startColumnIndex: 0, endColumnIndex: 5 }, top: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } }, bottom: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } }, left: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } }, right: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } }, innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.88, green: 0.86, blue: 0.98 } }, innerVertical: { style: 'SOLID', width: 1, color: { red: 0.88, green: 0.86, blue: 0.98 } } } });
}

fs.writeFileSync('chelators-format.json', JSON.stringify({ requests }, null, 2));
console.log('Generated chelators-format.json with ' + requests.length + ' requests.');
