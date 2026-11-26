"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "./icons";

const spans = ["aspect-[4/3]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/3]", "aspect-square", "aspect-[4/5]", "aspect-[3/2]"];

/** Masonry photo grid; clicking a photo opens a full-screen lightbox. */
export function PhotoGrid({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <figure key={src} className={`group relative overflow-hidden rounded-3xl bg-tint ${spans[i % spans.length]}`}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View photo ${i + 1} full screen`}
              className="absolute inset-0 cursor-zoom-in"
            >
              <Image
                src={src}
                alt={`Fasana Café — photo ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                quality={90}
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              />
            </button>
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-sheet/90 text-ink opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
            </span>
          </figure>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-night/90 p-4 backdrop-blur-sm sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${open + 1} of ${images.length}`}
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-sheet/10 text-frost backdrop-blur transition-colors hover:bg-sheet/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="anim-rise relative h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[open]}
              alt={`Fasana Café — photo ${open + 1}`}
              fill
              sizes="100vw"
              quality={95}
              className="object-contain"
              priority
            />
          </div>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-sheet/10 px-4 py-1.5 text-xs font-semibold text-frost backdrop-blur">
            {open + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
