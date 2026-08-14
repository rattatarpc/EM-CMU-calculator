#!/usr/bin/env node
// ============================================================
// sheet-sync.js — อ่าน/เขียน/จัดรูปแบบ Google Sheets ผ่าน Service Account
// ไม่ต้องติดตั้งแพ็กเกจ (ใช้ built-in crypto + fetch ของ Node 18+)
//
// วิธีใช้งาน:
//   node sheet-sync.js meta
//   node sheet-sync.js read "'RSI'!A1:F10"
//   node sheet-sync.js write "'RSI'!A1:F10" '[[1,2,3],[4,5,6]]'
//   node sheet-sync.js append "'RSI'" '[[1,2,3],[4,5,6]]'
//   node sheet-sync.js clear "'RSI'!A1:F10"
//   node sheet-sync.js batch batch.json
//   node sheet-sync.js batch batch.json --dry-run
//
// หมายเหตุ:
//   - ชื่อแท็บที่มีช่องว่างต้องครอบด้วย single quote เช่น 'Ped Common drug'
//   - ค่า string ที่ขึ้นต้นด้วย "=" จะถูกตีความเป็นสูตรอัตโนมัติ
//   - ต้องมีไฟล์ service-account.json (key จาก Google Cloud) อยู่ที่โปรเจกต์
// ============================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// ---------- helpers ----------
function readConfig() {
    const configPath = path.join(__dirname, 'config.json');
    if (!fs.existsSync(configPath)) {
        console.error('Missing config.json — please create it with {"spreadsheetId": "..."}.');
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function readKey() {
    const keyPath = path.join(__dirname, 'service-account.json');
    if (!fs.existsSync(keyPath)) {
        console.error('Missing service-account.json');
        console.error('Follow the setup steps (see sheet-sync-setup.md), then place the JSON key here.');
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
}

function b64url(str) {
    return Buffer.from(str).toString('base64url');
}

function signJwt(key) {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const body = b64url(JSON.stringify({
        iss: key.client_email,
        scope: SCOPES.join(' '),
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
    }));
    const data = `${header}.${body}`;
    const signature = crypto.createSign('RSA-SHA256').update(data).sign(key.private_key, 'base64url');
    return `${data}.${signature}`;
}

async function getAccessToken(key) {
    const jwt = signJwt(key);
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
    });
    const json = await res.json();
    if (!json.access_token) {
        console.error('Failed to get token:', JSON.stringify(json));
        process.exit(1);
    }
    return json.access_token;
}

async function api(spreadsheetId, token, method, pathname, body, query = '') {
    const url = `${API}/${spreadsheetId}${pathname}?${query}`;
    const res = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) {
        console.error(`API error ${res.status} ${res.statusText}: ${text.slice(0, 800)}`);
        process.exit(1);
    }
    return text ? JSON.parse(text) : null;
}

// Cells: convert string starting with "=" into formulas
function toValues(rows) {
    return rows.map(row => row.map(v => {
        if (typeof v === 'string' && v.trim().startsWith('=')) {
            return { userEnteredValue: { formulaValue: v } };
        }
        return { userEnteredValue: typeof v === 'string' ? { stringValue: v } : { numberValue: v } };
    }));
}

function normalizeInput(raw) {
    const cleaned = String(raw).replace(/^['"]|['"]$/g, '');
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Invalid JSON input:', raw);
        process.exit(1);
    }
}

// ---------- commands ----------
async function cmdMeta() {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const data = await api(config.spreadsheetId, token, 'GET', '', null, 'fields=sheets(properties(sheetId,title,index,gridProperties))');
    console.log('Sheets:');
    data.sheets.forEach(s => {
        const p = s.properties;
        console.log(`  [${p.index}] "${p.title}"  gid=${p.sheetId}  ${p.gridProperties.rowCount}r x ${p.gridProperties.columnCount}c`);
    });
}

async function cmdRead(range) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const enc = encodeURIComponent(range);
    const data = await api(config.spreadsheetId, token, 'GET', `/values/${enc}`);
    console.log(JSON.stringify(data.values || [], null, 2));
}

async function cmdWrite(range, values, raw) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const input = raw ? values : values.map(row => row.map(v =>
        typeof v === 'string' && v.trim().startsWith('=') ? v : v
    ));
    const body = raw ? { values: input } : { values: input };
    const query = raw ? 'valueInputOption=RAW' : 'valueInputOption=USER_ENTERED';
    const data = await api(config.spreadsheetId, token, 'PUT', `/values/${encodeURIComponent(range)}`, body, query);
    console.log(`Updated ${data.updatedCells} cells in ${data.updatedRange}.`);
}

async function cmdDump(range, file) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const data = await api(config.spreadsheetId, token, 'GET', `/values/${encodeURIComponent(range)}`);
    fs.writeFileSync(file, JSON.stringify(data.values || [], null, 2), 'utf8');
    console.log(`Dumped ${data.values?.length || 0} rows to ${file}.`);
}

