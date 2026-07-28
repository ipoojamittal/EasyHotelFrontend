/**
 * Query key factories — colocated, type-safe, hierarchical.
 *
 * TanStack Query keys are arrays; the convention here is a 3-level hierarchy:
 *   [scope, entity, params]   e.g. ["hotels", "list", { page, limit, city }]
 *                              ["hotels", "detail", hotelId]
 *
 * Keeping params as the last element (an object) lets `invalidateQueries({
 * queryKey: hotels.list() })` blow away every list variant, and partial
 * matching lets us invalidate a single entity by id.
 *
 * The params type is `Record<string, unknown>` at the edges so typed param
 * objects (ListHotelsParams, etc.) are accepted via a widening cast in the
 * hooks. This keeps the key factory decoupled from the API param types.
 */
type Params = Record<string, unknown>;

export const hotelsKeys = {
  all: ["hotels"] as const,
  lists: () => [...hotelsKeys.all, "list"] as const,
  list: (params: Params = {}) => [...hotelsKeys.lists(), params] as const,
  details: () => [...hotelsKeys.all, "detail"] as const,
  detail: (hotelId: string) => [...hotelsKeys.details(), hotelId] as const,
  mine: () => [...hotelsKeys.all, "mine"] as const,
};

export const roomTypesKeys = {
  all: ["roomTypes"] as const,
  lists: (hotelId: string) => [...roomTypesKeys.all, "list", hotelId] as const,
  list: (hotelId: string, params: Params = {}) =>
    [...roomTypesKeys.lists(hotelId), params] as const,
  details: (hotelId: string) =>
    [...roomTypesKeys.all, "detail", hotelId] as const,
  detail: (hotelId: string, roomTypeId: string) =>
    [...roomTypesKeys.details(hotelId), roomTypeId] as const,
};

export const roomsKeys = {
  all: ["rooms"] as const,
  lists: (hotelId: string) => [...roomsKeys.all, "list", hotelId] as const,
  list: (hotelId: string, params: Params = {}) =>
    [...roomsKeys.lists(hotelId), params] as const,
  details: (hotelId: string) => [...roomsKeys.all, "detail", hotelId] as const,
  detail: (hotelId: string, roomId: string) =>
    [...roomsKeys.details(hotelId), roomId] as const,
};

export const bookingsKeys = {
  all: ["bookings"] as const,
  mine: (params: Params = {}) =>
    [...bookingsKeys.all, "mine", params] as const,
  hotel: (hotelId: string, params: Params = {}) =>
    [...bookingsKeys.all, "hotel", hotelId, params] as const,
  details: () => [...bookingsKeys.all, "detail"] as const,
  detail: (bookingId: string) => [...bookingsKeys.details(), bookingId] as const,
};

export const usersKeys = {
  all: ["users"] as const,
  me: () => [...usersKeys.all, "me"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: Params = {}) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (userId: string) => [...usersKeys.details(), userId] as const,
};
