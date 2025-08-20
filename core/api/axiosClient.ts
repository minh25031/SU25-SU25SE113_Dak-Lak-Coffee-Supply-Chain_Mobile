import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:5077/api',
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Token found, adding to request:', config.url);
  } else {
    console.log('⚠️ No token found for request:', config.url);
  }
  return config;
});

export default api;