"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useRoomTypes, useDeactivateRoomType } from "@/lib/query";
import type { RoomType } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { BedDouble, Plus, Pencil, Trash2 } from "lucide-react";

/**
 * RoomTypesList — the /dashboard/room-types page. A DataTable-style table
 * of room types for the hotelAdmin's hotel, with create/edit/deactivate.
 *
 * Columns: name, type code, base price, capacity, status, actions.
 */
export function RoomTypesList() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const { data: roomTypes, isLoading, isError, error } = useRoomTypes(hotelId, { limit: 100 });
  const deactivate = useDeactivateRoomType(hotelId);

  if (!hotelId) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={BedDouble}
          title="No hotel assigned"
          description="Your account isn't linked to a hotel. Please contact an administrator."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={BedDouble}
          title="Could not load room types"
          description={error instanceof ApiError ? error.message : "Please try again later."}
        />
      </div>
    );
  }

  const list = roomTypes ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <Header />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/dashboard/room-types/new">
            <Plus className="h-4 w-4" />
            New room type
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No room types yet"
          description="Create your first room type to start adding rooms."
          action={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard/room-types/new">
                <Plus className="h-4 w-4" />
                New room type
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Code</TableHead>
                <TableHead className="w-32 text-right">Base price</TableHead>
                <TableHead className="w-28">Capacity</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((rt) => (
                <RoomTypeRow
                  key={rt.id}
                  roomType={rt}
                  onDeactivate={async () => {
                    try {
                      await deactivate.mutateAsync(rt.id);
                      toast.success("Room type deactivated.");
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : "Could not deactivate.");
                      throw err;
                    }
                  }}
                  deactivating={deactivate.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function RoomTypeRow({
  roomType,
  onDeactivate,
  deactivating,
}: {
  roomType: RoomType;
  onDeactivate: () => Promise<void>;
  deactivating: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/dashboard/room-types/${roomType.id}`}
          className="hover:text-primary"
        >
          {roomType.name}
        </Link>
        {roomType.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {roomType.description}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {roomType.typeCode ?? "—"}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency(roomType.basePrice)}
      </TableCell>
      <TableCell className="tabular-nums">
        {roomType.defaultCapacity}
        {roomType.maxCapacity ? ` / ${roomType.maxCapacity}` : ""}
      </TableCell>
      <TableCell>
        <span
          className={
            roomType.isActive
              ? "inline-flex items-center gap-1.5 text-xs text-success"
              : "inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          <span
            className={
              roomType.isActive
                ? "h-1.5 w-1.5 rounded-full bg-success"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
            }
          />
          {roomType.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/dashboard/room-types/${roomType.id}`} aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Deactivate"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Deactivate this room type?"
            description="This soft-deletes the room type. Existing rooms of this type are unaffected. This can be reversed by an administrator."
            confirmLabel="Deactivate"
            destructive
            onConfirm={onDeactivate}
          >
            {deactivating ? <p className="text-xs text-muted-foreground">Deactivating…</p> : null}
          </ConfirmDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Room types</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Categories of rooms — pricing, capacity, and amenities.
      </p>
    </div>
  );
}
