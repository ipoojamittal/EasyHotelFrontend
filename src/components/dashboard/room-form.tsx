"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useRoom,
  useRoomTypes,
  useCreateRoom,
  useUpdateRoom,
} from "@/lib/query";
import type { CreateRoomPayload, UpdateRoomPayload } from "@/lib/api/rooms";
import type { Room, RoomType, RoomStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrayField } from "@/components/primitives/array-field";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { roomSchema, type RoomValues } from "@/lib/forms/schemas";
import { z } from "zod";
import { DoorClosed, Save } from "lucide-react";

const ROOM_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "out_of_service", label: "Out of service" },
];

/**
 * RoomForm — shared create/edit form for rooms. Used by:
 *   /dashboard/rooms/new        (mode="create")
 *   /dashboard/rooms/[id]       (mode="edit")
 *
 * Fields: roomNumber, roomTypeId (select from hotel's room types),
 * optional overrides (capacity, pricePerNight, amenities, images,
 * viewTypeOverride, sizeOverride), status.
 */
export function RoomForm({
  mode,
  roomId,
}: {
  mode: "create" | "edit";
  roomId?: string;
}) {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const router = useRouter();

  const createRoom = useCreateRoom(hotelId);
  const updateRoom = useUpdateRoom(hotelId);

  const { data: roomTypes } = useRoomTypes(hotelId, { limit: 100 });
  const {
    data: existing,
    isLoading,
    isError,
    error,
  } = useRoom(hotelId, roomId ?? "");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.input<typeof roomSchema>, unknown, z.output<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: defaultValues(),
  });

  React.useEffect(() => {
    if (mode === "edit" && existing) reset(roomToValues(existing));
  }, [existing, mode, reset]);

  const amenities = watch("amenities") ?? [];
  const images = watch("images") ?? [];
  const status = watch("status") ?? "available";
  const sizeOverrideUnit = watch("sizeOverrideUnit") ?? "sqm";
  const roomTypeId = watch("roomTypeId") ?? "";

  const setArray = (field: "amenities" | "images", next: string[]) => {
    setValue(field, next, { shouldDirty: true });
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (mode === "edit" && isError) {
    return (
      <EmptyState
        icon={DoorClosed}
        title="Room not found"
        description={error instanceof ApiError ? error.message : "It may have been removed."}
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/rooms">Back to rooms</Link>
          </Button>
        }
      />
    );
  }

  const onSubmit = async (v: RoomValues) => {
    try {
      if (mode === "create") {
        await createRoom.mutateAsync(valuesToCreatePayload(v));
        toast.success("Room created.");
      } else if (roomId) {
        await updateRoom.mutateAsync({ roomId, payload: valuesToUpdatePayload(v) });
        toast.success("Room updated.");
      }
      router.push("/dashboard/rooms");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save room.");
    }
  };

  const isEdit = mode === "edit";
  const selectedRoomType = roomTypes?.find((rt) => rt.id === roomTypeId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {isEdit ? "Edit room" : "New room"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEdit
            ? "Update room details and optional overrides."
            : "Add a physical room and link it to a room type."}
        </p>
      </div>

      {/* Core */}
      <Section title="Core" description="The room number and its category.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Room number" error={errors.roomNumber?.message} required>
            <Input {...register("roomNumber")} placeholder="101" className="font-mono" />
          </Field>
          <div className="space-y-2">
            <Label>
              Room type<span className="text-destructive"> *</span>
            </Label>
            <Select
              value={roomTypeId}
              onValueChange={(v) => setValue("roomTypeId", v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                {(roomTypes ?? []).map((rt) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomTypeId?.message ? (
              <p className="text-xs text-destructive">{errors.roomTypeId.message}</p>
            ) : null}
          </div>
        </div>
        <Field label="Description" error={errors.description?.message}>
          <Textarea rows={3} {...register("description")} placeholder="Optional room-specific notes…" />
        </Field>
      </Section>

      {/* Inherited-from-roomType hint */}
      {selectedRoomType ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{selectedRoomType.name}</span> defaults:
            {" "}{selectedRoomType.defaultCapacity} guests · base {formatPrice(selectedRoomType.basePrice)}
            {selectedRoomType.bedConfiguration ? ` · ${selectedRoomType.bedConfiguration}` : ""}
            {selectedRoomType.viewType ? ` · ${selectedRoomType.viewType}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Leave the overrides below blank to inherit from the room type.
          </p>
        </div>
      ) : null}

      {/* Overrides */}
      <Section title="Optional overrides" description="Per-room values that override the room type defaults.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Capacity override" error={errors.capacity?.message}>
            <Input type="number" min="1" max="20" {...register("capacity")} placeholder="Inherited" />
          </Field>
          <Field label="Price / night override" error={errors.pricePerNight?.message}>
            <Input type="number" step="0.01" min="0" {...register("pricePerNight")} placeholder="Inherited" />
          </Field>
          <Field label="View type override" error={errors.viewTypeOverride?.message}>
            <Input {...register("viewTypeOverride")} placeholder="Inherited" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Size override value" error={errors.sizeOverrideValue?.message}>
              <Input type="number" min="0" {...register("sizeOverrideValue")} placeholder="Inherited" />
            </Field>
            <div className="space-y-2">
              <Label>Size unit</Label>
              <Select
                value={sizeOverrideUnit || "sqm"}
                onValueChange={(v) => setValue("sizeOverrideUnit", v as "sqm" | "sqft", { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="sqm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqm">sqm</SelectItem>
                  <SelectItem value="sqft">sqft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ArrayField
            label="Amenities (augments room type)"
            values={amenities}
            onChange={(v) => setArray("amenities", v)}
            placeholder="e.g. Balcony"
          />
          <ArrayField
            label="Image URLs (augments room type)"
            values={images}
            onChange={(v) => setArray("images", v)}
            type="url"
            placeholder="https://images.example.com/room-101.jpg"
          />
        </div>
      </Section>

      {/* Status */}
      <Section title="Status" description="Current operational state of this room.">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setValue("status", v as RoomStatus, { shouldDirty: true })}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || (isEdit && !isDirty)} className="gap-1.5">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create room"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/rooms")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* --- helpers -------------------------------------------------------------- */

function formatPrice(n: number): string {
  return `$${n}`;
}

function defaultValues(): z.input<typeof roomSchema> {
  return {
    roomNumber: "",
    roomTypeId: "",
    description: "",
    capacity: "",
    pricePerNight: "",
    viewTypeOverride: "",
    sizeOverrideValue: "",
    sizeOverrideUnit: "sqm",
    status: "available",
    amenities: [],
    images: [],
  } as unknown as z.input<typeof roomSchema>;
}

function roomToValues(room: Room): z.input<typeof roomSchema> {
  return {
    roomNumber: room.roomNumber ?? "",
    roomTypeId: typeof room.roomType === "object" ? (room.roomType as RoomType).id : (room.roomType as string),
    description: room.description ?? "",
    capacity: room.capacity != null ? String(room.capacity) : "",
    pricePerNight: room.pricePerNight != null ? String(room.pricePerNight) : "",
    viewTypeOverride: room.viewTypeOverride ?? "",
    sizeOverrideValue: room.sizeOverride?.value != null ? String(room.sizeOverride.value) : "",
    sizeOverrideUnit: room.sizeOverride?.unit ?? "sqm",
    status: room.status ?? "available",
    amenities: room.amenities ?? [],
    images: room.images ?? [],
  } as unknown as z.input<typeof roomSchema>;
}

function valuesToCreatePayload(v: RoomValues): CreateRoomPayload {
  const payload: CreateRoomPayload = {
    roomNumber: v.roomNumber,
    roomTypeId: v.roomTypeId,
  };
  if (v.description) payload.description = v.description;
  if (v.capacity !== "" && v.capacity != null) payload.capacity = Number(v.capacity);
  if (v.pricePerNight !== "" && v.pricePerNight != null) payload.pricePerNight = Number(v.pricePerNight);
  if (v.viewTypeOverride) payload.viewTypeOverride = v.viewTypeOverride;
  if (v.sizeOverrideValue !== "" && v.sizeOverrideValue != null && v.sizeOverrideUnit) {
    payload.sizeOverride = { value: Number(v.sizeOverrideValue), unit: v.sizeOverrideUnit as "sqm" | "sqft" };
  }
  if (v.status) payload.status = v.status;
  if (v.amenities && v.amenities.length) payload.amenities = v.amenities;
  if (v.images && v.images.length) payload.images = v.images;
  return payload;
}

function valuesToUpdatePayload(v: RoomValues): UpdateRoomPayload {
  return valuesToCreatePayload(v);
}

/* --- shared sub-components ------------------------------------------------ */

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
