"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useRoomType,
  useCreateRoomType,
  useUpdateRoomType,
} from "@/lib/query";
import type { CreateRoomTypePayload, UpdateRoomTypePayload } from "@/lib/api/roomTypes";
import type { RoomType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { roomTypeSchema, type RoomTypeValues } from "@/lib/forms/schemas";
import { z } from "zod";
import { BedDouble, Save } from "lucide-react";

/**
 * RoomTypeForm — shared create/edit form for room types. Used by:
 *   /dashboard/room-types/new        (mode="create")
 *   /dashboard/room-types/[id]       (mode="edit")
 *
 * Fields: name, typeCode, basePrice, defaultCapacity, maxCapacity,
 * amenities, images, bedConfiguration, viewType, size{value,unit},
 * tags, sortOrder, isDeleted.
 */
export function RoomTypeForm({
  mode,
  roomTypeId,
}: {
  mode: "create" | "edit";
  roomTypeId?: string;
}) {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const router = useRouter();

  const createRoomType = useCreateRoomType(hotelId);
  const updateRoomType = useUpdateRoomType(hotelId);

  const {
    data: existing,
    isLoading,
    isError,
    error,
  } = useRoomType(hotelId, roomTypeId ?? "");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.input<typeof roomTypeSchema>, unknown, z.output<typeof roomTypeSchema>>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: defaultValues(),
  });

  React.useEffect(() => {
    if (mode === "edit" && existing) reset(roomTypeToValues(existing));
  }, [existing, mode, reset]);

  const amenities = watch("amenities") ?? [];
  const images = watch("images") ?? [];
  const tags = watch("tags") ?? [];
  const sizeUnit = watch("sizeUnit") ?? "sqm";

  const setArray = (field: "amenities" | "images" | "tags", next: string[]) => {
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
        icon={BedDouble}
        title="Room type not found"
        description={error instanceof ApiError ? error.message : "It may have been removed."}
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/room-types">Back to room types</Link>
          </Button>
        }
      />
    );
  }

  const onSubmit = async (v: RoomTypeValues) => {
    try {
      if (mode === "create") {
        await createRoomType.mutateAsync(valuesToCreatePayload(v));
        toast.success("Room type created.");
      } else if (roomTypeId) {
        await updateRoomType.mutateAsync({ roomTypeId, payload: valuesToUpdatePayload(v) });
        toast.success("Room type updated.");
      }
      router.push("/dashboard/room-types");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save room type.");
    }
  };

  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {isEdit ? "Edit room type" : "New room type"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEdit
            ? "Update the details, pricing, and amenities for this room type."
            : "Define a category of rooms — pricing, capacity, and amenities."}
        </p>
      </div>

      {/* Core */}
      <Section title="Core" description="The name and code guests and staff see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message} required>
            <Input {...register("name")} placeholder="Deluxe King" />
          </Field>
          <Field label="Type code" error={errors.typeCode?.message}>
            <Input {...register("typeCode")} placeholder="DLX-K" className="font-mono" />
          </Field>
        </div>
        <Field label="Description" error={errors.description?.message}>
          <Textarea rows={3} {...register("description")} placeholder="A spacious king room with city views…" />
        </Field>
      </Section>

      {/* Pricing & capacity */}
      <Section title="Pricing & capacity" description="Base nightly rate and guest limits.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Base price / night" error={errors.basePrice?.message} required>
            <Input type="number" step="0.01" min="0" {...register("basePrice")} placeholder="180" />
          </Field>
          <Field label="Default capacity" error={errors.defaultCapacity?.message} required>
            <Input type="number" min="1" max="20" {...register("defaultCapacity")} placeholder="2" />
          </Field>
          <Field label="Max capacity" error={errors.maxCapacity?.message}>
            <Input type="number" min="1" max="20" {...register("maxCapacity")} placeholder="4" />
          </Field>
        </div>
      </Section>

      {/* Configuration */}
      <Section title="Configuration" description="Physical attributes that help guests choose.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bed configuration" error={errors.bedConfiguration?.message}>
            <Input {...register("bedConfiguration")} placeholder="1 King bed" />
          </Field>
          <Field label="View type" error={errors.viewType?.message}>
            <Input {...register("viewType")} placeholder="City view" />
          </Field>
          <Field label="Size value" error={errors.sizeValue?.message}>
            <Input type="number" min="0" {...register("sizeValue")} placeholder="35" />
          </Field>
          <div className="space-y-2">
            <Label>Size unit</Label>
            <Select value={sizeUnit || "sqm"} onValueChange={(v) => setValue("sizeUnit", v as "sqm" | "sqft", { shouldDirty: true })}>
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
      </Section>

      {/* Amenities + Images + Tags */}
      <Section title="Amenities, imagery & tags" description="What distinguishes this room type.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ArrayField
            label="Amenities"
            values={amenities}
            onChange={(v) => setArray("amenities", v)}
            placeholder="e.g. Minibar"
          />
          <ArrayField
            label="Tags"
            values={tags}
            onChange={(v) => setArray("tags", v)}
            placeholder="e.g. Family-friendly"
          />
        </div>
        <ArrayField
          label="Image URLs"
          values={images}
          onChange={(v) => setArray("images", v)}
          type="url"
          placeholder="https://images.example.com/deluxe.jpg"
        />
      </Section>

      {/* Display */}
      <Section title="Display" description="Sort order and visibility.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sort order" error={errors.sortOrder?.message}>
            <Input type="number" min="0" {...register("sortOrder")} placeholder="0" />
          </Field>
          <div className="flex items-center gap-3 pt-6">
            <Checkbox
              id="isDeleted"
              checked={!watch("isDeleted")}
              onCheckedChange={(c) => setValue("isDeleted", c !== true, { shouldDirty: true })}
            />
            <Label htmlFor="isDeleted" className="text-sm font-normal">
              Active (visible to guests)
            </Label>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || (isEdit && !isDirty)} className="gap-1.5">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create room type"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/room-types")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* --- helpers -------------------------------------------------------------- */

