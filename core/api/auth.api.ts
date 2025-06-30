// core/api/auth.ts
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:5077/api';

export async function loginFarmer(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_BASE_URL}/Auth/login`, {
    email,
    password,
  });
    return response.data;

}
