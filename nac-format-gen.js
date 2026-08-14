// Generator: จัดรูปแบบส่วน NAC ในแท็บ Common Antidotes (แถวที่ verified แล้ว)
const fs = require('fs');
const SID = 806262178;

const requests = [];
const C = hex => {
    const n = parseInt(hex.slice(1), 16);
    return { red: ((n >> 16) & 255) / 255, green: ((n >> 8) & 255) / 255, blue: (n & 255) / 255 };
};
const PURPLE = C('#7C3AED'), LIGHT_PURPLE = C('#EDE9FE'), DARK_PURPLE = C('#5B21B6');
const AMBER = C('#FEF3C7'), AMBER_SOFT = C('#FFFBEB'), BROWN = C('#92400E'), GRAY = C('#6B7280');

const R = (s, e) => ({ sheetId: SID, startRowIndex: s, endRowIndex: e });

// freeze + column widths
requests.push({
    updateSheetProperties: {
        properties: { sheetId: SID, gridProperties: { frozenRowCount: 14 } },
        fields: 'gridProperties.frozenRowCount'
    }
});
[36, 26, 22, 26, 28, 20].forEach((w, i) => requests.push({
    updateDimensionProperties: {
        range: { sheetId: SID, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: w },
        fields: 'pixelSize'
    }
}));

function repeatRange(rowRange, fmt, fields) {
    requests.push({ repeatCell: { range: rowRange, cell: { userEnteredFormat: fmt }, fields } });
}
function styleRow(row, fmt, fields) { repeatRange(R(row, row + 1), fmt, fields); }
function styleRows(s, e, fmt, fields) { repeatRange(R(s, e), fmt, fields); }
function mergeRow(row) {
    requests.push({ mergeCells: { range: { sheetId: SID, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: 0, endColumnIndex: 6 }, mergeType: 'MERGE_ALL' } });
}
function borderBlock(s, e) {
    requests.push({
        updateBorders: {
            range: R(s, e),
            top: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } },
            bottom: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } },
            left: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } },
            right: { style: 'SOLID', width: 2, color: { red: 0.75, green: 0.72, blue: 0.95 } },
            innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.85, green: 0.83, blue: 0.98 } },
            innerVertical: { style: 'SOLID', width: 1, color: { red: 0.85, green: 0.83, blue: 0.98 } }
        }
    });
}
function rowHeight(row, px) {
    requests.push({
        updateDimensionProperties: {
            range: { sheetId: SID, dimension: 'ROWS', startIndex: row, endIndex: row + 1 },
            properties: { pixelSize: px },
            fields: 'pixelSize'
        }
    });
}

// 0-based row indices = A1 row - 1 (verified against restored data)
const REF = 14; // A1 15
const IV_T = 16, IV_H = 17, IV_D = [18, 19, 20], IV_N = 21; // A1 17,18,19-21,22
const OR_T = 22, OR_H = 23, OR_D = [24, 25]; // A1 23,24,25-26
const SI_T = 27, SI_H = 28, SI_D = [29, 30], SI_N = 31; // A1 28,29,30-31,32
const SN_T = 32, SN_H = 33, SN_D = [34, 35], SN_N = 36; // A1 33,34,35-36,37
const SF_T = 37, SF_D = [38, 39, 40, 41]; // A1 38,39-42

const TITLE_F = 'userEnteredFormat.backgroundColor,userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.textFormat';
const TITLE = {
    backgroundColor: PURPLE,
    horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP',
    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 }
};
const HEADER = {
    backgroundColor: LIGHT_PURPLE,
    horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP',
    textFormat: { foregroundColor: DARK_PURPLE, bold: true, fontSize: 10 }
};
const DATA = {
    horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP',
    textFormat: { fontSize: 10 }
};
const NOTE = {
    backgroundColor: AMBER_SOFT,
    horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP',
    textFormat: { foregroundColor: GRAY, italic: true, fontSize: 10 }
};
const REF_STYLE = {
    backgroundColor: AMBER,
    horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP',
    textFormat: { foregroundColor: BROWN, bold: true, fontSize: 10 }
};
const SAFETY = {
    horizontalAlignment: 'LEFT', verticalAlignment: 'TOP', wrapStrategy: 'WRAP',
    textFormat: { fontSize: 10 }
};

const DATA_F = 'userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.textFormat.fontSize';

// Reference banner
mergeRow(REF); styleRow(REF, REF_STYLE, TITLE_F); rowHeight(REF, 26);

// Tables
[[IV_T, IV_H, IV_D, IV_N], [OR_T, OR_H, OR_D, null], [SI_T, SI_H, SI_D, SI_N], [SN_T, SN_H, SN_D, SN_N]].forEach(t => {
    const [title, header, data, note] = t;
    mergeRow(title); styleRow(title, TITLE, TITLE_F); rowHeight(title, 28);
    styleRow(header, HEADER, TITLE_F); rowHeight(header, 28);
    styleRows(data[0], data[data.length - 1] + 1, DATA, DATA_F);
    data.forEach(r => rowHeight(r, 24));
    borderBlock(title, (note ?? data[data.length - 1]) + 1);
    if (note !== null) { mergeRow(note); styleRow(note, NOTE, TITLE_F); rowHeight(note, 58); }
});

// Safety block
mergeRow(SF_T); styleRow(SF_T, TITLE, TITLE_F); rowHeight(SF_T, 28);
styleRows(SF_D[0], SF_D[SF_D.length - 1] + 1, SAFETY, DATA_F);
styleRow(SF_D[0], Object.assign({}, SAFETY, { textFormat: Object.assign({}, SAFETY.textFormat, { bold: true }) }), DATA_F + ',userEnteredFormat.textFormat.bold');
SF_D.forEach(r => rowHeight(r, 96));
borderBlock(SF_T, SF_D[SF_D.length - 1] + 1);

fs.writeFileSync('nac-format.json', JSON.stringify({ requests }, null, 2));
console.log('Generated nac-format.json with ' + requests.length + ' requests.');
