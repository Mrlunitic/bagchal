import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's local IP when testing on a real device
// e.g., 'http://192.168.1.100:5000'
const BASE_URL = 'http://10.0.2.2:5000'; // Android emulator → localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('bagchal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signupAPI = (data) => api.post('/api/auth/signup', data);
export const loginAPI = (data) => api.post('/api/auth/login', data);

// User
export const getProfileAPI = () => api.get('/api/user/profile');
export const updateProfileAPI = (data) => api.put('/api/user/update', data);

// Game
export const saveResultAPI = (data) => api.post('/api/game/save-result', data);
export const getHistoryAPI = () => api.get('/api/game/history');
export const getLeaderboardAPI = () => api.get('/api/game/leaderboard');

export default api;
