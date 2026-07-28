"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMe, useUpdateMe } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/primitives/skeleton";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { profileSchema, type ProfileValues } from "@/lib/forms/schemas";

/**
 * ProfileForm — edit firstName/lastName via PATCH /api/users/me. Keeps
 * the AuthProvider's user in sync via setProfile.
 */
export function ProfileForm() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  // Populate the form once the profile loads.
  React.useEffect(() => {
    if (me) {
      reset({ firstName: me.firstName, lastName: me.lastName });
    }
  }, [me, reset]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateMe.mutateAsync(values);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update profile."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
