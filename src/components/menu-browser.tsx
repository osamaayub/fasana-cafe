"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, MenuItem } from "@lib/types";
import { MenuCard } from "./menu-card";
import { DishDialog } from "./dish-dialog";
import { Search, X } from "./icons";

type Cat = Category & { items: MenuItem[] };

export function MenuBrowser({ categories, orderUrl }: { categories: Cat[]; orderUrl?: string }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(categories[0]?.slug);
  const [dish, setDish] = useState<{ item: MenuItem; note?: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map((c) => ({ ...c, items: c.items.filter((i) => `${i.name} ${i.description}`.toLowerCase().includes(term)) }))
      .filter((c) => c.items.length > 0);
  }, [categories, q]);

  const featured = useMemo(
    () => (q ? [] : categories.flatMap((c) => c.items.filter((i) => i.featured).map((i) => ({ ...i, cat: c.name }))).slice(0, 8)),
    [categories, q]
  );

  // "/" jumps to search, like most menu sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // highlight the chip for the section in view
  useEffect(() => {
    const els = filtered.map((c) => document.getElementById(c.slug)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-160px 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const count = filtered.reduce((n, c) => n + c.items.length, 0);
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  const jump = (slug?: string) => {
    if (!slug) return;
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(slug);
  };

  return (
    <div>
      {/* Sticky toolbar: search + category chips */}
      <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <label className="relative block lg:w-72 lg:shrink-0">
            <span className="sr-only">Search the menu</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes"
              className="input rounded-full pl-11 pr-12"
              type="search"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-sheet px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block">/</span>
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink sm:right-9">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <nav aria-label="Menu sections" className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] lg:flex-1">
            {filtered.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => jump(c.slug)}
                aria-current={active === c.slug ? "true" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all ${
                  active === c.slug ? "bg-ink font-semibold text-mist shadow-md" : "bg-sheet text-ink ring-1 ring-line hover:ring-ink/30"
                }`}
              >
                {c.name}
                <span className={`text-xs tabular-nums ${active === c.slug ? "text-mist/60" : "text-muted"}`}>{c.items.length}</span>
              </button>
            ))}
          </nav>
        </div>
        {!q && (
          <p className="mt-2 hidden text-xs text-muted lg:block">
            {total} dishes across {categories.length} sections · press <kbd className="rounded border border-line bg-sheet px-1 font-sans text-[10px]">/</kbd> to search
          </p>
        )}
      </div>

      <div aria-live="polite" className="pt-8">
        {q && (
          <p className="mb-6 flex items-center justify-between text-sm text-muted">
            <span>{count} {count === 1 ? "dish matches" : "dishes match"} “{q}”</span>
            <button type="button" onClick={() => setQ("")} className="text-xs font-semibold text-ember hover:underline">Clear</button>
          </p>
        )}

        {/* Favourites spotlight */}
        {!q && featured.length > 0 && (
          <section aria-labelledby="favourites" className="mb-14">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Most loved</p>
                <h2 id="favourites" className="mt-1 text-3xl sm:text-4xl">Favourites</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item) => <MenuCard key={item.id} item={item} note={item.cat} onSelect={() => setDish({ item, note: item.cat })} />)}
            </div>
          </section>
        )}

        {filtered.length === 0 ? (
          <div className="card py-20 text-center">
            <p className="font-serif text-3xl">Nothing by that name</p>
            <p className="mx-auto mt-2 max-w-xs text-muted">Try another word, or ask us. The kitchen often has specials.</p>
            <button type="button" onClick={() => setQ("")} className="btn-ghost mt-6">Show the full menu</button>
          </div>
        ) : (
          filtered.map((c) => (
            <section key={c.id} id={c.slug} className="mb-14 scroll-mt-36 last:mb-0" aria-labelledby={`h-${c.slug}`}>
              <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <h2 id={`h-${c.slug}`} className="text-4xl">{c.name}</h2>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold tabular-nums text-muted">{c.items.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {c.items.map((item) => <MenuCard key={item.id} item={item} onSelect={() => setDish({ item, note: c.name })} />)}
              </div>
            </section>
          ))
        )}
      </div>

      <DishDialog item={dish?.item ?? null} note={dish?.note} orderUrl={orderUrl} onClose={() => setDish(null)} />
    </div>
  );
}
