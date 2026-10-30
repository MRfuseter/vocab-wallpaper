import { config } from './config.js';

function sheetUrl(name) {
  return `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
}

// CSV parser แบบรองรับ "..." และ "" ข้างใน
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchSheet(name) {
  const res = await fetch(sheetUrl(name));
  if (!res.ok) throw new Error(`โหลดชีต "${name}" ไม่ได้: HTTP ${res.status}`);
  const [header, ...rows] = parseCsv(await res.text());
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const isChecked = (v) => v !== '';

export async function loadData() {
  const [vocabRows, planRows] = await Promise.all([
    fetchSheet(config.vocabSheet),
    fetchSheet(config.planSheet).catch(() => []),
  ]);

  const words = vocabRows
    .filter((r) => r['คำศัพท์ (EN)'])
    .map((r) => ({
      day: Number(r['วันที่']),
      no: Number(r['ลำดับ']),
      en: r['คำศัพท์ (EN)'],
      pos: r['ชนิดคำ'],
      level: r['ระดับ'],
      ipa: r['คำอ่าน (IPA)'],
      th: r['คำแปล (TH)'],
      done: isChecked(r['ท่องแล้ว']),
    }));

  const byDay = new Map();
  for (const w of words) {
    if (!byDay.has(w.day)) byDay.set(w.day, []);
    byDay.get(w.day).push(w);
  }

  // วันถือว่าท่องแล้ว ถ้าติ๊กในชีตแผนรายวัน หรือติ๊กครบทุกคำในชีตคำศัพท์
  const planDone = new Set(planRows.filter((r) => isChecked(r['ท่องแล้ว'])).map((r) => Number(r['วันที่'])));
  const days = [...byDay.keys()].sort((a, b) => a - b).map((day) => ({
    day,
    words: byDay.get(day),
    done: planDone.has(day) || byDay.get(day).every((w) => w.done),
  }));

  return days;
}
