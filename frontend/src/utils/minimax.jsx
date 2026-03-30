// Minimax + Alpha-Beta Pruning (3x3 ONLY)
// AI = 'O', Human = 'X'


/** Always 3 in a row */
export function getWinLength() {
  return 3;
}

/** Full depth search for perfect play */
function maxDepth() {
  return 9;
}


// Build winning lines for 3x3
function buildLines(size, winLen) {
  const lines = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c;

      // horizontal
      if (c + winLen <= size) {
        const l = [];
        for (let k = 0; k < winLen; k++) l.push(i + k);
        lines.push(l);
      }

      // vertical
      if (r + winLen <= size) {
        const l = [];
        for (let k = 0; k < winLen; k++) l.push(i + k * size);
        lines.push(l);
      }

      // diagonal 
      if (c + winLen <= size && r + winLen <= size) {
        const l = [];
        for (let k = 0; k < winLen; k++) l.push(i + k * size + k);
        lines.push(l);
      }

      // diagonal 
      if (c - winLen >= -1 && r + winLen <= size) {
        const l = [];
        for (let k = 0; k < winLen; k++) l.push(i + k * size - k);
        lines.push(l);
      }
    }
  }

  return lines;
}

const lineCache = {};
function getLines(size, winLen) {
  const key = `${size}_${winLen}`;
  if (!lineCache[key]) lineCache[key] = buildLines(size, winLen);
  return lineCache[key];
}


// Check winner
export function checkWinner(board, size, winLen) {
  const lines = getLines(size, winLen);

  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((idx) => board[idx] === first)) return first;
  }

  if (board.every((c) => c !== null)) return 'draw';
  return null;
}


// Winning line for UI
export function getWinningLine(board, size, winLen) {
  const lines = getLines(size, winLen);

  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((idx) => board[idx] === first)) return line;
  }

  return null;
}


// Heuristic (not really needed for 3x3 but kept safe)
function heuristic(board, size, winLen) {
  const lines = getLines(size, winLen);
  let score = 0;

  for (const line of lines) {
    const cells = line.map((i) => board[i]);
    const oCount = cells.filter((c) => c === 'O').length;
    const xCount = cells.filter((c) => c === 'X').length;

    if (xCount === 0 && oCount > 0) score += Math.pow(10, oCount);
    if (oCount === 0 && xCount > 0) score -= Math.pow(10, xCount);
  }

  return score;
}


// Sort moves (center first)
function emptySorted(board, size) {
  const mid = Math.floor(size / 2);

  return board
    .map((v, i) =>
      v === null
        ? { i, d: Math.abs(Math.floor(i / size) - mid) + Math.abs((i % size) - mid) }
        : null
    )
    .filter(Boolean)
    .sort((a, b) => a.d - b.d)
    .map((x) => x.i);
}


// Minimax + Alpha-Beta
function minimax(board, depth, isMax, alpha, beta, size, winLen, limit) {

  const result = checkWinner(board, size, winLen);

  // Base case
  if (result === 'O') return 1000 - depth;
  if (result === 'X') return depth - 1000;
  if (result === 'draw') return 0;

  const cells = emptySorted(board, size);

  if (isMax) {
    let best = -Infinity;

    for (const idx of cells) {
      board[idx] = 'O';

      //  recursion
      const s = minimax(board, depth + 1, false, alpha, beta, size, winLen, limit);

      board[idx] = null;

      if (s > best) best = s;

      // alpha update
      if (best > alpha) alpha = best;

      //  pruning
      if (beta <= alpha) break;
    }

    return best;
  } else {
    let best = Infinity;

    for (const idx of cells) {
      board[idx] = 'X';

      // 🔁 recursion
      const s = minimax(board, depth + 1, true, alpha, beta, size, winLen, limit);

      board[idx] = null;

      if (s < best) best = s;

      // ✂️ beta update
      if (best < beta) beta = best;

      // ✂️ pruning
      if (beta <= alpha) break;
    }

    return best;
  }
}


// Get best move
export function getBestMove(board, size, winLen) {
  const limit = maxDepth();
  const cells = emptySorted(board, size);

  let bestScore = -Infinity;
  let bestMove = cells[0];

  for (const idx of cells) {
    board[idx] = 'O';

    const score = minimax(board, 0, false, -Infinity, Infinity, size, winLen, limit);

    board[idx] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }

  return bestMove;
}