import api from "./axiosClient";

export async function loginFarmer(email: string, password: string): Promise<string> {
  const response = await api.post('/Auth/login', {
    email,
    password,
  });
  return response.data;
}
