import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@ui/auth-shell";
import { ForgotForm } from "@ui/auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Forgot your password?" intro="Enter your email and we'll send you a link to set a new one." footer={<Link href="/signin" className="font-semibold text-ember hover:underline">Back to sign in</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
