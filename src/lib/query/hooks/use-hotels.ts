"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { hotelsApi, type ListHotelsParams } from "@/lib/api/hotels";
import { bookingsKeys, hotelsKeys, roomTypesKeys, roomsKeys } from "@/lib/query/keys";

/** Public list of hotels (paginated, filterable). */
export function useHotels(params: ListHotelsParams = {}) {
  return useQuery({
    queryKey: hotelsKeys.list(params as Record<string, unknown>),
    queryFn: () => hotelsApi.listHotels(params),
  });
}

/** Public hotel detail. */
export function useHotel(hotelId: string) {
  return useQuery({
    queryKey: hotelsKeys.detail(hotelId),
    queryFn: () => hotelsApi.getHotel(hotelId),
    enabled: !!hotelId,
  });
}

/** hotelAdmin: their own hotel. */
export function useMyHotel() {
  return useQuery({
    queryKey: hotelsKeys.mine(),
    queryFn: () => hotelsApi.getMyHotel(),
  });
}

/** hotelAdmin: update own hotel. Invalidates the mine + detail caches. */
export function useUpdateMyHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hotelsApi.updateMyHotel,
    onSuccess: (hotel) => {
      qc.setQueryData(hotelsKeys.mine(), hotel);
      qc.setQueryData(hotelsKeys.detail(hotel.id), hotel);
    },
  });
}

/** hotelAdmin: deactivate own hotel. */
export function useDeactivateMyHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hotelsApi.deactivateMyHotel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hotelsKeys.mine() });
    },
  });
}

/** hotelAdmin: create hotel (first property). */
export function useCreateHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hotelsApi.createHotel,
    onSuccess: (hotel) => {
      qc.setQueryData(hotelsKeys.mine(), hotel);
      qc.invalidateQueries({ queryKey: hotelsKeys.lists() });
    },
  });
}

/**
 * useMyHotelRoomTypesAndRooms — convenience hook for the dashboard shell.
 * Returns the hotelAdmin's hotel + its room types + rooms in one call site.
 * (Kept here because it composes hotel-scoped keys.)
 */
export function useHotelScopedKeys(hotelId: string | undefined) {
  return {
    roomTypes: hotelId ? roomTypesKeys.lists(hotelId) : null,
    rooms: hotelId ? roomsKeys.lists(hotelId) : null,
    bookings: hotelId ? bookingsKeys.all : null,
  };
}
