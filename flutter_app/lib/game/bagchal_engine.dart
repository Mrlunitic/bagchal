// Bagh-Chal Game Engine — Dart port of bagchalEngine.js
// Board: 5x5 grid, nodes 0-24. Tigers start at corners: 0,4,20,24.

const List<int> kInitialTigers = [0, 4, 20, 24];

/// Build the adjacency map for the standard Bagh-Chal board.
Map<int, List<int>> buildAdjacency() {
  final adj = <int, List<int>>{};
  for (var i = 0; i < 25; i++) adj[i] = [];

  void addEdge(int a, int b) {
    if (!adj[a]!.contains(b)) adj[a]!.add(b);
    if (!adj[b]!.contains(a)) adj[b]!.add(a);
  }

  for (var r = 0; r < 5; r++) {
    for (var c = 0; c < 5; c++) {
      final n = r * 5 + c;
      if (c < 4) addEdge(n, n + 1); // right
      if (r < 4) addEdge(n, n + 5); // down
      if (r < 4 && c < 4 && (r + c) % 2 == 0) addEdge(n, n + 6); // ↘
      if (r < 4 && c > 0 && (r + c) % 2 == 0) addEdge(n, n + 4); // ↙
    }
  }
  return adj;
}

final Map<int, List<int>> kAdjacency = buildAdjacency();

// ──────────────────────────────────────────
// GameState
// ──────────────────────────────────────────
enum GamePhase { placement, movement }
enum GameTurn { goat, tiger }
enum GameWinner { none, goat, tiger }

class GameSnapshot {
  final List<String?> board;
  final int goatsPlaced;
  final int goatsCaptured;
  final GamePhase phase;
  final GameTurn turn;
  const GameSnapshot({
    required this.board,
    required this.goatsPlaced,
    required this.goatsCaptured,
    required this.phase,
    required this.turn,
  });
}

class GameState {
  final List<String?> board; // 'tiger' | 'goat' | null
  final GamePhase phase;
  final GameTurn turn;
  final int goatsPlaced;
  final int goatsCaptured;
  final int? selectedNode;
  final List<int> validMoves;
  final List<GameSnapshot> history;
  final GameWinner winner;

  const GameState({
    required this.board,
    required this.phase,
    required this.turn,
    required this.goatsPlaced,
    required this.goatsCaptured,
    this.selectedNode,
    required this.validMoves,
    required this.history,
    required this.winner,
  });

  GameState copyWith({
    List<String?>? board,
    GamePhase? phase,
    GameTurn? turn,
    int? goatsPlaced,
    int? goatsCaptured,
    Object? selectedNode = _sentinel,
    List<int>? validMoves,
    List<GameSnapshot>? history,
    GameWinner? winner,
  }) {
    return GameState(
      board: board ?? this.board,
      phase: phase ?? this.phase,
      turn: turn ?? this.turn,
      goatsPlaced: goatsPlaced ?? this.goatsPlaced,
      goatsCaptured: goatsCaptured ?? this.goatsCaptured,
      selectedNode:
          selectedNode == _sentinel ? this.selectedNode : selectedNode as int?,
      validMoves: validMoves ?? this.validMoves,
      history: history ?? this.history,
      winner: winner ?? this.winner,
    );
  }
}

const _sentinel = Object();

// ──────────────────────────────────────────
// Factory / helper functions
// ──────────────────────────────────────────
GameState createInitialState() {
  final board = List<String?>.filled(25, null);
  for (final t in kInitialTigers) board[t] = 'tiger';
  return GameState(
    board: board,
    phase: GamePhase.placement,
    turn: GameTurn.goat,
    goatsPlaced: 0,
    goatsCaptured: 0,
    selectedNode: null,
    validMoves: const [],
    history: const [],
    winner: GameWinner.none,
  );
}

List<int> getValidPlacements(List<String?> board) =>
    [for (var i = 0; i < 25; i++) if (board[i] == null) i];

List<int> getValidMoves(List<String?> board, int from) =>
    kAdjacency[from]!.where((to) => board[to] == null).toList();

