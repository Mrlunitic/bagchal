import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_screen.dart';
import 'screens/game_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/leaderboard_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const BagchalApp(),
    ),
  );
}

class BagchalApp extends StatelessWidget {
  const BagchalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bagh-Chal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const AuthWrapper(),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/signup': (_) => const SignupScreen(),
        '/home': (_) => const HomeScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/leaderboard': (_) => const LeaderboardScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/game') {
          final args = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (_) => GameScreen(mode: args['mode'] as String),
          );
        }
        return null;
      },
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.purpleLight),
        ),
      );
    }

    return auth.user != null ? const HomeScreen() : const LoginScreen();
  }
}
