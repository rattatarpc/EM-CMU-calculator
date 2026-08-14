const fs = require('fs');
const SID = 806262178;
const requests = [];
const C = h => { const n = parseInt(h.slice(1), 16); return { red: ((n >> 16) & 255) / 255, green: ((n >> 8) & 255) / 255, blue: (n & 255) / 255 }; };
const purple = C('#7C3AED'), light = C('#EDE9FE'), dark = C('#5B21B6'), amber = C('#FEF3C7'), gray = C('#6B7280');
const R = (s, e, c = 0, d = 7) => ({ sheetId: SID, startRowIndex: s, endRowIndex: e, startColumnIndex: c, endColumnIndex: d });
const titleFields = 'userEnteredFormat.backgroundColor,userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.textFormat';
const bodyFields = 'userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.textFormat.fontSize';
const title = { backgroundColor: purple, horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 } };
const subtitle = { backgroundColor: light, horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: dark, bold: true, fontSize: 10 } };
const header = { backgroundColor: light, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { foregroundColor: dark, bold: true, fontSize: 10 } };
const body = { horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { fontSize: 10 } };
const note = { backgroundColor: amber, horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { foregroundColor: gray, fontSize: 10 } };
function style(rows, fmt, fields, c = 0, d = 7) { for (const row of rows) requests.push({ repeatCell: { range: R(row, row + 1, c, d), cell: { userEnteredFormat: fmt }, fields } }); }
function styleRange(s, e, fmt, fields, c = 0, d = 7) { requests.push({ repeatCell: { range: R(s, e, c, d), cell: { userEnteredFormat: fmt }, fields } }); }
function height(rows, px) { rows.forEach(row => requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'ROWS', startIndex: row, endIndex: row + 1 }, properties: { pixelSize: px }, fields: 'pixelSize' } })); }
function border(s, e) { requests.push({ updateBorders: { range: R(s, e), top: { style: 'SOLID', width: 1, color: { red: .75, green: .72, blue: .95 } }, bottom: { style: 'SOLID', width: 1, color: { red: .75, green: .72, blue: .95 } }, left: { style: 'SOLID', width: 1, color: { red: .75, green: .72, blue: .95 } }, right: { style: 'SOLID', width: 1, color: { red: .75, green: .72, blue: .95 } }, innerHorizontal: { style: 'SOLID', width: 1, color: { red: .88, green: .86, blue: .98 } }, innerVertical: { style: 'SOLID', width: 1, color: { red: .88, green: .86, blue: .98 } } } }); }

// Keep the patient input area and make long clinical text readable.
requests.push({ updateSheetProperties: { properties: { sheetId: SID, gridProperties: { frozenRowCount: 14 } }, fields: 'gridProperties.frozenRowCount' } });
[36, 32, 30, 34, 38, 30, 42].forEach((w, i) => requests.push({ updateDimensionProperties: { range: { sheetId: SID, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 }, properties: { pixelSize: w }, fields: 'pixelSize' } }));

// A1 rows converted to 0-based indices. No new merges are created in this pass.
const titles = [46, 54, 79, 87, 103, 124, 135, 141, 147, 152, 157, 164].map(r => r - 1);
const subtitles = [56, 62, 68, 75, 104, 109, 115, 118, 136, 147, 157, 169].map(r => r - 1);
const headers = [47, 57, 80, 88, 105, 110, 116, 125, 137, 142, 148, 153, 158, 165].map(r => r - 1);
const notes = [50, 51, 55, 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 84, 85, 95, 96, 97, 98, 99, 100, 101, 104, 118, 119, 120, 121, 122, 136, 141, 143, 144, 145, 146, 156, 157, 159, 160, 161, 162, 169, 172, 174, 175, 176, 177].map(r => r - 1);

style(titles, title, titleFields); style(subtitles, subtitle, titleFields); style(headers, header, titleFields); style(notes, note, titleFields);
height(titles, 28); height(subtitles, 26); height(headers, 34); height(notes, 62);

// Long clinical blocks and their table borders.
styleRange(57, 60, body, bodyFields); border(56, 60);
styleRange(80, 83, body, bodyFields); border(79, 83);
styleRange(88, 94, body, bodyFields); border(87, 94);
styleRange(105, 107, body, bodyFields); border(104, 107);
styleRange(110, 114, body, bodyFields); border(109, 114);
styleRange(116, 116, body, bodyFields); border(115, 116);
styleRange(124, 133, body, bodyFields); border(123, 133);
styleRange(137, 139, body, bodyFields); border(136, 139);
styleRange(142, 145, body, bodyFields); border(141, 145);
styleRange(148, 150, body, bodyFields); border(147, 150);
styleRange(153, 155, body, bodyFields); border(152, 155);
styleRange(158, 161, body, bodyFields); border(157, 161);
styleRange(165, 166, body, bodyFields); border(164, 166);

fs.writeFileSync('antidote-rest-format.json', JSON.stringify({ requests }, null, 2));
console.log(`Generated antidote-rest-format.json with ${requests.length} requests.`);
