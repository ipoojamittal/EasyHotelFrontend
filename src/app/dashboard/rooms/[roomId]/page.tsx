import { PagePlaceholder } from "@/components/primitives/page-placeholder";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <PagePlaceholder
      title={`Room ${roomId}`}
      description="Room detail + edit + inline status — Phase 4."
    />
  );
}
