import { api } from '@/lib/api';
import { Vehicle, VehicleStatus, User } from '@/types';

export interface AdminStatistics {
  users: { total: number };
  vehicles: { total: number; pending: number; approved: number; rejected: number };
  carpool: { totalTrips: number; openTrips: number; completedTrips: number; totalReservations: number };
  rental: { totalOffers: number; activeOffers: number; totalBookings: number };
  recentVehicles: any[];
  recentUsers: any[];
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count?: {
    vehicles: number;
    carpoolTripsAsDriver: number;
    carpoolReservations: number;
    rentalBookings: number;
  };
}

export const adminService = {
  // Statistics
  async getStatistics(): Promise<AdminStatistics> {
    const { data } = await api.get('/admin/statistics');
    return data;
  },

  // Vehicles
  async getVehicles(status?: VehicleStatus): Promise<Vehicle[]> {
    const { data } = await api.get('/admin/vehicles', { params: { status } });
    return data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const { data } = await api.get(`/admin/vehicles/${id}`);
    return data;
  },

  async approveVehicle(id: string): Promise<Vehicle> {
    const { data } = await api.patch(`/admin/vehicles/${id}/approve`);
    return data;
  },

  async rejectVehicle(id: string, comment: string): Promise<Vehicle> {
    const { data } = await api.patch(`/admin/vehicles/${id}/reject`, { comment });
    return data;
  },

  // Users
  async getUsers(search?: string): Promise<AdminUser[]> {
    const { data } = await api.get('/admin/users', { params: { search } });
    return data;
  },

  async getUserById(id: string): Promise<any> {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  async updateUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return data;
  },

  async toggleUserActive(id: string): Promise<AdminUser> {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`);
    return data;
  },
};
