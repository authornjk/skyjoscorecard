/* =====================
   Skyjo — Kyle vs Nicole
   app.js
   ===================== */

const KEY = 'skyjo_v7';

/* ── Historical game data (from spreadsheet, cols B & C) ── */
const HISTORY = [
  { kyleScore: 115, nicoleScore: 81,  winner: 'Nicole' },
  { kyleScore: 110, nicoleScore: 114, winner: 'Kyle'   },
  { kyleScore: 106, nicoleScore: 100, winner: 'Nicole' },
  { kyleScore: 118, nicoleScore: 73,  winner: 'Nicole' },
  { kyleScore: 67,  nicoleScore: 101, winner: 'Kyle'   },
  { kyleScore: 100, nicoleScore: 78,  winner: 'Nicole' },
  { kyleScore: 59,  nicoleScore: 121, winner: 'Kyle'   },
  { kyleScore: 106, nicoleScore: 27,  winner: 'Nicole' },
  { kyleScore: 112, nicoleScore: 48,  winner: 'Nicole' },
  { kyleScore: 74,  nicoleScore: 111, winner: 'Kyle'   },
  { kyleScore: 78,  nicoleScore: 125, winner: 'Kyle'   },
  { kyleScore: 109, nicoleScore: 100, winner: 'Nicole' },
  { kyleScore: 103, nicoleScore: 87,  winner: 'Nicole' },
  { kyleScore: 97,  nicoleScore: 103, winner: 'Kyle'   },
  { kyleScore: 104, nicoleScore: 76,  winner: 'Nicole' },
  { kyleScore: 133, nicoleScore: 114, winner: 'Nicole' },
  { kyleScore: 90,  nicoleScore: 112, winner: 'Kyle'   },
  { kyleScore: 59,  nicoleScore: 100, winner: 'Kyle'   },
  { kyleScore: 99,  nicoleScore: 115, winner: 'Kyle'   },
  { kyleScore: 104, nicoleScore: 78,  winner: 'Nicole' },
  { kyleScore: 93,  nicoleScore: 103, winner: 'Kyle'   },
  { kyleScore: 103, nicoleScore: 91,  winner: 'Nicole' },
  { kyleScore: 108, nicoleScore: 103, winner: 'Nicole' },
  { kyleScore: 95,  nicoleScore: 123, winner: 'Kyle'   },
  { kyleScore: 111, nicoleScore: 78,  winner: 'Nicole' },
  { kyleScore: 80,  nicoleScore: 109, winner: 'Kyle'   },
  { kyleScore: 127, nicoleScore: 81,  winner: 'Nicole' },
  { kyleScore: 104, nicoleScore: 56,  winner: 'Nicole' },
  { kyleScore: 126, nicoleScore: 100, winner: 'Nicole' },
  { kyleScore: 109, nicoleScore: 142, winner: 'Kyle'   },
  { kyleScore: 64,  nicoleScore: 106, winner: 'Kyle'   },
  { kyleScore: 104, nicoleScore: 64,  winner: 'Nicole' },
  { kyleScore: 70,  nicoleScore: 108, winner: 'Kyle'   },
  { kyleScore: 129, nicoleScore: 116, winner: 'Nicole' },
  { kyleScore: 118, nicoleScore: 109, winner: 'Nicole' },
  { kyleScore: 124, nicoleScore: 79,  winner: 'Nicole' },
  { kyleScore: 105, nicoleScore: 109, winner: 'Kyle'   },
  { kyleScore: 95,  nicoleScore: 100, winner: 'Kyle'   },
  { kyleScore: 118, nicoleScore: 101, winner: 'Nicole' },
  { kyleScore: 120, nicoleScore: 80,  winner: 'Nicole' },
  { kyleScore: 123, nicoleScore: 83,  winner: 'Nicole' },
];

