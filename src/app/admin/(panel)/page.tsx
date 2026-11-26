import Link from "next/link";
import { prisma } from "@lib/prisma";
import { StatusPill } from "@ui/status-pill";

export default async function Dashboard() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const [pending, upcoming, unread, items, recent] = await Promise.all([
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.reservation.count({ where: { status: "confirmed", date: { gte: today } } }),
    prisma.message.count({ where: { read: false } }),
    prisma.menuItem.count(),
    prisma.reservation.findMany({
      where: { date: { gte: today }, status: { not: "cancelled" } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
    }),
  ]);
  const stats = [
    { label: "Pending bookings", value: pending, href: "/admin/reservations?status=pending" },
    { label: "Upcoming confirmed", value: upcoming, href: "/admin/reservations?status=confirmed" },
    { label: "Unread messages", value: unread, href: "/admin/messages" },
    { label: "Menu items", value: items, href: "/admin/menu" },
  ];
  return (
    <div>
      <h1 className="text-4xl text-ink">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:border-ink/40">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-4xl text-ink">{s.value}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-semibold">Upcoming bookings</h2>
      <div className="card mt-3 overflow-x-auto">
        {recent.length === 0 ? <p className="p-5 text-sm text-muted">No upcoming bookings.</p> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3">Date</th><th className="p-3">Time</th><th className="p-3">Name</th><th className="p-3">Guests</th><th className="p-3">Status</th></tr></thead>
            <tbody>{recent.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0"><td className="p-3">{r.date}</td><td className="p-3">{r.time}</td><td className="p-3">{r.name}</td><td className="p-3">{r.guests}</td><td className="p-3"><StatusPill status={r.status} /></td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
