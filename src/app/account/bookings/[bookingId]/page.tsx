import { PagePlaceholder } from "@/components/primitives/page-placeholder";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <PagePlaceholder
      title={`Booking ${bookingId}`}
      description="Booking detail with status timeline and cancel — Phase 2."
    />
  );
}
