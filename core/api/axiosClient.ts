import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://daklak.coffee.techtheworld.id.vn/api',
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized - Token may be invalid or expired');
    } else if (error.response?.status === 400) {
      console.error('📝 Bad Request - Check request parameters');
    } else if (error.response?.status === 500) {
      console.error('💥 Server Error - Backend issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;