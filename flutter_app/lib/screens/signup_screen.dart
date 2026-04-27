import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _showPassword = false;
  bool _isLoading = false;
  String? _error;

  Future<void> _handleSignup() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty || confirm.isEmpty) {
      setState(() => _error = 'Please fill in all fields');
      return;
    }

    if (password != confirm) {
      setState(() => _error = 'Passwords do not match');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await context.read<AuthProvider>().signup(name, email, password, confirm);
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String hint,
    bool secure = false,
    TextInputType type = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.purpleLight,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          style: const TextStyle(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textDim),
            fillColor: AppColors.bg0,
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(14),
            suffixIcon: secure
                ? IconButton(
                    icon: Icon(
                      _showPassword ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                  )
                : null,
          ),
          obscureText: secure && !_showPassword,
          keyboardType: type,
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.bg0, AppColors.bg1, AppColors.bg0],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              children: [
                const SizedBox(height: 20),
                const Text('🐐', style: TextStyle(fontSize: 56)),
                const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: AppColors.purpleLight,
                  ),
                ),
                const Text(
                  'Join the Bagh-Chal arena',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.purple.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildField(label: 'Full Name', controller: _nameController, hint: 'Your name'),
                      _buildField(
                        label: 'Email',
                        controller: _emailController,
                        hint: 'your@email.com',
                        type: TextInputType.emailAddress,
                      ),
                      _buildField(
                        label: 'Password',
                        controller: _passwordController,
                        hint: 'Min 6 chars',
                        secure: true,
                      ),
                      _buildField(
                        label: 'Confirm Password',
                        controller: _confirmController,
                        hint: 'Re-enter password',
                        secure: true,
                      ),
                      if (_error != null) ...[
                        Text(
                          _error!,
                          style: const TextStyle(color: AppColors.red, fontSize: 13),
                        ),
                        const SizedBox(height: 12),
                      ],
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.purple,
                            padding: const EdgeInsets.all(16),
                            shape: RoundedRectangle.circular(12),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  'Sign Up',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/login'),
                  child: RichText(
                    text: const TextSpan(
                      text: "Already have an account? ",
                      style: TextStyle(color: AppColors.textMuted, fontSize: 14),
                      children: [
                        TextSpan(
                          text: "Login",
                          style: TextStyle(
                            color: AppColors.purpleLight,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
