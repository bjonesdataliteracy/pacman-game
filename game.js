const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 24;
const DEBUG_SHOW_TARGETS = true;
const powerMode = { active: false, timer: 0, duration: 6000, ghostsEaten: 0 };

// Ghost-eat freeze state
const ghostEatFreeze = { active: false, timer: 0, duration: 500, points: 0, x: 0, y: 0 };

// Auto-fit canvas to screen
function resizeCanvas() {
  const gameW = COLS ? COLS * TILE_SIZE : 696;
  const gameH = ROWS ? ROWS * TILE_SIZE : 744;
  const scaleX = window.innerWidth / gameW;
  const scaleY = window.innerHeight / gameH;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = (gameW * scale) + 'px';
  canvas.style.height = (gameH * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);

// Data emoji bonus items (fruit replacement)
const DATA_EMOJIS = ['📊', '📈', '📉', '💹', '🗂️', '💾', '🗄️', '📋'];
const bonusItem = {
  active: false,
  row: 0,
  col: 0,
  x: 0,
  y: 0,
  emoji: '',
  points: 0,
  timer: 0,
  spawnTimer: 0,
  pelletsAtLastSpawn: Infinity
};
const BONUS_DISPLAY_DURATION = 8000;
const BONUS_PELLET_THRESHOLDS = [180, 140, 100, 60, 30]; // spawn at these pellet counts
let bonusThresholdIndex = 0;
const BONUS_POINTS = [100, 200, 300, 500, 700];
const FRIGHTENED_CORNERS = [
  { row: 1, col: 1 },
  { row: 1, col: 27 },
  { row: 30, col: 1 },
  { row: 30, col: 27 }
];
const modeTimer = {
  current: 'scatter',
  elapsed: 0,
  intervals: [7000, 20000, 7000, 20000, 5000, 20000, 5000],
  currentIntervalIndex: 0
};
let lives = 3;
let gameState = 'playing'; // 'playing', 'dying', 'gameover', 'won'
let deathTimer = 0;
const DEATH_ANIMATION_DURATION = 2000;
const DEATH_PAUSE_DURATION = 500; // pause after animation completes
const startDelay = 2000;
let readyTimer = 0;

// 1 = wall, 0 = path
const wallMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1],
  [1,0,0,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,1,0,0,1,1,0,0,0,1,1,0,0,1,0,0,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const ROWS = wallMap.length;
const COLS = wallMap[0].length;

canvas.width  = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;
resizeCanvas();

// 0 = none, 1 = pellet, 2 = power pellet
const pelletMap = [];

function initializePellets() {
  for (let r = 0; r < ROWS; r++) {
    pelletMap[r] = [];
    for (let c = 0; c < COLS; c++) {
      // Rule 2: Pellets are never placed in wall tiles
      if (wallMap[r][c] === 1) {
        pelletMap[r][c] = 0;
        continue;
      }

      // Rule 3: Pellets are ONLY placed if no wall to the right and no wall below
      const hasRightWall = (c + 1 >= COLS || wallMap[r][c + 1] === 1);
      const hasBottomWall = (r + 1 >= ROWS || wallMap[r + 1][c] === 1);
      const hasDiagonalWall = (r + 1 >= ROWS || c + 1 >= COLS || wallMap[r + 1][c + 1] === 1);

      if (!hasRightWall && !hasBottomWall && !hasDiagonalWall) {
        pelletMap[r][c] = 1; // All normal pellets for now
      } else {
        pelletMap[r][c] = 0;
      }
    }
  }

  const pelletsToRemove = [
    // Ghost spawning area
    [12, 13], [12, 14],
    [13, 13], [13, 14],
    [14, 12], [14, 13], [14, 14], [14, 15],

    // Enclosed wall top left
    [11, 1], [11, 2], [11, 3],

    // Enclosed wall bottom left
    [17, 1], [17, 2], [17, 3],

    // Enclosed wall top right
    [11, 24], [11, 25], [11, 26],

    // Enclosed wall bottom right
    [17, 24], [17, 25], [17, 26],

    // Tunnel edges (skipped during teleport)
    [14, 0], [14, 28]
  ];

  const powerPelletPositions = [
    [1, 1],
    [1, 26],
    [29, 1],
    [29, 26]
  ];

  for (const [r, c] of pelletsToRemove) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      pelletMap[r][c] = 0;
    }
  }

  for (const [r, c] of powerPelletPositions) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      pelletMap[r][c] = 2;
    }
  }
}

initializePellets();

function clearPellet(r, c) {
  pelletMap[r][c] = 0;
}

function setPower(r, c) {
  pelletMap[r][c] = 2;
}

// tweak these coordinates as you like
// setPower(1, 1);
// setPower(1, COLS - 2);
// setPower(ROWS - 2, 1);
// setPower(ROWS - 2, COLS - 2);

const pacMan = {
  // Node-based position: (row, col) refers to the bottom-right corner of tile (row, col)
  row: 23,
  col: 14,
  dir: { x: 0, y: 0 },
  nextDir: { x: 0, y: 0 },
  speed: 2,
  radius: TILE_SIZE * 0.6,
  x: undefined,
  y: undefined,
  color: 'yellow',
  mouthOpen: false,
  lastMouthToggle: 0
};

let gameStartTime = performance.now();

