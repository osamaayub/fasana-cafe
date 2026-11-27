"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { MenuItem } from "@lib/types";
import { formatPrice } from "@lib/format";
import { Coffee, Star, X } from "./icons";

/** Modal with the full details of one dish. Rendered only while `item` is set. */
export function DishDialog({ item, note, orderUrl, onClose }: { item: MenuItem | null; note?: string; orderUrl?: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  // Portal to <body>: a card with a transform would otherwise trap this "fixed" overlay inside the card.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-night/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="anim-rise flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-sheet shadow-2xl sm:rounded-[2rem]">
        <div className="relative aspect-[16/9] max-h-[44svh] shrink-0 overflow-hidden bg-ink-2 sm:aspect-[2/1]">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} quality={90} fill sizes="(min-width: 640px) 640px, 100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_20%_0%,#2a3a5f_0%,#16213b_55%,#0e1628_100%)]">
              <Coffee className="h-14 w-14 text-lamp/30" />
            </div>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-night/50 text-frost backdrop-blur transition-colors hover:bg-night/80"
          >
            <X className="h-5 w-5" />
          </button>
          {item.featured && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-sheet/95 px-3 py-1.5 text-xs font-semibold text-ember shadow-sm">
              <Star className="h-3.5 w-3.5 fill-current" /> Favourite
            </span>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              {note && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{note}</p>}
              <h2 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">{item.name}</h2>
            </div>
            {item.price == null ? (
              <span className="rounded-full border border-dashed border-line px-4 py-1.5 text-sm font-medium text-muted">Ask staff</span>
            ) : (
              <span className="rounded-full bg-lamp px-5 py-2 font-semibold tabular-nums text-night">{formatPrice(item.price)}</span>
            )}
          </div>
          {item.description && <p className="mt-4 text-[15px] leading-relaxed text-muted">{item.description}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            {orderUrl && (
              <a href={orderUrl} target="_blank" rel="noopener" className="btn-primary">
                Order on Foodpanda
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>
            )}
            <a href="/reserve" className="btn-dark">Book a table</a>
            <button type="button" onClick={onClose} className="btn-ghost">Keep browsing</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