/* ── State ── */
function defaultState() {
  const games = HISTORY.map(g => ({
    date: '',
    kyleScore: g.kyleScore,
    nicoleScore: g.nicoleScore,
    winner: g.winner,
    rounds: 0,
    dealer: null,
  }));
  return {
    kyleWins: 17,
    nicoleWins: 24,
    kyleTotalPts: 4169,
    nicoleTotalPts: 3905,
    games,
    rounds: [],
    dealer: null,
    active: 'kyle',
  };
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.kyleWins !== undefined) return s;
  } catch (e) {}
  return defaultState();
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(S));
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── App state ── */
let S = loadState();
let kpVal = '';
let editMode = null; // { roundIdx, player } | null
let confettiPieces = [];
let confettiAnim = null;

/* ── Score helpers ── */
function completeRounds() { return S.rounds.filter(r => r.nicole !== null); }
function kyleTotal()   { return completeRounds().reduce((a, r) => a + r.kyle,   0); }
function nicoleTotal() { return completeRounds().reduce((a, r) => a + r.nicole, 0); }

/* ── Player selection ── */
function selectPlayer(p) {
  if (editMode) return;
  S.active = p;
  kpVal = '';
  save();
  updateKPDisplay();
  updateLabel();
  document.getElementById('card-kyle').classList.toggle('selected',   p === 'kyle');
  document.getElementById('card-nicole').classList.toggle('selected', p === 'nicole');
}

/* ── Keypad ── */
function kp(d) {
  if (kpVal.replace('-', '').length >= 3) return;
  if (d === '0' && (kpVal === '' || kpVal === '-')) kpVal += '0';
  else if (kpVal === '0') kpVal = d;
  else kpVal += d;
  updateKPDisplay();
}
function kpNeg()  { kpVal = kpVal.startsWith('-') ? kpVal.slice(1) : '-' + kpVal; updateKPDisplay(); }
function kpBack() { kpVal = kpVal.slice(0, -1); updateKPDisplay(); }
function kpClear(){ kpVal = ''; updateKPDisplay(); }

function kpEnter() {
  const v = parseInt(kpVal);
  if (kpVal === '' || kpVal === '-' || isNaN(v)) return;

  /* Editing an existing score */
  if (editMode !== null) {
    S.rounds[editMode.roundIdx][editMode.player] = v;
    editMode = null;
    kpVal = '';
    save();
    updateAll();
    exitEditUI();
    return;
  }

  /* Normal entry */
  if (S.active === 'kyle') {
    S.rounds.push({ kyle: v, nicole: null });
    S.active = 'nicole';
  } else {
    S.rounds[S.rounds.length - 1].nicole = v;
    S.active = 'kyle';
  }
  kpVal = '';
  save();
  updateAll();

  /* Check for game end after Nicole's score is saved */
  if (S.active === 'kyle') {
    const kt = kyleTotal(), nt = nicoleTotal();
    if (kt >= 100 || nt >= 100) triggerWin(kt, nt);
  }
}

/* ── Edit mode ── */
function startEdit(roundIdx, player) {
  editMode = { roundIdx, player };
  kpVal = String(S.rounds[roundIdx][player]);
  updateKPDisplay();
  document.getElementById('kp-display').classList.add('editing');
  const pname = player === 'kyle' ? 'Kyle' : 'Nicole';
  document.getElementById('kp-who').innerHTML =
    `Editing R${roundIdx + 1} · <span style="color:#BA7517">${pname}</span>`;
  document.getElementById('cancel-edit-btn').style.display = 'flex';
  document.getElementById('clear-btn').style.display = 'none';
  document.getElementById('enter-btn').textContent = 'Save';
  renderRounds();
}

function cancelEdit() {
  editMode = null;
  kpVal = '';
  updateKPDisplay();
  updateLabel();
  exitEditUI();
}

function exitEditUI() {
  document.getElementById('kp-display').classList.remove('editing');
  document.getElementById('cancel-edit-btn').style.display = 'none';
  document.getElementById('clear-btn').style.display = 'flex';
  document.getElementById('enter-btn').textContent = 'Enter';
  updateLabel();
}

function updateKPDisplay() {
  document.getElementById('kp-display').textContent = kpVal === '' ? '—' : kpVal;
}

