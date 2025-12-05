const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 24;

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
  [17, 24], [17, 25], [17, 26]
];

for (const [r, c] of pelletsToRemove) {
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
    pelletMap[r][c] = 0;
  }
}

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
  radius: TILE_SIZE * 0.4,
  x: undefined,
  y: undefined,
  color: 'yellow'
};

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
function canTraverseEdge(row, col, dir) {
  // Tunnel row (14) allows wrapping, so allow horizontal movement even at edges
  const TUNNEL_ROW = 14;
  const isTunnelRow = row === TUNNEL_ROW;

  if (dir.x === 1) {
    // On tunnel row, allow moving right even at the right edge (for wrapping)
    if (isTunnelRow && col >= COLS - 2) {
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
    if (isTunnelRow && col <= 1) {
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

function consumePelletAt(row, col) {
  const pellet = pelletMap[row]?.[col];
  if (!pellet) return;

  if (pellet === 1) {
    score += 10;
  } else if (pellet === 2) {
    score += 50;
  }
  pelletMap[row][col] = 0;
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
  // const powerRadius  = TILE_SIZE * 0.35; // Commented out for now

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = pelletMap[r][c];
      if (type === 0) continue;

      let x = c * TILE_SIZE + TILE_SIZE; // Bottom-right X
      let y = r * TILE_SIZE + TILE_SIZE; // Bottom-right Y
      let radius = pelletRadius;

      // if (type === 2) { // Power pellets commented out for now
      //   x = c * TILE_SIZE + TILE_SIZE / 2;
      //   y = r * TILE_SIZE + TILE_SIZE / 2;
      //   radius = powerRadius;
      // } else {
      //   // Normal pellet, already set to bottom-right
      // }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'yellow';
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
    let targetCol = pacMan.col + pacMan.dir.x;
    let isWrapping = false;

    // Handle tunnel wrap-around BEFORE calculating target position
    const TUNNEL_ROW = 14;
    if (pacMan.row === TUNNEL_ROW) {
      if (targetCol < 0) {
        targetCol = COLS - 1; // Wrap to right edge
        isWrapping = true;
      } else if (targetCol >= COLS) {
        targetCol = 0; // Wrap to left edge
        isWrapping = true;
      }
    }

    const targetX = pelletAlignedPos(targetCol, pacMan.row).x;

    // When wrapping, teleport immediately; otherwise move incrementally
    if (isWrapping) {
      pacMan.x = targetX;
      pacMan.col = targetCol;
      consumePelletAt(pacMan.row, pacMan.col);
    } else {
      const deltaX = pacMan.dir.x * step;
      if ((pacMan.dir.x > 0 && pacMan.x + deltaX >= targetX) ||
          (pacMan.dir.x < 0 && pacMan.x + deltaX <= targetX)) {
        pacMan.x = targetX;
        pacMan.col = targetCol;
        consumePelletAt(pacMan.row, pacMan.col);
      } else {
        pacMan.x += deltaX;
      }
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
  ctx.beginPath();
  ctx.arc(pacMan.x, pacMan.y, pacMan.radius, 0, Math.PI * 2);
  ctx.fillStyle = pacMan.color;
  ctx.fill();
  ctx.closePath();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawPellets();
  updatePacMan();
  drawPacMan();

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 25);

  requestAnimationFrame(gameLoop);
}

gameLoop();
