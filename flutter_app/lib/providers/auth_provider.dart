import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _loadStoredToken();
  }

  Future<void> _loadStoredToken() async {
    try {
      final token = await ApiService.getToken();
      if (token != null) {
        _token = token;
        final profile = await ApiService.getProfile();
        _user = profile;
      }
    } catch (e) {
      debugPrint('Auto-login failed: $e');
      await ApiService.clearToken();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    final res = await ApiService.login(email, password);
    _token = res['token'];
    _user = res['user'];
    await ApiService.saveToken(_token!);
    notifyListeners();
  }

  Future<void> signup(String name, String email, String password, String confirmPassword) async {
    final res = await ApiService.signup(name, email, password, confirmPassword);
    _token = res['token'];
    _user = res['user'];
    await ApiService.saveToken(_token!);
    notifyListeners();
  }

  Future<void> logout() async {
    await ApiService.clearToken();
    _token = null;
    _user = null;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    try {
      final profile = await ApiService.getProfile();
      _user = profile;
      notifyListeners();
    } catch (e) {
      debugPrint('Refresh user failed: $e');
    }
  }
}
