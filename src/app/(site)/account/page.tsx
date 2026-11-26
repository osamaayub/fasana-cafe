import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@lib/prisma";
import { requireUser } from "@lib/user-session";
import { getSettings } from "@lib/data";
import { StatusPill } from "@ui/status-pill";
import { ChangePasswordForm, DeleteAccountForm, ProfileForm } from "@ui/account-forms";
import { AddToCalendar } from "@ui/calendar-button";
import { Calendar, Chat, Shield, User } from "@ui/icons";
import { cancelMyReservation, revokeSession, signOut, signOutEverywhere } from "@actions/account";

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
const dayMonth = (d: string) => {
  const date = new Date(`${d}T12:00:00`);
  return { day: date.getDate(), mon: date.toLocaleDateString("en-GB", { month: "short" }) };
};

function device(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Unknown device";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${br} on ${os}`;
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await requireUser({ allowIncomplete: true });
  const { notice } = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const [bookings, sessions, s] = await Promise.all([
    prisma.reservation.findMany({ where: { userId: user.id }, orderBy: [{ date: "desc" }, { time: "desc" }], take: 50 }),
    prisma.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" } }),
    getSettings(),
  ]);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled").reverse();
  const [next, ...later] = upcoming;
  const past = bookings.filter((b) => b.date < today || b.status === "cancelled");
  const first = user.name.split(" ")[0] || "there";
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
  const memberSince = user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const nav = [["bookings", "Bookings"], ["profile", "Profile"], ["security", "Security"]];

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-lamp/15 blur-3xl" />
        <div className="container-x relative py-12 md:py-16">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-3xl text-lamp ring-4 ring-lamp/20" aria-hidden>{initials}</span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Your account</p>
              <h1 className="mt-2 text-5xl sm:text-6xl">Hi, {first}</h1>
              <p className="mt-1.5 truncate text-muted">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 font-medium text-ink"><Calendar className="h-3.5 w-3.5" />{upcoming.length} upcoming {upcoming.length === 1 ? "booking" : "bookings"}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 font-medium text-ink"><User className="h-3.5 w-3.5" />Member since {memberSince}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/reserve" className="btn-primary px-6 py-3">Book a table</Link>
              <form action={signOut}><button className="btn-ghost px-6 py-3">Sign out</button></form>
            </div>
          </div>
        </div>
        <nav aria-label="Account sections" className="container-x sticky top-16 z-30 -mb-px flex gap-6 overflow-x-auto border-t border-line/60 bg-paper/95 py-3 text-sm backdrop-blur">
          {nav.map(([id, l]) => <a key={id} href={`#${id}`} className="whitespace-nowrap border-b-2 border-transparent pb-1 text-muted transition-colors hover:border-lamp hover:text-ink">{l}</a>)}
        </nav>
      </header>

      <div className="container-x max-w-4xl space-y-16 py-14">
        {!user.profileComplete && (
          <Link href="/account/setup" className="card flex items-center justify-between gap-4 border-lamp/50 bg-glow/50 p-5 transition-shadow hover:shadow-[0_16px_30px_-20px_rgba(22,33,59,.4)]">
            <div>
              <p className="font-semibold">Finish setting up your profile</p>
              <p className="mt-0.5 text-sm text-muted">Add your phone and seating preference so booking takes seconds.</p>
            </div>
            <span className="btn-dark shrink-0 px-5 py-2.5 text-sm">Complete profile</span>
          </Link>
        )}
        {notice && notices[notice] && (
          <p role="status" className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5 9-10" /></svg>
            {notices[notice]}
          </p>
        )}

        <section id="bookings" className="scroll-mt-32" aria-labelledby="bk">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-glow text-ember"><Calendar className="h-5 w-5" /></span>
            <div>
              <h2 id="bk" className="text-4xl">Your bookings</h2>
              <p className="text-sm text-muted">{upcoming.length} upcoming · {past.length} past or cancelled</p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <div className="card mt-8 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-glow text-ember"><Calendar className="h-6 w-6" /></span>
              <p className="mt-5 font-serif text-2xl">No upcoming tables</p>
              <p className="mt-1 text-muted">Your details are saved, so booking takes a few seconds.</p>
              <Link href="/reserve" className="btn-dark mt-6">Book a table</Link>
            </div>
          ) : (
            <>
              {next && (
                <div className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-ink p-6 text-mist sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lamp/15 blur-3xl" />
              <div className="relative flex flex-wrap items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-mist/10 ring-1 ring-mist/15">
                  <span className="font-serif text-3xl leading-none text-lamp">{dayMonth(next.date).day}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-mist/60">{dayMonth(next.date).mon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lamp">Next visit</p>
                  <p className="mt-1 font-serif text-3xl leading-tight">{niceDate(next.date)}</p>
                  <p className="mt-1 text-sm text-mist/70">{label12(next.time)} · {next.guests} {next.guests === 1 ? "guest" : "guests"} · {next.seating === "any" ? "any table" : next.seating === "outdoor" ? "terrace" : "indoors"} · Ref #{next.id}</p>
                  {next.notes && <p className="mt-1.5 truncate text-xs text-mist/50">“{next.notes}”</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusPill status={next.status} />
                  <AddToCalendar name={user.name} date={next.date} time={next.time} guests={next.guests} seating={next.seating} />
                  <form action={cancelMyReservation}><input type="hidden" name="id" value={next.id} /><button className="btn border border-mist/25 px-4 py-2 text-xs text-mist hover:border-mist/60">Cancel</button></form>
                </div>
              </div>
            </div>
              )}
              {later.length > 0 && (
                <ul className="mt-4 space-y-4">
                  {later.map((b) => {
                    const { day, mon } = dayMonth(b.date);
                    return (
                      <li key={b.id} className="card flex flex-wrap items-center gap-5 p-5 transition-shadow hover:shadow-[0_16px_36px_-24px_rgba(22,33,59,.45)] sm:p-6">
                        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-mist">
                          <span className="font-serif text-2xl leading-none">{day}</span>
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-lamp">{mon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-2xl leading-tight">{niceDate(b.date)}</p>
                          <p className="mt-1 text-sm text-muted">{label12(b.time)} · {b.guests} {b.guests === 1 ? "guest" : "guests"} · {b.seating === "any" ? "any table" : b.seating === "outdoor" ? "terrace" : "indoors"} · Ref #{b.id}</p>
                          {b.notes && <p className="mt-1 truncate text-xs text-muted">“{b.notes}”</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <StatusPill status={b.status} />
                          <AddToCalendar name={user.name} date={b.date} time={b.time} guests={b.guests} seating={b.seating} />
                          <form action={cancelMyReservation}><input type="hidden" name="id" value={b.id} /><button className="btn-ghost px-4 py-2 text-xs">Cancel</button></form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
                Running late or plans changed?
                <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi Fasana, I have a booking and need to change something.")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-ember hover:underline">
                  <Chat className="h-4 w-4" />Message us on WhatsApp
                </a>
              </p>
            </>
          )}
          {past.length > 0 && (
            <details className="card mt-4 px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">Past and cancelled ({past.length})</summary>
              <ul className="mt-3 divide-y divide-line text-sm">
                {past.map((b) => (
                  <li key={b.id} className="flex justify-between gap-4 py-3 text-muted">
                    <span>{niceDate(b.date)}, {label12(b.time)}, {b.guests} guests</span><StatusPill status={b.status} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section id="profile" className="scroll-mt-32" aria-labelledby="pf">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-glow text-ember"><User className="h-5 w-5" /></span>
            <div>
              <h2 id="pf" className="text-4xl">Profile</h2>
              <p className="text-sm text-muted">Your details, used to book faster</p>
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <ProfileForm from="account" profile={user} />
          </div>
        </section>

        <section id="security" className="scroll-mt-32 space-y-8" aria-labelledby="sc">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-glow text-ember"><Shield className="h-5 w-5" /></span>
            <div>
              <h2 id="sc" className="text-4xl">Security</h2>
              <p className="text-sm text-muted">Password and signed-in devices</p>
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <h3 className="mb-5 font-sans text-lg font-semibold">Change password</h3>
            <ChangePasswordForm />
          </div>
          <div className="card p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-sans text-lg font-semibold">Where you&apos;re signed in</h3>
              <form action={signOutEverywhere}><button className="btn-ghost px-4 py-2 text-xs">Sign out on all devices</button></form>
            </div>
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-medium">{device(s.userAgent)}</span>
                    <span className="text-muted">, last active {s.lastSeenAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    {s.id === user.sessionId && <span className="ml-2 rounded-full bg-lamp px-2 py-0.5 text-xs font-semibold text-night">This device</span>}
                  </span>
                  {s.id !== user.sessionId && (
                    <form action={revokeSession}><input type="hidden" name="id" value={s.id} /><button className="btn-ghost px-4 py-1.5 text-xs">Sign out</button></form>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <details className="card border-danger/30 p-6 sm:p-8">
            <summary className="cursor-pointer font-semibold text-danger">Delete account</summary>
            <div className="mt-5"><DeleteAccountForm email={user.email} /></div>
          </details>
        </section>
      </div>
    </>
  );
}
