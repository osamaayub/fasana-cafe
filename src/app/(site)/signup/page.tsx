import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@ui/auth-shell";
import { SignUpForm } from "@ui/auth-forms";
import { SocialButtons } from "@ui/social-buttons";
import { Arrow } from "@ui/icons";
import { getCurrentUser, safeNext } from "@lib/user-session";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return (
    <AuthShell
      title="Join Fasana"
      intro="Save your details once, then book a table in a few taps."
      footer={
        <>
          <p>
            Already have an account?{" "}
            <Link href={next ? `/signin?next=${encodeURIComponent(next)}` : "/signin"} className="font-semibold text-ember underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
          <p>
            <Link href="/reserve" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink/70 transition-colors hover:text-ink">
              Just booking once? Continue as a guest <Arrow className="h-3.5 w-3.5" />
            </Link>
          </p>
        </>
      }
    >
      <SocialButtons next={next} mode="signup" />
      <SignUpForm />
    </AuthShell>
  );
}
