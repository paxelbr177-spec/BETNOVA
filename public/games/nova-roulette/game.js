/* ============================================================
   Nova Roulette — ruleta europea para BetNova
   Rueda: @theblindhawk/roulette (licencia ISC) vía CDN.
   Mesa de apuestas, fichas, pagos y lógica: originales de BetNova.
   Solo demostración · saldo ficticio · sin dinero real.
   ============================================================ */
// La librería exporta la clase como DEFAULT (no como named export) → import por defecto.
import Roulette from 'https://cdn.jsdelivr.net/npm/@theblindhawk/roulette@3.1.1/+esm';

// ---- Datos de la ruleta europea ----
const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
  10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colorOf = (n) => (n === 0 ? 'green' : RED.has(n) ? 'red' : 'black');

// ---- Definición de apuestas: id -> {numbers[], payout (X:1), label} ----
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const colNumbers = (off) => Array.from({ length: 12 }, (_, k) => k * 3 + off); // off: 3=top,2=mid,1=bot
const BETS = {};
for (let n = 0; n <= 36; n++) BETS['straight:' + n] = { numbers: [n], payout: 35, label: 'Pleno ' + n };
BETS['red'] = { numbers: [...RED], payout: 1, label: 'Rojo' };
BETS['black'] = { numbers: range(1, 36).filter((n) => !RED.has(n)), payout: 1, label: 'Negro' };
BETS['even'] = { numbers: range(1, 36).filter((n) => n % 2 === 0), payout: 1, label: 'Par' };
BETS['odd'] = { numbers: range(1, 36).filter((n) => n % 2 === 1), payout: 1, label: 'Impar' };
BETS['low'] = { numbers: range(1, 18), payout: 1, label: '1-18' };
BETS['high'] = { numbers: range(19, 36), payout: 1, label: '19-36' };
BETS['dozen:1'] = { numbers: range(1, 12), payout: 2, label: '1ª docena' };
BETS['dozen:2'] = { numbers: range(13, 24), payout: 2, label: '2ª docena' };
BETS['dozen:3'] = { numbers: range(25, 36), payout: 2, label: '3ª docena' };
BETS['col:top'] = { numbers: colNumbers(3), payout: 2, label: 'Columna sup.' };
BETS['col:mid'] = { numbers: colNumbers(2), payout: 2, label: 'Columna med.' };
BETS['col:bot'] = { numbers: colNumbers(1), payout: 2, label: 'Columna inf.' };

// ---- Estado ----
let balance = 1000;
// Conexión con la billetera de BetNova (o demo local si va suelto/invitado)
if (window.NovaWallet) {
  NovaWallet.ready((b) => { balance = b; syncUI(); });
  NovaWallet.onBalance((b) => { balance = b; syncUI(); });
}
let chip = 5;
let spinning = false;
const placed = new Map(); // betId -> amount

// ---- Audio sintetizado (original) ----
let actx = null;
const ac = () => { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') actx.resume(); return actx; };
// Nota tonal con envolvente ADSR sencilla
function toneAt(t, f, dur, type, vol, glideTo) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
// Click corto (tic de la rueda / ficha)
function clickAt(t, f, vol) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'square'; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + 0.05);
}
// Ráfaga de ruido filtrada (whoosh)
function noiseBurst(dur, freq, q, vol) {
  const c = ac(); if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q || 1;
  const g = c.createGain();
  g.gain.setValueAtTime(vol || 0.15, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(bp); bp.connect(g); g.connect(c.destination);
  src.start(); src.stop(c.currentTime + dur);
}

const sndChip = () => { const c = ac(); if (!c) return; clickAt(c.currentTime, 880, 0.06); clickAt(c.currentTime + 0.03, 1280, 0.04); };

// Giro: whoosh inicial + tic-tic que desacelera (~4s), como una ruleta real
function sndSpin() {
  const c = ac(); if (!c) return;
  noiseBurst(0.45, 700, 0.8, 0.12);
  let t = c.currentTime + 0.12, interval = 0.045;
  const end = c.currentTime + 4.0;
  while (t < end) { clickAt(t, 1100, 0.045); interval *= 1.062; t += interval; }
}

// Premio: arpegio con osciladores ligeramente desafinados (más cuerpo)
function sndWin(big) {
  const c = ac(); if (!c) return;
  const notes = big ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    const t = c.currentTime + i * 0.11;
    toneAt(t, f, 0.4, 'triangle', 0.12);
    toneAt(t, f * 1.006, 0.4, 'triangle', 0.06); // detune para brillo
  });
  if (big) { const t = c.currentTime + notes.length * 0.11; clickAt(t, 1568, 0.07); clickAt(t + 0.08, 2093, 0.05); }
}

// Derrota: tono grave descendente, sutil
function sndLose() {
  const c = ac(); if (!c) return;
  toneAt(c.currentTime, 320, 0.32, 'sine', 0.08, 170);
}

// ---- DOM ----
const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildGrid() {
  const grid = $('#grid');
  // filas: top=3,6,..36 ; mid=2,5,..35 ; bot=1,4,..34
  const rows = [3, 2, 1];
  rows.forEach((off, rowIdx) => {
    for (let k = 0; k < 12; k++) {
      const num = k * 3 + off;
      const cell = document.createElement('div');
      cell.className = 'cell ' + colorOf(num);
      cell.dataset.bet = 'straight:' + num;
      cell.style.gridColumn = k + 1;
      cell.style.gridRow = rowIdx + 1;
      cell.textContent = num;
      grid.appendChild(cell);
    }
  });
}

function chipEl(amount) {
  const s = document.createElement('span');
  s.className = 'chip-stack';
  s.textContent = amount;
  return s;
}

