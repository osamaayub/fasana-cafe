import Link from "next/link";
import { prisma } from "@lib/prisma";
import { requireAdmin } from "@lib/auth";
import { logout } from "@actions/admin";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [pending, unread] = await Promise.all([
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.message.count({ where: { read: false } }),
  ]);
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/reservations", label: "Reservations", badge: pending },
    { href: "/admin/messages", label: "Messages", badge: unread },
    { href: "/admin/menu", label: "Menu" },
    { href: "/admin/settings", label: "Settings" },
  ];
  return (
    <div className="md:flex">
      <aside className="border-b border-line bg-ink text-mist md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href="/admin" className="font-serif text-xl">Fasana Admin</Link>
          <Link href="/" target="_blank" className="text-xs text-mist/70 underline md:mt-1 md:block">View site ↗</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-mist/85 hover:bg-sheet/10 hover:text-mist">
              {n.label}
              {!!n.badge && <span className="rounded-full bg-lamp px-2 text-xs font-semibold text-night">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <form action={logout} className="hidden px-5 py-4 md:absolute md:bottom-0 md:block">
          <p className="mb-2 truncate text-xs text-mist/60">{session.email}</p>
          <button className="text-sm text-mist/85 underline">Sign out</button>
        </form>
      </aside>
      <div className="flex-1 p-5 md:p-10">{children}</div>
    </div>
  );
}
