import { api } from '../api';
import { User, UserMode } from '@/types';
import { normalizePhone } from './auth.service';

export const usersService = {
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: { firstName: string; lastName: string }): Promise<User> => {
    const response = await api.patch('/users/me/profile', data);
    return response.data;
  },

  updateUserMode: async (userMode: UserMode): Promise<User> => {
    const response = await api.patch('/users/me/mode', { userMode });
    return response.data;
  },

  changePassword: async (data: { currentPassword?: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.patch('/users/me/password', data);
    return response.data;
  },

  // Rattacher + vérifier un numéro au compte courant (onboarding email/Google).
  sendPhoneOtp: async (phone: string): Promise<{ message: string; phone: string }> => {
    const response = await api.post('/users/me/phone/send-otp', {
      phone: normalizePhone(phone),
    });
    return response.data;
  },

  verifyPhone: async (code: string): Promise<User> => {
    const response = await api.post('/users/me/phone/verify', { code });
    return response.data;
  },

  // Définit ou change le code PIN (4 chiffres) du compte courant.
  setPin: async (pin: string): Promise<{ message: string }> => {
    const response = await api.post('/users/me/pin', { pin });
    return response.data;
  },
};
