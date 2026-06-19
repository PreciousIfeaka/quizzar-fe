import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Teacher } from '../types/auth.types';

interface AuthStore {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setTeacher: (teacher: Teacher | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const TOKEN_KEY = 'quizzar_access_token';

// Read initial token from localStorage
const initialToken = typeof window !== 'undefined'
  ? localStorage.getItem(TOKEN_KEY)
  : null;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      teacher: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: initialToken,
      setTeacher: (teacher) => set({ teacher, isAuthenticated: !!teacher }),
      setAccessToken: (token) => {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
        set({ accessToken: token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ teacher: null, isAuthenticated: false, accessToken: null });
      },
    }),
    { name: 'auth-store' }
  )
);
