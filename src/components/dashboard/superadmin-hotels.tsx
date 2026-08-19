"use client";

import * as React from "react";
import Link from "next/link";
import { useHotels } from "@/lib/query";
import type { Hotel } from "@/types/api";
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
import { formatRelative } from "@/lib/format";
import { Building2, ExternalLink } from "lucide-react";

/**
 * SuperAdminHotels — a read-only global hotel directory for superAdmin
 * users. The backend has no dedicated superAdmin routes, so this uses
 * the public GET /api/hotels (open to any authenticated user) to list
 * all hotels system-wide. Each row links to the public hotel detail.
 *
 * Per the plan: superAdmin is read-only-ish. Cross-hotel booking
 * analytics aren't possible (hotel-scoped booking lists are role-checked).
 */
export function SuperAdminHotels() {
  const { data: hotelsData, isLoading, isError } = useHotels({ limit: 100 });

  if (isError) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={Building2}
          title="Could not load hotels"
          description="Please try again later."
        />
      </div>
    );
  }

  const hotels = hotelsData?.hotels ?? [];

  return (
    <div className="space-y-8">
      <Header />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hotels yet"
          description="Hotels will appear here once hotelAdmins start onboarding properties."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-32">Created</TableHead>
                <TableHead className="w-16 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((h) => (
                <HotelRow key={h.id} hotel={h} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function HotelRow({ hotel }: { hotel: Hotel }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{hotel.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {hotel.address.city}, {hotel.address.country}
      </TableCell>
      <TableCell>
        <span
          className={
            !hotel.isDeleted
              ? "inline-flex items-center gap-1.5 text-xs text-success"
              : "inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          <span
            className={
              !hotel.isDeleted
                ? "h-1.5 w-1.5 rounded-full bg-success"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
            }
          />
          {!hotel.isDeleted ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {hotel.createdAt ? formatRelative(hotel.createdAt) : "—"}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={`/hotels/${hotel.id}`} aria-label="View">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">All hotels</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Global directory — superAdmin scope (read-only).
      </p>
    </div>
  );
}
