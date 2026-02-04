import { api } from '@/lib/api';
import { Vehicle, VehiclePhoto, VehicleDocument, CreateVehicleDto, UpdateVehicleDto, AddPhotoDto, AddDocumentDto } from '@/types';

export const vehiclesService = {
  async getMyVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get('/vehicles/mine');
    return data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  },

  async createVehicle(dto: CreateVehicleDto): Promise<Vehicle> {
    const { data } = await api.post('/vehicles', dto);
    return data;
  },

  async updateVehicle(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const { data } = await api.patch(`/vehicles/${id}`, dto);
    return data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  async addPhoto(vehicleId: string, dto: AddPhotoDto): Promise<VehiclePhoto> {
    const { data } = await api.post(`/vehicles/${vehicleId}/photos`, dto);
    return data;
  },

  async deletePhoto(vehicleId: string, photoId: string): Promise<void> {
    await api.delete(`/vehicles/${vehicleId}/photos/${photoId}`);
  },

  async setMainPhoto(vehicleId: string, photoId: string): Promise<VehiclePhoto> {
    const { data } = await api.patch(`/vehicles/${vehicleId}/photos/${photoId}/main`);
    return data;
  },

  async addDocument(vehicleId: string, dto: AddDocumentDto): Promise<VehicleDocument> {
    const { data } = await api.post(`/vehicles/${vehicleId}/documents`, dto);
    return data;
  },

  async deleteDocument(vehicleId: string, documentId: string): Promise<void> {
    await api.delete(`/vehicles/${vehicleId}/documents/${documentId}`);
  },

  async toggleActive(vehicleId: string): Promise<Vehicle> {
    const { data } = await api.patch(`/vehicles/${vehicleId}/toggle-active`);
    return data;
  },

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
