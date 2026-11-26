import Link from "next/link";
import { prisma } from "@lib/prisma";
import { StatusPill } from "@ui/status-pill";
import { deleteReservation, setReservationStatus } from "@actions/admin";

const tabs = ["all", "pending", "confirmed", "cancelled"] as const;

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const rows = await prisma.reservation.findMany({
    where: status !== "all" ? { status } : undefined,
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 200,
  });

  return (
    <div>
      <h1 className="text-4xl text-ink">Reservations</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t} href={t === "all" ? "/admin/reservations" : `/admin/reservations?status=${t}`} className={`rounded-full px-4 py-1.5 text-sm capitalize ${status === t ? "bg-ink text-mist" : "bg-sheet ring-1 ring-line"}`}>{t}</Link>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {rows.length === 0 && <p className="card p-5 text-sm text-muted">No reservations here yet.</p>}
        {rows.map((r) => {
          const wa = r.phone.replace(/[^\d]/g, "").replace(/^0/, "92");
          const msg = encodeURIComponent(`Hi ${r.name}, your table for ${r.guests} on ${r.date} at ${r.time} at Fasana Café is confirmed. See you soon!`);
          return (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.name} <span className="font-normal text-muted">· {r.guests} guests · {r.seating}</span></p>
                  <p className="text-sm text-muted">{r.date} at {r.time} · <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a>{r.email && <> · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a></>}</p>
                  {r.notes && <p className="mt-2 text-sm">“{r.notes}”</p>}
                </div>
                <StatusPill status={r.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "confirmed" && (
                  <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="confirmed" /><button className="btn-dark py-1.5 text-xs">Confirm</button></form>
                )}
                {r.status !== "cancelled" && (
                  <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="cancelled" /><button className="btn-ghost py-1.5 text-xs">Cancel</button></form>
                )}
                <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noopener" className="btn-ghost py-1.5 text-xs">WhatsApp confirmation</a>
                <form action={deleteReservation}><input type="hidden" name="id" value={r.id} /><button className="btn py-1.5 text-xs text-red-700 hover:bg-red-50">Delete</button></form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
