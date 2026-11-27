"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, MenuItem } from "@lib/types";
import { MenuCard } from "./menu-card";
import { DishDialog } from "./dish-dialog";
import { Search, X } from "./icons";

type Cat = Category & { items: MenuItem[] };

/** Lower-case and strip accents, so "cafe" finds "Café". */
const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function MenuBrowser({ categories, orderUrl }: { categories: Cat[]; orderUrl?: string }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(categories[0]?.slug);
  const [dish, setDish] = useState<{ item: MenuItem; note?: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const terms = useMemo(() => norm(q).split(/\s+/).filter(Boolean), [q]);
  const filtered = useMemo(() => {
    if (!terms.length) return categories;
    return categories
      .map((c) => {
        // a section name match ("pasta") shows the whole section
        if (terms.every((t) => norm(c.name).includes(t))) return c;
        return { ...c, items: c.items.filter((i) => { const hay = norm(`${i.name} ${i.description ?? ""} ${c.name}`); return terms.every((t) => hay.includes(t)); }) };
      })
      .filter((c) => c.items.length > 0);
  }, [categories, terms]);

  const featured = useMemo(
    () => (terms.length ? [] : categories.flatMap((c) => c.items.filter((i) => i.featured).map((i) => ({ ...i, cat: c.name }))).slice(0, 6)),
    [categories, terms]
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

  // keep the active chip visible inside the chip row (without scrolling the page)
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (!nav || !chip) return;
    const left = chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const suggestions = useMemo(() => categories.slice(0, 5).map((c) => c.name), [categories]);

  const jump = (slug?: string) => {
    if (!slug) return;
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(slug);
  };

  return (
    <div>
      {/* Sticky toolbar: search + category chips */}
      <div className="sticky top-[4.75rem] z-30 -mx-5 border-b border-line bg-paper px-5 py-3 shadow-[0_12px_24px_-22px_rgba(22,33,59,.45)] sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <label className="relative block lg:w-72 lg:shrink-0">
            <span className="sr-only">Search the menu</span>
            <Search className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${q ? "text-ink" : "text-muted"}`} />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); e.currentTarget.blur(); } }}
              placeholder="Search dishes"
              className="input h-12 rounded-full bg-sheet pl-11 pr-28 shadow-[0_6px_18px_-14px_rgba(22,33,59,.5)] [&::-webkit-search-cancel-button]:appearance-none"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              aria-describedby="menu-search-count"
            />
            <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {q ? (
                <>
                  <span id="menu-search-count" className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${count ? "bg-mist text-ink" : "bg-danger/10 text-danger"}`}>{count} found</span>
                  <button type="button" onClick={() => { setQ(""); searchRef.current?.focus(); }} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <kbd id="menu-search-count" className="mr-2 hidden rounded-md border border-line bg-paper px-1.5 py-0.5 font-sans text-[11px] font-semibold text-muted lg:block" aria-label="Press slash to search">/</kbd>
              )}
            </span>
          </label>
          <nav ref={navRef} aria-label="Menu sections" className="relative flex gap-2 overflow-x-auto scroll-smooth pb-0.5 [mask-image:linear-gradient(90deg,#000,#000_calc(100%-40px),transparent)] [scrollbar-width:none] pr-8 lg:flex-1">
            {filtered.map((c) => (
              <button
                key={c.slug}
                data-slug={c.slug}
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
        {q && count > 0 && (
          <p className="mb-6 flex items-center justify-between gap-4 text-sm text-muted">
            <span>Showing {count} {count === 1 ? "dish" : "dishes"} for <span className="font-semibold text-ink">“{q.trim()}”</span></span>
            <button type="button" onClick={() => setQ("")} className="shrink-0 text-xs font-semibold text-ember hover:underline">Clear search</button>
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
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {featured.map((item) => <MenuCard key={item.id} item={item} onSelect={() => setDish({ item, note: item.cat })} />)}
            </div>
          </section>
        )}

        {filtered.length === 0 ? (
          <div className="card py-20 text-center">
            <p className="font-serif text-3xl">Nothing by that name</p>
            <p className="mx-auto mt-2 max-w-xs text-muted">Check the spelling or try a section. The kitchen often has specials too, so just ask.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((sname) => (
                <button key={sname} type="button" onClick={() => setQ(sname)} className="rounded-full bg-sheet px-4 py-2 text-sm ring-1 ring-line transition-all hover:-translate-y-0.5 hover:ring-ink/40">{sname}</button>
              ))}
            </div>
            <button type="button" onClick={() => setQ("")} className="btn-ghost mt-6">Show the full menu</button>
          </div>
        ) : (
          filtered.map((c) => (
            <section key={c.id} id={c.slug} className="mb-14 scroll-mt-52 lg:scroll-mt-40 last:mb-0" aria-labelledby={`h-${c.slug}`}>
              <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <h2 id={`h-${c.slug}`} className="text-3xl sm:text-4xl">{c.name}</h2>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold tabular-nums text-muted">{c.items.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {c.items.map((item) => <MenuCard key={item.id} item={item} highlight={terms} onSelect={() => setDish({ item, note: c.name })} />)}
              </div>
            </section>
          ))
        )}
      </div>

      <DishDialog item={dish?.item ?? null} note={dish?.note} orderUrl={orderUrl} onClose={() => setDish(null)} />
    </div>
  );
}
