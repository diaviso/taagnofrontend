import { api } from '@/lib/api';
import { User } from '@/types';

export const authService = {
  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  getGoogleLoginUrl(): string {
    return process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL || 'http://localhost:3008/api/auth/google';
  },

  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: { token: string; password: string }) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async verifyEmail(data: { email: string; code: string }) {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  async resendCode(email: string) {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  },
};
