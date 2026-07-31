import { StaffForm } from "@/components/dashboard/staff-form";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <StaffForm mode="edit" userId={userId} />;
}
