/**
 * Bagh-Chal (Tiger and Goats) Game Engine
 *
 * Board: 5x5 grid with 25 nodes (0-24)
 * Tigers start at the 4 corners: 0, 4, 20, 24
 * Goats are placed one at a time (20 total)
 *
 * Adjacency (including diagonal where applicable — standard Bagh-Chal rules)
 */

// Build adjacency list for standard Bagh-Chal board
// Orthogonal neighbors are always connected
// Diagonal neighbors are connected only at certain intersections
export const buildAdjacency = () => {
  const adj = {};
  for (let i = 0; i < 25; i++) adj[i] = [];

  const addEdge = (a, b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const node = r * 5 + c;
      // Right
      if (c < 4) addEdge(node, node + 1);
      // Down
      if (r < 4) addEdge(node, node + 5);
      // Diagonal down-right: only on even rows/cols sum
      if (r < 4 && c < 4 && (r + c) % 2 === 0) addEdge(node, node + 6);
      // Diagonal down-left: only on odd row/col combinations
      if (r < 4 && c > 0 && (r + c) % 2 === 1) addEdge(node, node + 4);

      // Fixed: for even sum intersections allow both diagonals
      if (r < 4 && c < 4 && (r + c) % 2 === 0) {
        addEdge(node, node + 6); // already added
      }
      if (r < 4 && c > 0 && (r + c) % 2 === 0) {
        addEdge(node, node + 4); // down-left on even
      }
    }
  }
  return adj;
};

// Proper Bagh-Chal adjacency following the traditional board
export const ADJACENCY = (() => {
  const adj = {};
  for (let i = 0; i < 25; i++) adj[i] = [];

  const addEdge = (a, b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const n = r * 5 + c;
      if (c < 4) addEdge(n, n + 1);           // right
      if (r < 4) addEdge(n, n + 5);           // down
      if (r < 4 && c < 4 && (r + c) % 2 === 0) addEdge(n, n + 6);  // diagonal ↘
      if (r < 4 && c > 0 && (r + c) % 2 === 0) addEdge(n, n + 4);  // diagonal ↙
    }
  }
  return adj;
})();

export const INITIAL_TIGERS = [0, 4, 20, 24];

export const createInitialState = () => ({
  board: Array(25).fill(null).map((_, i) =>
    INITIAL_TIGERS.includes(i) ? 'tiger' : null
  ),
  phase: 'placement',   // 'placement' | 'movement'
  turn: 'goat',         // 'goat' | 'tiger'
  goatsPlaced: 0,
  goatsCaptured: 0,
  selectedNode: null,
  validMoves: [],
  history: [],          // for undo
  winner: null,         // 'goat' | 'tiger' | null
});

/** Get valid placement nodes (empty) for goat placement phase */
export const getValidPlacements = (board) =>
  board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);

/** Get valid movement destinations for a piece at 'from' */
export const getValidMoves = (board, from) => {
  return ADJACENCY[from].filter(to => board[to] === null);
};

/** Get capture moves for a tiger at 'from' */
export const getTigerCaptures = (board, from) => {
  const captures = [];
  ADJACENCY[from].forEach(mid => {
    if (board[mid] === 'goat') {
      // Find the node on the other side: from → mid → landing
      const dr = Math.floor(mid / 5) - Math.floor(from / 5);
      const dc = (mid % 5) - (from % 5);
      const landR = Math.floor(mid / 5) + dr;
      const landC = (mid % 5) + dc;
      if (landR >= 0 && landR < 5 && landC >= 0 && landC < 5) {
        const landing = landR * 5 + landC;
        if (board[landing] === null && ADJACENCY[mid].includes(landing)) {
          captures.push({ to: landing, captures: mid });
        }
      }
    }
  });
  return captures;
};

/** All valid tiger moves (regular + captures) for one tiger */
export const getTigerMovesFrom = (board, from) => {
  const regular = getValidMoves(board, from).map(to => ({ to, captures: null }));
  const captures = getTigerCaptures(board, from);
  return [...regular, ...captures];
};

/** All valid tiger moves across all 4 tigers */
export const getAllTigerMoves = (board) => {
  if (!board) return [];
  const moves = [];
  board.forEach((v, i) => {
    if (v === 'tiger') {
      getTigerMovesFrom(board, i).forEach(m => moves.push({ from: i, ...m }));
    }
  });
  return moves;
};

