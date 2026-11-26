export function StatusPill({ status }: { status: string }) {
  const c = status === "confirmed" ? "bg-success/15 text-success" : status === "cancelled" ? "bg-mist text-muted" : "bg-lamp/25 text-ember";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${c}`}>{status}</span>;
}
