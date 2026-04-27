import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { saveResultAPI } from '../services/api';
import {
  createInitialState, ADJACENCY, getValidPlacements, getValidMoves,
  getTigerCaptures, applyMove, undoMove, getBestAIMove, INITIAL_TIGERS,
} from '../game/bagchalEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const CELL = BOARD_SIZE / 4;

// Grid lines for the Bagh-Chal board
const BOARD_LINES = [];
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 4; c++) {
    BOARD_LINES.push({ x1: c * CELL, y1: r * CELL, x2: (c + 1) * CELL, y2: r * CELL }); // horizontal
  }
}
for (let c = 0; c < 5; c++) {
  for (let r = 0; r < 4; r++) {
    BOARD_LINES.push({ x1: c * CELL, y1: r * CELL, x2: c * CELL, y2: (r + 1) * CELL }); // vertical
  }
}
// Diagonal lines (standard Bagh-Chal board diagonals)
const DIAGS = [
  [0,6],[2,8],[4,2],[6,12],[8,16],[4,8],[12,18],[10,16],[12,8],[16,22],[18,24],[20,16],
  [0,12],[4,16],[20,24],[0,24],
];
DIAGS.forEach(([a, b]) => {
  const r1 = Math.floor(a/5), c1 = a%5, r2 = Math.floor(b/5), c2 = b%5;
  BOARD_LINES.push({ x1: c1*CELL, y1: r1*CELL, x2: c2*CELL, y2: r2*CELL });
});

