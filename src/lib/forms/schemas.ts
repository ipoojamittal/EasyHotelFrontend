import { z } from "zod";

/**
 * Shared Zod schemas — used by React Hook Form on the client and (future)
 * server-side validation. Kept framework-agnostic so they can be imported
 * anywhere.
 */

/* --- Auth ---------------------------------------------------------------- */
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(50, "First name is too long."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(50, "Last name is too long."),
  email: z.string().email("Enter a valid email address."),
  phoneNumber: z
    .string()
    .min(7, "Enter a valid phone number.")
    .max(20, "Phone number is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),
});
export type RegisterValues = z.infer<typeof registerSchema>;

/* --- Profile ------------------------------------------------------------- */
export const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/* --- Hotel ---------------------------------------------------------------- */
export const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required.").max(120),
  address: z.object({
    street: z.string().min(1, "Street is required.").max(200),
    city: z.string().min(1, "City is required.").max(100),
    state: z.string().min(1, "State is required.").max(100),
    zipCode: z.string().min(1, "ZIP code is required.").max(20),
    country: z.string().min(1, "Country is required.").max(100),
  }),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  checkInTime: z.string().min(1, "Check-in time is required."),
  checkOutTime: z.string().min(1, "Check-out time is required."),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  phoneNumber: z.array(z.string()).optional().default([]),
  mapsUrl: z
    .object({
      googleMaps: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
      appleMaps: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
    })
    .optional(),
});
export type HotelValues = z.infer<typeof hotelSchema>;

/* --- Room Type ------------------------------------------------------------ */
export const roomTypeSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  typeCode: z.string().max(40).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  basePrice: z.coerce.number().min(0, "Price must be 0 or more."),
  defaultCapacity: z.coerce.number().min(1, "Capacity must be at least 1.").max(20),
  maxCapacity: z.coerce
    .number()
    .min(1, "Max capacity must be at least 1.")
    .max(20)
    .optional()
    .or(z.literal("")),
  bedConfiguration: z.string().max(100).optional().or(z.literal("")),
  viewType: z.string().max(100).optional().or(z.literal("")),
  sizeValue: z.coerce.number().min(0).optional().or(z.literal("")),
  sizeUnit: z.enum(["sqm", "sqft"]).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).optional().or(z.literal("")),
  isActive: z.boolean(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});
export type RoomTypeValues = z.infer<typeof roomTypeSchema>;

/* --- Room ----------------------------------------------------------------- */
export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required.").max(20),
  roomTypeId: z.string().min(1, "Room type is required."),
  description: z.string().max(2000).optional().or(z.literal("")),
  capacity: z.coerce.number().min(1).max(20).optional().or(z.literal("")),
  pricePerNight: z.coerce.number().min(0).optional().or(z.literal("")),
  viewTypeOverride: z.string().max(100).optional().or(z.literal("")),
  sizeOverrideValue: z.coerce.number().min(0).optional().or(z.literal("")),
  sizeOverrideUnit: z.enum(["sqm", "sqft"]).optional().or(z.literal("")),
  status: z.enum(["available", "occupied", "cleaning", "out_of_service"]).optional(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
});
export type RoomValues = z.infer<typeof roomSchema>;

/* --- Staff (admin-created user) ------------------------------------------ */
export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50),
  lastName: z.string().min(1, "Last name is required.").max(50),
  email: z.string().email("Enter a valid email."),
  phoneNumber: z.string().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  role: z.enum(["staff", "hotelAdmin"]),
});
export type StaffValues = z.infer<typeof staffSchema>;

export const staffEditSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(["staff", "hotelAdmin"]),
  isActive: z.boolean(),
});
export type StaffEditValues = z.infer<typeof staffEditSchema>;
