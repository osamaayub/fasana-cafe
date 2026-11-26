import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@ui/auth-shell";
import { SignInForm } from "@ui/auth-forms";
import { getCurrentUser, safeNext } from "@lib/user-session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const notices: Record<string, string> = {
  "signed-out-everywhere": "You've been signed out on every device.",
  "signed-out": "You've been signed out. See you soon!",
  "account-created": "Account created! Sign in to book your table.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const { next, notice } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return (
    <AuthShell
      title="Welcome back"
      intro="Sign in to book faster and see your reservations."
      footer={
        <>
          New here? <Link href="/signup" className="font-semibold text-ember hover:underline">Create an account</Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/reserve" className="font-semibold text-ember hover:underline">Book without an account</Link>
        </>
      }
    >
      <SignInForm next={next} notice={notice ? notices[notice] : undefined} />
    </AuthShell>
  );
}
