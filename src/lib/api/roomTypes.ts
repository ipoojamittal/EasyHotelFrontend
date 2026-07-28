import { apiFetch } from "./apiFetch";
import type { RoomSize, RoomType } from "@/types/api";

export interface CreateRoomTypePayload {
  name: string;
  basePrice: number;
  defaultCapacity: number;
  typeCode?: string;
  description?: string;
  maxCapacity?: number;
  amenities?: string[];
  images?: string[];
  bedConfiguration?: string;
  viewType?: string;
  size?: RoomSize;
  tags?: string[];
  sortOrder?: number;
}

export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload> & {
  isActive?: boolean;
};

export interface ListRoomTypesParams {
  page?: number;
  limit?: number;
  name?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Room types are nested under a hotel. */
export const roomTypesApi = (hotelId: string) => ({
  base: `/api/hotels/${hotelId}/room-types`,

  list: (params: ListRoomTypesParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.name) q.set("name", params.name);
    if (params.isActive !== undefined) q.set("isActive", String(params.isActive));
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const qs = q.toString();
    return apiFetch<{ roomTypes: RoomType[] } | RoomType[]>(
      `${thisBase(hotelId)}${qs ? `?${qs}` : ""}`
    );
  },
  get: (roomTypeId: string) =>
    apiFetch<RoomType>(`${thisBase(hotelId)}/${roomTypeId}`),
  create: (payload: CreateRoomTypePayload) =>
    apiFetch<RoomType>(thisBase(hotelId), { method: "POST", body: payload }),
  update: (roomTypeId: string, payload: UpdateRoomTypePayload) =>
    apiFetch<RoomType>(`${thisBase(hotelId)}/${roomTypeId}`, {
      method: "PATCH",
      body: payload,
    }),
  deactivate: (roomTypeId: string) =>
    apiFetch<{ message: string }>(`${thisBase(hotelId)}/${roomTypeId}`, {
      method: "DELETE",
    }),
});

// Helper to keep `this`-free (object method shorthand loses `this` in arrow
// callbacks; using a module helper is unambiguous).
function thisBase(hotelId: string) {
  return `/api/hotels/${hotelId}/room-types`;
}
