import * as React from "react";
import { AuthGuard, RoleGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Role } from "@/types/api";

/**
 * Dashboard layout — management area, forced dark theme (warm-tinted near-black).
 * Guarded to staff / hotelAdmin / superAdmin.
 *
 * The dark theme is forced by wrapping the shell in `.dark`. The dashboard
 * should never render in light mode regardless of the user's system preference.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["staff", "hotelAdmin", "superAdmin"] as Role[]}>
        <div className="dark min-h-screen bg-background text-foreground">
          <DashboardShell>{children}</DashboardShell>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
