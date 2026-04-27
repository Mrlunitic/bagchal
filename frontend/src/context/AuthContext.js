import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginAPI, signupAPI, getProfileAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login: check for stored token on startup
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('bagchal_token');
        if (storedToken) {
          setToken(storedToken);
          const res = await getProfileAPI();
          setUser(res.data);
        }
      } catch (err) {
        // Token expired or invalid — clear it
        await AsyncStorage.removeItem('bagchal_token');
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    const res = await loginAPI({ email, password });
    const { token: newToken, user: userData } = res.data;
    await AsyncStorage.setItem('bagchal_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, confirmPassword) => {
    const res = await signupAPI({ name, email, password, confirmPassword });
    const { token: newToken, user: userData } = res.data;
    await AsyncStorage.setItem('bagchal_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('bagchal_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getProfileAPI();
      setUser(res.data);
    } catch (err) {
      console.log('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
