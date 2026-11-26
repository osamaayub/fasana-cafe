export function StatusPill({ status }: { status: string }) {
  const c = status === "confirmed" ? "bg-emerald-100 text-emerald-800" : status === "cancelled" ? "bg-stone-200 text-stone-600" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${c}`}>{status}</span>;
}
