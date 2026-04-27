import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// For Android emulator → host machine localhost
// Change to your machine's local IP for physical device, e.g. 'http://192.168.1.100:5000'
const String kBaseUrl = 'http://10.0.2.2:5000';
const String kTokenKey = 'bagchal_token';

class ApiService {
  // ── Token helpers ──────────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kTokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(kTokenKey, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kTokenKey);
  }

  // ── Base request helpers ───────────────────────────────
  static Future<Map<String, String>> _headers({bool auth = false}) async {
    final h = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await getToken();
      if (token != null) h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  static dynamic _decode(http.Response res) {
    final body = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(body['message'] ?? 'Request failed (${res.statusCode})');
    }
    return body;
  }

  // ── Auth ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/api/auth/login'),
      headers: await _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _decode(res) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> signup(
      String name, String email, String password, String confirmPassword) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/api/auth/signup'),
      headers: await _headers(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'confirmPassword': confirmPassword,
      }),
    );
    return _decode(res) as Map<String, dynamic>;
  }

  // ── User ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(
      Uri.parse('$kBaseUrl/api/user/profile'),
      headers: await _headers(auth: true),
    );
    return _decode(res) as Map<String, dynamic>;
  }

  // ── Game ───────────────────────────────────────────────
  static Future<void> saveResult({
    required String result,
    required String mode,
    required String side,
    required int goatsCaptured,
  }) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/api/game/save-result'),
      headers: await _headers(auth: true),
      body: jsonEncode({
        'result': result,
        'mode': mode,
        'side': side,
        'goatsCaptured': goatsCaptured,
      }),
    );
    _decode(res);
  }

  static Future<List<dynamic>> getHistory() async {
    final res = await http.get(
      Uri.parse('$kBaseUrl/api/game/history'),
      headers: await _headers(auth: true),
    );
    return _decode(res) as List<dynamic>;
  }

  static Future<List<dynamic>> getLeaderboard() async {
    final res = await http.get(
      Uri.parse('$kBaseUrl/api/game/leaderboard'),
      headers: await _headers(auth: true),
    );
    return _decode(res) as List<dynamic>;
  }
}

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}
