import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@ui/auth-shell";
import { SignInForm } from "@ui/auth-forms";
import { SocialButtons } from "@ui/social-buttons";
import { Arrow } from "@ui/icons";
import { getCurrentUser, safeNext } from "@lib/user-session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const notices: Record<string, string> = {
  "signed-out-everywhere": "You've been signed out on every device.",
  "signed-out": "You've been signed out. See you soon!",
  "account-created": "Account created! Sign in to book your table.",
};

// Messages for problems coming back from Google or Facebook.
const errors: Record<string, string> = {
  cancelled: "Sign-in was cancelled. Try again, or use your email below.",
  expired: "That sign-in took too long. Please try again.",
  "no-email": "We couldn't get an email address from that account. Allow email access when asked, or use your email below.",
  unverified: "That account's email isn't verified yet. Verify it first, or use your email below.",
  "provider-off": "That sign-in option isn't available right now. Please use your email.",
  "too-many": "Too many attempts. Wait a few minutes and try again.",
  failed: "Something went wrong while signing you in. Please try again.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string; error?: string }> }) {
  const { next, notice, error } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return (
    <AuthShell
      title="Welcome back"
      intro="Sign in to book faster and see your reservations."
      footer={
        <>
          <p>
            New here?{" "}
            <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-ember underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            <Link href="/reserve" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink/70 transition-colors hover:text-ink">
              Book a table without an account <Arrow className="h-3.5 w-3.5" />
            </Link>
          </p>
        </>
      }
    >
      <SocialButtons next={next} mode="signin" />
      <SignInForm next={next} notice={notice ? notices[notice] : undefined} error={error ? errors[error] ?? errors.failed : undefined} />
    </AuthShell>
  );
}
