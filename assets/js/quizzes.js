/* ============================================================
   หน้ารวมแบบทดสอบ — แถบความก้าวหน้า + เหรียญ 3 ระดับ
   ============================================================ */
import { QUIZ, MEDAL_INFO, medalOf } from './quiz-data.js?v=2';

const storeKey = (c) => `compro-quiz-ch${c}`;
function loadResult(c) {
  try { return JSON.parse(localStorage.getItem(storeKey(c))) || null; }
  catch { return null; }
}

const chapters = Object.keys(QUIZ).map(Number).sort((a, b) => a - b);
const count = { gold: 0, silver: 0, bronze: 0 };
let medalChapters = 0;

const shelf = document.getElementById('quizShelf');
shelf.innerHTML = '';

chapters.forEach((c) => {
  const data = QUIZ[c];
  const total = data.questions.length;
  const res = loadResult(c);
  const best = res ? (res.best || 0) : null;
  const medal = res ? medalOf(best, res.total || total) : null;
  if (medal) { count[medal]++; medalChapters++; }

  const badge = medal ? MEDAL_INFO[medal].icon : '⬜';
  let statusText, statusClass;
  if (medal) { statusText = `${MEDAL_INFO[medal].name} · ${best}/${total} ข้อ`; statusClass = 'st-pass'; }
  else if (res) { statusText = `ยังไม่ได้เหรียญ · ${best}/${total} ข้อ`; statusClass = 'st-try'; }
  else { statusText = 'ยังไม่ได้ทำ'; statusClass = 'st-none'; }

  const a = document.createElement('a');
  a.className = 'book quiz-card';
  a.href = `quiz.html?ch=${c}`;
  a.innerHTML = `
    <div class="book-cover ex">
      <span class="spine"></span>
      <span class="q-badge">${badge}</span>
      <span class="ex-num">${c}</span>
      <span class="ex-sub">CHAPTER ${c}</span>
    </div>
    <div class="book-body">
      <h3></h3>
      <div class="book-meta">
        <span class="pages">📝 ${total} ข้อ</span>
        <span class="qstatus ${statusClass}"></span>
      </div>
    </div>`;
  a.querySelector('h3').textContent = data.title;
  a.querySelector('.qstatus').textContent = statusText;
  shelf.appendChild(a);
});

// แถบความก้าวหน้ารวม (นับบทที่ได้เหรียญอย่างน้อยทองแดง)
const total = chapters.length;
const pct = Math.round((medalChapters / total) * 100);
document.getElementById('progFill').style.width = pct + '%';
document.getElementById('progLabel').innerHTML =
  `ได้เหรียญแล้ว <strong>${medalChapters}/${total}</strong> บท (${pct}%)`;

// สรุปจำนวนเหรียญแต่ละระดับ
document.getElementById('medalRow').innerHTML =
  `<span class="mcount">🥇 ${count.gold}</span>` +
  `<span class="mcount">🥈 ${count.silver}</span>` +
  `<span class="mcount">🥉 ${count.bronze}</span>`;

let cheer;
if (medalChapters === 0) cheer = 'เริ่มทำแบบทดสอบเพื่อรับเหรียญแรกกันเลย!';
else if (count.gold === total) cheer = 'ยอดเยี่ยมที่สุด! ได้เหรียญทองครบทุกบท 🏆';
else if (medalChapters === total) cheer = 'ได้เหรียญครบทุกบทแล้ว ลองไต่ให้เป็นเหรียญทองทั้งหมดสิ!';
else cheer = `เหลืออีก ${total - medalChapters} บทที่ยังไม่ได้เหรียญ สู้ ๆ!`;
document.getElementById('cheer').textContent = cheer;

// ปุ่มล้างสถิติ
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('ต้องการล้างสถิติแบบทดสอบทั้งหมดในเครื่องนี้ใช่หรือไม่?')) {
    chapters.forEach((c) => localStorage.removeItem(storeKey(c)));
    location.reload();
  }
});
