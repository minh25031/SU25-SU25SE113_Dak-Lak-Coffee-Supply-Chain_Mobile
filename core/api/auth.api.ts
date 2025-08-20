import api from "./axiosClient";

export async function loginFarmer(email: string, password: string): Promise<string> {
  const response = await api.post('/Auth/login', {
    email,
    password,
  });
  return response.data;
}

// Thêm function login cho Delivery Staff
export async function loginDeliveryStaff(email: string, password: string): Promise<string> {
  const response = await api.post('/Auth/login', {
    email,
    password,
  });
  return response.data;
}

// Function chung cho login
export async function login(email: string, password: string): Promise<string> {
  try {
    console.log('🔐 Attempting login with email:', email);
    const response = await api.post('/Auth/login', {
      email,
      password,
    });
    
    console.log('✅ Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('❌ Login error response:', error.response?.data);
    console.error('❌ Login error status:', error.response?.status);
    throw error;
  }
}
