"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyHotel,
  useCreateHotel,
  useUpdateMyHotel,
  useDeactivateMyHotel,
} from "@/lib/query";
import type { CreateHotelPayload } from "@/lib/api/hotels";
import type { Hotel } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrayField } from "@/components/primitives/array-field";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { hotelSchema, type HotelValues } from "@/lib/forms/schemas";
import { z } from "zod";
import { Building2, Plus, Save, Trash2 } from "lucide-react";

/**
 * HotelSettings — the /dashboard/hotel page. Two modes:
 *
 * 1. No hotel yet → onboarding form (POST /api/hotels). The hotelAdmin
 *    creates their first property here.
 * 2. Hotel exists → settings form (PATCH /api/hotels/my-hotel) + a
 *    destructive "Deactivate hotel" action (DELETE /api/hotels/my-hotel).
 *
 * Fields: name, structured address, phone array, email, description,
 * amenities array, images array (URLs), check-in/out times, maps URLs.
 */
export function HotelSettings() {
  const { data: hotel, isLoading, isError, error } = useMyHotel();
  const createHotel = useCreateHotel();
  const updateHotel = useUpdateMyHotel();
  const deactivateHotel = useDeactivateMyHotel();

  const isOnboarding = !hotel && !isLoading && !isError;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-tight">My hotel</h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // 404 on /my-hotel means "no hotel yet" → onboarding.
  if (isError && error instanceof ApiError && error.status === 404) {
    return <HotelForm mode="create" submitting={createHotel.isPending} onSubmit={async (v) => {
      try {
        await createHotel.mutateAsync(v);
        toast.success("Hotel created.");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not create hotel.");
        throw err;
      }
    }} />;
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <h1 className="font-display text-3xl tracking-tight">My hotel</h1>
        <EmptyState
          icon={Building2}
          title="Could not load your hotel"
          description={error instanceof ApiError ? error.message : "Please try again later."}
        />
      </div>
    );
  }

  if (isOnboarding || !hotel) {
    return <HotelForm mode="create" submitting={createHotel.isPending} onSubmit={async (v) => {
      try {
        await createHotel.mutateAsync(v);
        toast.success("Hotel created.");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not create hotel.");
        throw err;
      }
    }} />;
  }

  return (
    <HotelForm
      mode="edit"
      hotel={hotel}
      submitting={updateHotel.isPending}
      onSubmit={async (v) => {
        try {
          await updateHotel.mutateAsync(v);
          toast.success("Hotel updated.");
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Could not update hotel.");
          throw err;
        }
      }}
      onDelete={async () => {
        try {
          await deactivateHotel.mutateAsync();
          toast.success("Hotel deactivated.");
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Could not deactivate hotel.");
          throw err;
        }
      }}
      deleting={deactivateHotel.isPending}
    />
  );
}

/* -------------------------------------------------------------------------- */