function updateLabel() {
  if (editMode) return;
  const pending = S.rounds.length > 0 && S.rounds[S.rounds.length - 1].nicole === null;
  const dispRnd = (pending && S.active === 'nicole')
    ? S.rounds.length
    : completeRounds().length + 1;
  document.getElementById('kp-who').innerHTML =
    `${S.active === 'kyle' ? 'Kyle' : 'Nicole'} &middot; Round ${dispRnd}`;
}

/* ── Dealer bar ── */
function updateDealerBar() {
  const bar = document.getElementById('dealer-bar');
  if (!S.dealer) { bar.classList.remove('show'); return; }
  bar.classList.add('show');
  document.getElementById('dealer-name').textContent = S.dealer === 'kyle' ? 'Kyle' : 'Nicole';
  document.getElementById('card-kyle').classList.toggle('dealing',   S.dealer === 'kyle');
  document.getElementById('card-nicole').classList.toggle('dealing', S.dealer === 'nicole');
}

/* ── Main update ── */
function updateAll() {
  const kt = kyleTotal(), nt = nicoleTotal();
  const rndCount = completeRounds().length;

  /* Shrink score font as game progresses */
  const fontSize = Math.max(24, 40 - rndCount * 1.8);
  document.querySelectorAll('.ptotal').forEach(el => el.style.fontSize = fontSize + 'px');
  const pad = Math.max(.5, .85 - rndCount * .035);
  document.querySelectorAll('.player-card').forEach(el => el.style.padding = `${pad}rem .85rem`);

  document.getElementById('kyle-total').textContent   = kt;
  document.getElementById('nicole-total').textContent = nt;
  document.getElementById('card-kyle').classList.toggle('winning',   kt < nt && rndCount > 0);
  document.getElementById('card-nicole').classList.toggle('winning', nt < kt && rndCount > 0);

  function setTag(id, val) {
    const el  = document.getElementById(id);
    const rem = 100 - val;
    if (val >= 100)     { el.textContent = 'Over 100!';      el.className = 'p-tag danger'; }
    else if (val > 0)   { el.textContent = `${rem} to 100`;  el.className = 'p-tag' + (val >= 75 ? ' warn' : ''); }
    else                { el.textContent = '';                el.className = 'p-tag'; }
  }
  setTag('kyle-tag',   kt);
  setTag('nicole-tag', nt);

  if (!editMode) { updateLabel(); selectPlayer(S.active); }
  renderRounds();
  updateDealerBar();
}

