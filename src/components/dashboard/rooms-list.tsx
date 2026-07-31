"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useRooms,
  useRoomTypes,
  useUpdateRoom,
  useDeactivateRoom,
} from "@/lib/query";
import type { Room, RoomType, RoomStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { RoomStatusBadge } from "@/components/primitives/status-badge";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { DoorClosed, Plus, Pencil, Trash2 } from "lucide-react";

const ROOM_STATUSES: RoomStatus[] = ["available", "occupied", "cleaning", "out_of_service"];

/**
 * RoomsList — the /dashboard/rooms page. A DataTable of rooms with:
 * - Inline status dropdown (the key daily-ops action — optimistic update)
 * - Filter by room type + status (URL-synced via local state for MVP)
 * - Create/edit/deactivate per row
 *
 * Columns: room number, type, price, capacity, status (inline), actions.
 */
export function RoomsList() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const { data: roomTypes } = useRoomTypes(hotelId, { limit: 100 });
  const [statusFilter, setStatusFilter] = React.useState<RoomStatus | "all">("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const { data: rooms, isLoading, isError, error } = useRooms(hotelId, {
    limit: 100,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(typeFilter !== "all" ? { roomTypeId: typeFilter } : {}),
  });
  const deactivate = useDeactivateRoom(hotelId);

  if (!hotelId) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={DoorClosed}
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
          icon={DoorClosed}
          title="Could not load rooms"
          description={error instanceof ApiError ? error.message : "Please try again later."}
        />
      </div>
    );
  }

  const list = rooms ?? [];
  const roomTypeMap = new Map((roomTypes ?? []).map((rt) => [rt.id, rt]));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <Header />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/dashboard/rooms/new">
            <Plus className="h-4 w-4" />
            New room
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(roomTypes ?? []).map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RoomStatus | "all")}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ROOM_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms yet"
          description="Add your first room to start managing inventory."
          action={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard/rooms/new">
                <Plus className="h-4 w-4" />
                New room
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-28 text-right">Price</TableHead>
                <TableHead className="w-20">Capacity</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  roomType={
                    typeof room.roomType === "object"
                      ? (room.roomType as RoomType)
                      : roomTypeMap.get(
                          typeof room.roomType === "string" ? room.roomType : ""
                        ) ?? null
                  }
                  onDeactivate={async () => {
                    try {
                      await deactivate.mutateAsync(room.id);
                      toast.success("Room deactivated.");
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

function RoomRow({
  room,
  roomType,
  onDeactivate,
  deactivating,
}: {
  room: Room;
  roomType: RoomType | null;
  onDeactivate: () => Promise<void>;
  deactivating: boolean;
}) {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const updateRoom = useUpdateRoom(hotelId);
  const [optimisticStatus, setOptimisticStatus] = React.useState<RoomStatus | null>(null);

  const currentStatus = optimisticStatus ?? room.status;

  const onStatusChange = async (next: RoomStatus) => {
    const prev = room.status;
    setOptimisticStatus(next); // optimistic
    try {
      await updateRoom.mutateAsync({ roomId: room.id, payload: { status: next } });
      toast.success(`Room ${room.roomNumber} → ${next.replace(/_/g, " ")}`);
    } catch (err) {
      setOptimisticStatus(prev); // rollback
      toast.error(err instanceof ApiError ? err.message : "Could not update status.");
    }
  };

  const price = room.pricePerNight ?? roomType?.basePrice;
  const capacity = room.capacity ?? roomType?.defaultCapacity;

  return (
    <TableRow>
      <TableCell className="font-mono font-medium">
        <Link href={`/dashboard/rooms/${room.id}`} className="hover:text-primary">
          {room.roomNumber}
        </Link>
      </TableCell>
      <TableCell>
        {roomType ? (
          <Link
            href={`/dashboard/room-types/${roomType.id}`}
            className="text-sm hover:text-primary"
          >
            {roomType.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {price != null ? formatCurrency(price) : "—"}
      </TableCell>
      <TableCell className="tabular-nums">{capacity ?? "—"}</TableCell>
      <TableCell>
        {/* Inline status dropdown — the key daily-ops action */}
        <Select value={currentStatus} onValueChange={(v) => onStatusChange(v as RoomStatus)}>
          <SelectTrigger className="h-8 w-36">
            <RoomStatusBadge status={currentStatus} />
          </SelectTrigger>
          <SelectContent>
            {ROOM_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <RoomStatusBadge status={s} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/dashboard/rooms/${room.id}`} aria-label="Edit">
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
            title="Deactivate this room?"
            description="This soft-deletes the room. It will no longer appear in inventory. This can be reversed by an administrator."
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
      <h1 className="font-display text-3xl tracking-tight">Rooms</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Physical rooms linked to room types. Change status inline.
      </p>
    </div>
  );
}
