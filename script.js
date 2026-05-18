// ── Constantes da roleta europeia ────────────────────────────────────────────
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const NUM_SECTORS    = WHEEL_ORDER.length;
const SECTOR_ANGLE   = (2 * Math.PI) / NUM_SECTORS;
const STARTING_BALANCE = 1000;
const CANVAS_SIZE    = 340;

// ── Probabilidades (manipuladas — finalidade educativa) ──────────────────────
// Rodadas 1-2: alta chance para fisgar. Depois o cassino domina.
const WIN_RATES = { early: 0.78, mid: 0.22, late: 0.14 };

const LOSS_MSGS = [
  "Quase! A bola passou um número do vermelho!",
  "Incrível — você estava tão perto dessa vez!",
  "Não desanime! Sua sequência de vitórias vem aí!",
  "O azar não dura para sempre. Continue!",
  "Tente dobrar a aposta na próxima para recuperar!",
  "As probabilidades estão melhorando para você!",
  "Você foi azarado desta vez. A próxima é sua!",
  "A roleta é imprevisível — a sorte vai virar!",
];
const WIN_MSGS = [
  "Parabéns! Continue apostando enquanto está quente!",
  "Vitória! A sorte está do seu lado hoje!",
  "Incrível! Aproveite o embalo e jogue mais!",
  "Você está em chama! Continue enquanto pode!",
];
const NEAR_MISS_MSGS = [
  "Quase! O número anterior era o certo!",
  "A bola parou na borda — tão perto!",
  "Um número de diferença! Que azar!",
  "Passou correndo pelo seu número!",
];

// ── Estado ────────────────────────────────────────────────────────────────────
const state = {
  balance: STARTING_BALANCE,
  totalLost: 0,
  totalWon: 0,
  round: 0,
  betAmount: 50,
  betColor: "red",
  spinning: false,
  wheelAngle: 0,
  history: [],
};

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const startScreen     = $("start-screen");
const gameScreen      = $("game-screen");
const gameoverScreen  = $("gameover-screen");
const balanceEl       = $("balance");
const roundNumberEl   = $("round-number");
const totalLostEl     = $("total-lost");
const resultBox       = $("result-box");
const resultIcon      = $("result-icon");
const resultText      = $("result-text");
const historyStrip    = $("history-strip");
const potentialWinEl  = $("potential-win");
const spinButton      = $("spin-button");
const canvas          = $("roulette-canvas");
const ctx             = canvas.getContext("2d");

