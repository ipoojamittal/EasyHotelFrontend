/**
 * API types — mirror the Mongoose models in hms-backend.
 *
 * These are hand-written TypeScript interfaces matching the JSON the backend
 * returns (after `.lean()` / populate). Kept in sync with:
 *   - src/models/User.ts, Hotel.ts, RoomType.ts, Room.ts, Booking.ts
 *   - the response envelopes observed in the controllers/services.
 */

/* ---------------------------------------------------------------------------
   Enums (mirror backend enums)
   --------------------------------------------------------------------------- */
export type Role = "customer" | "staff" | "hotelAdmin" | "superAdmin";

export type RoomStatus = "available" | "occupied" | "cleaning" | "out_of_service";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled"
  | "no-show";

/* ---------------------------------------------------------------------------
   Shared value objects
   --------------------------------------------------------------------------- */
export interface RoomSize {
  value: number;
  unit: "sqm" | "sqft";
}

export interface HotelAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface HotelLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface HotelMapsUrl {
  googleMaps?: string;
  appleMaps?: string;
}

/* ---------------------------------------------------------------------------
   Entities (lean/plain objects — no Mongoose Document methods)
   --------------------------------------------------------------------------- */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role: Role;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isDeleted?: boolean;
  /** Only present for staff/hotelAdmin. */
  hotelId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: HotelAddress;
  phoneNumber?: string[];
  email?: string;
  description?: string;
  amenities: string[];
  images: string[];
  checkInTime: string;
  checkOutTime: string;
  location?: HotelLocation;
  mapsUrl?: HotelMapsUrl;
  isDeleted: boolean;
  createdBy: string | { id: string; firstName: string; lastName: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  typeCode?: string;
  description?: string;
  basePrice: number;
  defaultCapacity: number;
  maxCapacity?: number;
  amenities: string[];
  images: string[];
  bedConfiguration?: string;
  viewType?: string;
  size?: RoomSize;
  tags?: string[];
  sortOrder?: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  /** Populated RoomType on read endpoints; raw id on create payload. */
  roomType: string | RoomType;
  description?: string;
  capacity?: number; // override
  pricePerNight?: number; // override
  amenities?: string[]; // augments RoomType amenities
  images?: string[]; // augments RoomType images
  viewTypeOverride?: string;
  sizeOverride?: RoomSize;
  status: RoomStatus;
  isDeleted: boolean;
  createdBy?: string | User;
  updatedBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  user: string | User;
  hotel: string | Hotel;
  room: string | Room;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdBy: string | User;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------------------------------------------------------------------
   Pagination / list envelopes (verified against backend services)
   hotels: { hotels, currentPage, totalPages, totalHotels, limit }
   bookings (hotel/user): { bookings, currentPage, totalPages, totalBookings, limit }
   --------------------------------------------------------------------------- */
export interface PaginatedHotels {
  hotels: Hotel[];
  currentPage: number;
  totalPages: number;
  totalHotels: number;
  limit: number;
}

export interface PaginatedBookings {
  bookings: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  limit: number;
}

/** Generic list envelope used by users / room-types / rooms (shape confirmed
 * by the controller pattern; each resource returns its own list key). */
export interface ListEnvelope<T> {
  data?: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

/* ---------------------------------------------------------------------------
   Auth envelopes
   --------------------------------------------------------------------------- */
export interface AuthUser {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: Role;
  hotelId?: string;
}

export interface LoginResponse {
  message: string;
  /** "Bearer <jwt>" — sent verbatim as the Authorization header. */
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user: User;
}

/* ---------------------------------------------------------------------------
   Mutation envelopes (the controllers wrap created/updated entities)
   --------------------------------------------------------------------------- */
export interface BookingMutationResponse {
  message: string;
  booking: Booking;
}

export interface HotelMutationResponse {
  message: string;
  hotel: Hotel;
}

/* ---------------------------------------------------------------------------
   Error envelopes (from the backend global error handler)
   --------------------------------------------------------------------------- */
export interface ApiErrorBody {
  status?: string;
  message: string;
  /** express-validator body */
  errors?: { msg: string; param: string; location: string; value?: unknown }[];
  stack?: string;
}
