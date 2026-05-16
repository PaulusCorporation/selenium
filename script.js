const animals = [
  { name: "Panda", emoji: "🐼" },
  { name: "Gavião", emoji: "🦅" },
  { name: "Onça", emoji: "🐆" },
  { name: "Leão", emoji: "🦁" },
  { name: "Coelho", emoji: "🐰" },
];

const boostedRounds = new Set([1, 2, 4, 6, 7]);
const boostedWinChance = 0.65;
const regularWinChance = 0.1851;
const boardSize = 3;
const initialGrid = [
  animals[0].emoji,
  animals[1].emoji,
  animals[2].emoji,
  animals[3].emoji,
  animals[4].emoji,
  animals[0].emoji,
  animals[1].emoji,
  animals[2].emoji,
  animals[3].emoji,
];

const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const startButton = document.querySelector("#start-button");
const playAgainButton = document.querySelector("#play-again-button");
const restartButton = document.querySelector("#restart-button");
const boardElement = document.querySelector("#board");
const resultMessage = document.querySelector("#result-message");
const roundNumber = document.querySelector("#round-number");

const state = {
  round: 0,
  grid: [],
  winningCells: [],
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function currentWinChance() {
  const nextRound = state.round + 1;
  return boostedRounds.has(nextRound) ? boostedWinChance : regularWinChance;
}

function shouldForceWin() {
  return Math.random() < currentWinChance();
}

function createRandomGrid() {
  return Array.from({ length: boardSize * boardSize }, () => randomItem(animals).emoji);
}

function lineIndexes(lineType, index) {
  if (lineType === "row") {
    const start = index * boardSize;
    return [start, start + 1, start + 2];
  }

  if (lineType === "main-diagonal") {
    return [0, 4, 8];
  }

  return [2, 4, 6];
}

function winningLines() {
  return [
    lineIndexes("row", 0),
    lineIndexes("row", 1),
    lineIndexes("row", 2),
    lineIndexes("main-diagonal"),
    lineIndexes("secondary-diagonal"),
  ];
}

function findWinningCells(grid) {
  const winning = new Set();

  winningLines().forEach((line) => {
    if (line.every((cellIndex) => grid[cellIndex] === grid[line[0]])) {
      line.forEach((cellIndex) => winning.add(cellIndex));
    }
  });

  return [...winning];
}

function createWinningGrid() {
  const grid = createRandomGrid();
  const winningLine = randomItem(winningLines());
  const winningAnimal = randomItem(animals).emoji;

  winningLine.forEach((cellIndex) => {
    grid[cellIndex] = winningAnimal;
  });

  return grid;
}

function createLosingGrid() {
  let grid = createRandomGrid();
  let attempts = 0;

  while (findWinningCells(grid).length > 0 && attempts < 500) {
    grid = createRandomGrid();
    attempts += 1;
  }

  if (findWinningCells(grid).length === 0) {
    return grid;
  }

  return [
    animals[0].emoji,
    animals[1].emoji,
    animals[2].emoji,
    animals[3].emoji,
    animals[4].emoji,
    animals[0].emoji,
    animals[1].emoji,
    animals[2].emoji,
    animals[3].emoji,
  ];
}

function renderBoard() {
  boardElement.innerHTML = "";

  state.grid.forEach((emoji, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", animals.find((animal) => animal.emoji === emoji).name);
    cell.textContent = emoji;

    if (state.winningCells.includes(index)) {
      cell.classList.add("is-winning");
    }

    boardElement.append(cell);
  });
}

function updateResult() {
  const didWin = state.winningCells.length > 0;
  resultMessage.classList.remove("is-hidden");
  resultMessage.classList.toggle("is-win", didWin);
  resultMessage.classList.toggle("is-loss", !didWin);
  resultMessage.textContent = didWin
    ? "Você ganhou! Jogue de novo para tentar outra combinação."
    : "Não foi dessa vez. Jogue de novo e tente acertar uma linha ou diagonal.";
}

function updateStats() {
  roundNumber.textContent = state.round;
}

function playRound() {
  const forceWin = shouldForceWin();
  state.grid = forceWin ? createWinningGrid() : createLosingGrid();
  state.winningCells = findWinningCells(state.grid);
  state.round += 1;

  renderBoard();
  updateResult();
  updateStats();
  playAgainButton.textContent = "Jogar de novo";
}

function showGame() {
  startScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  state.grid = [...initialGrid];
  state.winningCells = [];
  renderBoard();
  resultMessage.className = "result-message is-hidden";
  resultMessage.textContent = "";
  playAgainButton.textContent = "Jogar";
  updateStats();
}

function showStart() {
  state.round = 0;
  state.grid = [];
  state.winningCells = [];
  gameScreen.classList.add("is-hidden");
  startScreen.classList.remove("is-hidden");
  boardElement.innerHTML = "";
  resultMessage.className = "result-message is-hidden";
  resultMessage.textContent = "";
  playAgainButton.textContent = "Jogar";
  updateStats();
}

startButton.addEventListener("click", showGame);
playAgainButton.addEventListener("click", playRound);
restartButton.addEventListener("click", showStart);

updateStats();
