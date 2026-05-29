import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pages publiques où un 401 ne doit PAS provoquer de redirection brutale.
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/phone-auth', '/'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isPublic = PUBLIC_PATHS.includes(path);
        if (!isPublic) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  // 30 jours (au lieu de 365) pour limiter la fenêtre d'un token volé.
  // Idéalement : cookie httpOnly posé par le backend (cf. AUDIT_GLOBAL.md).
  Cookies.set('access_token', token, { expires: 30, secure: true, sameSite: 'lax' });
};

export const removeAuthToken = () => {
  Cookies.remove('access_token');
};

export const getAuthToken = () => {
  return Cookies.get('access_token');
};
