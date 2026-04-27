import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../game/bagchal_engine.dart';
import '../game/bagchal_ai.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class GameScreen extends StatefulWidget {
  final String mode;
  const GameScreen({super.key, required this.mode});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late GameState _gameState;
  bool _isAiThinking = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _gameState = createInitialState();
  }

  void _handleRestart() {
    setState(() {
      _gameState = createInitialState();
      _isAiThinking = false;
    });
  }

  void _handleUndo() {
    if (_gameState.history.isEmpty) return;
    setState(() {
      if (widget.mode == 'ai') {
        _gameState = undoMove(undoMove(_gameState));
      } else {
        _gameState = undoMove(_gameState);
      }
    });
  }

  Future<void> _handleSaveAndExit(GameWinner winner) async {
    final auth = context.read<AuthProvider>();
    if (auth.user == null) {
      Navigator.pop(context);
      return;
    }

    setState(() => _isSaving = true);
    try {
      final playerSide = widget.mode == 'ai' ? 'goat' : 'both';
      String result = 'draw';
      if (widget.mode == 'ai') {
        result = (winner == GameWinner.goat) ? 'win' : 'loss';
      }

      await ApiService.saveResult(
        result: result,
        mode: widget.mode,
        side: playerSide,
        goatsCaptured: _gameState.goatsCaptured,
      );
      await auth.refreshUser();
    } catch (e) {
      debugPrint('Save error: $e');
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
        Navigator.pop(context);
      }
    }
  }

  void _showWinnerDialog(GameWinner winner) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.card,
        title: Text(
          winner == GameWinner.tiger ? '🐅 Tigers Win!' : '🐐 Goats Win!',
          style: TextStyle(color: winner == GameWinner.tiger ? AppColors.red : AppColors.green),
        ),
        content: Text(
          winner == GameWinner.tiger ? 'Tigers captured 5 goats!' : 'Goats blocked all tigers!',
          style: const TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _handleRestart();
            },
            child: const Text('Play Again'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _handleSaveAndExit(winner);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.purple),
            child: const Text('Save & Exit'),
          ),
        ],
      ),
    );
  }

  void _onNodeTap(int index) {
    if (_gameState.winner != GameWinner.none || _isAiThinking) return;
    if (widget.mode == 'ai' && _gameState.turn == GameTurn.tiger) return;

    setState(() {
      final board = _gameState.board;
      final turn = _gameState.turn;
      final phase = _gameState.phase;
      final selected = _gameState.selectedNode;
      final validMoves = _gameState.validMoves;

      // GOAT TURN
      if (turn == GameTurn.goat) {
        if (phase == GamePhase.placement) {
          if (board[index] == null) {
            _gameState = applyMove(_gameState, PlaceGoat(index));
          }
        } else {
          // Movement
          if (selected == index) {
            _gameState = _gameState.copyWith(selectedNode: null, validMoves: []);
          } else if (selected != null && validMoves.contains(index)) {
            _gameState = applyMove(_gameState, MoveGoat(selected, index));
          } else if (board[index] == 'goat') {
            final moves = getValidMoves(board, index);
            _gameState = _gameState.copyWith(selectedNode: index, validMoves: moves);
          }
        }
      }
      // TIGER TURN (PvP)
      else if (turn == GameTurn.tiger && widget.mode == 'pvp') {
        if (selected == index) {
          _gameState = _gameState.copyWith(selectedNode: null, validMoves: []);
        } else if (selected != null) {
          final captures = getTigerCaptures(board, selected);
          final cap = captures.where((c) => c.to == index).toList();
          if (cap.isNotEmpty) {
            _gameState = applyMove(_gameState, MoveTiger(selected, index, cap.first.captures));
          } else {
            final regular = getValidMoves(board, selected);
            if (regular.contains(index)) {
              _gameState = applyMove(_gameState, MoveTiger(selected, index, null));
            }
          }
        } else if (board[index] == 'tiger') {
          final regular = getValidMoves(board, index);
          final capTo = getTigerCaptures(board, index).map((c) => c.to).toList();
          _gameState = _gameState.copyWith(
            selectedNode: index,
            validMoves: [...regular, ...capTo],
          );
        }
      }

      if (_gameState.winner != GameWinner.none) {
        Future.delayed(const Duration(milliseconds: 300), () => _showWinnerDialog(_gameState.winner));
      } else if (widget.mode == 'ai' && _gameState.turn == GameTurn.tiger) {
        _triggerAiMove();
      }
    });
  }

  void _triggerAiMove() {
    setState(() => _isAiThinking = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      final best = getBestAIMove(_gameState.board, _gameState.goatsCaptured);
      setState(() {
        if (best != null) {
          _gameState = applyMove(_gameState, MoveTiger(best.from, best.to, best.captures));
        }
        _isAiThinking = false;
        if (_gameState.winner != GameWinner.none) {
          Future.delayed(const Duration(milliseconds: 300), () => _showWinnerDialog(_gameState.winner));
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final boardSize = math.min(size.width - 32, 360.0);

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.bg0, AppColors.bg1],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: AppColors.purpleLight),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Text(
                      widget.mode == 'ai' ? '🤖 vs AI' : '👥 PvP',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(width: 48),
                  ],
                ),
              ),

              // Status Bar
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: _gameState.turn == GameTurn.tiger ? AppColors.tigerBg : AppColors.goatBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${_gameState.turn == GameTurn.tiger ? '🐅 Tigers' : '🐐 Goats'} Turn',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (_isAiThinking)
                    const Text('🤔 AI thinking...', style: TextStyle(color: AppColors.yellow, fontSize: 12))
                  else
                    const SizedBox(height: 16),
                ],
              ),

              // Scoreboard
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    _buildScoreBox('${20 - _gameState.goatsPlaced}', '🐐 Left'),
                    const SizedBox(width: 8),
                    _buildPhaseBox(_gameState.phase == GamePhase.placement ? '📍 Placement' : '♟ Movement'),
                    const SizedBox(width: 8),
                    _buildScoreBox('${_gameState.goatsCaptured}', '💀 Caught', color: AppColors.red),
                  ],
                ),
              ),

              const Spacer(),

              // Game Board
              Container(
                width: boardSize,
                height: boardSize,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF130a28),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.purple.withOpacity(0.5),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Lines
                    CustomPaint(
                      size: Size(boardSize, boardSize),
                      painter: BoardPainter(CELL: boardSize / 4),
                    ),
                    // Nodes
                    ...List.generate(25, (i) {
                      final row = i ~/ 5;
                      final col = i % 5;
                      final cell = boardSize / 4;
                      final x = col * cell;
                      final y = row * cell;

                      final isSelected = _gameState.selectedNode == i;
                      final isValid = _gameState.validMoves.contains(i);
                      final piece = _gameState.board[i];

                      return Positioned(
                        left: x - 20,
                        top: y - 20,
                        child: GestureDetector(
                          onTap: () => _onNodeTap(i),
                          child: Container(
                            width: 40,
                            height: 40,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected ? AppColors.purple.withOpacity(0.5) : Colors.transparent,
                              border: isSelected
                                  ? Border.all(color: AppColors.purpleLight, width: 2)
                                  : (isValid ? Border.all(color: piece == 'goat' ? AppColors.red : AppColors.green, width: 1.5) : null),
                            ),
                            child: piece != null
                                ? Text(piece == 'tiger' ? '🐅' : '🐐', style: const TextStyle(fontSize: 22))
                                : (isValid ? Container(width: 10, height: 10, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.green)) : null),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),

              const Spacer(),

              // Controls
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildCtrlBtn('↩ Undo', _handleUndo),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildCtrlBtn('🔄 Restart', _handleRestart, danger: true),
                    ),
                  ],
                ),
              ),

              // Instructions
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  _getInstruction(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScoreBox(String value, String label, {Color color = AppColors.purpleLight}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildPhaseBox(String text) {
    return Expanded(
      flex: 1,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.purple),
        ),
        child: Center(
          child: Text(
            text,
            style: const TextStyle(color: AppColors.purpleLight, fontWeight: FontWeight.w700, fontSize: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildCtrlBtn(String text, VoidCallback onTap, {bool danger = false}) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.card,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangle.circular(12),
        side: BorderSide(color: danger ? AppColors.tigerBg : AppColors.border),
      ),
      child: Text(
        text,
        style: TextStyle(color: danger ? AppColors.red : AppColors.purpleLight, fontWeight: FontWeight.w700),
      ),
    );
  }

  String _getInstruction() {
    if (_gameState.turn == GameTurn.goat) {
      return _gameState.phase == GamePhase.placement
          ? '🐐 Tap any empty spot to place a goat (${20 - _gameState.goatsPlaced} left)'
          : '🐐 Select a goat, then tap a highlighted spot to move';
    } else {
      return widget.mode == 'ai' ? '🐅 AI is making a move...' : '🐅 Select a tiger, then tap to move or capture';
    }
  }
}

class BoardPainter extends CustomPainter {
  final double CELL;
  BoardPainter({required this.CELL});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.purpleDark
      ..strokeWidth = 1.5;

    // Grid lines
    for (int i = 0; i < 5; i++) {
      canvas.drawLine(Offset(0, i * CELL), Offset(4 * CELL, i * CELL), paint);
      canvas.drawLine(Offset(i * CELL, 0), Offset(i * CELL, 4 * CELL), paint);
    }

    // Standard Diagonals
    canvas.drawLine(const Offset(0, 0), Offset(4 * CELL, 4 * CELL), paint);
    canvas.drawLine(Offset(4 * CELL, 0), Offset(0, 4 * CELL), paint);
    
    // Middle diagonals
    canvas.drawLine(Offset(2 * CELL, 0), Offset(0, 2 * CELL), paint);
    canvas.drawLine(Offset(2 * CELL, 0), Offset(4 * CELL, 2 * CELL), paint);
    canvas.drawLine(Offset(2 * CELL, 4 * CELL), Offset(0, 2 * CELL), paint);
    canvas.drawLine(Offset(2 * CELL, 4 * CELL), Offset(4 * CELL, 2 * CELL), paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
