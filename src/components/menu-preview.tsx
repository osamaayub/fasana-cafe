"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, MenuItem } from "@lib/types";
import { MenuCard } from "./menu-card";
import { DishDialog } from "./dish-dialog";
import { Arrow } from "./icons";

type Cat = Category & { items: MenuItem[] };
type Dish = { item: MenuItem; note?: string };

const PAGE = 8;

/** Tabbed preview of the menu on the homepage — like a tasting flight. */
export function MenuPreview({ categories, orderUrl }: { categories: Cat[]; orderUrl?: string }) {
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [dish, setDish] = useState<Dish | null>(null);

  const tabs = useMemo(() => [{ slug: "all", name: "All", count: categories.reduce((n, c) => n + c.items.length, 0) }, ...categories.map((c) => ({ slug: c.slug, name: c.name, count: c.items.length }))], [categories]);

  const activeCount = tab === "all" ? tabs[0].count : tabs.find((t) => t.slug === tab)?.count ?? 0;

  const shown = useMemo<Dish[]>(() => {
    const cats = tab === "all" ? categories : categories.filter((c) => c.slug === tab);
    if (tab !== "all") return cats.flatMap((c) => c.items.map((item) => ({ item, note: c.name })));
    // "All": round-robin across categories so every section is represented
    const out: Dish[] = [];
    for (let d = 0; out.length < cats.reduce((n, c) => n + c.items.length, 0); d++) {
      let added = false;
      for (const c of cats) {
        const item = c.items[d];
        if (item) { out.push({ item, note: c.name }); added = true; }
      }
      if (!added) break;
    }
    return out;
  }, [categories, tab]);

  const visible = expanded ? shown : shown.slice(0, PAGE);

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => { setTab(t.slug); setExpanded(false); }}
            aria-pressed={tab === t.slug}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all ${
              tab === t.slug ? "bg-ink font-semibold text-mist shadow-md" : "bg-sheet text-ink ring-1 ring-line hover:ring-ink/30"
            }`}
          >
            {t.name}
            <span className={`text-xs tabular-nums ${tab === t.slug ? "text-mist/60" : "text-muted"}`}>{t.count}</span>
          </button>
        ))}
      </div>
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        Showing {visible.length} of {activeCount} {activeCount === 1 ? "dish" : "dishes"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map(({ item, note }) => (
          <MenuCard key={item.id} item={item} note={note} variant="feature" onSelect={() => setDish({ item, note })} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {shown.length > PAGE && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="btn-ghost px-6 py-3">
            {expanded ? "Show fewer" : `Show all ${activeCount} dishes`}
          </button>
        )}
        <Link href="/menu" className="btn-dark px-7 py-3.5 transition-transform hover:-translate-y-0.5">
          Open the full menu page <Arrow className="h-4 w-4" />
        </Link>
      </div>
      <DishDialog item={dish?.item ?? null} note={dish?.note} orderUrl={orderUrl} onClose={() => setDish(null)} />
    </div>
  );
}
