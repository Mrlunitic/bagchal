// Minimax AI for Bagh-Chal — Dart port of bagchalEngine.js AI section
import 'bagchal_engine.dart';

int _evaluateBoard(List<String?> board, int goatsCaptured) {
  int score = goatsCaptured * 100;
  score += getAllTigerMoves(board).length * 5;
  if (areTigersBlocked(board)) score -= 10000;
  return score;
}

({int from, int to, int? captures})? getBestAIMove(
    List<String?> board, int goatsCaptured,
    {int depth = 3}) {
  final tigerMoves = getAllTigerMoves(board);
  if (tigerMoves.isEmpty) return null;

  ({int from, int to, int? captures})? bestMove;
  var bestScore = double.negativeInfinity;

  for (final move in tigerMoves) {
    final newBoard = List<String?>.from(board);
    newBoard[move.from] = null;
    newBoard[move.to] = 'tiger';
    var newCaptured = goatsCaptured;
    if (move.captures != null) {
      newBoard[move.captures!] = null;
      newCaptured++;
    }
    final score = _minimax(newBoard, newCaptured, depth - 1, false,
        double.negativeInfinity, double.infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

double _minimax(List<String?> board, int goatsCaptured, int depth,
    bool isMaximizing, double alpha, double beta) {
  final winner = checkWinner(board, goatsCaptured);
  if (winner == GameWinner.tiger) return 100000;
  if (winner == GameWinner.goat) return -100000;
  if (depth == 0) return _evaluateBoard(board, goatsCaptured).toDouble();

  if (isMaximizing) {
    var maxScore = double.negativeInfinity;
    for (final move in getAllTigerMoves(board)) {
      final nb = List<String?>.from(board);
      nb[move.from] = null;
      nb[move.to] = 'tiger';
      var nc = goatsCaptured;
      if (move.captures != null) {
        nb[move.captures!] = null;
        nc++;
      }
      final score = _minimax(nb, nc, depth - 1, false, alpha, beta);
      if (score > maxScore) maxScore = score;
      if (score > alpha) alpha = score;
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    var minScore = double.infinity;
    final goatNodes = [
      for (var i = 0; i < 25; i++)
        if (board[i] == 'goat') i
    ];
    outer:
    for (final from in goatNodes) {
      for (final to in getValidMoves(board, from)) {
        final nb = List<String?>.from(board);
        nb[from] = null;
        nb[to] = 'goat';
        final score = _minimax(nb, goatsCaptured, depth - 1, true, alpha, beta);
        if (score < minScore) minScore = score;
        if (score < beta) beta = score;
        if (beta <= alpha) break outer;
      }
    }
    return minScore == double.infinity ? 0 : minScore;
  }
}
