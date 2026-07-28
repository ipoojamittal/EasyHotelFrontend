import { PasswordForm } from "@/components/account/password-form";

export default function PasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Change password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password you don&apos;t use elsewhere.
        </p>
      </div>
      <div className="max-w-lg rounded-lg border border-border bg-card p-6">
        <PasswordForm />
      </div>
    </div>
  );
}
