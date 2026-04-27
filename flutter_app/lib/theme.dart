import 'package:flutter/material.dart';

class AppColors {
  static const Color bg0 = Color(0xFF0d0520);
  static const Color bg1 = Color(0xFF1a0a2e);
  static const Color card = Color(0xFF1e1035);
  static const Color border = Color(0xFF4c1d95);
  static const Color borderAlt = Color(0xFF374151);
  static const Color purple = Color(0xFF7c3aed);
  static const Color purpleLight = Color(0xFFc084fc);
  static const Color purpleDark = Color(0xFF4c1d95);
  static const Color textPrimary = Color(0xFFf3f4f6);
  static const Color textMuted = Color(0xFF9ca3af);
  static const Color textDim = Color(0xFF6b7280);
  static const Color green = Color(0xFF4ade80);
  static const Color red = Color(0xFFf87171);
  static const Color yellow = Color(0xFFfbbf24);
  static const Color tigerBg = Color(0xFF7c2d12);
  static const Color goatBg = Color(0xFF14532d);
  static const Color aiGreen = Color(0xFF065f46);
}

class AppTheme {
  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.bg0,
        fontFamily: 'sans-serif',
        colorScheme: const ColorScheme.dark(
          primary: AppColors.purple,
          secondary: AppColors.purpleLight,
          surface: AppColors.card,
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: AppColors.textPrimary),
        ),
      );
}