function renderChips() {
  document.querySelectorAll('.chip-stack').forEach((e) => e.remove());
  placed.forEach((amount, betId) => {
    const el = document.querySelector(`[data-bet="${betId}"]`);
    if (el) el.appendChild(chipEl(amount));
  });
}

function totalBet() { let t = 0; placed.forEach((a) => (t += a)); return t; }

function syncUI() {
  $('#balance').textContent = fmt(balance);
  $('#totalBet').textContent = fmt(totalBet());
  $('#spinBtn').disabled = spinning || totalBet() === 0;
  document.querySelectorAll('.chipbtn').forEach((b) => b.classList.toggle('sel', +b.dataset.chip === chip));
}

function placeBet(betId) {
  if (spinning || !BETS[betId]) return;
  if (balance < chip) { setMsg('Saldo insuficiente para esa ficha.'); return; }
  balance = window.NovaWallet ? NovaWallet.bet(chip) : balance - chip;
  placed.set(betId, (placed.get(betId) || 0) + chip);
  sndChip();
  renderChips();
  syncUI();
  setMsg('');
}

function clearBets() {
  if (spinning) return;
  balance = window.NovaWallet ? NovaWallet.win(totalBet()) : balance + totalBet();
  placed.clear();
  renderChips();
  syncUI();
  setMsg('Apuestas retiradas.');
}

function setMsg(t, isErr) { const m = $('#message'); m.textContent = t; m.classList.toggle('err', !!isErr); }

function settle(winNum) {
  let win = 0;
  placed.forEach((amount, betId) => {
    const def = BETS[betId];
    if (def && def.numbers.includes(winNum)) win += amount * (def.payout + 1);
  });
  const col = colorOf(winNum);
  $('#result').innerHTML =
    `<span class="ball ${col}">${winNum}</span><span class="lbl">${col === 'green' ? 'Cero' : col === 'red' ? 'Rojo' : 'Negro'}${winNum === 0 ? '' : winNum % 2 ? ' · Impar' : ' · Par'}</span>`;
  if (win > 0) {
    balance = window.NovaWallet ? NovaWallet.win(win) : balance + win;
    $('#lastWin').textContent = fmt(win);
    const big = win >= totalBet() * 5;
    setMsg(`🎉 ¡Salió el ${winNum}! Ganaste ${fmt(win)}`);
    sndWin(big);
    if (window.Juice) { if (big) Juice.bigWin(win, { label: '¡GANASTE!', sub: '#' + winNum + ' ' + col }); else Juice.coins({ count: 50 }); }
  } else {
    $('#lastWin').textContent = fmt(0);
    setMsg(`Salió el ${winNum}. Sin premio esta vez.`);
    sndLose();
  }
  placed.clear();
  renderChips();
  spinning = false;
  syncUI();
}

// ---- Inicializar rueda ISC ----
let roulette = null;
function initWheel() {
  const sections = WHEEL.map((n) => ({
    value: n,
    background: colorOf(n) === 'green' ? '#1f9d57' : colorOf(n) === 'red' ? '#e3143c' : '#2a3346',
  }));
  roulette = new Roulette({
    container: $('#wheel'),
    sections,
    board: { radius: 150 }, // diámetro 300px → cabe centrado en la columna
    arrow: { element: 'sharp' },
    settings: { roll: { duration: 4200 } },
  });
  roulette.onstop = () => {
    // El número ganador ya lo decidimos nosotros (pendingWin); la rueda solo anima.
    settle(pendingWin);
  };
}

let pendingWin = 0;
function spin() {
  if (spinning || totalBet() === 0) return;
  spinning = true;
  syncUI();
  setMsg('Girando…');
  sndSpin();
  // "Modo casa": decidir si esta jugada PUEDE ganar.
  const canWin = (window.NovaHouse ? NovaHouse.allowWin() : true);
  // Conjunto de números cubiertos por alguna apuesta del jugador.
  const covered = new Set();
  placed.forEach((amount, betId) => {
    const def = BETS[betId];
    if (def) def.numbers.forEach((n) => covered.add(n));
  });
  const all = Array.from({ length: 37 }, (_, n) => n); // 0..36
  let pool;
  if (covered.size === 0) {
    pool = all; // sin apuestas: número totalmente aleatorio
  } else if (canWin) {
    pool = all.filter((n) => covered.has(n)); // garantiza un ganador
  } else {
    pool = all.filter((n) => !covered.has(n)); // pérdida garantizada
    if (pool.length === 0) pool = all; // por si las apuestas cubren todo 0..36
  }
  // Número ganador JUSTO e independiente del render
  pendingWin = pool[Math.floor(Math.random() * pool.length)];
  const idx = WHEEL.indexOf(pendingWin);
  try {
    roulette.rollByIndex(idx);
  } catch (e) {
    // Si la rueda fallara, resolvemos igual para no bloquear el juego
    console.error('wheel error', e);
    setTimeout(() => settle(pendingWin), 600);
  }
}

// ---- Arranque ----
function boot() {
  buildGrid();
  try {
    initWheel();
  } catch (e) {
    console.error('No se pudo cargar la rueda ISC:', e);
    $('#wheel').innerHTML = '<p class="err" style="padding:20px">No se pudo cargar la rueda. Revisa la conexión (CDN).</p>';
  }

  // Delegación de clicks en la mesa
  document.querySelectorAll('[data-bet]').forEach((el) =>
    el.addEventListener('click', () => placeBet(el.dataset.bet)));
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chipbtn'); if (!b) return; ac(); chip = +b.dataset.chip; syncUI();
  });
  $('#clearBtn').addEventListener('click', clearBets);
  $('#spinBtn').addEventListener('click', () => { ac(); spin(); });

  syncUI();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
