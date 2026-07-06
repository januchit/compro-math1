/* ============================================================
   เอนจินแบบทดสอบท้ายบท (MCQ)
   ============================================================ */
import { QUIZ, PASS } from './quiz-data.js';

const params = new URLSearchParams(location.search);
const ch = parseInt(params.get('ch') || '1', 10);
const data = QUIZ[ch];

const $ = (id) => document.getElementById(id);
const storeKey = (c) => `compro-quiz-ch${c}`;

function loadResult(c) {
  try { return JSON.parse(localStorage.getItem(storeKey(c))) || null; }
  catch { return null; }
}
function saveResult(c, percent, passed) {
  const prev = loadResult(c);
  const best = prev ? Math.max(prev.best, percent) : percent;
  const everPassed = (prev && prev.passed) || passed;
  localStorage.setItem(storeKey(c), JSON.stringify({
    best, passed: everPassed, last: percent, date: new Date().toISOString()
  }));
}

if (!data) {
  $('quizArea').innerHTML =
    '<p style="text-align:center">ไม่พบแบบทดสอบของบทนี้ · <a href="quizzes.html">กลับไปหน้าแบบทดสอบ</a></p>';
} else {
  document.title = `แบบทดสอบ บทที่ ${ch} — ComPro Math 1`;
  $('quizChTitle').textContent = `บทที่ ${ch} · ${data.title}`;
  const prev = loadResult(ch);
  if (prev) {
    $('prevScore').innerHTML =
      `สถิติเดิม: คะแนนสูงสุด <strong>${prev.best}%</strong>` +
      (prev.passed ? ' · 🏅 ผ่านแล้ว' : '');
  }
  renderQuestions();
}

let answered = null; // เก็บว่าตรวจไปแล้วหรือยัง

function renderQuestions() {
  const wrap = $('questions');
  wrap.innerHTML = '';
  data.questions.forEach((item, qi) => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.id = `q${qi}`;
    const choices = item.choices.map((c, ci) => `
      <label class="choice" data-q="${qi}" data-c="${ci}">
        <input type="radio" name="q${qi}" value="${ci}" />
        <span class="choice-mark">${String.fromCharCode(65 + ci)}</span>
        <span class="choice-text"></span>
      </label>`).join('');
    card.innerHTML = `
      <div class="q-head"><span class="q-no">ข้อ ${qi + 1}</span></div>
      <div class="q-text"></div>
      <div class="choices">${choices}</div>
      <div class="q-explain" hidden></div>`;
    wrap.appendChild(card);
    // ใส่ข้อความแบบปลอดภัย (กัน HTML injection ในโค้ดตัวอย่าง)
    card.querySelector('.q-text').textContent = item.q;
    card.querySelectorAll('.choice-text').forEach((el, ci) => { el.textContent = item.choices[ci]; });
  });
  $('submitBtn').hidden = false;
  $('resultPanel').hidden = true;
}

$('submitBtn').addEventListener('click', () => {
  let score = 0;
  let unanswered = 0;
  data.questions.forEach((item, qi) => {
    const sel = document.querySelector(`input[name="q${qi}"]:checked`);
    const card = $(`q${qi}`);
    card.querySelectorAll('.choice').forEach((lb) => {
      lb.classList.remove('correct', 'wrong');
      lb.querySelector('input').disabled = true;
    });
    // เฉลยตัวที่ถูกเสมอ
    const correctLb = card.querySelector(`.choice[data-c="${item.answer}"]`);
    correctLb.classList.add('correct');
    if (!sel) { unanswered++; }
    else {
      const ci = parseInt(sel.value, 10);
      if (ci === item.answer) score++;
      else card.querySelector(`.choice[data-c="${ci}"]`).classList.add('wrong');
    }
    const ex = card.querySelector('.q-explain');
    ex.hidden = false;
    ex.textContent = '💡 ' + item.explain;
  });

  const total = data.questions.length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= PASS;
  saveResult(ch, percent, passed);

  const panel = $('resultPanel');
  panel.hidden = false;
  panel.className = 'result-panel ' + (passed ? 'pass' : 'fail');
  $('resultIcon').textContent = passed ? '🏅' : '📚';
  $('resultText').innerHTML =
    `ได้ <strong>${score}/${total}</strong> ข้อ (${percent}%)<br>` +
    (passed
      ? 'ยอดเยี่ยม! ผ่านเกณฑ์แล้ว ได้รับเหรียญประจำบทนี้ 🎉'
      : `ยังไม่ผ่านเกณฑ์ (${PASS}%) ลองทบทวนคำอธิบายแล้วทำใหม่อีกครั้งนะ`) +
    (unanswered ? `<br><small style="color:var(--muted)">มี ${unanswered} ข้อที่ยังไม่ได้เลือกคำตอบ</small>` : '');

  $('submitBtn').hidden = true;
  $('retryBtn').hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('retryBtn').addEventListener('click', () => {
  $('retryBtn').hidden = true;
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
