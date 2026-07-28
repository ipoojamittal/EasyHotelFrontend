import { PagePlaceholder } from "@/components/primitives/page-placeholder";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <PagePlaceholder
      title={`Staff member ${userId}`}
      description="Staff detail + edit + deactivate — Phase 4."
    />
  );
}
