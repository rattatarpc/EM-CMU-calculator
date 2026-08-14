# ขั้นตอนตั้งค่าให้ผมแก้ Google Sheet ได้ (Service Account)

ทำครั้งเดียวประมาณ 10–15 นาที แล้วจากนั้นคุณแค่บอกในแชต ผมจะรันสคริปต์แก้ชีตให้

---

## 1. สร้าง Service Account ใน Google Cloud

1. เปิด [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project ใหม่ (หรือเลือก Project ที่มีอยู่) แล้วเปิด console ไว้
3. ไปที่ **APIs & Services → Library**
4. ค้นหา **Google Sheets API** → กด **Enable**
5. ไปที่ **IAM & Admin → Service Accounts**
6. กด **Create Service Account**
   - ชื่อ: `em-cmu-sync` (อะไรก็ได้)
   - Role: ไม่ต้องให้ก็ได้ (ข้ามได้)
   - กด **Create**
7. คลิกบัญชีที่สร้าง → แถบ **Keys** → **Add Key → Create new key**
   - เลือก **JSON** → **Create**
   - จะดาวน์โหลดไฟล์ `...json` มา

## 2. วาง key ลงในโปรเจกต์

1. เอาไฟล์ JSON ที่ดาวน์โหลดมา ใส่ในโฟลเดอร์เดียวกับ `EM CMU Calculator.html`
2. **เปลี่ยนชื่อเป็น `service-account.json`** (ไฟล์นี้ห้ามแชร์/คอมมิต)

## 3. แชร์ชีตให้ Service Account

1. เปิด Google Sheet (EM CMU Calculator Ver 2.0)
2. กด **Share** (มุมขวาบน)
3. ใส่ email ของ service account ซึ่งอยู่ในไฟล์ JSON ฟิลด์ `client_email`
   - หน้าตา: `em-cmu-sync@xxxxxxxx.iam.gserviceaccount.com`
4. เลือกสิทธิ์ **Editor**
5. กด **Send**

## 4. ทดสอบ

รันในโปรเจกต์:

```powershell
node sheet-sync.js meta
```

ถ้าเห็นรายชื่อ 6 แท็บ (RSI, Ped Common drug, ...) แปลว่าสำเร็จ

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ความหมาย |
|---|---|
| `node sheet-sync.js meta` | ดูรายชื่อแท็บ + gid |
| `node sheet-sync.js read "'RSI'!A1:F10"` | อ่านค่า (ชื่อแท็บที่มีช่องว่างต้องมี single quote) |
| `node sheet-sync.js write "'RSI'!A1" '[[1,2],[3,4]]'` | เขียนข้อมูล |
| `node sheet-sync.js append "'RSI'" '[[...],[...]]'` | ต่อแถวใหม่ท้ายตาราง |
| `node sheet-sync.js clear "'RSI'!A1:F20"` | ล้างข้อมูลช่วง |
| `node sheet-sync.js batch batch.json --dry-run` | รันหลายงานพร้อมกัน (ลองก่อนจริง) |
| `node sheet-sync.js batch batch.json` | รันจริง |

### เขียนสูตร
ค่าที่ขึ้นต้นด้วย `=` จะถูกตีความเป็นสูตร เช่น:

```powershell
node sheet-sync.js write "'RSI'!J1" '[["=SUM(A1:A5)"]]'
```

### จัดรูปแบบ/เขียนสูตรใน batch (format, merge, conditional format)
ใช้ไฟล์ JSON ดูตัวอย่างได้ที่ `example-batch.json` — โครงสร้าง `requests` เป็น Google Sheets API batchUpdate request ตรงตัว

---

## ความปลอดภัย

- `service-account.json` คือกุญแจจริง — **ห้าม**แชร์, ห้ามอัปโหลด, ห้ามคอมมิตลง git
- ถ้าจะเพิ่มไฟล์ `.gitignore` ให้ใส่บรรทัด `service-account.json`
- ถ้า key รั่ว ให้ลบ key ที่ Console แล้วสร้างใหม่ แล้วเปลี่ยนชื่อไฟล์ใหม่
