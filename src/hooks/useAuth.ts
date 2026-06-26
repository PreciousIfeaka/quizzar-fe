import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import type {
  SignInRequest,
  SignUpRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from '../types/auth.types';

export function useAuth() {
  const {
    teacher,
    isAuthenticated,
    isLoading,
    accessToken,
    setTeacher,
    setAccessToken,
    setLoading,
    logout
  } = useAuthStore();

  // Validate session on load
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const profile = await authApi.getProfile();
          setTeacher(profile);
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [accessToken, setTeacher, setLoading, logout]);

  const handleSignin = async (data: SignInRequest) => {
    setLoading(true);
    try {
      const response = await authApi.signin(data);
      setAccessToken(response.accessToken);
      setTeacher(response.profile);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await authApi.googleSignin(idToken);
      setAccessToken(response.accessToken);
      setTeacher(response.profile);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignUpRequest) => {
    return await authApi.signup(data);
  };

  const handleVerifyEmail = async (data: VerifyEmailRequest) => {
    setLoading(true);
    try {
      const response = await authApi.verifyEmail(data);
      setAccessToken(response.accessToken);
      setTeacher(response.profile);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (data: ResendOtpRequest) => {
    return await authApi.resendOtp(data);
  };

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    return await authApi.forgotPassword(data);
  };

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    return await authApi.resetPassword(data);
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    return await authApi.changePassword(data);
  };

  return {
    teacher,
    isAuthenticated,
    isLoading,
    signin: handleSignin,
    googleSignin: handleGoogleSignin,
    signup: handleSignup,
    verifyEmail: handleVerifyEmail,
    resendOtp: handleResendOtp,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    changePassword: handleChangePassword,
    logout: () => {
      logout();
    },
  };
}
