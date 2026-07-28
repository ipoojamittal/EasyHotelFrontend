import { apiFetch } from "./apiFetch";
import type { Role, User } from "@/types/api";

export interface AdminCreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role; // hotelAdmin | staff
  hotelId?: string; // required for staff, forbidden for hotelAdmin
}

export interface AdminCreateUserResponse {
  message: string;
  user: User;
}

export const adminApi = {
  /** POST /api/admin — create a hotelAdmin or staff user. */
  createUser: (payload: AdminCreateUserPayload) =>
    apiFetch<AdminCreateUserResponse>("/api/admin", {
      method: "POST",
      body: payload,
    }),
};