List<({int to, int? captures})> getTigerCaptures(
    List<String?> board, int from) {
  final result = <({int to, int? captures})>[];
  for (final mid in kAdjacency[from]!) {
    if (board[mid] != 'goat') continue;
    final dr = (mid ~/ 5) - (from ~/ 5);
    final dc = (mid % 5) - (from % 5);
    final landR = (mid ~/ 5) + dr;
    final landC = (mid % 5) + dc;
    if (landR < 0 || landR >= 5 || landC < 0 || landC >= 5) continue;
    final landing = landR * 5 + landC;
    if (board[landing] == null && kAdjacency[mid]!.contains(landing)) {
      result.add((to: landing, captures: mid));
    }
  }
  return result;
}

List<({int from, int to, int? captures})> getAllTigerMoves(
    List<String?> board) {
  final moves = <({int from, int to, int? captures})>[];
  for (var i = 0; i < 25; i++) {
    if (board[i] != 'tiger') continue;
    for (final to in getValidMoves(board, i)) {
      moves.add((from: i, to: to, captures: null));
    }
    for (final cap in getTigerCaptures(board, i)) {
      moves.add((from: i, to: cap.to, captures: cap.captures));
    }
  }
  return moves;
}

bool areTigersBlocked(List<String?> board) =>
    getAllTigerMoves(board).isEmpty;

GameWinner checkWinner(List<String?> board, int goatsCaptured) {
  if (goatsCaptured >= 5) return GameWinner.tiger;
  if (areTigersBlocked(board)) return GameWinner.goat;
  return GameWinner.none;
}

// ──────────────────────────────────────────
// Apply Move
// ──────────────────────────────────────────
abstract class GameAction {}

class PlaceGoat extends GameAction {
  final int to;
  PlaceGoat(this.to);
}

class MoveGoat extends GameAction {
  final int from;
  final int to;
  MoveGoat(this.from, this.to);
}

class MoveTiger extends GameAction {
  final int from;
  final int to;
  final int? captures;
  MoveTiger(this.from, this.to, this.captures);
}

GameState applyMove(GameState state, GameAction action) {
  final newBoard = List<String?>.from(state.board);
  var newGoatsPlaced = state.goatsPlaced;
  var newGoatsCaptured = state.goatsCaptured;
  var newPhase = state.phase;
  var newTurn = state.turn;

  final snapshot = GameSnapshot(
    board: List<String?>.from(state.board),
    goatsPlaced: state.goatsPlaced,
    goatsCaptured: state.goatsCaptured,
    phase: state.phase,
    turn: state.turn,
  );

  if (action is PlaceGoat) {
    newBoard[action.to] = 'goat';
    newGoatsPlaced++;
    if (newGoatsPlaced >= 20) newPhase = GamePhase.movement;
    newTurn = GameTurn.tiger;
  } else if (action is MoveGoat) {
    newBoard[action.from] = null;
    newBoard[action.to] = 'goat';
    newTurn = GameTurn.tiger;
  } else if (action is MoveTiger) {
    newBoard[action.from] = null;
    newBoard[action.to] = 'tiger';
    if (action.captures != null) {
      newBoard[action.captures!] = null;
      newGoatsCaptured++;
    }
    newTurn = GameTurn.goat;
  }

  final winner = checkWinner(newBoard, newGoatsCaptured);

  return GameState(
    board: newBoard,
    phase: newPhase,
    turn: newTurn,
    goatsPlaced: newGoatsPlaced,
    goatsCaptured: newGoatsCaptured,
    selectedNode: null,
    validMoves: const [],
    history: [...state.history, snapshot],
    winner: winner,
  );
}

// ──────────────────────────────────────────
// Undo
// ──────────────────────────────────────────
GameState undoMove(GameState state) {
  if (state.history.isEmpty) return state;
  final prev = state.history.last;
  return GameState(
    board: List<String?>.from(prev.board),
    phase: prev.phase,
    turn: prev.turn,
    goatsPlaced: prev.goatsPlaced,
    goatsCaptured: prev.goatsCaptured,
    selectedNode: null,
    validMoves: const [],
    history: state.history.sublist(0, state.history.length - 1),
    winner: GameWinner.none,
  );
}
