import { api } from '../../../../services/api';
import type { LoginDto, RegisterDto, AuthResponse } from '../types';

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  sendOtp: async (phone: string, purpose: string = 'PHONE_VERIFICATION') => {
    const response = await api.post<{ success: boolean; message: string; cooldownSeconds: number; phone?: string }>('/auth/send-otp', {
      phone,
      purpose,
    });
    return response.data;
  },

  verifyOtp: async (data: { phone: string; otp: string; purpose?: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (phone: string, purpose: string = 'PHONE_VERIFICATION') => {
    const response = await api.post<{ success: boolean; message: string; cooldownSeconds: number; phone?: string }>('/auth/resend-otp', {
      phone,
      purpose,
    });
    return response.data;
  },

  forgotPassword: async (phone: string) => {
    const response = await api.post<{ success: boolean; message: string; cooldownSeconds: number; phone?: string }>('/auth/forgot-password', {
      phone,
    });
    return response.data;
  },

  resetPassword: async (data: { phone: string; otp: string; newPassword: string; confirmPassword: string }) => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};
