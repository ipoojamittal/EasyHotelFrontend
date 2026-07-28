import { HotelDetail } from "@/components/marketing/hotel-detail";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;
  return <HotelDetail hotelId={hotelId} />;
}
