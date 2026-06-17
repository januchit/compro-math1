/* ============================================================
   Flipbook reader engine — PDF.js based
   ============================================================ */
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

/* ---- Book catalogue ---- */
const BOOKS = {
  'chapter-1':  { file: 'books/chapter-1.pdf',  title: 'บทที่ 1 · Introduction to Computers and Python' },
  'chapter-2':  { file: 'books/chapter-2.pdf',  title: 'บทที่ 2 · Variables, Input and Output' },
  'chapter-3':  { file: 'books/chapter-3.pdf',  title: 'บทที่ 3 · Using Standard Libraries' },
  'chapter-4':  { file: 'books/chapter-4.pdf',  title: 'บทที่ 4 · Conditional Structure' },
  'chapter-5':  { file: 'books/chapter-5.pdf',  title: 'บทที่ 5 · For Loops' },
  'chapter-6':  { file: 'books/chapter-6.pdf',  title: 'บทที่ 6 · List Data Structures' },
  'chapter-7':  { file: 'books/chapter-7.pdf',  title: 'บทที่ 7 · While Loops' },
  'chapter-8':  { file: 'books/chapter-8.pdf',  title: 'บทที่ 8 · Dictionaries and Sets' },
  'chapter-9':  { file: 'books/chapter-9.pdf',  title: 'บทที่ 9 · Functions' },
  'chapter-10': { file: 'books/chapter-10.pdf', title: 'บทที่ 10 · Numerical Computing with NumPy' },
};

/* ---- DOM ---- */
const $ = (id) => document.getElementById(id);
const spreadEl   = $('spread');
const stageEl    = $('stage');
const loaderEl   = $('loader');
const loaderText = $('loaderText');
const titleEl    = $('bookTitle');
const curEl      = $('pageCur');
const totalEl    = $('pageTotal');
const rangeEl    = $('pageRange');
const navPrev    = $('navPrev');
const navNext    = $('navNext');

/* ---- State ---- */
let pdfDoc = null;
let numPages = 0;
let spreadIndex = 0;       // 0-based; pages (2s+1, 2s+2)
let zoom = 1;
let twoPage = false  /* single-page mode: one slide fills the view */;
let rendering = false;
const pageCache = new Map(); // pageNum -> rendered canvas (at current layout)
let layoutKey = '';          // invalidates cache when size/zoom changes

/* ---- Boot ---- */
const params = new URLSearchParams(location.search);
const bookId = params.get('book') || 'chapter-1';
const book = BOOKS[bookId];

if (!book) {
  loaderText.textContent = 'ไม่พบหนังสือเล่มนี้';
} else {
  initBook();
}

async function initBook() {
  titleEl.textContent = book.title;
  document.title = book.title + ' — ComPro Math 1';
  $('btnDownload').href = book.file;

  try {
    const task = pdfjsLib.getDocument(book.file);
    task.onProgress = ({ loaded, total }) => {
      if (total) loaderText.textContent = `กำลังเปิดหนังสือ… ${Math.round((loaded / total) * 100)}%`;
    };
    pdfDoc = await task.promise;
    numPages = pdfDoc.numPages;
    totalEl.textContent = numPages;
    rangeEl.max = numPages;
    spreadIndex = 0;
    await render();
    loaderEl.classList.add('hide');
  } catch (err) {
    console.error(err);
    loaderText.textContent = 'เปิดหนังสือไม่สำเร็จ ลองรีเฟรชอีกครั้ง';
  }
}

/* ---- Page math ---- */
function leftPageOf(s) { return 2 * s + 1; }
function maxSpread() { return Math.floor((numPages - 1) / 2); }
function currentFirstPage() { return twoPage ? leftPageOf(spreadIndex) : (spreadIndex + 1); }

/* ---- Rendering ---- */
async function renderPageCanvas(pageNum, fitScale) {
  const cacheId = `${pageNum}@${layoutKey}`;
  if (pageCache.has(cacheId)) return pageCache.get(cacheId);

  const page = await pdfDoc.getPage(pageNum);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = page.getViewport({ scale: fitScale * dpr });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = (viewport.width / dpr) + 'px';
  canvas.style.height = (viewport.height / dpr) + 'px';

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  pageCache.set(cacheId, canvas);
  return canvas;
}

