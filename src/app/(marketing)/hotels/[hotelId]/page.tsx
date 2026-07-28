import { PagePlaceholder } from "@/components/primitives/page-placeholder";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;
  return (
    <PagePlaceholder
      title={`Hotel ${hotelId}`}
      description="Hotel detail with hero gallery, amenities, and room list — Phase 1."
    />
  );
}