// Basic ghost definitions (node-based positions mirror Pac-Man's system)
const ghosts = [
  {
    name: 'blinky',
    color: 'red',
    startRow: 13,
    startCol: 13,
    row: 13,
    col: 13,
    x: undefined,
    y: undefined,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    radius: TILE_SIZE * 0.6,
    state: 'in-house',
    leavingHouse: true,
    releaseTime: 0,
    frightenedTarget: null,
    scatterTarget: { row: 1, col: 26 }
  },
  {
    name: 'pinky',
    color: 'pink',
    startRow: 13,
    startCol: 14,
    row: 13,
    col: 14,
    x: undefined,
    y: undefined,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    radius: TILE_SIZE * 0.6,
    state: 'in-house',
    leavingHouse: true,
    releaseTime: 2000,
    frightenedTarget: null,
    scatterTarget: { row: 1, col: 1 }
  },
  {
    name: 'inky',
    color: 'cyan',
    startRow: 14,
    startCol: 13,
    row: 14,
    col: 13,
    x: undefined,
    y: undefined,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    radius: TILE_SIZE * 0.6,
    state: 'in-house',
    leavingHouse: true,
    releaseTime: 4000,
    frightenedTarget: null,
    scatterTarget: { row: 30, col: 28 }
  },
  {
    name: 'clyde',
    color: 'orange',
    startRow: 14,
    startCol: 14,
    row: 14,
    col: 14,
    x: undefined,
    y: undefined,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    radius: TILE_SIZE * 0.6,
    state: 'in-house',
    leavingHouse: true,
    releaseTime: 6000,
    frightenedTarget: null,
    scatterTarget: { row: 30, col: 1 }
  }
];

let score = 0;

function pelletAlignedPos(col, row) {
  // Position on the pellet grid: right edge of column, bottom edge of row
  return {
    x: (col + 1) * TILE_SIZE,
    y: (row + 1) * TILE_SIZE
  };
}

function isOpenTile(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS && wallMap[r][c] === 0;
}

// Checks if Pac-Man's circle overlaps any wall tile at the given pixel position
function collidesWithWall(x, y) {
  const radius = pacMan.radius;
  const left = x - radius;
  const right = x + radius;
  const top = y - radius;
  const bottom = y + radius;

  const startCol = Math.floor(left / TILE_SIZE);
  const endCol = Math.floor(right / TILE_SIZE);
  const startRow = Math.floor(top / TILE_SIZE);
  const endRow = Math.floor(bottom / TILE_SIZE);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (!isOpenTile(r, c)) {
        const tileLeft = c * TILE_SIZE;
        const tileRight = tileLeft + TILE_SIZE;
        const tileTop = r * TILE_SIZE;
        const tileBottom = tileTop + TILE_SIZE;

        const nearestX = Math.max(tileLeft, Math.min(x, tileRight));
        const nearestY = Math.max(tileTop, Math.min(y, tileBottom));
        const dx = x - nearestX;
        const dy = y - nearestY;

        if (dx * dx + dy * dy < radius * radius) {
          return true;
        }
      }
    }
  }

  return false;
}

// Checks movement along pellet-aligned edges (requires four open tiles around the edge)
function canTraverseEdge(row, col, dir, entity) {
  // Tunnel row (14) allows wrapping, so allow horizontal movement even at edges
  const TUNNEL_ROW = 14;
  const isTunnelRow = row === TUNNEL_ROW;
  const isGhostEaten = entity?.state === 'eaten';

  // One-way house entrance: block moving down into the house columns 13-15 for rows 13+
  const targetRow = row + dir.y;
  const targetCol = col + dir.x;
  const inHouseEntranceCols = targetCol >= 13 && targetCol <= 15;
  if (!isGhostEaten && dir.y === 1 && targetRow >= 11 && targetRow <= 14 && inHouseEntranceCols) {
    return false;
  }

  if (dir.x === 1) {
    // On tunnel row, allow moving right even at the right edge (for wrapping)
    // Need to allow movement from col 27 -> 28 -> teleport, so check from col 26 onwards
    if (isTunnelRow && col >= COLS - 3) {
      // Just check current position is valid, allow going off-screen
      return isOpenTile(row, col) && isOpenTile(row + 1, col);
    }
    return (
      isOpenTile(row, col) &&
      isOpenTile(row + 1, col) &&
      isOpenTile(row, col + 1) &&
      isOpenTile(row + 1, col + 1) &&
      // When moving right, look two tiles ahead to avoid sticking out of the wall
      isOpenTile(row, col + 2) &&
      isOpenTile(row + 1, col + 2)
    );
  }
  if (dir.x === -1) {
    // On tunnel row, allow moving left even at the left edge (for wrapping)
    if (isTunnelRow && col <= 2) {
      // Just check current position is valid, allow going off-screen
      return isOpenTile(row, col) && isOpenTile(row + 1, col);
    }
    return (
      isOpenTile(row, col) &&
      isOpenTile(row + 1, col) &&
      isOpenTile(row, col - 1) &&
      isOpenTile(row + 1, col - 1)
    );
  }
  if (dir.y === 1) {
    return (
      isOpenTile(row, col) &&
      isOpenTile(row, col + 1) &&
      isOpenTile(row + 1, col) &&
      isOpenTile(row + 1, col + 1) &&
      // When moving down, check two rows ahead to stop before sticking
      isOpenTile(row + 2, col) &&
      isOpenTile(row + 2, col + 1)
    );
  }
  if (dir.y === -1) {
    return (
      isOpenTile(row, col) &&
      isOpenTile(row, col + 1) &&
      isOpenTile(row - 1, col) &&
      isOpenTile(row - 1, col + 1)
    );
  }
  return false;
}

function isAtIntersection(row, col, currentDir, entity) {
  const opposite = { x: -currentDir.x, y: -currentDir.y };
  const candidates = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ].filter((d) => !(d.x === opposite.x && d.y === opposite.y));

  const validDirs = candidates.filter((d) => canTraverseEdge(row, col, d, entity));

  // Intersection if there are 2+ options (including straight ahead)
  if (validDirs.length >= 2) return true;

  // Dead-end: no options except reversing
  if (validDirs.length === 0) return true;

  return false;
}