/* ── Round table ── */
function renderRounds() {
  const sec   = document.getElementById('rounds-section');
  const tbody = document.getElementById('round-tbody');
  if (S.rounds.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = '';

  let kr = 0, nr = 0;
  tbody.innerHTML = S.rounds.map((r, i) => {
    const complete = r.nicole !== null;
    if (complete) { kr += r.kyle; nr += r.nicole; }

    const kl = complete && kr < nr;
    const nl = complete && nr < kr;
    const kScore = complete ? r.kyle   : '?';
    const nScore = complete ? r.nicole : '—';
    const kRem   = complete ? 100 - kr : '';
    const nRem   = complete ? 100 - nr : '';

    const kSubClass = complete ? (kr >= 100 ? 'sub danger' : kr >= 75 ? 'sub warn' : 'sub lead') : 'sub';
    const nSubClass = complete ? (nr >= 100 ? 'sub danger' : nr >= 75 ? 'sub warn' : 'sub lead') : 'sub';
    const kRemText  = complete ? (kr >= 100 ? 'over!'  : kRem + ' left') : '';
    const nRemText  = complete ? (nr >= 100 ? 'over!'  : nRem + ' left') : '';

    const isEdit = editMode && editMode.roundIdx === i;
    const kEdit  = isEdit && editMode.player === 'kyle';
    const nEdit  = isEdit && editMode.player === 'nicole';
    const nClick = complete ? `startEdit(${i},'nicole')` : 'void(0)';

    return `<tr class="${isEdit ? 'editing-row' : ''}" id="rrow-${i}">
      <td>R${i + 1}</td>
      <td class="${kl ? 'lead' : ''} ${kEdit ? 'pending-cell' : ''}" onclick="startEdit(${i},'kyle')">${kScore}</td>
      <td class="${kSubClass}">${kRemText}</td>
      <td class="${nl ? 'lead' : ''} ${nEdit ? 'pending-cell' : ''}" onclick="${nClick}">${nScore}</td>
      <td class="${nSubClass}">${nRemText}</td>
    </tr>`;
  }).join('');
}

/* ── Win / game end ── */
function triggerWin(kt, nt) {
  const winner = kt < nt ? 'Kyle' : nt < kt ? 'Nicole' : 'Tie';
  const loser  = winner === 'Kyle' ? 'Nicole' : 'Kyle';

  if (winner === 'Kyle')   S.kyleWins++;
  if (winner === 'Nicole') S.nicoleWins++;
  S.kyleTotalPts   += kt;
  S.nicoleTotalPts += nt;

  S.games.push({
    date:        todayStr(),
    kyleScore:   kt,
    nicoleScore: nt,
    winner,
    rounds:      completeRounds().length,
    dealer:      S.dealer,
  });

  const nextDealer = S.dealer === 'kyle' ? 'nicole' : 'kyle';
  const nextName   = nextDealer === 'kyle' ? 'Kyle' : 'Nicole';
  const winColor   = winner === 'Kyle' ? '#2A8A4A' : '#C05A10';

  const mw = document.getElementById('m-winner');
  mw.style.color  = winColor;
  mw.textContent  = winner === 'Tie' ? "It's a tie!" : `${winner} wins!`;

  document.getElementById('m-sub').textContent =
    winner === 'Tie'
      ? `Both at ${kt} pts`
      : `${loser} hit ${winner === 'Kyle' ? nt : kt} · ${winner} had ${winner === 'Kyle' ? kt : nt}`;

  document.getElementById('m-detail').innerHTML =
    `<div class="mdi"><div class="dn">Kyle</div><div class="ds">${kt}</div></div>
     <div class="mdi" style="font-size:18px;color:#aaa;align-self:center">vs</div>
     <div class="mdi"><div class="dn">Nicole</div><div class="ds">${nt}</div></div>`;

  document.getElementById('next-dealer-note').innerHTML =
    `<strong>${nextName}</strong> deals next game`;

  save();
  renderRecord();
  document.getElementById('win-modal').classList.add('open');
  if (winner !== 'Tie') launchConfetti();
}

function startNewGame() {
  S.dealer  = S.dealer === 'kyle' ? 'nicole' : 'kyle';
  S.rounds  = [];
  S.active  = 'kyle';
  kpVal     = '';
  editMode  = null;
  save();
  closeModal('win-modal');
  stopConfetti();
  exitEditUI();
  updateAll();
}

function setFirstDealer(p) {
  S.dealer = p;
  save();
  closeModal('dealer-modal');
  updateDealerBar();
}

/* ── Confetti ── */
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const wrap   = document.getElementById('main-wrap');
  canvas.width  = wrap.offsetWidth  || 380;
  canvas.height = wrap.offsetHeight || 600;
  const ctx    = canvas.getContext('2d');
  const colors = ['#0ABFA3','#047A6A','#FFD700','#FF6B6B','#5DD6C4','#ffffff','#F0A500','#9BE5D8'];

  confettiPieces = Array.from({ length: 130 }, () => ({
    x:          Math.random() * canvas.width,
    y:          -20 - Math.random() * 100,
    r:          5 + Math.random() * 6,
    d:          Math.random() * 80 + 60,
    color:      colors[Math.floor(Math.random() * colors.length)],
    tiltAngle:  0,
    tiltSpeed:  .05 + Math.random() * .1,
    speed:      2 + Math.random() * 3,
    rotation:   Math.random() * 360,
    rotSpeed:   (Math.random() - .5) * 6,
    shape:      Math.random() > .5 ? 'rect' : 'circle',
  }));

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = .88;
      if (p.shape === 'rect') ctx.fillRect(-p.r / 2, -p.r * .8, p.r, p.r * 1.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      p.y          += p.speed;
      p.x          += Math.sin(tick * .02 + p.d) * 1.2;
      p.rotation   += p.rotSpeed;
      p.tiltAngle  += p.tiltSpeed;
    });
    tick++;
    confettiPieces = confettiPieces.filter(p => p.y < canvas.height + 40);
    if (confettiPieces.length > 0) confettiAnim = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (confettiAnim) cancelAnimationFrame(confettiAnim);
  draw();
}

