"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@lib/types";
import { formatPrice } from "@lib/format";
import { Star } from "./icons";
import { DishDialog } from "./dish-dialog";

/** One line on the "contents page": name ······ price, description underneath. Click opens dish details. */
export function MenuEntry({ item, note, orderUrl }: { item: MenuItem; note?: string; orderUrl?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
        className="group -mx-3 flex cursor-pointer gap-4 rounded-2xl px-3 py-4 transition-colors duration-200 hover:bg-mist/50 sm:gap-5 sm:px-4"
      >
        {item.imageUrl && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mist sm:h-24 sm:w-24">
            <Image src={item.imageUrl} alt="" quality={90} fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="font-serif text-[1.35rem] leading-tight">
              {item.name}
              {item.featured && !note && (
                <span className="ml-2 inline-flex -translate-y-0.5 items-center gap-1 rounded-full bg-glow px-2 py-0.5 align-middle font-sans text-[11px] font-semibold text-ember">
                  <Star className="h-3 w-3 fill-current" /> Favourite
                </span>
              )}
            </h3>
            <span className="leader" aria-hidden />
            {item.price == null ? (
              <span className="shrink-0 rounded-full border border-dashed border-line px-3 py-1 text-xs font-medium text-muted">Ask staff</span>
            ) : (
              <p className="shrink-0 rounded-full bg-ink px-3.5 py-1 font-semibold tabular-nums text-mist">{formatPrice(item.price)}</p>
            )}
          </div>
          {(item.description || note) && (
            <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-muted">
              {note && <span className="font-medium text-ember">{note}. </span>}
              {item.description}
            </p>
          )}
        </div>
      </article>
      {open && <DishDialog item={item} note={note} orderUrl={orderUrl} onClose={() => setOpen(false)} />}
    </>
  );
}
