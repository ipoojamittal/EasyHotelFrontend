"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  usersApi,
  type AdminCreateStaffPayload,
  type AdminUpdateUserPayload,
  type ChangePasswordPayload,
  type UpdateMyProfilePayload,
  type UsersListParams,
} from "@/lib/api/users";
import { usersKeys } from "@/lib/query/keys";
import { useAuth } from "@/components/providers/auth-provider";

function asArray<T>(res: { users?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : (res.users ?? []);
}

/** Current user's full profile (/api/users/me). */
export function useMe() {
  return useQuery({
    queryKey: usersKeys.me(),
    queryFn: () => usersApi.getMe(),
  });
}

/** Update own profile (firstName/lastName). Keeps AuthProvider in sync. */
export function useUpdateMe() {
  const qc = useQueryClient();
  const { setProfile, user } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      qc.setQueryData(usersKeys.me(), data.user);
      if (user) {
        setProfile({
          ...data.user,
          id: data.user.id,
        });
      }
    },
  });
}

/** Change own password. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      usersApi.changePassword(payload),
  });
}

/** hotelAdmin: list users (staff) with optional filters. */
export function useUsers(params: UsersListParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params as Record<string, unknown>),
    queryFn: async () => asArray(await usersApi.listUsers(params)),
  });
}

/** hotelAdmin: single user detail. */
export function useUser(userId: string) {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
  });
}

/** hotelAdmin: create a staff/admin user. */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreateStaffPayload) => usersApi.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/** hotelAdmin: update a user (role, active, name). */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AdminUpdateUserPayload;
    }) => usersApi.updateUser(userId, payload),
    onSuccess: (data, variables) => {
      qc.setQueryData(usersKeys.detail(variables.userId), data.user);
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/** hotelAdmin: delete a user. */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
      qc.removeQueries({ queryKey: usersKeys.detail(userId) });
    },
  });
}
