import { api } from '@/lib/api';
import { UserReviews } from '@/types';

export interface CreateReviewInput {
  rating: number;
  comment?: string;
  carpoolReservationId?: string;
  rentalBookingId?: string;
}

export const reviewsService = {
  // Laisser un avis après une transaction terminée.
  async create(data: CreateReviewInput) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Avis reçus par un utilisateur (page profil) + sa moyenne.
  async getUserReviews(userId: string): Promise<UserReviews> {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  // Transactions déjà notées par l'utilisateur courant (pour masquer « Noter »).
  async getGiven(): Promise<{ carpoolReservationIds: string[]; rentalBookingIds: string[] }> {
    const response = await api.get('/reviews/given');
    return response.data;
  },
};
