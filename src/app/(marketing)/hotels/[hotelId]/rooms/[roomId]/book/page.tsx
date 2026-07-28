import { BookingFlow } from "@/components/booking/booking-flow";

export default async function BookRoomPage({
  params,
}: {
  params: Promise<{ hotelId: string; roomId: string }>;
}) {
  const { hotelId, roomId } = await params;
  return <BookingFlow hotelId={hotelId} roomId={roomId} />;
}
