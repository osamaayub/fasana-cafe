import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@lib/prisma";
import { deleteItem } from "@actions/admin";
import { ItemForm } from "./item-form";

export default async function EditItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const item = id === "new" ? undefined : await prisma.menuItem.findUnique({ where: { id: Number(id) || -1 } });
  if (id !== "new" && !item) notFound();

  return (
    <div>
      <Link href="/admin/menu" className="text-sm text-muted underline">← Back to menu</Link>
      <h1 className="mb-6 mt-2 text-4xl text-ink">{item ? `Edit ${item.name}` : "New menu item"}</h1>
      {categories.length === 0 ? <p className="card p-5">Add a category first.</p> : <ItemForm item={item ?? undefined} categories={categories} />}
      {item && (
        <form action={deleteItem} className="mt-6">
          <input type="hidden" name="id" value={item.id} />
          <button className="btn text-red-700 hover:bg-red-50">Delete this item</button>
        </form>
      )}
    </div>
  );
}
