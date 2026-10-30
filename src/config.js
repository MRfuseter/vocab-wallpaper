// ค่าทั้งหมดเปลี่ยนได้ผ่าน environment variable (ตั้งใน GitHub Actions ได้)
export const config = {
  sheetId: process.env.SHEET_ID || '1kAKhiXs2rJi-5YFNmioMn0vXTTyQpuCWQ4xqt0lQYec',
  vocabSheet: process.env.VOCAB_SHEET || 'คำศัพท์ทั้งหมด',
  planSheet: process.env.PLAN_SHEET || 'แผนรายวัน',

  // date      = นับวันจาก START_DATE ไปเรื่อยๆ เปลี่ยนชุดเองทุกวัน
  // unchecked = ใช้วันแรกที่ยังไม่ได้ติ๊ก "ท่องแล้ว" (ไม่ท่อง = ไม่เลื่อนวัน)
  dayMode: process.env.DAY_MODE || 'date',
  startDate: process.env.START_DATE || '2026-10-28', // วันที่ของ Day 1 (YYYY-MM-DD)
  timezone: process.env.TZ_NAME || 'Asia/Bangkok',
  forceDay: process.env.DAY ? Number(process.env.DAY) : null, // บังคับวัน เช่น DAY=5

  // ขนาดจอ iPhone 17 Pro Max
  width: 1320,
  height: 2868,

  outDir: process.env.OUT_DIR || 'docs',
};
