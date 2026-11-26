"use client";

import { useActionState } from "react";
import type { Category, MenuItem } from "@lib/types";
import { saveItem } from "@actions/admin";
import { Submit } from "@ui/form-bits";

export function ItemForm({ item, categories }: { item?: MenuItem; categories: Category[] }) {
  const [state, action] = useActionState(saveItem, {});
  return (
    <form action={action} className="card grid max-w-2xl gap-5 p-6 sm:grid-cols-2">
      {item && <input type="hidden" name="id" value={item.id} />}
      {state.error && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <div className="sm:col-span-2"><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={item?.name} className="input" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={3} defaultValue={item?.description} className="input" /></div>
      <div><label className="label" htmlFor="price">Price (PKR)</label><input id="price" name="price" type="number" min={0} defaultValue={item?.price ?? ""} placeholder="Leave empty for “Ask staff”" className="input" /></div>
      <div><label className="label" htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" defaultValue={item?.categoryId ?? categories[0]?.id} className="input">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><label className="label" htmlFor="imageUrl">Image URL</label><input id="imageUrl" name="imageUrl" type="url" defaultValue={item?.imageUrl} placeholder="https://…" className="input" /><p className="mt-1 text-xs text-muted">Optional. Use the café&apos;s own photos.</p></div>
      <div><label className="label" htmlFor="sortOrder">Display order</label><input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className="input" /></div>
      <div className="flex items-end gap-5 pb-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={item?.featured} /> Featured on home</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="available" defaultChecked={item?.available ?? true} /> Available</label>
      </div>
      <div className="sm:col-span-2"><Submit pendingText="Saving…" className="btn-dark px-8 py-3">Save item</Submit></div>
    </form>
  );
}