/** Check if all tigers are blocked */
export const areTigersBlocked = (board) => getAllTigerMoves(board).length === 0;

/** Check win condition */
export const checkWinner = (board, goatsCaptured) => {
  if (goatsCaptured >= 5) return 'tiger';
  if (areTigersBlocked(board)) return 'goat';
  return null;
};

/** Apply a move, returns new state */
export const applyMove = (state, action) => {
  const { board, goatsPlaced, goatsCaptured, phase, history } = state;
  const newBoard = [...board];
  let newGoatsPlaced = goatsPlaced;
  let newGoatsCaptured = goatsCaptured;
  let newPhase = phase;
  let newTurn = state.turn;

  // Save to history for undo
  const snapshot = {
    board: [...board],
    goatsPlaced,
    goatsCaptured,
    phase,
    turn: state.turn,
  };

  if (action.type === 'PLACE_GOAT') {
    newBoard[action.to] = 'goat';
    newGoatsPlaced++;
    if (newGoatsPlaced >= 20) newPhase = 'movement';
    newTurn = 'tiger';
  } else if (action.type === 'MOVE_GOAT') {
    newBoard[action.from] = null;
    newBoard[action.to] = 'goat';
    newTurn = 'tiger';
  } else if (action.type === 'MOVE_TIGER') {
    newBoard[action.from] = null;
    newBoard[action.to] = 'tiger';
    if (action.captures !== null) {
      newBoard[action.captures] = null;
      newGoatsCaptured++;
    }
    newTurn = 'goat';
  }

  const winner = checkWinner(newBoard, newGoatsCaptured);

  return {
    ...state,
    board: newBoard,
    goatsPlaced: newGoatsPlaced,
    goatsCaptured: newGoatsCaptured,
    phase: newPhase,
    turn: newTurn,
    selectedNode: null,
    validMoves: [],
    history: [...history, snapshot],
    winner,
  };
};

/** Undo last move */
export const undoMove = (state) => {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    ...prev,
    selectedNode: null,
    validMoves: [],
    winner: null,
    history: state.history.slice(0, -1),
  };
};

// ============================
// AI — Minimax for Tiger side
// ============================

const evaluateBoard = (board, goatsCaptured) => {
  // More captured goats = better for tiger AI
  let score = goatsCaptured * 100;
  // Bonus for tiger mobility
  score += getAllTigerMoves(board).length * 5;
  // Penalty if tigers are blocked
  if (areTigersBlocked(board)) score -= 10000;
  return score;
};

export const getBestAIMove = (board, goatsCaptured, depth = 3) => {
  const tigerMoves = getAllTigerMoves(board);
  if (tigerMoves.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of tigerMoves) {
    const newBoard = [...board];
    newBoard[move.from] = null;
    newBoard[move.to] = 'tiger';
    let newCaptured = goatsCaptured;
    if (move.captures !== null) {
      newBoard[move.captures] = null;
      newCaptured++;
    }
    const score = minimax(newBoard, newCaptured, depth - 1, false, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};

function minimax(board, goatsCaptured, depth, isMaximizing, alpha, beta) {
  const winner = checkWinner(board, goatsCaptured);
  if (winner === 'tiger') return 10000;
  if (winner === 'goat') return -10000;
  if (depth === 0) return evaluateBoard(board, goatsCaptured);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of getAllTigerMoves(board)) {
      const newBoard = [...board];
      newBoard[move.from] = null;
      newBoard[move.to] = 'tiger';
      let newCaptured = goatsCaptured;
      if (move.captures !== null) { newBoard[move.captures] = null; newCaptured++; }
      const score = minimax(newBoard, newCaptured, depth - 1, false, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    // Goat moves (random valid moves for simplicity at depth)
    let minScore = Infinity;
    const goatNodes = board.map((v, i) => v === 'goat' ? i : -1).filter(i => i !== -1);
    outer: for (const from of goatNodes) {
      for (const to of getValidMoves(board, from)) {
        const newBoard = [...board];
        newBoard[from] = null;
        newBoard[to] = 'goat';
        const score = minimax(newBoard, goatsCaptured, depth - 1, true, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break outer;
      }
    }
    return minScore === Infinity ? 0 : minScore;
  }
}
