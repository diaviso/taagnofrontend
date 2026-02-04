import { api } from '@/lib/api';
import { RentalOffer, RentalBooking, CreateOfferDto, UpdateOfferDto, CreateBookingDto, SearchOfferDto } from '@/types';

export const rentalService = {
  // ============== OFFERS ==============

  async searchOffers(params?: SearchOfferDto): Promise<RentalOffer[]> {
    const { data } = await api.get('/rental/offers/search', { params });
    return data;
  },

  async getMyOffers(): Promise<RentalOffer[]> {
    const { data } = await api.get('/rental/offers/mine');
    return data;
  },

  async getOfferById(id: string): Promise<RentalOffer> {
    const { data } = await api.get(`/rental/offers/${id}`);
    return data;
  },

  async createOffer(dto: CreateOfferDto): Promise<RentalOffer> {
    const { data } = await api.post('/rental/offers', dto);
    return data;
  },

  async updateOffer(id: string, dto: UpdateOfferDto): Promise<RentalOffer> {
    const { data } = await api.patch(`/rental/offers/${id}`, dto);
    return data;
  },

  // ============== BOOKINGS ==============

  async getMyBookings(): Promise<RentalBooking[]> {
    const { data } = await api.get('/rental/bookings/mine');
    return data;
  },

  async createBooking(offerId: string, dto: CreateBookingDto): Promise<RentalBooking> {
    const { data } = await api.post(`/rental/offers/${offerId}/bookings`, dto);
    return data;
  },

  async acceptBooking(bookingId: string): Promise<RentalBooking> {
    const { data } = await api.patch(`/rental/bookings/${bookingId}/accept`);
    return data;
  },

  async rejectBooking(bookingId: string): Promise<RentalBooking> {
    const { data } = await api.patch(`/rental/bookings/${bookingId}/reject`);
    return data;
  },

  async cancelBooking(bookingId: string): Promise<RentalBooking> {
    const { data } = await api.patch(`/rental/bookings/${bookingId}/cancel`);
    return data;
  },

  async completeBooking(bookingId: string): Promise<RentalBooking> {
    const { data } = await api.patch(`/rental/bookings/${bookingId}/complete`);
    return data;
  },
};
