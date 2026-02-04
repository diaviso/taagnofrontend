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
};
