import { config } from './config.js';

export const LEVEL_COLORS = { A1: '#4ade80', A2: '#60a5fa', B1: '#facc15', B2: '#fb923c' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * mode: 'full' = คำ + IPA + คำแปล, 'quiz' = ซ่อนคำแปล (ไว้ทายในใจ)
 * พื้นที่ปลอดภัยบน Lock Screen: ด้านบนมีนาฬิกา ด้านล่างมีปุ่มไฟฉาย/กล้อง
 * เลยวางเนื้อหาไว้ช่วง y ≈ 880–2420px
 */
export function renderHtml({ day, totalDays, words, review, mode }) {
  const level = words[0]?.level || 'A1';
  const accent = LEVEL_COLORS[level] || '#e5e7eb';
  const hue = (day * 47) % 360; // สีพื้นหลังเปลี่ยนทุกวัน สมองจะได้รู้ว่าเป็นชุดใหม่
  const progress = Math.round((day / totalDays) * 100);

  const rows = words.map((w) => `
    <li style="--c:${LEVEL_COLORS[w.level] || accent}">
      <div class="line1">
        <span class="en">${esc(w.en)}</span>
        <span class="ipa">${esc(w.ipa)}</span>
        <span class="pos">${esc(w.pos)}</span>
      </div>
      ${mode === 'full' ? `<div class="th">${esc(w.th)}</div>` : ''}
    </li>`).join('');

  const reviewHtml = review.length && mode === 'full' ? `
    <div class="review">
      <div class="review-title">ทบทวน</div>
      ${review.map((w) => `<div class="review-item"><b>${esc(w.en)}</b> <span>${esc(w.th)}</span></div>`).join('')}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;800&family=Noto+Sans+Thai:wght@400;500;600&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${config.width}px; height: ${config.height}px; overflow: hidden; }
  body {
    font-family: 'Noto Sans', 'Noto Sans Thai', sans-serif;
    color: #f8fafc;
    background:
      radial-gradient(1200px 900px at 85% 10%, hsl(${hue} 70% 32% / .55), transparent 60%),
      radial-gradient(1000px 1000px at 0% 95%, hsl(${(hue + 60) % 360} 60% 28% / .5), transparent 60%),
      linear-gradient(180deg, hsl(${hue} 35% 11%), hsl(${(hue + 30) % 360} 30% 6%));
  }
  #safe {
    position: absolute; left: 100px; right: 100px; top: 880px; height: 1540px;
    display: flex; flex-direction: column; justify-content: center;
    font-size: var(--fs, 1px);
  }
  .header { display: flex; align-items: center; gap: 24em; margin-bottom: 36em; }
  .day { font-size: 40em; font-weight: 800; letter-spacing: .02em; }
  .day small { font-weight: 500; opacity: .55; font-size: .8em; }
  .bar { flex: 1; height: 10em; border-radius: 99em; background: rgb(255 255 255 / .14); overflow: hidden; }
  .bar i { display: block; height: 100%; width: ${progress}%; background: ${accent}; border-radius: inherit; }
  .badge { font-size: 30em; font-weight: 800; color: #0b0f14; background: ${accent}; padding: .15em .6em; border-radius: .5em; }
  .mode { font-size: 28em; opacity: .6; margin: -.5em 0 1em; font-family: 'Noto Sans Thai', sans-serif; }

  .card {
    background: rgb(10 14 20 / .45);
    border: 1px solid rgb(255 255 255 / .1);
    border-radius: 48em;
    padding: 20em 44em;
  }
  ul { list-style: none; }
  li { padding: ${mode === 'full' ? '18em' : '24em'} 0 ${mode === 'full' ? '18em' : '24em'} 30em; border-left: 6em solid var(--c); margin: 6em 0; }
  li + li { border-top: 1px solid rgb(255 255 255 / .07); }
  .line1 { display: flex; align-items: baseline; gap: 18em; flex-wrap: wrap; }
  .en { font-size: ${mode === 'full' ? 56 : 66}em; font-weight: 800; letter-spacing: -.01em; line-height: 1.15; }
  .ipa { font-size: ${mode === 'full' ? 32 : 36}em; opacity: .62; }
  .pos { font-size: 26em; font-style: italic; opacity: .45; margin-left: auto; }
  .th { font-family: 'Noto Sans Thai', sans-serif; font-size: 42em; font-weight: 500; color: rgb(255 255 255 / .88); line-height: 1.35; margin-top: .1em; }

  .review { margin-top: .9em; font-family: 'Noto Sans Thai', 'Noto Sans', sans-serif; font-size: 30em; opacity: .75;
    display: flex; flex-wrap: wrap; gap: .3em 1.1em; align-items: baseline; padding: 0 .6em; }
  .review-title { font-weight: 600; color: ${accent}; }
  .review-item span { opacity: .8; }
</style></head>
<body>
  <div id="safe">
    <div class="header">
      <div class="day">Day ${day}<small> / ${totalDays}</small></div>
      <div class="bar"><i></i></div>
      <div class="badge">${esc(level)}</div>
    </div>
    ${mode === 'quiz' ? '<div class="mode">โหมดทายคำ — นึกคำแปลในใจก่อนนะ</div>' : ''}
    <div class="card"><ul>${rows}</ul></div>
    ${reviewHtml}
  </div>
  <script>
    // ย่อขนาดอัตโนมัติถ้าเนื้อหาล้นพื้นที่ปลอดภัย
    window.fit = () => {
      const safe = document.getElementById('safe');
      let fs = 1;
      safe.style.setProperty('--fs', fs + 'px');
      while (safe.scrollHeight > safe.clientHeight && fs > 0.6) {
        fs -= 0.02;
        safe.style.setProperty('--fs', fs + 'px');
      }
      return fs;
    };
  </script>
</body></html>`;
}
