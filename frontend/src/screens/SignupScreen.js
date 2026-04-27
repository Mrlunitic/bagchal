import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      newErrors.password = 'Password needs uppercase, lowercase, and a number';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.confirmPassword);
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert('Signup Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, placeholder, secure = false, keyboard = 'default' }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, field === 'password' && styles.passwordInput, errors[field] && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          value={form[field]}
          onChangeText={(t) => update(field, t)}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboard}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
        />
        {secure && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </>
  );

  return (
    <LinearGradient colors={['#0d0520', '#1a0a2e', '#0d0520']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.logo}>🐐</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Bagh-Chal arena</Text>

          <View style={styles.card}>
            <Field label="Full Name" field="name" placeholder="Your name" />
            <Field label="Email" field="email" placeholder="your@email.com" keyboard="email-address" />
            <Field label="Password" field="password" placeholder="Min 6 chars, upper+lower+number" secure />
            <Field label="Confirm Password" field="confirmPassword" placeholder="Re-enter password" secure />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
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
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#c084fc' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 28, letterSpacing: 2 },
  card: {
    width: '100%', backgroundColor: '#1e1035', borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#4c1d95',
    shadowColor: '#7c3aed', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  label: { color: '#c084fc', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0d0520', color: '#f3f4f6', borderRadius: 12,
    borderWidth: 1, borderColor: '#374151', padding: 14, fontSize: 15, flex: 1,
  },
  passwordInput: { flex: 1 },
  inputError: { borderColor: '#ef4444' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
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
