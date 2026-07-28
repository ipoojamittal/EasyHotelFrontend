"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  roomsApi,
  type CreateRoomPayload,
  type ListRoomsParams,
  type UpdateRoomPayload,
} from "@/lib/api/rooms";
import { roomsKeys } from "@/lib/query/keys";

function asArray<T>(res: { rooms?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : (res.rooms ?? []);
}

/** List rooms for a hotel. */
export function useRooms(hotelId: string, params: ListRoomsParams = {}) {
  return useQuery({
    queryKey: roomsKeys.list(hotelId, params as Record<string, unknown>),
    queryFn: async () => asArray(await roomsApi(hotelId).list(params)),
    enabled: !!hotelId,
  });
}

/** Single room detail. */
export function useRoom(hotelId: string, roomId: string) {
  return useQuery({
    queryKey: roomsKeys.detail(hotelId, roomId),
    queryFn: () => roomsApi(hotelId).get(roomId),
    enabled: !!hotelId && !!roomId,
  });
}

/** Create a room. */
export function useCreateRoom(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomsApi(hotelId).create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomsKeys.lists(hotelId) });
    },
  });
}

/** Update a room. */
export function useUpdateRoom(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: UpdateRoomPayload;
    }) => roomsApi(hotelId).update(roomId, payload),
    onSuccess: (room) => {
      qc.setQueryData(roomsKeys.detail(hotelId, room.id), room);
      qc.invalidateQueries({ queryKey: roomsKeys.lists(hotelId) });
    },
  });
}

/** Deactivate (soft-delete) a room. */
export function useDeactivateRoom(hotelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi(hotelId).deactivate(roomId),
    onSuccess: (_data, roomId) => {
      qc.invalidateQueries({ queryKey: roomsKeys.lists(hotelId) });
      qc.removeQueries({ queryKey: roomsKeys.detail(hotelId, roomId) });
    },
  });
}
