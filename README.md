# Vocab Wallpaper — คำศัพท์วันละ 10 คำบน Lock Screen

ดึงคำศัพท์จาก [Google Sheet Oxford 3000](https://docs.google.com/spreadsheets/d/1kAKhiXs2rJi-5YFNmioMn0vXTTyQpuCWQ4xqt0lQYec/edit) แล้วสร้าง wallpaper ขนาด iPhone 17 Pro Max (1320×2868) ทุกวัน

| ไฟล์ | เนื้อหา |
|---|---|
| `docs/today.png` | คำศัพท์ + IPA + คำแปล + คำทบทวน (จาก 1, 3, 7 วันก่อน) |
| `docs/quiz.png` | โหมดทายคำ: มีแค่คำอังกฤษ + IPA ไม่มีคำแปล |
| `docs/today.json` | ข้อมูลของวันนี้ |

## หลักการเลือกวัน
ค่าเริ่มต้น (`DAY_MODE=date`) จะ **เปลี่ยนชุดคำเองทุกวัน** โดยนับจาก `START_DATE` (วันที่ของ Day 1, ตอนนี้ตั้งไว้ `2026-10-28`)
ไม่ต้องไปติ๊กอะไรในชีต ถ้าอยากเริ่มนับใหม่ ให้แก้ `START_DATE` ใน `src/config.js` หรือในไฟล์ workflow

ถ้าวันหลังอยากให้เลื่อนวันเฉพาะตอนติ๊ก "ท่องแล้ว" ในชีต ให้ตั้ง `DAY_MODE=unchecked`

> ⚠️ ชีตต้องแชร์แบบ "ทุกคนที่มีลิงก์ดูได้" ไว้เสมอ ไม่อย่างนั้นสคริปต์จะดึงข้อมูลไม่ได้

## รันในเครื่อง
```bash
npm install
npx playwright install chromium   # ครั้งแรกครั้งเดียว
npm run build                     # ได้ไฟล์ใน docs/
DAY=42 npm run build              # ลองดูวันที่ 42
```

## ตั้งค่าครั้งแรก

### 1. GitHub
1. สร้าง repo ใหม่ (แนะนำแบบ public เพราะ GitHub Pages ฟรีเฉพาะ public) แล้ว push โปรเจกต์นี้ขึ้นไป
2. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / โฟลเดอร์ `/docs`
3. **Actions** → *Daily vocab wallpaper* → **Run workflow** เพื่อทดสอบ
4. เปิด `https://<username>.github.io/<repo>/` จะเห็นภาพของวันนี้

workflow รันเองทุกวันตอน 05:00 เวลาไทย (และ 05:30 เผื่อรอบแรกพลาด)

### 2. iPhone Shortcuts
**สร้าง Shortcut ชื่อ "Vocab Wallpaper"**
1. `URL` → `https://<username>.github.io/<repo>/today.png?v=` แล้วต่อท้ายด้วยตัวแปร *Current Date* (กันโหลดภาพเก่าจาก cache)
2. `Get Contents of URL`
3. `Set Wallpaper Photo` → เลือก **Lock Screen** → กดลูกศรขยาย แล้ว **ปิด Show Preview** และ **ปิด Crop to Subject**

**ตั้งให้รันอัตโนมัติ:** แท็บ Automation → `+` → *Time of Day* 06:00 ทุกวัน → **Run Immediately** → เลือก Shortcut ด้านบน

**(แนะนำ) โหมดทายคำตอนเย็น:** ทำ Shortcut อีกตัวที่ใช้ `quiz.png` แล้วตั้ง Automation เวลา 18:00
ตอนเช้าได้ท่องพร้อมคำแปล ส่วนตอนเย็นให้ลองนึกคำแปลเองทุกครั้งที่เปิดจอ

> ใน Lock Screen ควรเลือก wallpaper แบบ Photo ไว้ก่อน และปิด Depth Effect / Perspective Zoom เพื่อไม่ให้ภาพถูกซูมหรือนาฬิกาบังตัวหนังสือ

## หมายเหตุ
- GitHub จะหยุด workflow แบบตั้งเวลา ถ้า repo ไม่มีความเคลื่อนไหว 60 วัน แต่ workflow นี้ commit ภาพทุกครั้งที่วันเปลี่ยน ถ้าเปลี่ยนวันสม่ำเสมอก็ไม่น่ามีปัญหา ถ้าโดนปิดก็กด Enable ได้ในแท็บ Actions
- เวลาของ cron บน GitHub อาจคลาดไปได้ 5–30 นาที จึงตั้งให้รันตี 5 เผื่อไว้ก่อน Shortcut รันตอน 6 โมง
- ปรับดีไซน์ได้ที่ `src/template.js` / เปลี่ยนภาพพื้นหลังได้โดยแทนไฟล์ `assets/background.jpg` (ถ้าภาพใหม่มีองค์ประกอบคนละตำแหน่ง ต้องขยับตำแหน่งตัวหนังสือใน template ด้วย)
- workflow จะ commit ภาพทุกวัน ก่อนแก้โค้ดในเครื่องให้ `git pull` ก่อนทุกครั้ง
