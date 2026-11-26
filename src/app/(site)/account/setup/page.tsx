import type { Metadata } from "next";
import { AuthShell } from "@ui/auth-shell";
import { ProfileForm } from "@ui/account-forms";
import { requireUser } from "@lib/user-session";

export const metadata: Metadata = { title: "Set up your profile", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = await requireUser({ allowIncomplete: true });
  return (
    <AuthShell title={`Nice to meet you, ${user.name.split(" ")[0]}`} intro="Two quick details so we can confirm your bookings and seat you where you like.">
      <div className="mb-6 flex items-center gap-3 text-xs text-muted" aria-label="Step 2 of 2">
        <span className="h-1.5 flex-1 rounded-full bg-ink" /><span className="h-1.5 flex-1 rounded-full bg-ink" />
        <span>Step 2 of 2</span>
      </div>
      <ProfileForm from="setup" profile={user} />
    </AuthShell>
  );
}
