import 'package:flutter/material.dart';
import '../theme.dart';
import '../services/api_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  List<dynamic> _leaders = [];
  bool _loading = true;
  String? _error;

  final List<String> _medals = ['🥇', '🥈', '🥉'];

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await ApiService.getLeaderboard();
      setState(() => _leaders = res);
    } catch (e) {
      setState(() => _error = 'Failed to load leaderboard. Check server connection.');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('🏆 Leaderboard', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.purpleLight)),
                    Text('Top players by wins', style: TextStyle(color: AppColors.textDim, fontSize: 13)),
                  ],
                ),
              ),
              Expanded(
                child: _buildContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.purpleLight));
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!, style: const TextStyle(color: AppColors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchLeaderboard,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.purple),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }
    if (_leaders.isEmpty) {
      return const Center(child: Text('No players yet. Be the first to play!', style: TextStyle(color: AppColors.textMuted)));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      itemCount: _leaders.length,
      itemBuilder: (context, index) {
        final item = _leaders[index];
        final winRate = item['gamesPlayed'] > 0 ? (item['wins'] / item['gamesPlayed'] * 100).round() : 0;
        
        return Container(
          margin: const EdgeInsets.bottom(10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: index == 0 ? AppColors.yellow : AppColors.borderAlt, width: index == 0 ? 2 : 1),
          ),
          child: Row(
            children: [
              Text(
                index < 3 ? _medals[index] : '#${index + 1}',
                style: const TextStyle(fontSize: 20),
              ),
              const SizedBox(width: 10),
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(color: AppColors.purpleDark, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Text(
                  item['name']?.substring(0, 1).toUpperCase() ?? '',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['name'] ?? '', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 15)),
                    Text('${item['wins']}W · ${item['losses']}L · ${item['gamesPlayed']} games', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  ],
                ),
              ),
              Column(
                children: [
                  Text('$winRate%', style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.w800, fontSize: 18)),
                  const Text('Win Rate', style: TextStyle(color: AppColors.textDim, fontSize: 11)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
