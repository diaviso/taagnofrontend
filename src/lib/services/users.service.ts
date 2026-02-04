import { api } from '../api';
import { User, UserMode } from '@/types';

export const usersService = {
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateUserMode: async (userMode: UserMode): Promise<User> => {
    const response = await api.patch('/users/me/mode', { userMode });
    return response.data;
  },
};
