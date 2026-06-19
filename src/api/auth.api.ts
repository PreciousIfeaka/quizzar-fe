import api, { publicApi } from '../lib/axios';
import type {
  Teacher,
  SignInRequest,
  SignUpRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthResponse
} from '../types/auth.types';

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
}

export const authApi = {
  signin: (data: SignInRequest): Promise<AuthResponse> =>
    publicApi.post('/api/v1/auth/signin', data).then(r => r.data.data),

  signup: (data: SignUpRequest): Promise<string> =>
    publicApi.post('/api/v1/auth/signup', data).then(r => r.data.data),

  verifyEmail: (data: VerifyEmailRequest): Promise<AuthResponse> =>
    publicApi.post('/api/v1/auth/verify-email', data).then(r => r.data.data),

  resendOtp: (data: ResendOtpRequest): Promise<string> =>
    publicApi.post('/api/v1/auth/resend-otp', data).then(r => r.data.data),

  forgotPassword: (data: ForgotPasswordRequest): Promise<string> =>
    publicApi.post('/api/v1/auth/forgot-password', data).then(r => r.data.data),

  resetPassword: (data: ResetPasswordRequest): Promise<string> =>
    publicApi.post('/api/v1/auth/reset-password', data).then(r => r.data.data),

  changePassword: (data: ChangePasswordRequest): Promise<string> =>
    api.post('/api/v1/auth/change-password', data).then(r => r.data.data),

  getProfile: (): Promise<Teacher> =>
    api.post('/api/v1/auth/me').then(r => r.data.data),

  updateProfile: (data: UpdateProfileRequest): Promise<Teacher> =>
    api.put('/api/v1/teachers/profile', data).then(r => r.data.data),

  getAvatarUploadUrl: (filename: string, contentType: string): Promise<PresignedUrlResponse> =>
    api.post(`/api/v1/teachers/avatar/presigned-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`)
      .then(r => r.data.data),
};
