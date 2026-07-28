import { apiFetch } from "./apiFetch";
import type {
  AuthStatusResponse,
  LoginResponse,
  RegisterResponse,
} from "@/types/api";

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
      _skipAuthRedirect: true,
    }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) =>
    apiFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: data,
    }),

  status: () => apiFetch<AuthStatusResponse>("/api/auth/status"),
};
