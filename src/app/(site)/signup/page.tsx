import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/user-session";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <AuthShell title="Join Fasana" intro="Save your details once, then book a table in a few taps." footer={<>Already have an account? <Link href="/signin" className="font-semibold text-ember hover:underline">Sign in</Link></>}>
      <SignUpForm />
    </AuthShell>
  );
}
