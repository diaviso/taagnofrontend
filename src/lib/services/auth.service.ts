import { api } from '@/lib/api';
import { User } from '@/types';

// Normalise un numéro saisi (avec espaces, tirets, 0 initial…) vers le format
// E.164 `+221XXXXXXXXX` attendu par la validation backend (/^\+?[0-9]{7,15}$/).
// Doit refléter la normalisation du backend pour que le numéro envoyé à
// send-phone-otp et verify-phone-otp soit identique et toujours valide.
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0')) return `+221${cleaned.slice(1)}`;
  if (/^\d{9}$/.test(cleaned)) return `+221${cleaned}`;
  return `+${cleaned}`;
}

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

  async sendPhoneOtp(phone: string) {
    const response = await api.post('/auth/send-phone-otp', {
      phone: normalizePhone(phone),
    });
    return response.data;
  },

  async verifyPhoneOtp(data: { phone: string; code: string }) {
    const response = await api.post('/auth/verify-phone-otp', {
      phone: normalizePhone(data.phone),
      code: data.code,
    });
    return response.data;
  },

  // Étape suivante sans révéler l'existence du compte : 'pin' (connexion) ou 'otp'.
  async checkPhone(phone: string): Promise<{ nextStep: 'pin' | 'otp' }> {
    const response = await api.post('/auth/phone/check', {
      phone: normalizePhone(phone),
    });
    return response.data;
  },

  // Connexion sans SMS : numéro + PIN.
  async pinLogin(data: { phone: string; pin: string }) {
    const response = await api.post('/auth/pin/login', {
      phone: normalizePhone(data.phone),
      pin: data.pin,
    });
    return response.data;
  },
};
