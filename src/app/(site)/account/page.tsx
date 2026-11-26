import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user-session";
import { StatusPill } from "@/components/status-pill";
import { ChangePasswordForm, DeleteAccountForm, ProfileForm } from "@/components/account-forms";
import { cancelMyReservation, revokeSession, signOut, signOutEverywhere } from "./actions";

export const metadata: Metadata = { title: "My account", robots: { index: false } };
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  welcome: "You're all set. Your details will be filled in next time you book.",
  "password-reset": "Your password has been changed and other devices were signed out.",
};

const label12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};
const niceDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function device(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Unknown device";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${br} on ${os}`;
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await requireUser();
  const { notice } = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const [bookings, sessions] = await Promise.all([
    prisma.reservation.findMany({ where: { userId: user.id }, orderBy: [{ date: "desc" }, { time: "desc" }], take: 50 }),
    prisma.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" } }),
  ]);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled").reverse();
  const past = bookings.filter((b) => b.date < today || b.status === "cancelled");

  const nav = [["bookings", "Bookings"], ["profile", "Profile"], ["security", "Security"]];

  return (
    <>
      <header className="border-b border-line">
        <div className="container-x flex flex-wrap items-end justify-between gap-6 py-12 md:py-16">
          <div>
            <h1 className="text-5xl sm:text-6xl">Hi, {user.name.split(" ")[0]}</h1>
            <p className="mt-2 text-muted">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/reserve" className="btn-primary px-6 py-3">Book a table</Link>
            <form action={signOut}><button className="btn-ghost px-6 py-3">Sign out</button></form>
          </div>
        </div>
        <nav aria-label="Account sections" className="container-x flex gap-6 overflow-x-auto text-sm">
          {nav.map(([id, l]) => <a key={id} href={`#${id}`} className="border-b-2 border-transparent pb-3 text-muted transition-colors hover:border-lamp hover:text-ink">{l}</a>)}
        </nav>
      </header>

      <div className="container-x max-w-4xl space-y-16 py-14">
        {notice && notices[notice] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notices[notice]}</p>}

        <section id="bookings" className="scroll-mt-24" aria-labelledby="bk">
          <h2 id="bk" className="border-b border-ink pb-3 text-4xl">Your bookings</h2>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif text-2xl">No upcoming tables</p>
              <p className="mt-1 text-muted">Your details are saved, so booking takes a few seconds.</p>
              <Link href="/reserve" className="btn-dark mt-5">Book a table</Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <p className="font-serif text-2xl">{niceDate(b.date)}, {label12(b.time)}</p>
                    <p className="text-sm text-muted">{b.guests} {b.guests === 1 ? "guest" : "guests"}, {b.seating === "any" ? "any table" : b.seating === "outdoor" ? "terrace" : "indoors"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={b.status} />
                    <form action={cancelMyReservation}><input type="hidden" name="id" value={b.id} /><button className="btn-ghost py-1.5 text-xs">Cancel booking</button></form>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {past.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">Past and cancelled ({past.length})</summary>
              <ul className="mt-2 divide-y divide-line text-sm">
                {past.map((b) => (
                  <li key={b.id} className="flex justify-between gap-4 py-3 text-muted">
                    <span>{niceDate(b.date)}, {label12(b.time)}, {b.guests} guests</span><StatusPill status={b.status} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section id="profile" className="scroll-mt-24" aria-labelledby="pf">
          <h2 id="pf" className="mb-6 border-b border-ink pb-3 text-4xl">Profile</h2>
          <ProfileForm from="account" profile={user} />
        </section>

        <section id="security" className="scroll-mt-24 space-y-12" aria-labelledby="sc">
          <h2 id="sc" className="border-b border-ink pb-3 text-4xl">Security</h2>
          <div>
            <h3 className="mb-4 font-sans text-lg font-semibold">Change password</h3>
            <ChangePasswordForm />
          </div>
          <div>
            <h3 className="mb-2 font-sans text-lg font-semibold">Where you&apos;re signed in</h3>
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-medium">{device(s.userAgent)}</span>
                    <span className="text-muted">, last active {s.lastSeenAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    {s.id === user.sessionId && <span className="ml-2 rounded-full bg-lamp px-2 py-0.5 text-xs font-semibold">This device</span>}
                  </span>
                  {s.id !== user.sessionId && (
                    <form action={revokeSession}><input type="hidden" name="id" value={s.id} /><button className="btn-ghost py-1 text-xs">Sign out</button></form>
                  )}
                </li>
              ))}
            </ul>
            <form action={signOutEverywhere} className="mt-4"><button className="btn-ghost">Sign out on all devices</button></form>
          </div>
          <details className="rounded-2xl border border-red-200 p-5">
            <summary className="cursor-pointer font-semibold text-red-800">Delete account</summary>
            <div className="mt-4"><DeleteAccountForm email={user.email} /></div>
          </details>
        </section>
      </div>
    </>
  );
}