function chooseNextDirection(ghost, targetRow, targetCol) {
  const opposite = { x: -ghost.dir.x, y: -ghost.dir.y };
  const candidates = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ].filter((d) => !(d.x === opposite.x && d.y === opposite.y));

  const valid = candidates.filter((d) => canTraverseEdge(ghost.row, ghost.col, d, ghost));
  if (!valid.length) return { x: 0, y: 0 };

  let best = valid[0];
  let bestDist = Infinity;

  for (const d of valid) {
    const nextRow = ghost.row + d.y;
    const nextCol = ghost.col + d.x;
    const dr = targetRow - nextRow;
    const dc = targetCol - nextCol;
    const dist = Math.sqrt(dr * dr + dc * dc);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }

  return best;
}

function getGhostTarget(ghost) {
  const pacTarget = { row: pacMan.row, col: pacMan.col };

  if (ghost.state === 'frightened') {
    return ghost.frightenedTarget || FRIGHTENED_CORNERS[0];
  }

  if (ghost.state === 'eaten') {
    return { row: 14, col: 14 };
  }

  if (modeTimer.current === 'scatter') {
    return ghost.scatterTarget;
  }

  switch (ghost.name) {
    case 'blinky':
      return pacTarget;
    case 'pinky': {
      const dir = pacMan.dir;
      let target = pacTarget; // default when idle
      if (dir.x === 1) target = { row: pacMan.row, col: pacMan.col + 4 };
      else if (dir.x === -1) target = { row: pacMan.row, col: pacMan.col - 4 };
      else if (dir.y === 1) target = { row: pacMan.row + 4, col: pacMan.col };
      else if (dir.y === -1) target = { row: pacMan.row - 4, col: pacMan.col };

      target.row = Math.min(Math.max(target.row, 0), ROWS - 1);
      target.col = Math.min(Math.max(target.col, 0), COLS - 1);
      return target;
    }
    case 'inky': {
      const dir = pacMan.dir;
      let intermediateRow = pacMan.row + dir.y * 2;
      let intermediateCol = pacMan.col + dir.x * 2;

      intermediateRow = Math.min(Math.max(intermediateRow, 0), ROWS - 1);
      intermediateCol = Math.min(Math.max(intermediateCol, 0), COLS - 1);

      const blinky = ghosts.find((g) => g.name === 'blinky');
      const blinkyRow = blinky?.row ?? pacMan.row;
      const blinkyCol = blinky?.col ?? pacMan.col;

      let targetRow = intermediateRow + (intermediateRow - blinkyRow);
      let targetCol = intermediateCol + (intermediateCol - blinkyCol);

      targetRow = Math.min(Math.max(targetRow, 0), ROWS - 1);
      targetCol = Math.min(Math.max(targetCol, 0), COLS - 1);

      return { row: targetRow, col: targetCol };
    }
    case 'clyde': {
      const dr = pacMan.row - ghost.row;
      const dc = pacMan.col - ghost.col;
      const dist = Math.sqrt(dr * dr + dc * dc);
      if (dist > 8) {
        return pacTarget;
      }
      return ghost.scatterTarget;
    }
    default:
      return pacTarget;
  }
}

function updatePowerMode(deltaMs) {
  if (!powerMode.active) return;
  powerMode.timer -= deltaMs;
  if (powerMode.timer <= 0) {
    powerMode.active = false;
    powerMode.timer = 0;
  }
}

function resetPositions() {
  pacMan.row = 23;
  pacMan.col = 14;
  pacMan.dir = { x: 0, y: 0 };
  pacMan.nextDir = { x: 0, y: 0 };
  pacMan.x = undefined;
  pacMan.y = undefined;

  for (const ghost of ghosts) {
    ghost.row = ghost.startRow;
    ghost.col = ghost.startCol;
    ghost.x = undefined;
    ghost.y = undefined;
    ghost.dir = { x: 0, y: 0 };
    ghost.nextDir = { x: 0, y: 0 };
    ghost.state = 'in-house';
    ghost.leavingHouse = true;
    ghost.frightenedTarget = null;
  }

  powerMode.active = false;
  powerMode.timer = 0;
  powerMode.ghostsEaten = 0;
  ghostEatFreeze.active = false;
  ghostEatFreeze.timer = 0;
  gameStartTime = performance.now();
  readyTimer = startDelay;
  gameState = 'ready';
}

function resetGame() {
  lives = 3;
  score = 0;
  gameState = 'playing';
  modeTimer.current = 'scatter';
  modeTimer.elapsed = 0;
  modeTimer.currentIntervalIndex = 0;
  bonusItem.active = false;
  bonusThresholdIndex = 0;
  initializePellets();
  resetPositions();
}

function updateModeTimer(deltaMs) {
  const intervals = modeTimer.intervals;
  let modeChanged = false;

  modeTimer.elapsed += deltaMs;

  while (modeTimer.currentIntervalIndex < intervals.length && modeTimer.elapsed >= intervals[modeTimer.currentIntervalIndex]) {
    modeTimer.elapsed -= intervals[modeTimer.currentIntervalIndex];
    modeTimer.currentIntervalIndex += 1;

    const prevMode = modeTimer.current;

    if (modeTimer.currentIntervalIndex >= intervals.length) {
      modeTimer.current = 'chase'; // permanent chase after schedule ends
    } else {
      modeTimer.current = modeTimer.current === 'scatter' ? 'chase' : 'scatter';
    }

    if (prevMode !== modeTimer.current) {
      modeChanged = true;
    }
  }

  if (modeChanged) {
    for (const ghost of ghosts) {
      if (ghost.state === 'chase' || ghost.state === 'scatter') {
        ghost.dir = { x: -ghost.dir.x, y: -ghost.dir.y };
      }
    }
  }
}