// ── Helpers de cor ─────────────────────────────────────────────────────────
function numberColor(n) {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

function sectorFill(n) {
  if (n === 0) return "#1a7a3a";
  return RED_NUMBERS.has(n) ? "#b82020" : "#111111";
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Desenho do canvas ────────────────────────────────────────────────────────
function drawWheel(angle) {
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const outerR = CANVAS_SIZE / 2 - 6;
  const textR  = outerR * 0.80;
  const hubR   = outerR * 0.20;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Fundo escuro com sombra
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = "#080808";
  ctx.fill();
  ctx.restore();

  // Setores coloridos
  for (let i = 0; i < NUM_SECTORS; i++) {
    const num    = WHEEL_ORDER[i];
    const startA = angle + i * SECTOR_ANGLE - Math.PI / 2;
    const endA   = startA + SECTOR_ANGLE;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR - 3, startA, endA);
    ctx.closePath();
    ctx.fillStyle = sectorFill(num);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR - 3, startA, endA);
    ctx.closePath();
    ctx.strokeStyle = "rgba(212,175,55,0.45)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Número
    const midA = startA + SECTOR_ANGLE / 2;
    const tx = cx + textR * Math.cos(midA);
    const ty = cy + textR * Math.sin(midA);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(midA + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 10px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(num.toString(), 0, 0);
    ctx.restore();
  }

  // Anel externo dourado
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 1, 0, Math.PI * 2);
  ctx.strokeStyle = "#8b6914";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hub central
  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
  ctx.fillStyle = "#d4af37";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, hubR * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = "#8b6914";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, hubR * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = "#d4af37";
  ctx.fill();

  // Raios decorativos
  for (let i = 0; i < NUM_SECTORS; i++) {
    const a = angle + i * SECTOR_ANGLE - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + hubR * Math.cos(a), cy + hubR * Math.sin(a));
    ctx.lineTo(cx + (outerR - 14) * Math.cos(a), cy + (outerR - 14) * Math.sin(a));
    ctx.strokeStyle = "rgba(212,175,55,0.15)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

// ── Animação ──────────────────────────────────────────────────────────────────
function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

function computeTargetAngle(targetIndex) {
  const desired = ((-targetIndex * SECTOR_ANGLE - SECTOR_ANGLE / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const current = (state.wheelAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  let delta = desired - current;
  if (delta < 0.05) delta += Math.PI * 2;
  return state.wheelAngle + (6 + Math.floor(Math.random() * 4)) * Math.PI * 2 + delta;
}

function spinTo(targetIndex, onComplete) {
  const startAngle = state.wheelAngle;
  const endAngle   = computeTargetAngle(targetIndex);
  const duration   = 5000 + Math.random() * 1200;
  const t0         = performance.now();

  function frame(now) {
    const t = Math.min((now - t0) / duration, 1);
    state.wheelAngle = startAngle + (endAngle - startAngle) * easeOut(t);
    drawWheel(state.wheelAngle);
    if (t < 1) requestAnimationFrame(frame);
    else { state.wheelAngle = endAngle; drawWheel(endAngle); onComplete(); }
  }
  requestAnimationFrame(frame);
}

// ── Lógica de probabilidade ───────────────────────────────────────────────────
function getWinRate() {
  if (state.round <= 2) return WIN_RATES.early;
  if (state.round <= 7) return WIN_RATES.mid;
  return WIN_RATES.late;
}

function pickTargetIndex(shouldWin) {
  const all = WHEEL_ORDER.map((n, i) => ({ n, i }));

  if (shouldWin) {
    const winners = all.filter(({ n }) => numberColor(n) === state.betColor);
    return pick(winners).i;
  }

  // Near miss (40% das derrotas): para ao lado de um número vencedor
  if (Math.random() < 0.4) {
    const winPos = all.filter(({ n }) => numberColor(n) === state.betColor).map(({ i }) => i);
    const ref    = pick(winPos);
    const adj    = Math.random() < 0.5 ? (ref - 1 + NUM_SECTORS) % NUM_SECTORS : (ref + 1) % NUM_SECTORS;
    if (numberColor(WHEEL_ORDER[adj]) !== state.betColor) return adj;
  }

  const losers = all.filter(({ n }) => numberColor(n) !== state.betColor);
  return pick(losers).i;
}

// ── Rodada ────────────────────────────────────────────────────────────────────
function playRound() {
  if (state.spinning) return;
  if (state.balance < state.betAmount) { showGameOver(); return; }

  state.spinning = true;
  state.balance -= state.betAmount;
  state.round += 1;

  spinButton.disabled = true;
  spinButton.textContent = "⏳ Girando…";
  resultBox.classList.add("is-hidden");
  updateUI();

  const shouldWin   = Math.random() < getWinRate();
  const targetIndex = pickTargetIndex(shouldWin);
  const landedNum   = WHEEL_ORDER[targetIndex];
  const landedColor = numberColor(landedNum);
  const didWin      = landedColor === state.betColor;

  spinTo(targetIndex, () => {
    state.spinning = false;

    if (didWin) {
      state.balance  += state.betAmount * 2;
      state.totalWon += state.betAmount;
    } else {
      state.totalLost += state.betAmount;
    }

    showResult(landedNum, landedColor, didWin);
    addHistory(landedNum);
    updateUI();
    updateBetButtons();

    spinButton.disabled = false;
    spinButton.textContent = "🎲 Girar Roleta";

    if (state.balance < 50) setTimeout(showGameOver, 1600);
  });
}

// ── Exibição de resultado ─────────────────────────────────────────────────────
function isNearMiss(num) {
  const pos  = WHEEL_ORDER.indexOf(num);
  const prev = WHEEL_ORDER[(pos - 1 + NUM_SECTORS) % NUM_SECTORS];
  const next = WHEEL_ORDER[(pos + 1) % NUM_SECTORS];
  return numberColor(prev) === state.betColor || numberColor(next) === state.betColor;
}

function showResult(num, color, didWin) {
  resultBox.classList.remove("is-hidden", "is-win", "is-loss");
  const colorLabel =
    color === "red"   ? "🔴 Vermelho" :
    color === "black" ? "⚫ Preto"    : "🟢 Zero";

  if (didWin) {
    resultBox.classList.add("is-win");
    resultIcon.textContent = "🏆";
    resultText.textContent = `${num} — ${colorLabel} • +R$ ${state.betAmount.toLocaleString("pt-BR")} • ${pick(WIN_MSGS)}`;
    spawnConfetti();
  } else {
    resultBox.classList.add("is-loss");
    resultIcon.textContent = "💔";
    const msgs = isNearMiss(num) ? NEAR_MISS_MSGS : LOSS_MSGS;
    resultText.textContent = `${num} — ${colorLabel} • -R$ ${state.betAmount.toLocaleString("pt-BR")} • ${pick(msgs)}`;
  }
}

// ── Histórico de números ──────────────────────────────────────────────────────
function addHistory(num) {
  state.history.unshift(num);
  if (state.history.length > 14) state.history.pop();
  historyStrip.innerHTML = "";
  state.history.forEach(n => {
    const dot = document.createElement("span");
    dot.className = `history-dot history-${numberColor(n)}`;
    dot.textContent = n;
    dot.setAttribute("aria-label", `${n} ${numberColor(n)}`);
    historyStrip.append(dot);
  });
}

// ── UI ────────────────────────────────────────────────────────────────────────
function updateUI() {
  balanceEl.textContent     = `R$ ${state.balance.toLocaleString("pt-BR")}`;
  roundNumberEl.textContent  = state.round;
  totalLostEl.textContent   = `R$ ${state.totalLost.toLocaleString("pt-BR")}`;
  potentialWinEl.textContent = `R$ ${(state.betAmount * 2).toLocaleString("pt-BR")}`;
}

function updateBetButtons() {
  document.querySelectorAll(".chip").forEach(btn => {
    const val = parseInt(btn.dataset.value);
    btn.classList.toggle("is-selected", val === state.betAmount);
    btn.setAttribute("aria-pressed", val === state.betAmount ? "true" : "false");
    btn.disabled = val > state.balance;
  });
}

// ── Telas ─────────────────────────────────────────────────────────────────────
function showGame() {
  Object.assign(state, {
    balance: STARTING_BALANCE, totalLost: 0, totalWon: 0, round: 0,
    betAmount: 50, betColor: "red", spinning: false, history: [],
  });

  startScreen.classList.add("is-hidden");
  gameoverScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  resultBox.classList.add("is-hidden");
  historyStrip.innerHTML = "";
  spinButton.disabled = false;
  spinButton.textContent = "🎲 Girar Roleta";

  $("bet-red").classList.add("is-selected");
  $("bet-red").setAttribute("aria-pressed", "true");
  $("bet-black").classList.remove("is-selected");
  $("bet-black").setAttribute("aria-pressed", "false");

  updateUI();
  updateBetButtons();
  drawWheel(state.wheelAngle);
}

function showStart() {
  gameScreen.classList.add("is-hidden");
  gameoverScreen.classList.add("is-hidden");
  startScreen.classList.remove("is-hidden");
}

function showGameOver() {
  gameScreen.classList.add("is-hidden");
  gameoverScreen.classList.remove("is-hidden");
  const net = state.balance - STARTING_BALANCE;
  $("go-stats").innerHTML = `
    <div class="stat-row"><span>Rodadas jogadas</span><strong>${state.round}</strong></div>
    <div class="stat-row"><span>Total apostado</span><strong>R$ ${(state.totalLost + state.totalWon).toLocaleString("pt-BR")}</strong></div>
    <div class="stat-row"><span>Total ganho</span><strong class="win-text">R$ ${state.totalWon.toLocaleString("pt-BR")}</strong></div>
    <div class="stat-row"><span>Total perdido</span><strong class="loss-text">R$ ${state.totalLost.toLocaleString("pt-BR")}</strong></div>
    <div class="stat-row"><span>Resultado líquido</span><strong class="${net >= 0 ? "win-text" : "loss-text"}">R$ ${net.toLocaleString("pt-BR")}</strong></div>
  `;
}

// ── Confete ───────────────────────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ["#d4af37", "#f0d060", "#b82020", "#e74c3c", "#ffffff", "#4caf74"];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = [
      `left:${Math.random() * 100}%`,
      `background:${pick(colors)}`,
      `animation-delay:${Math.random() * 0.5}s`,
      `animation-duration:${0.9 + Math.random() * 0.9}s`,
      `width:${6 + Math.random() * 6}px`,
      `height:${6 + Math.random() * 6}px`,
      `border-radius:${Math.random() > 0.5 ? "50%" : "2px"}`,
    ].join(";");
    document.body.append(el);
    setTimeout(() => el.remove(), 2200);
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────
$("start-button").addEventListener("click", showGame);
$("restart-button").addEventListener("click", showStart);
$("play-again-button").addEventListener("click", showGame);
$("go-restart-button").addEventListener("click", showStart);
spinButton.addEventListener("click", playRound);

$("chip-row").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn || state.spinning || btn.disabled) return;
  state.betAmount = parseInt(btn.dataset.value);
  updateBetButtons();
  updateUI();
});

document.querySelector(".color-bet-row").addEventListener("click", e => {
  const btn = e.target.closest(".color-bet");
  if (!btn || state.spinning) return;
  state.betColor = btn.dataset.color;
  document.querySelectorAll(".color-bet").forEach(b => {
    b.classList.toggle("is-selected", b === btn);
    b.setAttribute("aria-pressed", b === btn ? "true" : "false");
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
drawWheel(0);
