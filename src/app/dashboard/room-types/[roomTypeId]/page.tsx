import { PagePlaceholder } from "@/components/primitives/page-placeholder";

export default async function RoomTypeDetailPage({
  params,
}: {
  params: Promise<{ roomTypeId: string }>;
}) {
  const { roomTypeId } = await params;
  return (
    <PagePlaceholder
      title={`Room type ${roomTypeId}`}
      description="Room type detail + edit — Phase 3."
    />
  );
}
