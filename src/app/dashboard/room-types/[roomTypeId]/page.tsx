import { RoomTypeForm } from "@/components/dashboard/room-type-form";

export default async function RoomTypeDetailPage({
  params,
}: {
  params: Promise<{ roomTypeId: string }>;
}) {
  const { roomTypeId } = await params;
  return <RoomTypeForm mode="edit" roomTypeId={roomTypeId} />;
}
