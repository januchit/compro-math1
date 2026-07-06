/* ============================================================
   หน้ารวมแบบทดสอบ — แถบความก้าวหน้า + เหรียญ (badge)
   ============================================================ */
import { QUIZ, PASS } from './quiz-data.js';

const storeKey = (c) => `compro-quiz-ch${c}`;
function loadResult(c) {
  try { return JSON.parse(localStorage.getItem(storeKey(c))) || null; }
  catch { return null; }
}

const chapters = Object.keys(QUIZ).map(Number).sort((a, b) => a - b);
let passedCount = 0;

const shelf = document.getElementById('quizShelf');
shelf.innerHTML = '';

chapters.forEach((c) => {
  const data = QUIZ[c];
  const res = loadResult(c);
  const passed = res && res.passed;
  if (passed) passedCount++;
  const best = res ? res.best : null;

  const badge = passed ? '🏅' : '⬜';
  let statusText, statusClass;
  if (passed) { statusText = `ผ่านแล้ว · สูงสุด ${best}%`; statusClass = 'st-pass'; }
  else if (res) { statusText = `ยังไม่ผ่าน · สูงสุด ${best}%`; statusClass = 'st-try'; }
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
        <span class="pages">📝 ${data.questions.length} ข้อ</span>
        <span class="qstatus ${statusClass}"></span>
      </div>
    </div>`;
  a.querySelector('h3').textContent = data.title;
  a.querySelector('.qstatus').textContent = statusText;
  shelf.appendChild(a);
});

// แถบความก้าวหน้ารวม
const total = chapters.length;
const pct = Math.round((passedCount / total) * 100);
document.getElementById('progFill').style.width = pct + '%';
document.getElementById('progLabel').innerHTML =
  `ผ่านแล้ว <strong>${passedCount}/${total}</strong> บท (${pct}%)`;

// ข้อความให้กำลังใจ + เหรียญสะสม
const medals = '🏅'.repeat(passedCount) + '⬜'.repeat(total - passedCount);
document.getElementById('medalRow').textContent = medals;
let cheer;
if (passedCount === 0) cheer = 'เริ่มทำแบบทดสอบบทแรกกันเลย!';
else if (passedCount === total) cheer = 'สุดยอด! ผ่านครบทุกบทแล้ว 🎉';
else cheer = `เหลืออีก ${total - passedCount} บทก็ครบแล้ว สู้ ๆ!`;
document.getElementById('cheer').textContent = cheer;

// ปุ่มล้างสถิติ
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('ต้องการล้างสถิติแบบทดสอบทั้งหมดในเครื่องนี้ใช่หรือไม่?')) {
    chapters.forEach((c) => localStorage.removeItem(storeKey(c)));
    location.reload();
  }
});
