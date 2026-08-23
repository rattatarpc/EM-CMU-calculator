const fs = require('fs');
const SID = 806262178;
const requests = [];
const purple = { red: 0.486, green: 0.227, blue: 0.929 };
const light = { red: 0.929, green: 0.914, blue: 0.996 };
const dark = { red: 0.357, green: 0.129, blue: 0.714 };
const bord = { red: 0.75, green: 0.72, blue: 0.95 };
const bordInner = { red: 0.88, green: 0.86, blue: 0.98 };

// [title(A1), lastDosingRow(A1), lastRow(A1)]
const tables = [
  { title: 221, dosingEnd: 224, end: 227 },
  { title: 229, dosingEnd: 231, end: 234 },
  { title: 236, dosingEnd: 240, end: 243 },
  { title: 245, dosingEnd: 247, end: 250 }
];

function banner(row0, c0, c1) {
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: row0, endRowIndex: row0 + 1, startColumnIndex: c0, endColumnIndex: c1 }, cell: { userEnteredFormat: { backgroundColor: purple, horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 } } }, fields: 'userEnteredFormat' } });
}
function header(row0, c0, c1) {
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: row0, endRowIndex: row0 + 1, startColumnIndex: c0, endColumnIndex: c1 }, cell: { userEnteredFormat: { backgroundColor: light, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: dark, bold: true, fontSize: 10 } } }, fields: 'userEnteredFormat' } });
}
function border(s, e, c1) {
  requests.push({ updateBorders: { range: { sheetId: SID, startRowIndex: s, endRowIndex: e, startColumnIndex: 0, endColumnIndex: c1 }, top: { style: 'SOLID', width: 2, color: bord }, bottom: { style: 'SOLID', width: 2, color: bord }, left: { style: 'SOLID', width: 2, color: bord }, right: { style: 'SOLID', width: 2, color: bord }, innerHorizontal: { style: 'SOLID', width: 1, color: bordInner }, innerVertical: { style: 'SOLID', width: 1, color: bordInner } } });
}

for (const t of tables) {
  const t0 = t.title - 1, h0 = t.title, dEnd = t.dosingEnd, end = t.end;
  requests.push({ mergeCells: { range: { sheetId: SID, startRowIndex: t0, endRowIndex: t0 + 1, startColumnIndex: 0, endColumnIndex: 5 }, mergeType: 'MERGE_ALL' } });
  requests.push({ mergeCells: { range: { sheetId: SID, startRowIndex: t0, endRowIndex: t0 + 1, startColumnIndex: 6, endColumnIndex: 11 }, mergeType: 'MERGE_ALL' } });
  banner(t0, 0, 5);
  banner(t0, 6, 11);
  header(h0, 0, 5);
  header(h0, 6, 11);
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: h0 + 1, endRowIndex: dEnd, startColumnIndex: 0, endColumnIndex: 11 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { fontSize: 10 } } }, fields: 'userEnteredFormat' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: t0, endIndex: t0 + 1 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: h0, endIndex: h0 + 1 }, properties: { pixelSize: 34 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: h0 + 1, endIndex: dEnd }, properties: { pixelSize: 48 }, fields: 'pixelSize' } });
  border(t0, dEnd, 11);
  requests.push({ repeatCell: { range: { sheetId: SID, startRowIndex: dEnd, endRowIndex: end, startColumnIndex: 0, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { fontSize: 10 } } }, fields: 'userEnteredFormat' } });
  border(dEnd, end, 5);
}

fs.writeFileSync('chelators-sbs-format.json', JSON.stringify({ requests }, null, 2));
console.log('Generated chelators-sbs-format.json with ' + requests.length + ' requests.');