export default function GameScreen({ route, navigation }) {
  const { mode } = route.params;
  const { user, refreshUser } = useAuth();
  const [gameState, setGameState] = useState(createInitialState());
  const [saving, setSaving] = useState(false);
  const aiThinking = useRef(false);

  const { board, phase, turn, goatsPlaced, goatsCaptured, selectedNode, validMoves, winner } = gameState;

  // AI move effect (triggers when it's tiger's turn in AI mode)
  useEffect(() => {
    if (mode === 'ai' && turn === 'tiger' && !winner && !aiThinking.current) {
      aiThinking.current = true;
      setTimeout(() => {
        setGameState(prev => {
          const best = getBestAIMove(prev.board, prev.goatsCaptured, 3);
          if (!best) { aiThinking.current = false; return prev; }
          const newState = applyMove(prev, {
            type: 'MOVE_TIGER',
            from: best.from,
            to: best.to,
            captures: best.captures,
          });
          aiThinking.current = false;
          return newState;
        });
      }, 600); // small delay to show "thinking"
    }
  }, [turn, winner, mode]);

  // Handle game over
  useEffect(() => {
    if (winner) {
      const isPlayerGoat = mode === 'ai'; // player is goat in AI mode
      const playerWon = (isPlayerGoat && winner === 'goat') || (!isPlayerGoat && winner === mode === 'pvp');

      setTimeout(() => {
        Alert.alert(
          winner === 'tiger' ? '🐅 Tigers Win!' : '🐐 Goats Win!',
          winner === 'tiger'
            ? 'Tigers captured 5 goats!'
            : 'Goats blocked all tigers!',
          [
            { text: 'Play Again', onPress: handleRestart },
            {
              text: 'Save & Exit', onPress: () => handleSaveAndExit(winner, mode),
            },
          ]
        );
      }, 300);
    }
  }, [winner]);

  const handleSaveAndExit = async (winnerSide, gameMode) => {
    if (!user) { navigation.goBack(); return; }
    setSaving(true);
    try {
      // In AI mode, player plays as goat
      const playerSide = gameMode === 'ai' ? 'goat' : 'both';
      const result = gameMode === 'ai'
        ? (winnerSide === 'goat' ? 'win' : 'loss')
        : 'draw'; // PvP: the calling player loses (simplification)
      await saveResultAPI({ result, mode: gameMode, side: playerSide, goatsCaptured });
      await refreshUser();
    } catch (e) {
      console.log('Save error:', e);
    } finally {
      setSaving(false);
      navigation.goBack();
    }
  };

  const handleRestart = () => setGameState(createInitialState());

  const handleUndo = () => {
    if (mode === 'ai') {
      // Undo twice (undo AI move + player move)
      setGameState(prev => undoMove(undoMove(prev)));
    } else {
      setGameState(prev => undoMove(prev));
    }
  };

  const handleNodePress = useCallback((nodeIndex) => {
    if (winner) return;
    if (mode === 'ai' && turn === 'tiger') return; // AI's turn

    setGameState(prev => {
      const { board, phase, turn, selectedNode, validMoves, goatsPlaced } = prev;

      // GOAT TURN
      if (turn === 'goat') {
        if (phase === 'placement') {
          // Place a goat on empty node
          if (board[nodeIndex] === null) {
            return applyMove(prev, { type: 'PLACE_GOAT', to: nodeIndex });
          }
          return prev;
        } else {
          // Movement phase
          if (selectedNode === nodeIndex) {
            return { ...prev, selectedNode: null, validMoves: [] };
          }
          if (selectedNode !== null && validMoves.includes(nodeIndex)) {
            return applyMove(prev, { type: 'MOVE_GOAT', from: selectedNode, to: nodeIndex });
          }
          if (board[nodeIndex] === 'goat') {
            const moves = getValidMoves(board, nodeIndex);
            return { ...prev, selectedNode: nodeIndex, validMoves: moves };
          }
          return prev;
        }
      }

      // TIGER TURN (PvP only)
      if (turn === 'tiger') {
        if (selectedNode === nodeIndex) {
          return { ...prev, selectedNode: null, validMoves: [] };
        }
        if (selectedNode !== null) {
          const captureMoves = getTigerCaptures(board, selectedNode);
          const captureMove = captureMoves.find(m => m.to === nodeIndex);
          if (captureMove) {
            return applyMove(prev, { type: 'MOVE_TIGER', from: selectedNode, to: nodeIndex, captures: captureMove.captures });
          }
          const regularMoves = getValidMoves(board, selectedNode);
          if (regularMoves.includes(nodeIndex)) {
            return applyMove(prev, { type: 'MOVE_TIGER', from: selectedNode, to: nodeIndex, captures: null });
          }
        }
        if (board[nodeIndex] === 'tiger') {
          const regularMoves = getValidMoves(board, nodeIndex);
          const captureMoves = getTigerCaptures(board, nodeIndex).map(m => m.to);
          return { ...prev, selectedNode: nodeIndex, validMoves: [...regularMoves, ...captureMoves] };
        }
        return prev;
      }

      return prev;
    });
  }, [winner, mode, turn]);

  const getNodeStyle = (index) => {
    if (selectedNode === index) return [styles.node, styles.nodeSelected];
    if (validMoves.includes(index)) return [styles.node, styles.nodeValid];
    return styles.node;
  };

  const getPieceEmoji = (val) => {
    if (val === 'tiger') return '🐅';
    if (val === 'goat') return '🐐';
    return null;
  };

  const goatsLeft = 20 - goatsPlaced;
  const tigersTurn = turn === 'tiger';

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'ai' ? '🤖 vs AI' : '👥 PvP'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.turnBadge, tigersTurn ? styles.tigerBadge : styles.goatBadge]}>
            <Text style={styles.turnText}>
              {tigersTurn ? '🐅 Tigers' : '🐐 Goats'} Turn
            </Text>
          </View>
          {mode === 'ai' && tigersTurn && !winner && (
            <Text style={styles.thinkingText}>🤔 AI thinking...</Text>
          )}
        </View>

        {/* Scoreboard */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{goatsLeft}</Text>
            <Text style={styles.scoreLbl}>🐐 Left to Place</Text>
          </View>
          <View style={styles.phaseBox}>
            <Text style={styles.phaseText}>
              {phase === 'placement' ? '📍 Placement' : '♟ Movement'}
            </Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreNum, { color: '#f87171' }]}>{goatsCaptured}</Text>
            <Text style={styles.scoreLbl}>💀 Captured</Text>
          </View>
        </View>

        {/* Game Board */}
        <View style={[styles.boardContainer, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {/* Draw lines */}
          {BOARD_LINES.map((line, i) => {
            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: line.x1,
                  top: line.y1,
                  width: length,
                  height: 1.5,
                  backgroundColor: '#4c1d95',
                  transformOrigin:'0 0',
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}

          {/* Draw nodes */}
          {board.map((val, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const x = col * CELL;
            const y = row * CELL;
            const isSelected = selectedNode === i;
            const isValid = validMoves.includes(i);

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleNodePress(i)}
                style={[
                  styles.nodeBtn,
                  {
                    left: x - 20,
                    top: y - 20,
                  },
                ]}
              >
                <View
                  style={[
                    styles.nodeInner,
                    isSelected && styles.nodeSelected,
                    isValid && !val && styles.nodeValid,
                    isValid && val && styles.nodeCapture,
                  ]}
                >
                  {val ? (
                    <Text style={styles.pieceText}>{getPieceEmoji(val)}</Text>
                  ) : isValid ? (
                    <View style={styles.validDot} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleUndo}>
            <Text style={styles.ctrlText}>↩ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnDanger]} onPress={handleRestart}>
            <Text style={[styles.ctrlText, { color: '#f87171' }]}>🔄 Restart</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructBox}>
          {turn === 'goat' && phase === 'placement' && (
            <Text style={styles.instruct}>🐐 Tap any empty spot to place a goat ({goatsLeft} left)</Text>
          )}
          {turn === 'goat' && phase === 'movement' && (
            <Text style={styles.instruct}>🐐 Select a goat, then tap a highlighted spot to move</Text>
          )}
          {turn === 'tiger' && mode === 'pvp' && (
            <Text style={styles.instruct}>🐅 Select a tiger, then tap a highlighted spot to move or capture</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const NODE_SIZE = 40;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  backText: { color: '#c084fc', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#f3f4f6', fontSize: 18, fontWeight: '800' },
  statusBar: { alignItems: 'center', marginBottom: 12 },
  turnBadge: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 4,
  },
  tigerBadge: { backgroundColor: '#7c2d12' },
  goatBadge: { backgroundColor: '#14532d' },
  turnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  thinkingText: { color: '#fbbf24', fontSize: 12 },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, paddingHorizontal: 16,
  },
  scoreBox: { flex: 1, alignItems: 'center', backgroundColor: '#1e1035', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#4c1d95' },
  scoreNum: { fontSize: 24, fontWeight: '800', color: '#c084fc' },
  scoreLbl: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  phaseBox: { flex: 1.2, alignItems: 'center', backgroundColor: '#1e1035', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#6d28d9' },
  phaseText: { color: '#c084fc', fontWeight: '700', fontSize: 12 },
  boardContainer: {
    position: 'relative', backgroundColor: '#130a28', borderRadius: 16,
    borderWidth: 2, borderColor: '#4c1d95', margin: 8,
    shadowColor: '#7c3aed', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  nodeBtn: {
    position: 'absolute', width: NODE_SIZE, height: NODE_SIZE,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  nodeInner: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  nodeSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    borderWidth: 2, borderColor: '#c084fc',
  },
  nodeValid: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1.5, borderColor: '#4ade80',
  },
  nodeCapture: {
    backgroundColor: 'rgba(248, 113, 113, 0.3)',
    borderWidth: 1.5, borderColor: '#f87171',
  },
  pieceText: { fontSize: 22 },
  validDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ade80',
  },
  controls: {
    flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: 16, width: '100%',
  },
  ctrlBtn: {
    flex: 1, backgroundColor: '#1e1035', borderRadius: 12, paddingVertical: 13,
    alignItems: 'center', borderWidth: 1, borderColor: '#4c1d95',
  },
  ctrlBtnDanger: { borderColor: '#7f1d1d' },
  ctrlText: { color: '#c084fc', fontWeight: '700', fontSize: 15 },
  instructBox: { paddingHorizontal: 16, marginTop: 12 },
  instruct: { color: '#9ca3af', fontSize: 13, textAlign: 'center' },
});
