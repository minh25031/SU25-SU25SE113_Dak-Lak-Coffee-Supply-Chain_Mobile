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
export async function login(email: string, password: string): Promise<any> {
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

// Function đăng ký
export async function register(fullName: string, email: string, password: string, phone: string): Promise<any> {
  try {
    console.log('🔐 Attempting registration with email:', email);
    const response = await api.post('/Auth/register', {
      fullName,
      email,
      password,
      phone,
    });
    
    console.log('✅ Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('❌ Registration error response:', error.response?.data);
    console.error('❌ Registration error status:', error.response?.status);
    throw error;
  }
}
