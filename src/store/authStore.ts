import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Teacher } from '../types/auth.types';

interface AuthStore {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setTeacher: (teacher: Teacher) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools((set) => ({
    teacher: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    setTeacher: (teacher) => set({ teacher, isAuthenticated: true }),
    setAccessToken: (token) => set({ accessToken: token }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ teacher: null, isAuthenticated: false, accessToken: null }),
  }), { name: 'auth-store' })
);
