import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _startGame(BuildContext context, String mode) {
    Navigator.pushNamed(context, '/game', arguments: {'mode': mode});
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final firstName = user?['name']?.split(' ')[0] ?? 'Player';

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Text(
                  'Hello, $firstName 👋',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 16),
                ),
                const Text(
                  'Bagh-Chal',
                  style: TextStyle(
                    fontSize: 38,
                    fontWeight: FontWeight.w900,
                    color: AppColors.purpleLight,
                    letterSpacing: 2,
                  ),
                ),
                const Text(
                  '🐅 Tiger & Goats • Traditional Nepali Game 🐐',
                  style: TextStyle(color: AppColors.textDim, fontSize: 13),
                ),
                const SizedBox(height: 24),

                // Stats Row
                Row(
                  children: [
                    _buildStatBox('Played', user?['gamesPlayed']?.toString() ?? '0'),
                    const SizedBox(width: 12),
                    _buildStatBox('Wins', user?['wins']?.toString() ?? '0', color: AppColors.green),
                    const SizedBox(width: 12),
                    _buildStatBox('Losses', user?['losses']?.toString() ?? '0', color: AppColors.red),
                  ],
                ),
                const SizedBox(height: 24),

                // Game Board Preview
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: const [
                      Text('♟️ 🎯 ♟️ 🎯 ♟️', style: TextStyle(fontSize: 20, letterSpacing: 8)),
                      Text('🎯 🐅 🎯 🐅 🎯', style: TextStyle(fontSize: 20, letterSpacing: 8)),
                      Text('♟️ 🎯 ♟️ 🎯 ♟️', style: TextStyle(fontSize: 20, letterSpacing: 8)),
                      Text('🎯 🐅 🎯 🐅 🎯', style: TextStyle(fontSize: 20, letterSpacing: 8)),
                      Text('♟️ 🎯 ♟️ 🎯 ♟️', style: TextStyle(fontSize: 20, letterSpacing: 8)),
                      SizedBox(height: 8),
                      Text(
                        '5×5 Strategic Board',
                        style: TextStyle(color: AppColors.textDim, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                const Text(
                  'Choose Mode',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                _buildModeCard(
                  context,
                  title: 'Player vs Player',
                  desc: 'Play locally with a friend on the same device',
                  icon: '👥',
                  iconBg: AppColors.purpleDark,
                  onTap: () => _startGame(context, 'pvp'),
                ),
                _buildModeCard(
                  context,
                  title: 'Player vs AI',
                  desc: 'Challenge the computer — you play as Goats',
                  icon: '🤖',
                  iconBg: AppColors.aiGreen,
                  borderColor: AppColors.aiGreen,
                  onTap: () => _startGame(context, 'ai'),
                ),

                const SizedBox(height: 8),
                // Quick Rules
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderAlt),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '📖 Quick Rules',
                        style: TextStyle(
                          color: AppColors.purpleLight,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildRule('🐅 4 Tigers start at the corners'),
                      _buildRule('🐐 Place 20 Goats one by one on the board'),
                      _buildRule('🐅 Tigers win by capturing 5 goats'),
                      _buildRule('🐐 Goats win by surrounding all tigers'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: AppColors.bg0,
        selectedItemColor: AppColors.purpleLight,
        unselectedItemColor: AppColors.textDim,
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) Navigator.pushNamed(context, '/leaderboard');
          if (index == 2) Navigator.pushNamed(context, '/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.leaderboard), label: 'Leaderboard'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildStatBox(String label, String value, {Color color = AppColors.purpleLight}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeCard(
    BuildContext context, {
    required String title,
    required String desc,
    required String icon,
    required Color iconBg,
    required VoidCallback onTap,
    Color? borderColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.bottom(12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor ?? AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Text(icon, style: const TextStyle(fontSize: 24)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    desc,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ],
              ),
            ),
            const Text(
              '›',
              style: TextStyle(
                color: AppColors.purpleLight,
                fontSize: 24,
                fontWeight: FontWeight.w300,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRule(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(color: Color(0xFFd1d5db), fontSize: 13),
      ),
    );
  }
}
