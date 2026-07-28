"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  roomTypesApi,
  type CreateRoomTypePayload,
  type ListRoomTypesParams,
  type UpdateRoomTypePayload,
} from "@/lib/api/roomTypes";
import { roomTypesKeys } from "@/lib/query/keys";

/** Normalize the backend's two possible list shapes ({roomTypes:[]} | []) into []. */
function asArray<T>(res: { roomTypes?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : (res.roomTypes ?? []);
}

/** List room types for a hotel. */
export function useRoomTypes(hotelId: string, params: ListRoomTypesParams = {}) {
  return useQuery({
    queryKey: roomTypesKeys.list(hotelId, params as Record<string, unknown>),
    queryFn: async () => asArray(await roomTypesApi(hotelId).list(params)),
    enabled: !!hotelId,
  });
}

/** Single room type detail. */
export function useRoomType(hotelId: string, roomTypeId: string) {
  return useQuery({
    queryKey: roomTypesKeys.detail(hotelId, roomTypeId),
    queryFn: () => roomTypesApi(hotelId).get(roomTypeId),
    enabled: !!hotelId && !!roomTypeId,
  });
}

/** Create a room type. */
export function useCreateRoomType(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomTypePayload) =>
      roomTypesApi(hotelId).create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomTypesKeys.lists(hotelId) });
    },
  });
}

/** Update a room type. */
export function useUpdateRoomType(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomTypeId,
      payload,
    }: {
      roomTypeId: string;
      payload: UpdateRoomTypePayload;
    }) => roomTypesApi(hotelId).update(roomTypeId, payload),
    onSuccess: (roomType) => {
      qc.setQueryData(roomTypesKeys.detail(hotelId, roomType.id), roomType);
      qc.invalidateQueries({ queryKey: roomTypesKeys.lists(hotelId) });
    },
  });
}

/** Deactivate (soft-delete) a room type. */
export function useDeactivateRoomType(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomTypeId: string) =>
      roomTypesApi(hotelId).deactivate(roomTypeId),
    onSuccess: (_data, roomTypeId) => {
      qc.invalidateQueries({ queryKey: roomTypesKeys.lists(hotelId) });
      qc.removeQueries({ queryKey: roomTypesKeys.detail(hotelId, roomTypeId) });
    },
  });
}