function checkGhostCollision() {
  if (gameState !== 'playing') return;

  for (const ghost of ghosts) {
    if (ghost.row === pacMan.row && ghost.col === pacMan.col) {
      if (ghost.state === 'frightened') {
        ghost.state = 'eaten';
        const basePoints = 200;
        const multiplier = Math.pow(2, powerMode.ghostsEaten); // 1,2,4,8
        const earnedPoints = basePoints * multiplier;
        score += earnedPoints;
        powerMode.ghostsEaten = Math.min(powerMode.ghostsEaten + 1, 3);
        // Freeze the game briefly to show the eat
        ghostEatFreeze.active = true;
        ghostEatFreeze.timer = ghostEatFreeze.duration;
        ghostEatFreeze.points = earnedPoints;
        ghostEatFreeze.x = ghost.x;
        ghostEatFreeze.y = ghost.y;
        console.log(`Pac-Man ate ${ghost.name}! +${earnedPoints} points`);
      } else if (ghost.state === 'chase' || ghost.state === 'scatter') {
        if (gameState === 'playing') {
          gameState = 'dying';
          deathTimer = DEATH_ANIMATION_DURATION + DEATH_PAUSE_DURATION;
          lives = Math.max(0, lives - 1);
          pacMan.dir = { x: 0, y: 0 };
          console.log('Pac-Man caught!');
        }
      } else {
        // state === 'eaten' -> ignore
      }
    }
  }
}

function handleDeath(deltaMs) {
  if (gameState !== 'dying') return;
  deathTimer -= deltaMs;
  if (deathTimer <= 0) {
    if (lives > 0) {
      resetPositions();
      gameState = 'playing';
    } else {
      gameState = 'gameover';
    }
  }
}

function handleWin() {
  if (gameState !== 'won') return;
  const message = 'YOU WIN!';
  const scoreMsg = `Score: ${score}`;
  const restartMsg = 'Press SPACE to restart';

  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  const msgWidth = ctx.measureText(message).width;
  ctx.fillText(message, (canvas.width - msgWidth) / 2, canvas.height / 2 - 20);

  ctx.font = '28px Arial';
  const scoreWidth = ctx.measureText(scoreMsg).width;
  ctx.fillText(scoreMsg, (canvas.width - scoreWidth) / 2, canvas.height / 2 + 20);

  ctx.font = '20px Arial';
  const restartWidth = ctx.measureText(restartMsg).width;
  ctx.fillText(restartMsg, (canvas.width - restartWidth) / 2, canvas.height / 2 + 50);
}

function handleGameOver() {
  if (gameState !== 'gameover') return;
  const message = 'GAME OVER';
  const scoreMsg = `Score: ${score}`;
  const restartMsg = 'Press SPACE to restart';

  ctx.fillStyle = 'red';
  ctx.font = '48px Arial';
  const msgWidth = ctx.measureText(message).width;
  ctx.fillText(message, (canvas.width - msgWidth) / 2, canvas.height / 2 - 20);

  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  const scoreWidth = ctx.measureText(scoreMsg).width;
  ctx.fillText(scoreMsg, (canvas.width - scoreWidth) / 2, canvas.height / 2 + 20);

  ctx.font = '20px Arial';
  const restartWidth = ctx.measureText(restartMsg).width;
  ctx.fillText(restartMsg, (canvas.width - restartWidth) / 2, canvas.height / 2 + 50);
}

function handleReady(deltaMs) {
  if (gameState !== 'ready') return;
  readyTimer -= deltaMs;
  ctx.fillStyle = 'yellow';
  ctx.font = '36px Arial';
  const msg = 'READY!';
  const w = ctx.measureText(msg).width;
  ctx.fillText(msg, (canvas.width - w) / 2, canvas.height / 2);

  if (readyTimer <= 0) {
    gameState = 'playing';
  }
}

function consumePelletAt(row, col) {
  const pellet = pelletMap[row]?.[col];
  if (!pellet) return;

  if (pellet === 1) {
    score += 10;
  } else if (pellet === 2) {
    score += 50;
    powerMode.active = true;
    powerMode.timer = powerMode.duration;
    powerMode.ghostsEaten = 0;
  }
  pelletMap[row][col] = 0;
}

function countRemainingPellets() {
  let remaining = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = pelletMap[r][c];
      if (val === 1 || val === 2) remaining++;
    }
  }
  return remaining;
}

function spawnBonusItem() {
  // Pick a random valid open tile for the bonus
  const validTiles = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (wallMap[r][c] === 0 && pelletMap[r][c] === 0 &&
          !(r >= 12 && r <= 16 && c >= 11 && c <= 17)) { // not in ghost house
        validTiles.push({ r, c });
      }
    }
  }
  if (validTiles.length === 0) return;
  const tile = validTiles[Math.floor(Math.random() * validTiles.length)];
  const idx = Math.min(bonusThresholdIndex, BONUS_POINTS.length - 1);
  bonusItem.active = true;
  bonusItem.row = tile.r;
  bonusItem.col = tile.c;
  const pos = pelletAlignedPos(tile.c, tile.r);
  bonusItem.x = pos.x;
  bonusItem.y = pos.y;
  bonusItem.emoji = DATA_EMOJIS[Math.floor(Math.random() * DATA_EMOJIS.length)];
  bonusItem.points = BONUS_POINTS[idx];
  bonusItem.timer = BONUS_DISPLAY_DURATION;
  bonusThresholdIndex++;
}