function HotelForm({
  mode,
  hotel,
  submitting,
  onSubmit,
  onDelete,
  deleting,
}: {
  mode: "create" | "edit";
  hotel?: Hotel;
  submitting: boolean;
  onSubmit: (values: CreateHotelPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  deleting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof hotelSchema>, unknown, z.output<typeof hotelSchema>>({
    resolver: zodResolver(hotelSchema),
    defaultValues: hotelToValues(hotel),
  });

  // Repopulate when the hotel loads (edit mode after async fetch).
  React.useEffect(() => {
    if (hotel) reset(hotelToValues(hotel));
  }, [hotel, reset]);

  const amenities = watch("amenities") ?? [];
  const images = watch("images") ?? [];
  const phoneNumbers = watch("phoneNumber") ?? [];

  // ArrayField is uncontrolled-ish (we drive via setValue), so we keep the
  // arrays in RHF state via watch + setValue.
  const setArray = (field: "amenities" | "images" | "phoneNumber", next: string[]) => {
    setValue(field, next, { shouldDirty: true });
  };

  const isEdit = mode === "edit";

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(valuesToPayload(v)))}
      className="space-y-8"
      noValidate
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {isEdit ? "My hotel" : "List your property"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEdit
              ? "Update your hotel details, amenities, and imagery."
              : "Create your first property to start managing rooms and bookings."}
          </p>
        </div>
        {isEdit && onDelete ? (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
                Deactivate
              </Button>
            }
            title="Deactivate this hotel?"
            description="This soft-deletes the hotel. It will no longer appear in searches. This action can be reversed by an administrator."
            confirmLabel="Deactivate"
            destructive
            onConfirm={onDelete}
          >
            {deleting ? <p className="text-xs text-muted-foreground">Deactivating…</p> : null}
          </ConfirmDialog>
        ) : null}
      </div>

      {/* Identity */}
      <Section title="Identity" description="The public-facing name and contact for your property.">
        <div className="grid gap-4">
          <Field label="Hotel name" error={errors.name?.message} required>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} placeholder="The Grand Meridian" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} placeholder="stay@grandmeridian.com" />
            </Field>
            <div className="space-y-2">
              <Label>Phone numbers</Label>
              <ArrayField
                values={phoneNumbers}
                onChange={(v) => setArray("phoneNumber", v)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <Textarea id="description" rows={4} {...register("description")} placeholder="A short, evocative description of your property…" />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section title="Address" description="Where guests will arrive.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street" error={errors.address?.street?.message} required className="sm:col-span-2">
            <Input {...register("address.street")} placeholder="1 Harbor Way" />
          </Field>
          <Field label="City" error={errors.address?.city?.message} required>
            <Input {...register("address.city")} placeholder="Lisbon" />
          </Field>
          <Field label="State / Province" error={errors.address?.state?.message} required>
            <Input {...register("address.state")} placeholder="Lisboa" />
          </Field>
          <Field label="ZIP / Postal code" error={errors.address?.zipCode?.message} required>
            <Input {...register("address.zipCode")} placeholder="1100-000" />
          </Field>
          <Field label="Country" error={errors.address?.country?.message} required>
            <Input {...register("address.country")} placeholder="Portugal" />
          </Field>
        </div>
      </Section>

      {/* Operations */}
      <Section title="Operations" description="Standard check-in and check-out times.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Check-in time" error={errors.checkInTime?.message} required>
            <Input type="time" {...register("checkInTime")} />
          </Field>
          <Field label="Check-out time" error={errors.checkOutTime?.message} required>
            <Input type="time" {...register("checkOutTime")} />
          </Field>
        </div>
      </Section>

      {/* Amenities + Images */}
      <Section title="Amenities & imagery" description="What makes your property distinctive.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ArrayField
            label="Amenities"
            values={amenities}
            onChange={(v) => setArray("amenities", v)}
            placeholder="e.g. Rooftop pool"
          />
          <ArrayField
            label="Image URLs"
            values={images}
            onChange={(v) => setArray("images", v)}
            type="url"
            placeholder="https://images.example.com/hero.jpg"
          />
        </div>
      </Section>

      {/* Maps (optional) */}
      <Section title="Maps" description="Optional deep links to mapping services.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Google Maps URL" error={errors.mapsUrl?.googleMaps?.message}>
            <Input {...register("mapsUrl.googleMaps")} placeholder="https://maps.app.goo.gl/…" />
          </Field>
          <Field label="Apple Maps URL" error={errors.mapsUrl?.appleMaps?.message}>
            <Input {...register("mapsUrl.appleMaps")} placeholder="https://maps.apple.com/…" />
          </Field>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || (isEdit && !isDirty)} className="gap-1.5">
          {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create hotel"}
        </Button>
        {isEdit ? (
          <p className="text-xs text-muted-foreground">
            {isDirty ? "You have unsaved changes." : "All changes saved."}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/* --- helpers -------------------------------------------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

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

function hotelToValues(hotel?: Hotel): HotelValues {
  if (!hotel) {
    return {
      name: "",
      address: { street: "", city: "", state: "", zipCode: "", country: "" },
      email: "",
      description: "",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      mapsUrl: { googleMaps: "", appleMaps: "" },
      // arrays handled via setValue below; default empty
      amenities: [],
      images: [],
      phoneNumber: [],
    } as HotelValues;
  }
  return {
    name: hotel.name ?? "",
    address: hotel.address ?? { street: "", city: "", state: "", zipCode: "", country: "" },
    email: hotel.email ?? "",
    description: hotel.description ?? "",
    checkInTime: hotel.checkInTime ?? "15:00",
    checkOutTime: hotel.checkOutTime ?? "11:00",
    mapsUrl: {
      googleMaps: hotel.mapsUrl?.googleMaps ?? "",
      appleMaps: hotel.mapsUrl?.appleMaps ?? "",
    },
    amenities: hotel.amenities ?? [],
    images: hotel.images ?? [],
    phoneNumber: hotel.phoneNumber ?? [],
  } as HotelValues;
}

function valuesToPayload(v: HotelValues): CreateHotelPayload {
  const payload: CreateHotelPayload = {
    name: v.name,
    address: v.address,
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
  };
  if (v.email) payload.email = v.email;
  if (v.description) payload.description = v.description;
  if (v.amenities && v.amenities.length) payload.amenities = v.amenities;
  if (v.images && v.images.length) payload.images = v.images;
  if (v.phoneNumber && v.phoneNumber.length) payload.phoneNumber = v.phoneNumber;
  if (v.mapsUrl && (v.mapsUrl.googleMaps || v.mapsUrl.appleMaps)) {
    payload.mapsUrl = {};
    if (v.mapsUrl.googleMaps) payload.mapsUrl.googleMaps = v.mapsUrl.googleMaps;
    if (v.mapsUrl.appleMaps) payload.mapsUrl.appleMaps = v.mapsUrl.appleMaps;
  }
  return payload;
}
