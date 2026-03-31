// AI plays as 'O', human plays as 'X'
// Uses Alpha-Beta Pruning to find the best move

// All 8 winning combinations for a 3x3 board
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

/* Check if someone has won or if it's a draw.
   Returns 'X', 'O', 'draw', or null if game is still going. */
export function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // return the winner symbol
    }
  }
  // All 9 cells filled = draw
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

/* Return the array of 3 winning cell indexes, or null if no winner yet. */
export function getWinningLine(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

/* Alpha-Beta Pruning algorithm.
   isMax = true means it's AI's turn (maximizing)
   isMax = false means it's human's turn (minimizing)
   alpha = best score AI can guarantee so far
   beta  = best score human can guarantee so far */
function alphaBeta(board, isMax, alpha, beta) {
  const result = checkWinner(board);

  // Base cases: return score when game is over
  if (result === 'O') return 10;    // AI wins
  if (result === 'X') return -10;   // Human wins
  if (result === 'draw') return 0;  // Draw

  if (isMax) {
    // AI turn — try to maximize score
    let best = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O'; // try this move
        const score = alphaBeta(board, false, alpha, beta);
        board[i] = null; // undo move

        best = Math.max(best, score);
        alpha = Math.max(alpha, best);

        // Beta cut-off: human won't allow this path
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    // Human turn — try to minimize score
    let best = Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X'; // try this move
        const score = alphaBeta(board, true, alpha, beta);
        board[i] = null; // undo move

        best = Math.min(best, score);
        beta = Math.min(beta, best);

        // Alpha cut-off: AI won't allow this path
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

/* Find and return the best cell index for the AI to play.
   Loops over all empty cells, runs alpha-beta for each, picks the best. */
export function getBestMove(board) {
  let bestScore = -Infinity;
  let bestCell = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O'; // try placing O here
      const score = alphaBeta(board, false, -Infinity, Infinity);
      board[i] = null; // undo

      if (score > bestScore) {
        bestScore = score;
        bestCell = i;
      }
    }
  }

  return bestCell;
}
