/* ============================================================
   เอนจินแบบทดสอบท้ายบท (MCQ) — ระบบเหรียญ 3 ระดับ
   ============================================================ */
import { QUIZ, MEDAL_INFO, medalOf } from './quiz-data.js?v=2';

const params = new URLSearchParams(location.search);
const ch = parseInt(params.get('ch') || '1', 10);
const data = QUIZ[ch];

const $ = (id) => document.getElementById(id);
const storeKey = (c) => `compro-quiz-ch${c}`;

function loadResult(c) {
  try { return JSON.parse(localStorage.getItem(storeKey(c))) || null; }
  catch { return null; }
}
function saveResult(c, score, total) {
  const prev = loadResult(c);
  const best = prev ? Math.max(prev.best || 0, score) : score;
  localStorage.setItem(storeKey(c), JSON.stringify({
    best, total, last: score, date: new Date().toISOString()
  }));
}

if (!data) {
  $('quizArea').innerHTML =
    '<p style="text-align:center">ไม่พบแบบทดสอบของบทนี้ · <a href="quizzes.html">กลับไปหน้าแบบทดสอบ</a></p>';
} else {
  const total = data.questions.length;
  document.title = `แบบทดสอบ บทที่ ${ch} — ComPro Math 1`;
  $('quizChTitle').textContent = `บทที่ ${ch} · ${data.title}`;
  const prev = loadResult(ch);
  if (prev) {
    const m = medalOf(prev.best, prev.total || total);
    $('prevScore').innerHTML =
      `สถิติเดิม: ทำถูกสูงสุด <strong>${prev.best}/${prev.total || total}</strong> ข้อ` +
      (m ? ` · ${MEDAL_INFO[m].icon} ${MEDAL_INFO[m].name}` : '');
  }
  renderQuestions();
}

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
  saveResult(ch, score, total);
  const medal = medalOf(score, total);

  const panel = $('resultPanel');
  panel.hidden = false;
  panel.className = 'result-panel ' + (medal ? 'pass' : 'fail');
  $('resultIcon').textContent = medal ? MEDAL_INFO[medal].icon : '📚';

  let msg = `ทำถูก <strong>${score}/${total}</strong> ข้อ<br>`;
  if (medal) {
    msg += `ได้รับ <strong>${MEDAL_INFO[medal].name} ${MEDAL_INFO[medal].icon}</strong> ประจำบทนี้!`;
    if (medal !== 'gold') {
      const need = (medal === 'silver') ? 20 : 15;
      const nextName = (medal === 'silver') ? 'เหรียญทอง' : 'เหรียญเงิน';
      msg += `<br><small style="color:var(--muted)">อีกนิดเดียว! ทำถูก ${need} ข้อ รับ${nextName}</small>`;
    } else {
      msg += '<br>🎉 สุดยอด! ทำถูกครบทุกข้อ';
    }
  } else {
    msg += `ยังไม่ได้เหรียญ (ต้องทำถูกอย่างน้อย 10 ข้อ) ลองทบทวนคำอธิบายแล้วทำใหม่นะ`;
  }
  if (unanswered) {
    msg += `<br><small style="color:var(--muted)">มี ${unanswered} ข้อที่ยังไม่ได้เลือกคำตอบ</small>`;
  }
  $('resultText').innerHTML = msg;

  $('medalHint').innerHTML =
    'เกณฑ์เหรียญ: 🥇 ทอง = ถูกครบ 20 ข้อ · 🥈 เงิน = ถูก 15–19 ข้อ · 🥉 ทองแดง = ถูก 10–14 ข้อ';

  $('submitBtn').hidden = true;
  $('retryBtn').hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('retryBtn').addEventListener('click', () => {
  $('retryBtn').hidden = true;
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
