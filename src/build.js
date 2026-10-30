import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { config } from './config.js';
import { loadData } from './sheet.js';
import { renderHtml } from './template.js';

function todayInTz() {
  // ได้ YYYY-MM-DD ตามเขตเวลาไทย
  return new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone }).format(new Date());
}

function pickDay(days) {
  const last = days[days.length - 1].day;
  if (config.forceDay) return Math.min(config.forceDay, last);
  if (config.dayMode === 'date') {
    const diff = Math.round((Date.parse(todayInTz()) - Date.parse(config.startDate)) / 86400000);
    return Math.min(Math.max(diff + 1, 1), last);
  }
  return (days.find((d) => !d.done) ?? days[days.length - 1]).day;
}

// ทบทวนแบบเว้นระยะ: หยิบคำละ 1 คำจากชุดเมื่อ 1, 3, 7 วันก่อน
function pickReview(days, day) {
  return [1, 3, 7]
    .map((back) => days.find((d) => d.day === day - back))
    .filter(Boolean)
    .map((d) => d.words[(day * 7 + d.day) % d.words.length]);
}

async function main() {
  const days = await loadData();
  if (!days.length) throw new Error('ไม่พบคำศัพท์ในชีต');

  const day = pickDay(days);
  const { words } = days.find((d) => d.day === day);
  const review = pickReview(days, day);
  const totalDays = days[days.length - 1].day;
  console.log(`Day ${day}/${totalDays}: ${words.map((w) => w.en).join(', ')}`);

  // ภาพพื้นหลังต้องฝังเป็น data URL เพราะ page.setContent โหลดไฟล์ในเครื่องไม่ได้
  const background = `data:image/jpeg;base64,${(await readFile(config.background)).toString('base64')}`;

  await mkdir(config.outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: 1 });

  for (const mode of ['full', 'quiz']) {
    await page.setContent(renderHtml({ day, totalDays, words, review, mode, background }), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const scale = await page.evaluate(() => window.fit());
    const file = join(config.outDir, mode === 'full' ? 'today.png' : 'quiz.png');
    await page.screenshot({ path: file, type: 'png' });
    console.log(`→ ${file} (font scale ${scale.toFixed(2)})`);
  }
  await browser.close();

  const generatedAt = new Date().toISOString();
  await writeFile(join(config.outDir, 'today.json'), JSON.stringify({ day, totalDays, generatedAt, words, review }, null, 2));
  await writeFile(join(config.outDir, 'index.html'), `<!DOCTYPE html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Day ${day} vocab wallpaper</title>
<style>body{font-family:system-ui;background:#111;color:#eee;text-align:center;margin:24px}img{width:min(45vw,330px);border-radius:28px;margin:8px}</style></head>
<body><h1>Day ${day} / ${totalDays}</h1><p>อัปเดต ${generatedAt}</p>
<a href="today.png"><img src="today.png?v=${day}" alt="today"></a><a href="quiz.png"><img src="quiz.png?v=${day}" alt="quiz"></a></body></html>`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
