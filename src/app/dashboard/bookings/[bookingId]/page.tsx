import { BookingDetail } from "@/components/dashboard/booking-detail";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingDetail bookingId={bookingId} />;
}