async function render() {
  if (!pdfDoc || rendering) return;
  rendering = true;
  twoPage = false  /* single-page mode: one slide fills the view */;

  // Compute fit scale from a reference page (page 1 viewport at scale 1)
  const ref = await pdfDoc.getPage(1);
  const base = ref.getViewport({ scale: 1 });
  const pad = twoPage ? 140 : 24;
  const availW = stageEl.clientWidth - pad;
  const availH = stageEl.clientHeight - 52;
  const perPageW = twoPage ? availW / 2 : availW;
  let fit = Math.min(perPageW / base.width, availH / base.height);
  fit = Math.max(fit, 0.2) * zoom;

  layoutKey = `${Math.round(fit * 1000)}-${twoPage ? 2 : 1}`;

  // Which pages to show
  let pages;
  if (twoPage) {
    const l = leftPageOf(spreadIndex);
    pages = [l, l + 1 <= numPages ? l + 1 : null];
  } else {
    pages = [spreadIndex + 1];
  }

  // Render them
  const canvases = [];
  for (const p of pages) {
    if (p == null) { canvases.push(null); continue; }
    canvases.push(await renderPageCanvas(p, fit));
  }

  // Mount
  spreadEl.innerHTML = '';
  spreadEl.classList.toggle('two-page', twoPage && pages[1] != null);
  for (const c of canvases) {
    const slot = document.createElement('div');
    slot.className = 'page-slot';
    if (c) slot.appendChild(c);
    spreadEl.appendChild(slot);
  }

  updateChrome();
  rendering = false;
  prefetchNeighbors(fit);
}

function prefetchNeighbors(fit) {
  const step = twoPage ? 2 : 1;
  const next = currentFirstPage() + step;
  const prev = currentFirstPage() - step;
  [next, next + 1, prev].forEach((p) => {
    if (p >= 1 && p <= numPages) renderPageCanvas(p, fit).catch(() => {});
  });
}

function updateChrome() {
  const first = currentFirstPage();
  curEl.textContent = twoPage && first + 1 <= numPages ? `${first}–${first + 1}` : `${first}`;
  rangeEl.value = first;
  const atStart = spreadIndex <= 0;
  const atEnd = twoPage ? spreadIndex >= maxSpread() : spreadIndex >= numPages - 1;
  navPrev.disabled = $('btnPrev').disabled = atStart;
  navNext.disabled = $('btnNext').disabled = atEnd;
}

/* ---- Navigation ---- */
function go(dir) {
  const maxIdx = twoPage ? maxSpread() : numPages - 1;
  const next = Math.min(Math.max(spreadIndex + dir, 0), maxIdx);
  if (next === spreadIndex) return;
  spreadIndex = next;
  spreadEl.classList.remove('flip-next', 'flip-prev');
  void spreadEl.offsetWidth; // reflow to restart animation
  spreadEl.classList.add(dir > 0 ? 'flip-next' : 'flip-prev');
  render();
}

function goToPage(p) {
  p = Math.min(Math.max(p, 1), numPages);
  spreadIndex = twoPage ? Math.floor((p - 1) / 2) : (p - 1);
  render();
}

/* ---- Zoom ---- */
function setZoom(z) {
  zoom = Math.min(Math.max(z, 0.6), 2.4);
  pageCache.clear();
  render();
}

/* ---- Wire up controls ---- */
navPrev.onclick = $('btnPrev').onclick = () => go(-1);
navNext.onclick = $('btnNext').onclick = () => go(1);
$('btnZoomIn').onclick = () => setZoom(zoom + 0.2);
$('btnZoomOut').onclick = () => setZoom(zoom - 0.2);
rangeEl.oninput = (e) => goToPage(parseInt(e.target.value, 10));

$('btnFullscreen').onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  else if (e.key === 'Home') goToPage(1);
  else if (e.key === 'End') goToPage(numPages);
  else if (e.key === '+' || e.key === '=') setZoom(zoom + 0.2);
  else if (e.key === '-') setZoom(zoom - 0.2);
  else if (e.key.toLowerCase() === 'f') $('btnFullscreen').click();
});

// Re-render on resize (debounced), switching between 1 and 2 page layouts
let rsTimer;
window.addEventListener('resize', () => {
  clearTimeout(rsTimer);
  rsTimer = setTimeout(() => {
    const wasTwo = twoPage;
    const firstNow = currentFirstPage();
    pageCache.clear();
    twoPage = false  /* single-page mode: one slide fills the view */;
    if (wasTwo !== twoPage) spreadIndex = twoPage ? Math.floor((firstNow - 1) / 2) : (firstNow - 1);
    render();
  }, 180);
});

// Swipe on touch devices
let touchX = null;
stageEl.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
stageEl.addEventListener('touchend', (e) => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  touchX = null;
});
