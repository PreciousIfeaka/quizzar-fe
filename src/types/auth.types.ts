export interface Teacher {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

export interface SignInRequest {
  email: string;
  password?: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  profile: Teacher;
}
