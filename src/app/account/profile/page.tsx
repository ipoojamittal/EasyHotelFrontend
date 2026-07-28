import { ProfileForm } from "@/components/account/profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your name and contact details.
        </p>
      </div>
      <div className="max-w-lg rounded-lg border border-border bg-card p-6">
        <ProfileForm />
      </div>
    </div>
  );
}
