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
