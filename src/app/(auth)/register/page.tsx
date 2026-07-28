"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { ApiError } from "@/lib/api/apiFetch";
import { registerSchema, type RegisterValues } from "@/lib/forms/schemas";

export default function RegisterPage() {
  const { register: registerUser, login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      // Auto-login after register for a smooth first-run.
      await login(values.email.trim(), values.password);
      toast.success("Account created. Welcome!");
      router.replace("/account");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not register. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register as a guest to book stays.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
            {errors.firstName ? (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
            {errors.lastName ? (
              <p className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone</Label>
          <Input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            aria-invalid={!!errors.phoneNumber}
            {...register("phoneNumber")}
          />
          {errors.phoneNumber ? (
            <p className="text-xs text-destructive">
              {errors.phoneNumber.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