async function cmdAppend(sheet, values) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const body = { values };
    const data = await api(config.spreadsheetId, token, 'POST', `/values/${encodeURIComponent(sheet)}:append`, body, 'valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS');
    console.log(`Appended. New range: ${data.updates.updatedRange}.`);
}

async function cmdClear(range) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    await api(config.spreadsheetId, token, 'POST', `/values/${encodeURIComponent(range)}:clear`, {});
    console.log(`Cleared ${range}.`);
}

async function cmdBatch(file, dryRun) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const batch = JSON.parse(fs.readFileSync(file, 'utf8'));

    if (batch.values && typeof batch.values === 'object') {
        for (const [range, rows] of Object.entries(batch.values)) {
            if (dryRun) {
                console.log(`[dry-run] write ${range} (${rows.length} rows)`);
            } else {
                const query = 'valueInputOption=USER_ENTERED';
                const data = await api(config.spreadsheetId, token, 'PUT', `/values/${encodeURIComponent(range)}`, { values: rows }, query);
                console.log(`Updated ${data.updatedCells} cells in ${range}.`);
            }
        }
    }

    if (Array.isArray(batch.requests) && batch.requests.length) {
        if (dryRun) {
            console.log(`[dry-run] batchUpdate: ${batch.requests.length} request(s)`);
        } else {
            const data = await api(config.spreadsheetId, token, 'POST', ':batchUpdate', { requests: batch.requests });
            console.log(`batchUpdate OK — replies: ${(data.replies || []).length}`);
        }
    }
    if (!dryRun) console.log('Done.');
}

async function cmdMerges(sheetName) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const data = await api(config.spreadsheetId, token, 'GET', '', null, 'fields=sheets(properties(sheetId,title),merges)');
    const sheet = data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) { console.error('Sheet not found:', sheetName); process.exit(1); }
    console.log(`Merges in "${sheetName}":`);
    (sheet.merges || []).forEach(m => {
        console.log(`  rows ${m.startRowIndex}-${m.endRowIndex - 1} cols ${m.startColumnIndex}-${m.endColumnIndex - 1}`);
    });
    if (!sheet.merges || !sheet.merges.length) console.log('  (none)');
}

async function cmdDiff(range) {
    const config = readConfig();
    const key = readKey();
    const token = await getAccessToken(key);
    const enc = encodeURIComponent(range);
    const cur = await api(config.spreadsheetId, token, 'GET', `/values/${enc}`);
    const bak = await api(config.spreadsheetId, token, 'GET', `/values/${encodeURIComponent("'BAK Antidotes'!" + range.replace(/^'[^']*'!/, ''))}`);
    const a = cur.values || [];
    const b = bak.values || [];
    const n = Math.max(a.length, b.length);
    console.log('Row diffs (1-based):');
    let any = false;
    for (let i = 0; i < n; i++) {
        const x = a[i] || [];
        const y = b[i] || [];
        const maxC = Math.max(x.length, y.length);
        const diffs = [];
        for (let c = 0; c < maxC; c++) {
            const xv = x[c] === undefined ? '(empty)' : x[c];
            const yv = y[c] === undefined ? '(empty)' : y[c];
            if (String(xv) !== String(yv)) diffs.push({ col: String.fromCharCode(65 + c), cur: xv, bak: yv });
        }
        if (diffs.length) {
            any = true;
            console.log(`Row ${i + 1}: ${JSON.stringify(diffs)}`);
        }
    }
    if (!any) console.log('No differences.');
}

// ---------- main ----------
async function main() {
    const [,, cmd, a, b] = process.argv;
    switch (cmd) {
        case 'meta': return cmdMeta();
        case 'read': return cmdRead(a);
        case 'write': return cmdWrite(a, normalizeInput(b), process.argv.includes('--raw'));
        case 'append': return cmdAppend(a, normalizeInput(b));
        case 'writefile': return cmdWrite(a, JSON.parse(fs.readFileSync(b, 'utf8')), process.argv.includes('--raw'));
        case 'dump': return cmdDump(a, b);
        case 'clear': return cmdClear(a);
        case 'batch': return cmdBatch(a, process.argv.includes('--dry-run'));
        case 'diff': return cmdDiff(a);
        case 'merges': return cmdMerges(a);
        default:
            console.log(`Usage:
  node sheet-sync.js meta
  node sheet-sync.js read "<range>"
  node sheet-sync.js write "<range>" "<json>"
  node sheet-sync.js writefile "<range>" "<jsonfile>"
  node sheet-sync.js append "<sheet>" "<json>"
  node sheet-sync.js clear "<range>"
  node sheet-sync.js batch <file.json> [--dry-run]`);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
