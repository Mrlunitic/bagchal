import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const startGame = (mode) => {
    navigation.navigate('Game', { mode });
  };

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.title}>Bagh-Chal</Text>
        <Text style={styles.subtitle}>🐅 Tiger & Goats • Traditional Nepali Game 🐐</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Played</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#4ade80' }]}>{user?.wins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f87171' }]}>{user?.losses || 0}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
        </View>

        {/* Game Board Preview */}
        <View style={styles.boardPreview}>
          <Text style={styles.boardEmoji}>♟️ 🎯 ♟️ 🎯 ♟️</Text>
          <Text style={styles.boardEmoji}>🎯 🐅 🎯 🐅 🎯</Text>
          <Text style={styles.boardEmoji}>♟️ 🎯 ♟️ 🎯 ♟️</Text>
          <Text style={styles.boardEmoji}>🎯 🐅 🎯 🐅 🎯</Text>
          <Text style={styles.boardEmoji}>♟️ 🎯 ♟️ 🎯 ♟️</Text>
          <Text style={styles.boardCaption}>5×5 Strategic Board</Text>
        </View>

        {/* Game Mode Selection */}
        <Text style={styles.sectionTitle}>Choose Mode</Text>

        <TouchableOpacity style={styles.modeCard} onPress={() => startGame('pvp')}>
          <View style={styles.modeIconBox}>
            <Text style={styles.modeIcon}>👥</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Player vs Player</Text>
            <Text style={styles.modeDesc}>Play locally with a friend on the same device</Text>
          </View>
          <Text style={styles.modeArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.modeCard, styles.modeCardAI]} onPress={() => startGame('ai')}>
          <View style={[styles.modeIconBox, styles.modeIconBoxAI]}>
            <Text style={styles.modeIcon}>🤖</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Player vs AI</Text>
            <Text style={styles.modeDesc}>Challenge the computer — you play as Goats</Text>
          </View>
          <Text style={styles.modeArrow}>›</Text>
        </TouchableOpacity>

        {/* Rules Quick Guide */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>📖 Quick Rules</Text>
          <Text style={styles.rule}>🐅 4 Tigers start at the corners</Text>
          <Text style={styles.rule}>🐐 Place 20 Goats one by one on the board</Text>
          <Text style={styles.rule}>🐅 Tigers win by capturing 5 goats</Text>
          <Text style={styles.rule}>🐐 Goats win by surrounding all tigers</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 24, paddingTop: 60 },
  greeting: { color: '#9ca3af', fontSize: 16 },
  title: { fontSize: 38, fontWeight: '900', color: '#c084fc', letterSpacing: 2, marginTop: 4 },
  subtitle: { color: '#6b7280', fontSize: 13, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: '#1e1035', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#4c1d95',
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#c084fc' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  boardPreview: {
    backgroundColor: '#1e1035', borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#4c1d95', alignItems: 'center',
  },
  boardEmoji: { fontSize: 20, letterSpacing: 8, marginVertical: 2 },
  boardCaption: { color: '#6b7280', fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f3f4f6', marginBottom: 12 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1035',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#4c1d95',
  },
  modeCardAI: { borderColor: '#065f46' },
  modeIconBox: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#4c1d95',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  modeIconBoxAI: { backgroundColor: '#065f46' },
  modeIcon: { fontSize: 24 },
  modeInfo: { flex: 1 },
  modeName: { color: '#f3f4f6', fontSize: 16, fontWeight: '700' },
  modeDesc: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  modeArrow: { color: '#c084fc', fontSize: 24, fontWeight: '300' },
  rulesBox: {
    backgroundColor: '#1e1035', borderRadius: 16, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#374151',
  },
  rulesTitle: { color: '#c084fc', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  rule: { color: '#d1d5db', fontSize: 13, marginBottom: 6 },
});
