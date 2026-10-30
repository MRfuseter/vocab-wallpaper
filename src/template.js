import { config } from './config.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * mode: 'full' = คำ + IPA + คำแปล, 'quiz' = ซ่อนคำแปล (ไว้ทายในใจ)
 * background: data URL ของภาพพื้นหลัง (assets/background.jpg)
 *
 * ตำแหน่งบนจอ 1320×2868:
 *   0–860     นาฬิกา Lock Screen (เว้นไว้)
 *   900–1940  คำศัพท์ บนพื้นกระดาษ
 *   ~2000–2500 ตัวคนเดิน + เงา (เว้นไว้)
 *   2545+     คำทบทวน กลางแถบหญ้า (ระหว่างปุ่มไฟฉาย/กล้อง)
 */
export function renderHtml({ day, totalDays, words, review, mode, background }) {
  const level = words[0]?.level || 'A1';
  const progress = Math.max(1, Math.round((day / totalDays) * 100));
  const pad = (n) => String(n).padStart(2, '0');

  const rows = words.map((w, i) => `
    <li>
      <span class="no">${pad(i + 1)}</span>
      <div class="word">
        <div class="en">${esc(w.en)}</div>
        <div class="ipa">${esc(w.ipa)}</div>
      </div>
      ${mode === 'full' ? `<div class="th">${esc(w.th)}</div>` : ''}
    </li>`).join('');

  const reviewHtml = review.length && mode === 'full' ? `
    <div id="review">${review.map((w) => `<span>${esc(w.en)} <em>${esc(w.th)}</em></span>`).join('')}</div>` : '';

  return `<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans+Thai:wght@300;400&family=Noto+Sans:wght@400&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${config.width}px; height: ${config.height}px; overflow: hidden; }
  body {
    font-family: 'IBM Plex Sans Thai', 'Noto Sans', sans-serif;
    color: #2f3a2a;
    background: #e4d9bf url('${background}') center bottom / cover no-repeat;
  }
  #safe {
    position: absolute; left: 120px; right: 120px; top: 900px; height: 1040px;
    display: flex; flex-direction: column; justify-content: center;
    font-size: var(--fs, 1px);
  }
  .header { display: flex; align-items: center; gap: .8em; margin-bottom: 1.6em;
    font-family: 'Noto Sans', sans-serif; font-size: 24em; letter-spacing: .28em; text-transform: uppercase; opacity: .6; }
  .header .line { flex: 1; height: 2px; background: rgb(47 58 42 / .18); position: relative; }
  .header .line i { position: absolute; inset: 0 auto 0 0; width: ${progress}%; background: #2f3a2a; }

  ul { list-style: none; }
  li { display: flex; align-items: baseline; gap: 26em; padding: ${mode === 'full' ? 20 : 24}em 0; }
  .no { font-family: 'Noto Sans', sans-serif; font-size: 22em; opacity: .35; width: 1.6em; }
  .word { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 16em; flex-wrap: wrap; }
  .en { font-family: 'Fraunces', serif; font-weight: 500; font-size: ${mode === 'full' ? 56 : 66}em; line-height: 1.05; letter-spacing: -.01em; }
  .ipa { font-family: 'Noto Sans', sans-serif; font-size: ${mode === 'full' ? 26 : 30}em; opacity: .45; }
  .th { font-weight: 300; font-size: 38em; text-align: right; max-width: 52%; line-height: 1.3; }

  .hint { font-weight: 300; font-size: 30em; opacity: .55; margin: -.6em 0 1em; }

  #review {
    position: absolute; left: 260px; right: 260px; top: 2540px;
    font-size: 30px; font-weight: 300; color: rgb(244 236 216 / .92); text-align: center; line-height: 1.55;
  }
  #review span { display: block; font-family: 'Fraunces', serif; }
  #review em { font-style: normal; font-family: 'IBM Plex Sans Thai', sans-serif; opacity: .8; margin-left: .2em; }
</style></head>
<body>
  <div id="safe">
    <div class="header">
      <span>Day ${pad(day)}</span>
      <span class="line"><i></i></span>
      <span>${esc(level)}</span>
    </div>
    ${mode === 'quiz' ? '<div class="hint">นึกคำแปลในใจก่อนนะ</div>' : ''}
    <ul>${rows}</ul>
  </div>
  ${reviewHtml}
  <script>
    // ย่อขนาดอัตโนมัติถ้าเนื้อหาล้นพื้นที่ (ไม่ให้ทับตัวคนในภาพ)
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
