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
      description="Booking detail + status stepper + edit + cancel — Phase 4."
    />
  );
}
