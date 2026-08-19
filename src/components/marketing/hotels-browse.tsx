"use client";

import * as React from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { useHotels } from "@/lib/query";
import {
  HotelCardReveal,
  HotelCardSkeleton,
} from "@/components/marketing/hotel-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/primitives/empty-state";
import { Hotel as HotelIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * HotelsBrowse — the /hotels page. Search/filter bar (city, country)
 * synced to the URL via nuqs so filters are shareable and back-button
 * works. Responsive grid of HotelCards with staggered reveal, pagination,
 * and graceful loading/empty states.
 *
 * The backend's GET /api/hotels accepts page, limit, city, country,
 * isDeleted, sortBy, sortOrder — all wired here.
 */
const PAGE_SIZE = 9;

export function HotelsBrowse() {
  const [filters, setFilters] = useQueryStates({
    city: parseAsString.withDefault(""),
    country: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
  });

  const { data, isLoading, isError } = useHotels({
    page: filters.page,
    limit: PAGE_SIZE,
    city: filters.city || undefined,
    country: filters.country || undefined,
    isDeleted: false,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const hotels = data?.hotels ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? 1;

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFilters({
      city: (formData.get("city") as string) || "",
      country: (formData.get("country") as string) || "",
      page: 1,
    });
  };

  const goToPage = (page: number) => {
    setFilters({ page: Math.max(1, Math.min(page, totalPages)) });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Browse stays
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Curated properties, transparent pricing, no surprises.
        </p>
      </div>

      {/* Filter bar */}
      <form
        onSubmit={onSearch}
        className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="city"
            placeholder="City (e.g. Lisbon, Tokyo)"
            defaultValue={filters.city}
            className="pl-9"
          />
        </div>
        <Input
          name="country"
          placeholder="Country (e.g. Portugal, Japan)"
          defaultValue={filters.country}
          className="sm:w-56"
        />
        <Button type="submit" className="sm:w-28">
          Search
        </Button>
        {(filters.city || filters.country) && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFilters({ city: "", country: "", page: 1 })}
            className="sm:w-28"
          >
            Clear
          </Button>
        )}
      </form>

      {/* Results */}
      {isError ? (
        <EmptyState
          icon={HotelIcon}
          title="Couldn't load hotels"
          description="Please check your connection and try again."
        />
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState
          icon={HotelIcon}
          title="No hotels found"
          description={
            filters.city || filters.country
              ? "Try adjusting your search filters."
              : "New properties are being added. Check back soon."
          }
          action={
            filters.city || filters.country ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ city: "", country: "", page: 1 })
                }
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel, i) => (
              <HotelCardReveal
                key={hotel.id}
                hotel={hotel}
                index={i}
                priority={i < 3}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
