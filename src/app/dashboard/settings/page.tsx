import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";

/**
 * Dashboard settings — profile + password for staff/hotelAdmin/superAdmin.
 * Reuses the same forms as the customer /account/profile pages since
 * the /api/users/me endpoints are shared across all roles.
 */
export default function DashboardSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile and password.
        </p>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg tracking-tight">Profile</h2>
        <ProfileForm />
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg tracking-tight">Password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
