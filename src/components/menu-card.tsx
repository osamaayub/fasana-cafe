import Image from "next/image";
import type { MenuItem } from "@lib/types";
import { formatPrice } from "@lib/format";
import { Coffee, Star } from "./icons";

/** Modern menu card: photo (or a branded placeholder band), name, price, description. Click opens dish details. */
export function MenuCard({ item, note, onSelect }: { item: MenuItem; note?: string; onSelect?: () => void }) {
  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } } : undefined}
      className={`card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(22,33,59,.4)] ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} quality={90} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_20%_0%,#2a3a5f_0%,#16213b_55%,#0e1628_100%)]">
            <Coffee className="h-10 w-10 text-lamp/30 transition-transform duration-500 group-hover:scale-110 group-hover:text-lamp/50" />
          </div>
        )}
        {item.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-sheet/95 px-2.5 py-1 text-[11px] font-semibold text-ember shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-current" /> Favourite
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[1.3rem] leading-snug">{item.name}</h3>
          {item.price == null ? (
            <span className="mt-1 shrink-0 rounded-full border border-dashed border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">Ask staff</span>
          ) : (
            <span className="mt-1 shrink-0 rounded-full bg-lamp px-3 py-1 font-semibold tabular-nums text-night">{formatPrice(item.price)}</span>
          )}
        </div>
        {item.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.description}</p>}
        {note && <p className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wider text-ember">{note}</p>}
      </div>
    </article>
  );
}