function stopConfetti() {
  if (confettiAnim) { cancelAnimationFrame(confettiAnim); confettiAnim = null; }
  const c = document.getElementById('confetti-canvas');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

/* ── Record tab ── */
function renderRecord() {
  const total = S.kyleWins + S.nicoleWins;
  document.getElementById('r-kw').textContent  = S.kyleWins;
  document.getElementById('r-nw').textContent  = S.nicoleWins;
  document.getElementById('r-kwp').textContent = total ? Math.round(S.kyleWins   / total * 100) + '% win rate' : '';
  document.getElementById('r-nwp').textContent = total ? Math.round(S.nicoleWins / total * 100) + '% win rate' : '';
  document.getElementById('r-kp').textContent  = S.kyleTotalPts;
  document.getElementById('r-np').textContent  = S.nicoleTotalPts;
  document.getElementById('r-gp').textContent  = total;
  const leader = S.kyleWins > S.nicoleWins ? 'Kyle' : S.nicoleWins > S.kyleWins ? 'Nicole' : 'Tied';
  document.getElementById('r-leader').textContent  = leader;
  document.getElementById('r-lead-d').textContent  = S.kyleWins + ' – ' + S.nicoleWins;
}

/* ── History tab ── */
function renderHistory() {
  const el = document.getElementById('game-history');
  if (!S.games || S.games.length === 0) {
    el.innerHTML = '<div class="empty">No games yet</div>';
    return;
  }
  el.innerHTML = [...S.games].reverse().map(g => {
    const isKyle   = g.winner === 'Kyle';
    const isNicole = g.winner === 'Nicole';
    const cardClass = isKyle ? 'kyle-won' : isNicole ? 'nicole-won' : 'tied';
    const winClass  = isKyle ? 'kyle'     : isNicole ? 'nicole'     : 'tied';
    const winText   = isKyle ? 'Kyle won' : isNicole ? 'Nicole won' : 'Tie';
    const meta = [
      g.date || null,
      g.rounds ? g.rounds + ' rounds' : null,
      g.dealer ? 'dealt by ' + (g.dealer === 'kyle' ? 'Kyle' : 'Nicole') : null,
    ].filter(Boolean).join(' · ');

    return `<div class="hist-item ${cardClass}">
      <div class="hist-top">
        <span class="hist-date">${meta || 'Earlier game'}</span>
        <span class="hist-win ${winClass}">${winText}</span>
      </div>
      <div class="hist-sc">Kyle: ${g.kyleScore} · Nicole: ${g.nicoleScore}</div>
    </div>`;
  }).join('');
}

/* ── Reset ── */
function confirmReset() { document.getElementById('reset-modal').classList.add('open'); }
function doReset() {
  S.rounds = []; S.active = 'kyle'; kpVal = ''; editMode = null;
  save();
  closeModal('reset-modal');
  stopConfetti();
  exitEditUI();
  updateAll();
}

/* ── Modal helpers ── */
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ── Tab switching ── */
function switchTab(t) {
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  ['game', 'record', 'history'].forEach((n, i) => {
    if (n === t) {
      document.querySelectorAll('.tab')[i].classList.add('active');
      document.getElementById('tab-' + t).classList.add('active');
    }
  });
  if (t === 'record')  renderRecord();
  if (t === 'history') renderHistory();
}

/* ── Boot ── */
updateAll();
renderRecord();
if (!S.dealer) {
  setTimeout(() => document.getElementById('dealer-modal').classList.add('open'), 300);
}

/* ── PWA service worker registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
