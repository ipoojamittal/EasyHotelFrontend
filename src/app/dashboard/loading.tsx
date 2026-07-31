import { Skeleton } from "@/components/primitives/skeleton";

/**
 * Dashboard loading state — shown while a dashboard route segment
 * is loading. Keeps the layout shift minimal with a skeleton that
 * matches the typical page header + content shape.
 */
export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}