function updateBonusItem(deltaMs) {
  if (bonusItem.active) {
    bonusItem.timer -= deltaMs;
    if (bonusItem.timer <= 0) {
      bonusItem.active = false;
    }
    // Check if PacMan collected it
    if (pacMan.row === bonusItem.row && pacMan.col === bonusItem.col) {
      score += bonusItem.points;
      bonusItem.active = false;
    }
  }
  // Spawn based on pellet thresholds
  if (!bonusItem.active && bonusThresholdIndex < BONUS_PELLET_THRESHOLDS.length) {
    const remaining = countRemainingPellets();
    if (remaining <= BONUS_PELLET_THRESHOLDS[bonusThresholdIndex]) {
      spawnBonusItem();
    }
  }
}

function drawBonusItem() {
  if (!bonusItem.active) return;
  const now = performance.now();
  // Blink when about to disappear (last 2 seconds)
  if (bonusItem.timer < 2000 && Math.floor(now / 200) % 2 === 0) return;
  const fontSize = TILE_SIZE * 1.1;
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonusItem.emoji, bonusItem.x, bonusItem.y);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}

function drawMaze() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (wallMap[r][c] === 1) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawPellets() {
  const pelletRadius = TILE_SIZE * 0.18;
  const powerRadius  = TILE_SIZE * 0.3;
  const now = performance.now();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = pelletMap[r][c];
      if (type === 0) continue;

      let x = c * TILE_SIZE + TILE_SIZE; // Bottom-right alignment
      let y = r * TILE_SIZE + TILE_SIZE; // Bottom-right alignment
      let radius = pelletRadius;

      if (type === 2) {
        const pulse = 1 + 0.08 * Math.sin(now * 0.006);
        radius = powerRadius * pulse;
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    }
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp')    pacMan.nextDir = { x: 0,  y: -1 };
  if (e.key === 'ArrowDown')  pacMan.nextDir = { x: 0,  y: 1 };
  if (e.key === 'ArrowLeft')  pacMan.nextDir = { x: -1, y: 0 };
  if (e.key === 'ArrowRight') pacMan.nextDir = { x: 1,  y: 0 };
  if (e.code === 'Space') {
    if (gameState === 'gameover' || gameState === 'won') {
      resetGame();
    }
  }
});

function updatePacMan() {
  const aligned = pelletAlignedPos(pacMan.col, pacMan.row);

  if (pacMan.x === undefined) {
    pacMan.x = aligned.x;
    pacMan.y = aligned.y;
    consumePelletAt(pacMan.row, pacMan.col);
  }

  const prevX = pacMan.x;
  const prevY = pacMan.y;
  const prevRow = pacMan.row;
  const prevCol = pacMan.col;

  const EPS = 0.5;
  const atNode =
    Math.abs(pacMan.x - aligned.x) < EPS && Math.abs(pacMan.y - aligned.y) < EPS;

  // TUNNEL TELEPORT: If at edge of tunnel row, teleport to other side
  const TUNNEL_ROW = 14;
  if (atNode && pacMan.row === TUNNEL_ROW) {
    // Teleport from col 1 moving left
    if (pacMan.col === 1 && pacMan.dir.x === -1) {
      pacMan.col = COLS - 2;
      pacMan.x = pelletAlignedPos(pacMan.col, pacMan.row).x;
      consumePelletAt(pacMan.row, pacMan.col);
    }
    // Teleport from col 27 moving right
    else if (pacMan.col === COLS - 2 && pacMan.dir.x === 1) {
      pacMan.col = 1;
      pacMan.x = pelletAlignedPos(pacMan.col, pacMan.row).x;
      consumePelletAt(pacMan.row, pacMan.col);
    }
  }

  // Handle direction changes only when centered on a pellet node
  if (atNode) {
    pacMan.x = aligned.x;
    pacMan.y = aligned.y;

    if (
      (pacMan.nextDir.x !== pacMan.dir.x || pacMan.nextDir.y !== pacMan.dir.y) &&
      canTraverseEdge(pacMan.row, pacMan.col, pacMan.nextDir)
    ) {
      pacMan.dir = { x: pacMan.nextDir.x, y: pacMan.nextDir.y };
    }

    if (!canTraverseEdge(pacMan.row, pacMan.col, pacMan.dir)) {
      pacMan.dir = { x: 0, y: 0 };
    }
  }

  // Lock Pac-Man to the correct pellet-aligned line
  if (pacMan.dir.x !== 0) pacMan.y = aligned.y; // Horizontal moves stay on row's bottom edge
  if (pacMan.dir.y !== 0) pacMan.x = aligned.x; // Vertical moves stay on column's right edge

  const step = pacMan.speed;

  // Move along the current edge; snap to the next node when reached
  if (pacMan.dir.x !== 0 && canTraverseEdge(pacMan.row, pacMan.col, pacMan.dir)) {
    const targetCol = pacMan.col + pacMan.dir.x;
    const targetX = pelletAlignedPos(targetCol, pacMan.row).x;
    const deltaX = pacMan.dir.x * step;

    if ((pacMan.dir.x > 0 && pacMan.x + deltaX >= targetX) ||
        (pacMan.dir.x < 0 && pacMan.x + deltaX <= targetX)) {
      pacMan.x = targetX;
      pacMan.col = targetCol;
      consumePelletAt(pacMan.row, pacMan.col);
    } else {
      pacMan.x += deltaX;
    }
  } else if (pacMan.dir.y !== 0 && canTraverseEdge(pacMan.row, pacMan.col, pacMan.dir)) {
    const targetRow = pacMan.row + pacMan.dir.y;
    const targetY = pelletAlignedPos(pacMan.col, targetRow).y;
    const deltaY = pacMan.dir.y * step;

    if ((pacMan.dir.y > 0 && pacMan.y + deltaY >= targetY) ||
        (pacMan.dir.y < 0 && pacMan.y + deltaY <= targetY)) {
      pacMan.y = targetY;
      pacMan.row = targetRow;
      consumePelletAt(pacMan.row, pacMan.col);
    } else {
      pacMan.y += deltaY;
    }
  }

  // Prevent overshooting into walls (especially moving right/down) by reverting to last safe spot
  if (collidesWithWall(pacMan.x, pacMan.y)) {
    pacMan.x = prevX;
    pacMan.y = prevY;
    pacMan.row = prevRow;
    pacMan.col = prevCol;
    pacMan.dir = { x: 0, y: 0 };
  }
}

