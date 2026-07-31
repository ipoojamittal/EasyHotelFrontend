import { apiFetch } from "./apiFetch";
import type { Room, RoomSize, RoomStatus } from "@/types/api";

export interface CreateRoomPayload {
  roomNumber: string;
  roomTypeId: string;
  description?: string;
  capacity?: number;
  pricePerNight?: number;
  amenities?: string[];
  images?: string[];
  viewTypeOverride?: string;
  sizeOverride?: RoomSize;
  status?: RoomStatus;
}

export type UpdateRoomPayload = Partial<CreateRoomPayload>;

export interface ListRoomsParams {
  page?: number;
  limit?: number;
  roomTypeId?: string;
  status?: RoomStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const roomsApi = (hotelId: string) => ({
  list: (params: ListRoomsParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.roomTypeId) q.set("roomTypeId", params.roomTypeId);
    if (params.status) q.set("status", params.status);
    if (params.isActive !== undefined) q.set("isActive", String(params.isActive));
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const qs = q.toString();
    return apiFetch<{ rooms: Room[] } | Room[]>(
      `/api/hotels/${hotelId}/rooms${qs ? `?${qs}` : ""}`,
      { _skipAuthRedirect: true }
    );
  },
  get: (roomId: string) =>
    apiFetch<Room>(`/api/hotels/${hotelId}/rooms/${roomId}`, {
      _skipAuthRedirect: true,
    }),
  create: (payload: CreateRoomPayload) =>
    apiFetch<Room>(`/api/hotels/${hotelId}/rooms`, {
      method: "POST",
      body: payload,
    }),
  update: (roomId: string, payload: UpdateRoomPayload) =>
    apiFetch<Room>(`/api/hotels/${hotelId}/rooms/${roomId}`, {
      method: "PATCH",
      body: payload,
    }),
  deactivate: (roomId: string) =>
    apiFetch<{ message: string }>(
      `/api/hotels/${hotelId}/rooms/${roomId}`,
      { method: "DELETE" }
    ),
});
