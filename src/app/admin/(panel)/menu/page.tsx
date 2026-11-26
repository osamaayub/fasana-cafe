import Link from "next/link";
import { prisma } from "@lib/prisma";
import { formatPrice } from "@lib/format";
import { deleteCategory, saveCategory, toggleItem } from "@actions/admin";

export default async function AdminMenu({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl text-ink">Menu</h1>
        <Link href="/admin/menu/new" className="btn-primary">+ Add item</Link>
      </div>
      {saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Saved. The live site is updated.</p>}

      <form action={saveCategory} className="card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1"><label className="label" htmlFor="newcat">New category</label><input id="newcat" name="name" placeholder="e.g. Breakfast" className="input" required /></div>
        <div className="w-24"><label className="label" htmlFor="newsort">Order</label><input id="newsort" name="sortOrder" type="number" defaultValue={cats.length} className="input" /></div>
        <button className="btn-dark">Add category</button>
      </form>

      <div className="mt-6 space-y-6">
        {cats.map((c) => (
          <section key={c.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-mist/60 p-3">
              <form action={saveCategory} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" defaultValue={c.name} aria-label="Category name" className="input max-w-xs py-1.5 font-semibold" />
                <input name="sortOrder" type="number" defaultValue={c.sortOrder} aria-label="Order" className="input w-20 py-1.5" />
                <button className="btn-ghost py-1.5 text-xs">Rename</button>
              </form>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button className="btn py-1.5 text-xs text-red-700 hover:bg-red-50" title="Deletes the category and its items">Delete category</button>
              </form>
            </div>
            {c.items.length === 0 ? <p className="p-4 text-sm text-muted">No items yet.</p> : (
              <ul className="divide-y divide-line">
                {c.items.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center gap-3 p-3">
                    <Link href={`/admin/menu/${i.id}`} className="min-w-48 flex-1">
                      <p className={`font-medium ${i.available ? "" : "text-muted line-through"}`}>{i.name}</p>
                      <p className="text-xs text-muted">{formatPrice(i.price)}</p>
                    </Link>
                    <form action={toggleItem}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="field" value="featured" />
                      <button className={`rounded-full px-3 py-1 text-xs ${i.featured ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"}`}>{i.featured ? "★ Featured" : "☆ Feature"}</button>
                    </form>
                    <form action={toggleItem}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="field" value="available" />
                      <button className={`rounded-full px-3 py-1 text-xs ${i.available ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>{i.available ? "Available" : "Hidden"}</button>
                    </form>
                    <Link href={`/admin/menu/${i.id}`} className="btn-ghost py-1 text-xs">Edit</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
