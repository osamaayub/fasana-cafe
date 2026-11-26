import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";

/** One line on the "contents page": name ······ price, description underneath. */
export function MenuEntry({ item, note }: { item: MenuItem; note?: string }) {
  return (
    <article className="group flex gap-4 py-4">
      {item.imageUrl && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-mist sm:h-20 sm:w-20">
          <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-[1.35rem] leading-tight">{item.name}</h3>
          <span className="leader" aria-hidden />
          <p className={`shrink-0 tabular-nums ${item.price == null ? "text-sm text-muted" : "font-semibold"}`}>{formatPrice(item.price)}</p>
        </div>
        {(item.description || note) && (
          <p className="mt-1 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            {note && <span className="text-ember">{note}. </span>}
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
