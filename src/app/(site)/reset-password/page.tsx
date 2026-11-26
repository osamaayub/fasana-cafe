import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@ui/auth-shell";
import { ResetForm } from "@ui/auth-forms";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Set a new password" intro="You'll be signed out on all other devices." footer={<Link href="/forgot-password" className="font-semibold text-ember hover:underline">Need a new link?</Link>}>
      {token ? <ResetForm token={token} /> : <p className="text-center">This link is missing its code. <Link href="/forgot-password" className="text-ember underline">Ask for a new one</Link>.</p>}
    </AuthShell>
  );
}
