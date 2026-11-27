"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@lib/prisma";
import { checkCredentials, requireAdmin } from "@lib/auth";
import { SESSION_COOKIE, cookieOptions, createToken } from "@lib/session";
import { rateLimit } from "@lib/rate-limit";
import { slugify } from "@lib/format";

const refreshSite = () => revalidatePath("/", "layout");
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ---------- auth ---------- */
export async function login(_: { error?: string; email?: string }, fd: FormData): Promise<{ error?: string; email?: string }> {
  if (!(await rateLimit("login", 8, 15 * 60 * 1000))) return { error: "Too many attempts. Try again in 15 minutes.", email: str(fd, "email") };
  if (!checkCredentials(str(fd, "email"), String(fd.get("password") ?? ""))) return { error: "Wrong email or password.", email: str(fd, "email") };
  const store = await cookies();
  store.set(SESSION_COOKIE, await createToken(str(fd, "email")), cookieOptions);
  const next = str(fd, "next");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- menu ---------- */
const itemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  price: z.union([z.literal("").transform(() => null), z.coerce.number().int().min(0).max(1_000_000)]),
  imageUrl: z.union([z.literal(""), z.string().url()]),
  options: z.string().max(300).default(""),
  categoryId: z.coerce.number().int().positive(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveItem(_: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = itemSchema.safeParse({
    name: str(fd, "name"), description: str(fd, "description"), price: str(fd, "price"),
    imageUrl: str(fd, "imageUrl"), options: str(fd, "options"), categoryId: str(fd, "categoryId"), sortOrder: str(fd, "sortOrder") || "0",
  });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(", ") };
  const data = { ...parsed.data, featured: fd.get("featured") === "on", available: fd.get("available") === "on" };
  const id = Number(fd.get("id") || 0);
  if (id) await prisma.menuItem.update({ where: { id }, data });
  else await prisma.menuItem.create({ data });
  refreshSite();
  redirect("/admin/menu?saved=1");
}

export async function deleteItem(fd: FormData) {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id: Number(fd.get("id")) } }).catch(() => null);
  refreshSite();
  redirect("/admin/menu");
}

export async function toggleItem(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const field = fd.get("field") === "featured" ? "featured" : "available";
  const row = await prisma.menuItem.findUnique({ where: { id } });
  if (row) await prisma.menuItem.update({ where: { id }, data: { [field]: !row[field] } });
  refreshSite();
  revalidatePath("/admin/menu");
}

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return;
  const id = Number(fd.get("id") || 0);
  const sortOrder = Number(fd.get("sortOrder") || 0);
  if (id) await prisma.category.update({ where: { id }, data: { name, sortOrder } });
  else {
    let slug = slugify(name) || "category";
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.category.create({ data: { name, slug, sortOrder } });
  }
  refreshSite();
  revalidatePath("/admin/menu");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: Number(fd.get("id")) } }).catch(() => null);
  refreshSite();
  revalidatePath("/admin/menu");
}

/* ---------- reservations & messages ---------- */
export async function setReservationStatus(fd: FormData) {
  await requireAdmin();
  const status = z.enum(["pending", "confirmed", "cancelled"]).parse(fd.get("status"));
  await prisma.reservation.update({ where: { id: Number(fd.get("id")) }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteReservation(fd: FormData) {
  await requireAdmin();
  await prisma.reservation.delete({ where: { id: Number(fd.get("id")) } }).catch(() => null);
  revalidatePath("/admin", "layout");
}

export async function toggleMessageRead(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  await prisma.message.update({ where: { id }, data: { read: fd.get("read") === "1" } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  await prisma.message.delete({ where: { id: Number(fd.get("id")) } }).catch(() => null);
  revalidatePath("/admin", "layout");
}

/* ---------- settings ---------- */
const settingsSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().max(160),
  heroTitle: z.string().min(1).max(160),
  heroSubtitle: z.string().max(400),
  about: z.string().max(5000),
  address: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  whatsapp: z.string().regex(/^\d{8,15}$/, "digits only, with country code, e.g. 923001234567"),
  email: z.union([z.literal(""), z.string().email()]),
  instagram: z.union([z.literal(""), z.string().url()]),
  facebook: z.union([z.literal(""), z.string().url()]),
  foodpandaUrl: z.union([z.literal(""), z.string().url()]),
  mapsUrl: z.union([z.literal(""), z.string().url()]),
  mapEmbedQuery: z.string().max(200),
  heroImage: z.union([z.literal(""), z.string().url()]),
  storyImage: z.union([z.literal(""), z.string().url()]),
  reserveImage: z.union([z.literal(""), z.string().url()]),
  galleryImages: z
    .string()
    .max(4000)
    .transform((v) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join("\n"))
    .refine((v) => !v || v.split("\n").every((l) => /^https:\/\/\S+$/.test(l)), "each line must be an https:// image link"),
  googleRating: z.coerce.number().min(0).max(5),
  googleReviews: z.coerce.number().int().min(0),
});

export async function saveSettings(_: { error?: string; ok?: boolean }, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const raw = Object.fromEntries(Object.keys(settingsSchema.shape).map((k) => [k, str(fd, k)]));
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
  await prisma.settings.update({ where: { id: 1 }, data: parsed.data });

  for (let d = 0; d < 7; d++) {
    const opensAt = str(fd, `open_${d}`) || "10:00";
    const closesAt = str(fd, `close_${d}`) || "00:00";
    const closed = fd.get(`closed_${d}`) === "on";
    await prisma.openingHour.upsert({ where: { dayOfWeek: d }, update: { opensAt, closesAt, closed }, create: { dayOfWeek: d, opensAt, closesAt, closed } });
  }
  refreshSite();
  return { ok: true };
}
