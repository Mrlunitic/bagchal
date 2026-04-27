import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getLeaderboardAPI } from '../services/api';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLeaderboardAPI();
      setLeaders(res.data);
    } catch (err) {
      setError('Failed to load leaderboard. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const winRate = item.gamesPlayed > 0
      ? Math.round((item.wins / item.gamesPlayed) * 100)
      : 0;

    return (
      <View style={[styles.row, index === 0 && styles.rowFirst]}>
        <Text style={styles.rank}>
          {index < 3 ? MEDALS[index] : `#${index + 1}`}
        </Text>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerStats}>
            {item.wins}W · {item.losses}L · {item.gamesPlayed} games
          </Text>
        </View>
        <View style={styles.winBox}>
          <Text style={styles.winNum}>{winRate}%</Text>
          <Text style={styles.winLbl}>Win Rate</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Top players by wins</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#c084fc" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchLeaderboard}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : leaders.length === 0 ? (
          <Text style={styles.emptyText}>No players yet. Be the first to play!</Text>
        ) : (
          <FlatList
            data={leaders}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '900', color: '#c084fc', marginBottom: 4 },
  subtitle: { color: '#6b7280', fontSize: 13, marginBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1035',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#374151',
  },
  rowFirst: { borderColor: '#fbbf24', borderWidth: 2 },
  rank: { fontSize: 20, width: 36, textAlign: 'center' },
  avatarBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#4c1d95',
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 10,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  playerInfo: { flex: 1 },
  playerName: { color: '#f3f4f6', fontWeight: '700', fontSize: 15 },
  playerStats: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  winBox: { alignItems: 'center' },
  winNum: { color: '#4ade80', fontWeight: '800', fontSize: 18 },
  winLbl: { color: '#6b7280', fontSize: 11 },
  errorBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#7c3aed', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#9ca3af', fontSize: 14, marginTop: 40, textAlign: 'center' },
});
