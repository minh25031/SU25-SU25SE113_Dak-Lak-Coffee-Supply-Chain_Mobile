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
export async function register(
  fullName: string, 
  email: string, 
  password: string, 
  phone: string, 
  roleId: number = 1,
  companyName: string = '',
  taxId: string = '',
  businessLicenseURL: string = ''
): Promise<any> {
  try {
    console.log('🔐 Attempting registration with email:', email);
    
    // Prepare base registration data
    const registrationData: any = {
      name: fullName, // Backend expects 'name' not 'fullName'
      email,
      password,
      phone,
      roleId,
    };

    // Add business-specific fields if role is business (assuming roleId 2 is business)
    if (roleId === 2 || roleId === 3) { // Assuming roleId 2 or 3 could be business roles
      registrationData.companyName = companyName;
      registrationData.taxId = taxId;
      registrationData.businessLicenseURl = businessLicenseURL; // Note: backend uses 'URl' not 'URL'
    }

    const response = await api.post('/Auth/SignUpRequest', registrationData);
    
    console.log('✅ Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('❌ Registration error response:', error.response?.data);
    console.error('❌ Registration error status:', error.response?.status);
    throw error;
  }
}

// Function lấy roles
export async function getBusinessAndFarmerRole(): Promise<any[]> {
  try {
    console.log('🎭 Fetching roles...');
    const response = await api.get('/Roles/BusinessAndFarmer');
    console.log('✅ Roles response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching roles:', error);
    throw error;
  }
}
