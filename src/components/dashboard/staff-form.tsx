"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUser,
  useCreateUser,
  useUpdateUser,
} from "@/lib/query";
import type { AdminCreateStaffPayload, AdminUpdateUserPayload } from "@/lib/api/users";
import type { User } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { staffSchema, staffEditSchema, type StaffValues, type StaffEditValues } from "@/lib/forms/schemas";
import { z } from "zod";
import { Users, Save } from "lucide-react";

/**
 * StaffForm — shared create/edit form for staff/hotelAdmin users.
 *   /dashboard/staff/new        (mode="create")
 *   /dashboard/staff/[id]       (mode="edit")
 *
 * Create: firstName, lastName, email, phoneNumber, password, role.
 * Edit: firstName, lastName, role, isDeleted (no password/email edit).
 */
export function StaffForm({
  mode,
  userId,
}: {
  mode: "create" | "edit";
  userId?: string;
}) {
  const router = useRouter();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    data: existing,
    isLoading,
    isError,
    error,
  } = useUser(userId ?? "");

  // Create form
  const createForm = useForm<z.input<typeof staffSchema>, unknown, z.output<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "staff",
    },
  });

  // Edit form
  const editForm = useForm<z.input<typeof staffEditSchema>, unknown, z.output<typeof staffEditSchema>>({
    resolver: zodResolver(staffEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "staff",
      isDeleted: false,
    },
  });

  React.useEffect(() => {
    if (mode === "edit" && existing) {
      editForm.reset({
        firstName: existing.firstName,
        lastName: existing.lastName,
        role: existing.role === "hotelAdmin" ? "hotelAdmin" : "staff",
        isDeleted: existing.isDeleted,
      });
    }
  }, [existing, mode, editForm]);

  if (mode === "edit" && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (mode === "edit" && isError) {
    return (
      <EmptyState
        icon={Users}
        title="Staff member not found"
        description={error instanceof ApiError ? error.message : "They may have been removed."}
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/staff">Back to staff</Link>
          </Button>
        }
      />
    );
  }

  const onCreate = async (v: StaffValues) => {
    try {
      await createUser.mutateAsync(v as AdminCreateStaffPayload);
      toast.success("Staff member created.");
      router.push("/dashboard/staff");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create staff member.");
    }
  };

  const onEdit = async (v: StaffEditValues) => {
    if (!userId) return;
    try {
      await updateUser.mutateAsync({
        userId,
        payload: {
          firstName: v.firstName,
          lastName: v.lastName,
          role: v.role,
          isDeleted: v.isDeleted,
        } as AdminUpdateUserPayload,
      });
      toast.success("Staff member updated.");
      router.push("/dashboard/staff");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update.");
    }
  };

  const isEdit = mode === "edit";

  if (isEdit) {
    return (
      <EditForm
        form={editForm}
        onSubmit={onEdit}
        submitting={updateUser.isPending}
        existing={existing}
      />
    );
  }

  return (
    <CreateForm
      form={createForm}
      onSubmit={onCreate}
      submitting={createUser.isPending}
    />
  );
}

/* --- create form ---------------------------------------------------------- */

function CreateForm({
  form,
  onSubmit,
  submitting,
}: {
  form: ReturnType<typeof useForm<z.input<typeof staffSchema>, unknown, z.output<typeof staffSchema>>>;
  onSubmit: (v: StaffValues) => Promise<void>;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const router = useRouter();
  const role = watch("role") ?? "staff";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div>
        <h1 className="font-display text-3xl tracking-tight">New staff member</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a team member who can manage your hotel.
        </p>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message} required>
            <Input {...register("firstName")} />
          </Field>
          <Field label="Last name" error={errors.lastName?.message} required>
            <Input {...register("lastName")} />
          </Field>
          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone number" error={errors.phoneNumber?.message} required>
            <Input {...register("phoneNumber")} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Password" error={errors.password?.message} required>
            <Input type="password" {...register("password")} />
          </Field>
          <div className="space-y-2">
            <Label>
              Role<span className="text-destructive"> *</span>
            </Label>
            <Select value={role} onValueChange={(v) => setValue("role", v as "staff" | "hotelAdmin")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="hotelAdmin">Hotel admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
          <Save className="h-4 w-4" />
          {submitting ? "Creating…" : "Create staff member"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/staff")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* --- edit form ------------------------------------------------------------ */

function EditForm({
  form,
  onSubmit,
  submitting,
  existing,
}: {
  form: ReturnType<typeof useForm<z.input<typeof staffEditSchema>, unknown, z.output<typeof staffEditSchema>>>;
  onSubmit: (v: StaffEditValues) => Promise<void>;
  submitting: boolean;
  existing?: User;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;
  const router = useRouter();
  const role = watch("role") ?? "staff";
  const isDeleted = watch("isDeleted") ?? false;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div>
        <h1 className="font-display text-3xl tracking-tight">Edit staff member</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {existing ? `${existing.firstName} ${existing.lastName}` : ""}
          {existing?.email ? ` · ${existing.email}` : ""}
        </p>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message} required>
            <Input {...register("firstName")} />
          </Field>
          <Field label="Last name" error={errors.lastName?.message} required>
            <Input {...register("lastName")} />
          </Field>
          <div className="space-y-2">
            <Label>
              Role<span className="text-destructive"> *</span>
            </Label>
            <Select value={role} onValueChange={(v) => setValue("role", v as "staff" | "hotelAdmin", { shouldDirty: true })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="hotelAdmin">Hotel admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Checkbox
              id="isDeleted"
              checked={!isDeleted}
              onCheckedChange={(c) => setValue("isDeleted", c !== true, { shouldDirty: true })}
            />
            <Label htmlFor="isDeleted" className="text-sm font-normal">
              Active (can log in)
            </Label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={submitting || !isDirty} className="gap-1.5">
          <Save className="h-4 w-4" />
          {submitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/staff")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* --- shared --------------------------------------------------------------- */

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        {children}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
