import * as React from "react";
import { AuthGuard, RoleGuard } from "@/components/auth/auth-guard";
import { AccountHeader } from "@/components/account/account-header";
import type { Role } from "@/types/api";

/**
 * Account layout — customer-facing authenticated area (warm light).
 * Guarded to the `customer` role. Top nav, no footer (app-like).
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["customer" as Role]}>
        <div className="grain-overlay flex min-h-screen flex-col">
          <AccountHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
            {children}
          </main>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
