"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, MenuItem } from "@/lib/types";
import { MenuEntry } from "./menu-entry";
import { Search, X } from "./icons";

type Cat = Category & { items: MenuItem[] };

export function MenuBrowser({ categories }: { categories: Cat[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(categories[0]?.slug);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map((c) => ({ ...c, items: c.items.filter((i) => `${i.name} ${i.description}`.toLowerCase().includes(term)) }))
      .filter((c) => c.items.length > 0);
  }, [categories, q]);

  // highlight the section in view
  useEffect(() => {
    const els = filtered.map((c) => document.getElementById(c.slug)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const count = filtered.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
      {/* Contents */}
      <aside className="sticky top-16 z-20 -mx-5 bg-paper/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:py-0">
        <label className="relative block">
          <span className="sr-only">Search the menu</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="input rounded-full pl-11 pr-10" type="search" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <nav aria-label="Menu sections" className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:mt-8 lg:flex-col lg:gap-0 lg:overflow-visible">
          {filtered.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              aria-current={active === c.slug ? "true" : undefined}
              className={`flex shrink-0 items-baseline justify-between gap-3 rounded-full px-4 py-2 text-sm transition-colors lg:rounded-none lg:border-l-2 lg:px-4 lg:py-2.5 ${
                active === c.slug ? "bg-ink text-mist lg:border-ink lg:bg-transparent lg:font-semibold lg:text-ink" : "bg-sheet text-ink ring-1 ring-line lg:border-line lg:bg-transparent lg:text-muted lg:ring-0 hover:lg:text-ink"
              }`}
            >
              {c.name}
              <span className="hidden text-xs tabular-nums text-muted lg:inline">{c.items.length}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div aria-live="polite">
        {q && <p className="mb-2 mt-6 text-sm text-muted lg:mt-0">{count} {count === 1 ? "dish matches" : "dishes match"} “{q}”</p>}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-3xl">Nothing by that name</p>
            <p className="mt-2 text-muted">Try another word, or ask us. The kitchen often has specials.</p>
            <button type="button" onClick={() => setQ("")} className="btn-ghost mt-6">Show the full menu</button>
          </div>
        ) : (
          filtered.map((c) => (
            <section key={c.id} id={c.slug} className="scroll-mt-40 pt-10 first:pt-6 lg:scroll-mt-24 lg:first:pt-0" aria-labelledby={`h-${c.slug}`}>
              <h2 id={`h-${c.slug}`} className="border-b border-ink pb-3 text-4xl">{c.name}</h2>
              <div className="divide-y divide-line">
                {c.items.map((item) => <MenuEntry key={item.id} item={item} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
