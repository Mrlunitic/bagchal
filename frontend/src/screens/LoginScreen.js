import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e', '#0d0520']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.logo}>🐅</Text>
          <Text style={styles.title}>Bagh-Chal</Text>
          <Text style={styles.subtitle}>Tiger & Goats</Text>
          <Text style={styles.heading}>Welcome Back</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Enter password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '800', color: '#c084fc', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 32, letterSpacing: 4 },
  heading: { fontSize: 22, fontWeight: '700', color: '#f3f4f6', marginBottom: 20 },
  card: {
    width: '100%', backgroundColor: '#1e1035', borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#4c1d95',
    shadowColor: '#7c3aed', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  label: { color: '#c084fc', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0d0520', color: '#f3f4f6', borderRadius: 12,
    borderWidth: 1, borderColor: '#374151', padding: 14, fontSize: 15,
  },
  inputError: { borderColor: '#ef4444' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 14 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: '#7c3aed', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#9ca3af', marginTop: 24, fontSize: 14 },
  linkBold: { color: '#c084fc', fontWeight: '700' },
});
