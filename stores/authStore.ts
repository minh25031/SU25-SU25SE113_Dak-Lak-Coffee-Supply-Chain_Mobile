import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setToken: async (token) => {
    await AsyncStorage.setItem('authToken', token);
      const decoded: any = jwtDecode(token);

    set({ user: decoded, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const saved = await AsyncStorage.getItem('authToken');
    if (saved) {
      const decoded: any = jwtDecode(saved);
      set({ user: decoded, token: saved });
    }
  },
}));
