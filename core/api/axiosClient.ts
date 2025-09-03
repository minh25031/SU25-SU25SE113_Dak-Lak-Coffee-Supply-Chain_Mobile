import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// const BASE_URL = 'http://10.0.2.2:5077/api'; // Cho Android Emulator
const BASE_URL = 'https://daklak.coffee.techtheworld.id.vn/api';

// Retry configuration
const RETRY_CONFIG = {
  retries: 2,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    // Retry cho network errors và 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      error.message === 'Network Error' ||
      (error.response && error.response.status >= 500) ||
      error.code === 'ECONNABORTED'
    );
  }
};

// Retry function
const retryRequest = async (error: any, retryCount: number = 0): Promise<any> => {
  if (retryCount >= RETRY_CONFIG.retries || !RETRY_CONFIG.retryCondition(error)) {
    throw error;
  }

  console.log(`🔄 Retrying request (${retryCount + 1}/${RETRY_CONFIG.retries}):`, error.config?.url);
  
  // Wait before retry
  await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
  
  try {
    return await axios.request(error.config);
  } catch (retryError) {
    return retryRequest(retryError, retryCount + 1);
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000, // Giảm từ 15s xuống 8s
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Token found, adding to request:', config.url);
  } else {
    console.log('⚠️ No token found for request:', config.url);
  }
  
  // Log request details for debugging
  console.log('📤 Making request to:', config.url);
  console.log('🌐 Base URL:', BASE_URL);
  console.log('🖥️ Running on VM - using special IP configuration');
  
  return config;
});

// Add response interceptor for better error handling and retry logic
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    // Log detailed error information
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    
    // Try to retry the request if it meets retry conditions
    if (RETRY_CONFIG.retryCondition(error)) {
      try {
        console.log('🔄 Attempting to retry request:', error.config?.url);
        return await retryRequest(error);
      } catch (retryError: any) {
        console.error('❌ Retry failed:', retryError.config?.url);
        // Continue with normal error handling
      }
    }
    
    // Handle network errors specifically
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error - VM Configuration Issues:');
      console.error('   1. Backend server is running on host machine');
      console.error('   2. Using special IP for VM:', BASE_URL);
      console.error('   3. For Android Emulator: 10.0.2.2');
      console.error('   4. For iOS Simulator: localhost (should work)');
      console.error('   5. For physical device: use host machine IP');
      console.error('   6. Check if port 5077 is accessible from VM');
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized - Token may be invalid or expired');
    } else if (error.response?.status === 400) {
      console.error('📝 Bad Request - Check request parameters');
    } else if (error.response?.status === 500) {
      console.error('💥 Server Error - Backend issue');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - Server may be slow or network issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;