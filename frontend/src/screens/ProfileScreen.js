import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getHistoryAPI } from '../services/api';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    refreshUser();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const res = await getHistoryAPI();
      setHistory(res.data.slice(0, 5));
    } catch (err) {
      console.log('History error:', err);
    } finally {
      setHistLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const winRate = user?.gamesPlayed > 0
    ? Math.round((user.wins / user.gamesPlayed) * 100)
    : 0;

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>My Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Text style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{user?.gamesPlayed || 0}</Text>
            <Text style={styles.statLbl}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#4ade80' }]}>{user?.wins || 0}</Text>
            <Text style={styles.statLbl}>Wins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#f87171' }]}>{user?.losses || 0}</Text>
            <Text style={styles.statLbl}>Losses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#fbbf24' }]}>{winRate}%</Text>
            <Text style={styles.statLbl}>Win Rate</Text>
          </View>
        </View>

        {/* Win Rate Progress Bar */}
        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>Win Rate Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${winRate}%` }]} />
          </View>
          <Text style={styles.progressText}>{winRate}%</Text>
        </View>

        {/* Recent Games */}
        <Text style={styles.sectionTitle}>Recent Games</Text>
        {histLoading ? (
          <ActivityIndicator color="#c084fc" style={{ marginTop: 16 }} />
        ) : history.length === 0 ? (
          <Text style={styles.noGames}>No games played yet. Start playing!</Text>
        ) : (
          history.map((game, i) => (
            <View key={game._id || i} style={styles.gameRow}>
              <Text style={styles.gameIcon}>
                {game.result === 'win' ? '🏆' : game.result === 'loss' ? '💀' : '🤝'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.gameResult}>
                  {game.result.charAt(0).toUpperCase() + game.result.slice(1)}
                </Text>
                <Text style={styles.gameMode}>
                  {game.mode === 'ai' ? 'vs AI' : 'vs Player'} • {game.side}
                </Text>
              </View>
              <Text style={styles.gameDate}>
                {new Date(game.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 24, paddingTop: 60, alignItems: 'center' },
  pageTitle: { color: '#c084fc', fontSize: 22, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 20 },
  avatarBox: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4c1d95', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#7c3aed',
  },
  avatar: { fontSize: 36, color: '#fff', fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '800', color: '#f3f4f6', marginTop: 12 },
  userEmail: { fontSize: 14, color: '#9ca3af', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16, width: '100%' },
  statCard: {
    flex: 1, minWidth: '42%', backgroundColor: '#1e1035', borderRadius: 14,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#4c1d95',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: '#c084fc' },
  statLbl: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  progressBox: {
    width: '100%', backgroundColor: '#1e1035', borderRadius: 14,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#4c1d95',
  },
  progressLabel: { color: '#c084fc', fontWeight: '600', marginBottom: 8 },
  progressBar: { height: 10, backgroundColor: '#374151', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 5 },
  progressText: { color: '#9ca3af', fontSize: 12, marginTop: 6, textAlign: 'right' },
  sectionTitle: { color: '#f3f4f6', fontWeight: '700', fontSize: 16, alignSelf: 'flex-start', marginBottom: 10 },
  noGames: { color: '#6b7280', fontSize: 14, marginTop: 8 },
  gameRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1035',
    borderRadius: 12, padding: 12, marginBottom: 8, width: '100%',
    borderWidth: 1, borderColor: '#374151',
  },
  gameIcon: { fontSize: 24, marginRight: 12 },
  gameResult: { color: '#f3f4f6', fontWeight: '700' },
  gameMode: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  gameDate: { color: '#6b7280', fontSize: 11 },
  logoutBtn: {
    marginTop: 24, backgroundColor: '#4c1d95', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: '#7c3aed',
  },
  logoutText: { color: '#f87171', fontWeight: '700', fontSize: 16 },
});
