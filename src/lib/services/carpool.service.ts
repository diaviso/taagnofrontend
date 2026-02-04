import { api } from '@/lib/api';
import { CarpoolTrip, CarpoolReservation, CreateTripDto, SearchTripDto, CreateReservationDto } from '@/types';

export const carpoolService = {
  // ============== TRIPS ==============

  async searchTrips(params?: SearchTripDto): Promise<CarpoolTrip[]> {
    const { data } = await api.get('/carpool/trips/search', { params });
    return data;
  },

  async getMyTrips(): Promise<CarpoolTrip[]> {
    const { data } = await api.get('/carpool/trips/mine');
    return data;
  },

  async getTripById(id: string): Promise<CarpoolTrip> {
    const { data } = await api.get(`/carpool/trips/${id}`);
    return data;
  },

  async createTrip(dto: CreateTripDto): Promise<CarpoolTrip> {
    const { data } = await api.post('/carpool/trips', dto);
    return data;
  },

  async cancelTrip(tripId: string): Promise<CarpoolTrip> {
    const { data } = await api.patch(`/carpool/trips/${tripId}/cancel`);
    return data;
  },

  async completeTrip(tripId: string): Promise<CarpoolTrip> {
    const { data } = await api.patch(`/carpool/trips/${tripId}/complete`);
    return data;
  },

  // ============== RESERVATIONS ==============

  async getMyReservations(): Promise<CarpoolReservation[]> {
    const { data } = await api.get('/carpool/reservations/mine');
    return data;
  },

  async createReservation(tripId: string, dto: CreateReservationDto): Promise<CarpoolReservation> {
    const { data } = await api.post(`/carpool/trips/${tripId}/reservations`, dto);
    return data;
  },

  async acceptReservation(reservationId: string): Promise<CarpoolReservation> {
    const { data } = await api.patch(`/carpool/reservations/${reservationId}/accept`);
    return data;
  },

  async rejectReservation(reservationId: string): Promise<CarpoolReservation> {
    const { data } = await api.patch(`/carpool/reservations/${reservationId}/reject`);
    return data;
  },

  async cancelReservation(reservationId: string): Promise<CarpoolReservation> {
    const { data } = await api.patch(`/carpool/reservations/${reservationId}/cancel`);
    return data;
  },
};
