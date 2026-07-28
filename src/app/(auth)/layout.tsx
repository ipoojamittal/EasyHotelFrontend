import * as React from "react";

/**
 * Auth layout — minimal centered layout for /login and /register.
 * Warm light theme, no nav (sign-in focus).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain-overlay flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
