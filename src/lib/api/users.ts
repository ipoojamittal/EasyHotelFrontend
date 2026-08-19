import { apiFetch } from "./apiFetch";
import type { Role, User } from "@/types/api";

export interface UpdateMyProfilePayload {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AdminCreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role; // hotelAdmin can create staff (and per backend, any role)
}

export interface AdminUpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isDeleted?: boolean;
}

export interface UsersListParams {
  role?: Role;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

export const usersApi = {
  // --- self ---
  getMe: () => apiFetch<User>("/api/users/me"),
  updateMe: (payload: UpdateMyProfilePayload) =>
    apiFetch<{ message: string; user: User }>("/api/users/me", {
      method: "PATCH",
      body: payload,
    }),
  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch<{ message: string }>("/api/users/me/password", {
      method: "PUT",
      body: payload,
    }),

  // --- admin (hotelAdmin) ---
  listUsers: (params: UsersListParams = {}) => {
    const q = new URLSearchParams();
    if (params.role) q.set("role", params.role);
    if (params.isDeleted !== undefined) q.set("isDeleted", String(params.isDeleted));
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiFetch<{ users: User[] } | User[]>(
      `/api/users${qs ? `?${qs}` : ""}`
    );
  },
  createUser: (payload: AdminCreateStaffPayload) =>
    apiFetch<{ message: string; user: User }>("/api/users", {
      method: "POST",
      body: payload,
    }),
  getUser: (userId: string) => apiFetch<User>(`/api/users/${userId}`),
  updateUser: (userId: string, payload: AdminUpdateUserPayload) =>
    apiFetch<{ message: string; user: User }>(`/api/users/${userId}`, {
      method: "PATCH",
      body: payload,
    }),
  deleteUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/users/${userId}`, { method: "DELETE" }),
};
