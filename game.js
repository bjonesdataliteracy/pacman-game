const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 24;
const DEBUG_SHOW_TARGETS = true;
const powerMode = { active: false, timer: 0, duration: 6000, ghostsEaten: 0 };
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
        score += basePoints * multiplier;
        powerMode.ghostsEaten = Math.min(powerMode.ghostsEaten + 1, 3);
        console.log(`Pac-Man ate ${ghost.name}! +${basePoints * multiplier} points`);
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
    if (pacMan.dir.x === 1) return 0; // right
    if (pacMan.dir.x === -1) return Math.PI; // left
    if (pacMan.dir.y === -1) return -Math.PI / 2; // up
    if (pacMan.dir.y === 1) return Math.PI / 2; // down
    return 0; // default facing right when idle
  })();

  const deathAnimTime =
    gameState === 'dying'
      ? Math.max(0, deathTimer - DEATH_PAUSE_DURATION)
      : DEATH_ANIMATION_DURATION;
  const deathScale =
    gameState === 'dying' ? Math.max(0, deathAnimTime / DEATH_ANIMATION_DURATION) : 1;
  const mouthWedge = gameState === 'dying'
    ? Math.PI * (1.2 + (1 - deathScale) * 1.0)
    : Math.PI / 4; // open wider as death progresses

  ctx.beginPath();
  if (pacMan.mouthOpen || gameState === 'dying') {
    const start = angleForDir + mouthWedge / 2;
    const end = angleForDir - mouthWedge / 2 + Math.PI * 2;
    ctx.moveTo(pacMan.x, pacMan.y);
    ctx.arc(pacMan.x, pacMan.y, pacMan.radius * deathScale, start, end);
  } else {
    ctx.arc(pacMan.x, pacMan.y, pacMan.radius * deathScale, 0, Math.PI * 2);
  }
  ctx.fillStyle = pacMan.color;
  ctx.fill();
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
      ctx.beginPath();
      ctx.arc(ghost.x - ghost.radius * 0.3, ghost.y, ghost.radius * 0.3, 0, Math.PI * 2);
      ctx.arc(ghost.x + ghost.radius * 0.3, ghost.y, ghost.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }

    if (DEBUG_SHOW_TARGETS) {
      const target = getGhostTarget(ghost);
      const targetPos = pelletAlignedPos(target.col, target.row);

      // Line to target
      ctx.strokeStyle = ghost.color + '80'; // add alpha
      ctx.beginPath();
      ctx.moveTo(ghost.x, ghost.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.closePath();

      // Target marker
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, TILE_SIZE * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = ghost.color + '80';
      ctx.fill();
      ctx.closePath();
    }
  }
}

function gameLoop() {
  const now = performance.now();
  const deltaMs = now - (gameLoop.lastTime || now);
  gameLoop.lastTime = now;

  if (gameState === 'playing') {
    updatePowerMode(deltaMs);
    updateModeTimer(deltaMs);

    if (countRemainingPellets() === 0) {
      gameState = 'won';
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawPellets();
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
  if (DEBUG_SHOW_TARGETS) {
    const modeLabel = modeTimer.current.toUpperCase();
    const remaining =
      modeTimer.currentIntervalIndex < modeTimer.intervals.length
        ? Math.max(0, Math.ceil((modeTimer.intervals[modeTimer.currentIntervalIndex] - modeTimer.elapsed) / 100) / 10)
        : '∞';
    ctx.fillText(`Mode: ${modeLabel} (${remaining}s)`, 10, 50);
  }

  // Lives display (do not count the current life)
  const iconRadius = TILE_SIZE * 0.4;
  const startX = 10;
  const startY = canvas.height - iconRadius - 6; // sit just above bottom edge without covering maze walls
  const spacing = 25;
  ctx.fillStyle = 'yellow';
  for (let i = 0; i < Math.max(0, lives - 1); i++) {
    const x = startX + i * spacing;
    ctx.beginPath();
    ctx.arc(x, startY, iconRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

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

gameLoop();
