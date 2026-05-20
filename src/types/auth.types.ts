export interface Teacher {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}
