import { RoomForm } from "@/components/dashboard/room-form";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomForm mode="edit" roomId={roomId} />;
}
