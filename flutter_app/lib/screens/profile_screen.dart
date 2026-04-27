import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  List<dynamic> _history = [];
  bool _loadingHistory = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    context.read<AuthProvider>().refreshUser();
    setState(() => _loadingHistory = true);
    try {
      final h = await ApiService.getHistory();
      setState(() => _history = h.reversed.take(5).toList());
    } catch (e) {
      debugPrint('History error: $e');
    } finally {
      setState(() => _loadingHistory = false);
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthProvider>().logout();
            },
            child: const Text('Logout', style: TextStyle(color: AppColors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final int gamesPlayed = user?['gamesPlayed'] ?? 0;
    final int wins = user?['wins'] ?? 0;
    final int losses = user?['losses'] ?? 0;
    final int winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).round() : 0;

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
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'My Profile',
                    style: TextStyle(color: AppColors.purpleLight, fontSize: 22, fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(height: 20),
                
                // Avatar
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: AppColors.purpleDark,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.purple, width: 3),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    user?['name']?.substring(0, 1).toUpperCase() ?? '?',
                    style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  user?['name'] ?? 'User',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                Text(
                  user?['email'] ?? '',
                  style: const TextStyle(fontSize: 14, color: AppColors.textMuted),
                ),
                const SizedBox(height: 20),

                // Stats Grid
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _buildStatCard('Games Played', '$gamesPlayed'),
                    _buildStatCard('Wins', '$wins', color: AppColors.green),
                    _buildStatCard('Losses', '$losses', color: AppColors.red),
                    _buildStatCard('Win Rate', '$winRate%', color: AppColors.yellow),
                  ],
                ),
                const SizedBox(height: 20),

                // Win rate progress
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Win Rate Progress',
                        style: TextStyle(color: AppColors.purpleLight, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(5),
                        child: LinearProgressIndicator(
                          value: winRate / 100,
                          backgroundColor: Color(0xFF374151),
                          color: AppColors.purple,
                          minHeight: 10,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text('$winRate%', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Recent Games
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Recent Games',
                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                ),
                const SizedBox(height: 10),
                if (_loadingHistory)
                  const CircularProgressIndicator(color: AppColors.purpleLight)
                else if (_history.isEmpty)
                  const Text('No games played yet. Start playing!', style: TextStyle(color: AppColors.textDim, fontSize: 14))
                else
                  ..._history.map((g) => _buildGameRow(g)),

                const SizedBox(height: 24),
                
                // Logout button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _handleLogout,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purpleDark,
                      padding: const EdgeInsets.all(16),
                      shape: RoundedRectangle.circular(12),
                      side: BorderSide(color: AppColors.purple),
                    ),
                    child: const Text('🚪 Logout', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w700, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, {Color? color}) {
    return Container(
      width: (MediaQuery.of(context).size.width - 58) / 2,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: color ?? AppColors.purpleLight)),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildGameRow(dynamic game) {
    String result = game['result'] ?? '';
    String emoji = result == 'win' ? '🏆' : (result == 'loss' ? '💀' : '🤝');
    
    return Container(
      margin: const EdgeInsets.bottom(8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderAlt),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  result[0].toUpperCase() + result.substring(1),
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700),
                ),
                Text(
                  '${game['mode'] == 'ai' ? 'vs AI' : 'vs Player'} • ${game['side']}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            DateTime.tryParse(game['createdAt'] ?? '')?.toLocal().toString().split(' ')[0] ?? '',
            style: const TextStyle(color: AppColors.textDim, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
