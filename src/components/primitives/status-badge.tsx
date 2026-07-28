import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  bookingStatusMeta,
  roomStatusMeta,
  roleMeta,
} from "@/lib/format";
import type { BookingStatus, Role, RoomStatus } from "@/types/api";

/**
 * StatusBadge — a single badge for booking/room/role statuses, driven by
 * the central status maps in lib/format. Keeps dot+label consistent across
 * the dashboard and customer views.
 */

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusBadgeVariants>;

function Badge({ className, tone, ...rest }: BadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)} {...rest} />
  );
}

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const meta = bookingStatusMeta[status];
  return (
    <Badge className={cn(meta.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

export function RoomStatusBadge({
  status,
  className,
}: {
  status: RoomStatus;
  className?: string;
}) {
  const meta = roomStatusMeta[status];
  return (
    <Badge className={cn(meta.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const meta = roleMeta[role];
  return <Badge className={cn(meta.badge, className)}>{meta.label}</Badge>;
}