function defaultValues(): RoomTypeValues {
  return {
    name: "",
    typeCode: "",
    description: "",
    basePrice: 0,
    defaultCapacity: 2,
    maxCapacity: "",
    bedConfiguration: "",
    viewType: "",
    sizeValue: "",
    sizeUnit: "sqm",
    sortOrder: "",
    isDeleted: false,
    amenities: [],
    images: [],
    tags: [],
  } as unknown as RoomTypeValues;
}

function roomTypeToValues(rt: RoomType): RoomTypeValues {
  return {
    name: rt.name ?? "",
    typeCode: rt.typeCode ?? "",
    description: rt.description ?? "",
    basePrice: rt.basePrice ?? 0,
    defaultCapacity: rt.defaultCapacity ?? 2,
    maxCapacity: rt.maxCapacity ? String(rt.maxCapacity) : "",
    bedConfiguration: rt.bedConfiguration ?? "",
    viewType: rt.viewType ?? "",
    sizeValue: rt.size?.value ? String(rt.size.value) : "",
    sizeUnit: rt.size?.unit ?? "sqm",
    sortOrder: rt.sortOrder != null ? String(rt.sortOrder) : "",
    isDeleted: rt.isDeleted ?? false,
    amenities: rt.amenities ?? [],
    images: rt.images ?? [],
    tags: rt.tags ?? [],
  } as unknown as RoomTypeValues;
}

function valuesToCreatePayload(v: RoomTypeValues): CreateRoomTypePayload {
  const payload: CreateRoomTypePayload = {
    name: v.name,
    basePrice: Number(v.basePrice) || 0,
    defaultCapacity: Number(v.defaultCapacity) || 1,
  };
  if (v.typeCode) payload.typeCode = v.typeCode;
  if (v.description) payload.description = v.description;
  if (v.maxCapacity !== "" && v.maxCapacity != null) payload.maxCapacity = Number(v.maxCapacity);
  if (v.bedConfiguration) payload.bedConfiguration = v.bedConfiguration;
  if (v.viewType) payload.viewType = v.viewType;
  if (v.sizeValue !== "" && v.sizeValue != null && v.sizeUnit) {
    payload.size = { value: Number(v.sizeValue), unit: v.sizeUnit as "sqm" | "sqft" };
  }
  if (v.sortOrder !== "" && v.sortOrder != null) payload.sortOrder = Number(v.sortOrder);
  if (v.amenities && v.amenities.length) payload.amenities = v.amenities;
  if (v.images && v.images.length) payload.images = v.images;
  if (v.tags && v.tags.length) payload.tags = v.tags;
  return payload;
}

function valuesToUpdatePayload(v: RoomTypeValues): UpdateRoomTypePayload {
  return { ...valuesToCreatePayload(v), isDeleted: v.isDeleted };
}

/* --- shared sub-components (duplicated from hotel-form for independence) --- */

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
