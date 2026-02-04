// ============== ENUMS ==============

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserMode {
  VOYAGEUR = 'VOYAGEUR',
  PROPRIETAIRE = 'PROPRIETAIRE',
}

export enum VehicleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  INSURANCE = 'INSURANCE',
  REGISTRATION = 'REGISTRATION',
  TECHNICAL_VISIT = 'TECHNICAL_VISIT',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CarpoolTripStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum CarpoolReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RentalBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// ============== MODELS ==============

export interface User {
  id: string;
  email: string;
  googleId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  role: Role;
  userMode?: UserMode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  owner?: User;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  numberOfSeats: number;
  isForRental: boolean;
  isForCarpooling: boolean;
  isActive: boolean;
  status: VehicleStatus;
  adminComment?: string;
  photos?: VehiclePhoto[];
  documents?: VehicleDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CarpoolTrip {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId: string;
  driver?: User;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: CarpoolTripStatus;
  reservations?: CarpoolReservation[];
  createdAt: string;
}

export interface CarpoolReservation {
  id: string;
  tripId: string;
  trip?: CarpoolTrip;
  passengerId: string;
  passenger?: User;
  seatsReserved: number;
  status: CarpoolReservationStatus;
  createdAt: string;
}

export interface RentalOffer {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  pricePerDay: number;
  depositAmount: number;
  minDays: number;
  isActive: boolean;
  bookings?: RentalBooking[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalBooking {
  id: string;
  rentalOfferId: string;
  rentalOffer?: RentalOffer;
  renterId: string;
  renter?: User;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalBookingStatus;
  createdAt: string;
  updatedAt: string;
}

// ============== DTOs ==============

export interface CreateVehicleDto {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  numberOfSeats: number;
  isForRental?: boolean;
  isForCarpooling?: boolean;
}

export interface UpdateVehicleDto {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  numberOfSeats?: number;
  isForRental?: boolean;
  isForCarpooling?: boolean;
}

export interface CreateTripDto {
  vehicleId: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
}

export interface SearchTripDto {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
}

export interface CreateReservationDto {
  seatsReserved: number;
}

export interface CreateOfferDto {
  vehicleId: string;
  pricePerDay: number;
  depositAmount: number;
  minDays?: number;
  isActive?: boolean;
}

export interface UpdateOfferDto {
  pricePerDay?: number;
  depositAmount?: number;
  minDays?: number;
  isActive?: boolean;
}

export interface CreateBookingDto {
  startDate: string;
  endDate: string;
}

export interface SearchOfferDto {
  city?: string;
  startDate?: string;
  endDate?: string;
}

export interface AddPhotoDto {
  url: string;
  isMain?: boolean;
}

export interface AddDocumentDto {
  type: DocumentType;
  fileUrl: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