function drawPacMan() {
  const moving = pacMan.dir.x !== 0 || pacMan.dir.y !== 0;
  const now = performance.now();
  const TOGGLE_INTERVAL_MS = 150;

  if (!moving) {
    pacMan.mouthOpen = false;
    pacMan.lastMouthToggle = now;
  } else if (now - pacMan.lastMouthToggle >= TOGGLE_INTERVAL_MS) {
    pacMan.mouthOpen = !pacMan.mouthOpen;
    pacMan.lastMouthToggle = now;
  }

  const angleForDir = (() => {
    if (pacMan.dir.x === 1) return 0;
    if (pacMan.dir.x === -1) return Math.PI;
    if (pacMan.dir.y === -1) return -Math.PI / 2;
    if (pacMan.dir.y === 1) return Math.PI / 2;
    return 0;
  })();

  const deathAnimTime =
    gameState === 'dying'
      ? Math.max(0, deathTimer - DEATH_PAUSE_DURATION)
      : DEATH_ANIMATION_DURATION;
  const deathScale =
    gameState === 'dying' ? Math.max(0, deathAnimTime / DEATH_ANIMATION_DURATION) : 1;

  const r = pacMan.radius * deathScale;
  const x = pacMan.x;
  const y = pacMan.y;

  // Data-themed PacMan: pie chart with animated "eating" slice
  const mouthWedge = gameState === 'dying'
    ? Math.PI * (1.2 + (1 - deathScale) * 1.0)
    : (pacMan.mouthOpen ? Math.PI / 4 : 0);

  // Draw pie chart slices (the "body")
  const sliceColors = ['#FFD700', '#FF8C00', '#FFA500'];
  const sliceAngles = [0.45, 0.30, 0.25]; // proportions of the pie

  if (mouthWedge > 0) {
    // Mouth open: draw pie slices with a gap
    const gapStart = angleForDir - mouthWedge / 2;
    const gapEnd = angleForDir + mouthWedge / 2;
    const availableAngle = Math.PI * 2 - mouthWedge;
    let currentAngle = gapEnd;
    for (let i = 0; i < sliceColors.length; i++) {
      const sliceAngle = sliceAngles[i] * availableAngle;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColors[i];
      ctx.fill();
      // Slice border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      currentAngle += sliceAngle;
    }
  } else {
    // Mouth closed: full pie chart
    let currentAngle = angleForDir;
    for (let i = 0; i < sliceColors.length; i++) {
      const sliceAngle = sliceAngles[i] * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColors[i];
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      currentAngle += sliceAngle;
    }
  }

  // Outer ring to give it a polished look
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

function updateGhosts() {
  for (const ghost of ghosts) {
    const aligned = pelletAlignedPos(ghost.col, ghost.row);
    const now = performance.now();
    const elapsedTime = now - gameStartTime;

    const prevState = ghost.state;

    // Update frightened/chase state based on power mode (unless eaten)
    if (powerMode.active && ghost.state !== 'eaten') {
      ghost.state = 'frightened';
      if (prevState !== 'frightened' && ghost.frightenedTarget === null) {
        ghost.frightenedTarget =
          FRIGHTENED_CORNERS[Math.floor(Math.random() * FRIGHTENED_CORNERS.length)];
      }
    } else if (!powerMode.active && ghost.state === 'frightened') {
      ghost.state = 'chase';
      ghost.frightenedTarget = null;
    } else if (!powerMode.active && ghost.state !== 'eaten' && ghost.state !== 'in-house' && !ghost.leavingHouse) {
      ghost.state = modeTimer.current;
    }

    // Hold inside until release time
    if (elapsedTime < ghost.releaseTime) {
      ghost.dir = { x: 0, y: 0 };
      continue;
    }

    // Initialize pixel position once
    if (ghost.x === undefined || ghost.y === undefined) {
      ghost.x = aligned.x;
      ghost.y = aligned.y;
    }

    const prevX = ghost.x;
    const prevY = ghost.y;
    const prevRow = ghost.row;
    const prevCol = ghost.col;

    const EPS = 0.5;
    const atNode =
      Math.abs(ghost.x - aligned.x) < EPS && Math.abs(ghost.y - aligned.y) < EPS;

    if (atNode) {
      ghost.x = aligned.x;
      ghost.y = aligned.y;

      // If eaten and at home, reset to in-house and let exit routine handle re-entry
      if (ghost.state === 'eaten' && ghost.row === 14 && ghost.col === 14) {
        ghost.state = 'in-house';
        ghost.leavingHouse = true;
        ghost.frightenedTarget = null;
        ghost.dir = { x: 0, y: 0 };
        continue;
      }

      // Leaving house: force upward movement until row 11
      if (ghost.leavingHouse) {
        ghost.dir = { x: 0, y: -1 };
        if (ghost.row <= 11) {
          ghost.leavingHouse = false;
          ghost.dir = { x: 0, y: 0 };
          if (!powerMode.active) {
            ghost.state = modeTimer.current;
          }
        }
      } else {
        const target = getGhostTarget(ghost);
        const dirBlocked = !canTraverseEdge(ghost.row, ghost.col, ghost.dir, ghost);
        const needDecision = isAtIntersection(ghost.row, ghost.col, ghost.dir, ghost) || dirBlocked;

        if (needDecision) {
          const nextDir = chooseNextDirection(ghost, target.row, target.col);
          ghost.dir = nextDir;
        }
      }
    }

    // Lock ghost to pellet-aligned edges just like Pac-Man
    if (ghost.dir.x !== 0) ghost.y = aligned.y;
    if (ghost.dir.y !== 0) ghost.x = aligned.x;

    let step = ghost.speed;
    if (ghost.state === 'frightened') step *= 0.5;
    else if (ghost.state === 'eaten') step *= 1.5;

    if (ghost.dir.x !== 0 && canTraverseEdge(ghost.row, ghost.col, ghost.dir, ghost)) {
      const targetCol = ghost.col + ghost.dir.x;
      const targetX = pelletAlignedPos(targetCol, ghost.row).x;
      const deltaX = ghost.dir.x * step;

      if (
        (ghost.dir.x > 0 && ghost.x + deltaX >= targetX) ||
        (ghost.dir.x < 0 && ghost.x + deltaX <= targetX)
      ) {
        ghost.x = targetX;
        ghost.col = targetCol;
      } else {
        ghost.x += deltaX;
      }
    } else if (ghost.dir.y !== 0 && canTraverseEdge(ghost.row, ghost.col, ghost.dir, ghost)) {
      const targetRow = ghost.row + ghost.dir.y;
      const targetY = pelletAlignedPos(ghost.col, targetRow).y;
      const deltaY = ghost.dir.y * step;

      if (
        (ghost.dir.y > 0 && ghost.y + deltaY >= targetY) ||
        (ghost.dir.y < 0 && ghost.y + deltaY <= targetY)
      ) {
        ghost.y = targetY;
        ghost.row = targetRow;
      } else {
        ghost.y += deltaY;
      }
    }

    // Prevent going through walls; halt movement if collision occurs
    if (collidesWithWall(ghost.x, ghost.y)) {
      ghost.x = prevX;
      ghost.y = prevY;
      ghost.row = prevRow;
      ghost.col = prevCol;
      ghost.dir = { x: 0, y: 0 };
    }
  }
}

// Data-themed ghost shapes: each ghost is a different data visualization icon
function drawDataBug(ghost, color, x, y, r) {
  // "Bug" = a database cylinder shape
  const name = ghost.name;
  if (name === 'blinky') {
    drawBarChartGhost(x, y, r, color, ghost.dir);
  } else if (name === 'pinky') {
    drawDatabaseGhost(x, y, r, color, ghost.dir);
  } else if (name === 'inky') {
    drawScatterPlotGhost(x, y, r, color, ghost.dir);
  } else {
    drawCursorGhost(x, y, r, color, ghost.dir);
  }
}

function drawBarChartGhost(x, y, r, color, dir) {
  // Mini bar chart shape
  const w = r * 1.6;
  const h = r * 1.6;
  const left = x - w / 2;
  const top = y - h / 2;
  const barW = w / 5;
  const heights = [0.6, 1.0, 0.4, 0.8];

  // Background rounded rect
  ctx.beginPath();
  const rr = r * 0.3;
  ctx.moveTo(left + rr, top);
  ctx.lineTo(left + w - rr, top);
  ctx.quadraticCurveTo(left + w, top, left + w, top + rr);
  ctx.lineTo(left + w, top + h - rr);
  ctx.quadraticCurveTo(left + w, top + h, left + w - rr, top + h);
  ctx.lineTo(left + rr, top + h);
  ctx.quadraticCurveTo(left, top + h, left, top + h - rr);
  ctx.lineTo(left, top + rr);
  ctx.quadraticCurveTo(left, top, left + rr, top);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff40';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Bars
  const barArea = h * 0.7;
  const barBottom = top + h * 0.85;
  for (let i = 0; i < 4; i++) {
    const bx = left + w * 0.12 + i * (barW + w * 0.04);
    const bh = barArea * heights[i];
    ctx.fillStyle = `rgba(255,255,255,${0.6 + i * 0.1})`;
    ctx.fillRect(bx, barBottom - bh, barW, bh);
  }

  // Eyes on top bar area
  drawGhostEyes(x, y - r * 0.15, r * 0.5, dir);
}

function drawDatabaseGhost(x, y, r, color, dir) {
  // Database cylinder
  const w = r * 1.2;
  const h = r * 1.6;
  const top = y - h / 2;
  const ellipseH = h * 0.18;

  // Cylinder body
  ctx.beginPath();
  ctx.moveTo(x - w, top + ellipseH);
  ctx.lineTo(x - w, top + h - ellipseH);
  ctx.ellipse(x, top + h - ellipseH, w, ellipseH, 0, Math.PI, 0, true);
  ctx.lineTo(x + w, top + ellipseH);
  ctx.ellipse(x, top + ellipseH, w, ellipseH, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff40';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top ellipse
  ctx.beginPath();
  ctx.ellipse(x, top + ellipseH, w, ellipseH, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff60';
  ctx.stroke();

  // Middle lines (data rows)
  for (let i = 1; i <= 2; i++) {
    const ly = top + ellipseH + (h - 2 * ellipseH) * (i / 3);
    ctx.beginPath();
    ctx.ellipse(x, ly, w, ellipseH * 0.6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff30';
    ctx.stroke();
  }

  // Eyes
  drawGhostEyes(x, y - r * 0.1, r * 0.5, dir);
}

function drawScatterPlotGhost(x, y, r, color, dir) {
  // Scatter plot / data point cluster in a diamond shape
  const s = r * 1.4;

  // Diamond body
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff40';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Scatter dots
  const dots = [
    { dx: -0.3, dy: 0.3 },
    { dx: 0.3, dy: -0.3 },
    { dx: -0.15, dy: -0.15 },
    { dx: 0.4, dy: 0.15 },
    { dx: -0.05, dy: 0.4 }
  ];
  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(x + d.dx * r, y + d.dy * r, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff80';
    ctx.fill();
  }

  // Eyes
  drawGhostEyes(x, y - r * 0.15, r * 0.5, dir);
}

function drawCursorGhost(x, y, r, color, dir) {
  // Cursor / pointer shape (data selector)
  const s = r * 1.4;

  // Hexagon body
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + s * Math.cos(angle);
    const py = y + s * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff40';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Small trend line inside
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y + r * 0.3);
  ctx.lineTo(x - r * 0.15, y + r * 0.1);
  ctx.lineTo(x + r * 0.15, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.1);
  ctx.strokeStyle = '#ffffff80';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  drawGhostEyes(x, y - r * 0.2, r * 0.5, dir);
}

function drawGhostEyes(x, y, scale, dir) {
  const eyeOffsetX = scale * 0.7;
  const eyeRX = scale * 0.35;
  const eyeRY = scale * 0.45;
  const pupilR = scale * 0.2;
  const d = (dir.x === 0 && dir.y === 0) ? { x: 1, y: 0 } : dir;
  const mag = Math.hypot(d.x, d.y) || 1;
  const pupilOX = (d.x / mag) * scale * 0.18;
  const pupilOY = (d.y / mag) * scale * 0.18;

  // White of eyes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(x - eyeOffsetX, y, eyeRX, eyeRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + eyeOffsetX, y, eyeRX, eyeRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(x - eyeOffsetX + pupilOX, y + pupilOY, pupilR, pupilR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + eyeOffsetX + pupilOX, y + pupilOY, pupilR, pupilR, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhosts() {
  for (const ghost of ghosts) {
    if (ghost.x === undefined || ghost.y === undefined) {
      const aligned = pelletAlignedPos(ghost.col, ghost.row);
      ghost.x = aligned.x;
      ghost.y = aligned.y;
    }

    const isFrightened = ghost.state === 'frightened';
    const isEaten = ghost.state === 'eaten';
    const flash = isFrightened && powerMode.timer < 2000 && Math.floor(powerMode.timer / 200) % 2 === 0;
    const color = isFrightened ? (flash ? 'white' : '#0011cc') : ghost.color;

    if (isEaten) {
      // Just eyes floating back
      drawGhostEyes(ghost.x, ghost.y, ghost.radius * 0.5, ghost.dir);
    } else if (isFrightened) {
      // Frightened: draw as a glitchy/corrupted data blob
      const r = ghost.radius;
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
      // Wavy distortion lines
      ctx.strokeStyle = flash ? '#0011cc' : 'white';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ly = ghost.y - r * 0.4 + i * r * 0.4;
        ctx.moveTo(ghost.x - r * 0.5, ly);
        ctx.quadraticCurveTo(ghost.x, ly + (i % 2 === 0 ? -3 : 3), ghost.x + r * 0.5, ly);
      }
      ctx.stroke();
      // Frightened eyes (simple)
      drawGhostEyes(ghost.x, ghost.y - r * 0.15, r * 0.4, ghost.dir);
    } else {
      drawDataBug(ghost, color, ghost.x, ghost.y, ghost.radius);
    }
  }
}

function gameLoop() {
  const now = performance.now();
  const deltaMs = now - (gameLoop.lastTime || now);
  gameLoop.lastTime = now;

  // Handle ghost-eat freeze: pause all game updates, just render
  if (ghostEatFreeze.active) {
    ghostEatFreeze.timer -= deltaMs;
    if (ghostEatFreeze.timer <= 0) {
      ghostEatFreeze.active = false;
    }
    // Still draw everything, but show the score popup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPellets();
    drawBonusItem();
    drawPacMan();
    drawGhosts();

    // Score popup at the eat location
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${ghostEatFreeze.points}`, ghostEatFreeze.x, ghostEatFreeze.y);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Still draw HUD
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    drawLivesIcons();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameState === 'playing') {
    updatePowerMode(deltaMs);
    updateModeTimer(deltaMs);
    updateBonusItem(deltaMs);

    if (countRemainingPellets() === 0) {
      gameState = 'won';
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawPellets();
  drawBonusItem();
  if (gameState === 'playing') {
    updateGhosts();
    updatePacMan();
    checkGhostCollision();
  } else if (gameState === 'dying') {
    handleDeath(deltaMs);
  }
  drawPacMan();
  drawGhosts();

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 25);

  drawLivesIcons();

  if (gameState === 'won') {
    handleWin();
  }
  if (gameState === 'gameover') {
    handleGameOver();
  }
  if (gameState === 'ready') {
    handleReady(deltaMs);
  }

  requestAnimationFrame(gameLoop);
}

function drawLivesIcons() {
  const iconRadius = TILE_SIZE * 0.4;
  const startX = 10;
  const startY = canvas.height - iconRadius - 6;
  const spacing = 25;
  // Draw mini pie charts for lives
  const sliceColors = ['#FFD700', '#FF8C00', '#FFA500'];
  for (let i = 0; i < Math.max(0, lives - 1); i++) {
    const x = startX + i * spacing;
    let angle = 0;
    const proportions = [0.45, 0.30, 0.25];
    for (let j = 0; j < sliceColors.length; j++) {
      const sliceAngle = proportions[j] * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.arc(x, startY, iconRadius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColors[j];
      ctx.fill();
      angle += sliceAngle;
    }
  }
}

gameLoop();
