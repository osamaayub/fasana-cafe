"use server";

import { prisma } from "@lib/prisma";
import { getCurrentUser } from "@lib/user-session";
import { notify } from "@lib/notify";
import { rateLimit } from "@lib/rate-limit";
import { fieldErrors, messageSchema, reservationSchema, type FormState } from "@lib/validation";

const toObj = (fd: FormData) => Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));

export async function submitReservation(_: FormState, fd: FormData): Promise<FormState> {
  const values = toObj(fd);
  if (values.company) return { ok: true, message: "Thanks!" }; // honeypot: silently drop bots

  const parsed = reservationSchema.safeParse(values);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };

  if (!(await rateLimit("reserve"))) return { ok: false, message: "Too many requests. Please call us instead.", values };
  const r = parsed.data;
  const user = await getCurrentUser();
  // signed-in guests: carry their saved dietary needs onto every booking for the kitchen
  const diet = user?.dietaryNotes?.trim();
  const notes = diet && !r.notes.toLowerCase().includes(diet.toLowerCase()) ? [r.notes, `Dietary: ${diet}`].filter(Boolean).join(" | ") : r.notes;
  await prisma.reservation.create({ data: { ...r, notes, userId: user?.id ?? null } });
  await notify(`New reservation: ${r.name}, ${r.guests} guests`, {
    Name: r.name, Phone: r.phone, Email: r.email || "-", Date: r.date, Time: r.time, Guests: r.guests, Seating: r.seating, Notes: notes || "-",
  });
  return { ok: true, message: `Thanks ${r.name.split(" ")[0]}! We've received your request for ${r.guests} on ${r.date} at ${r.time}. We'll call or message ${r.phone} to confirm.${user ? " You can see it under My account." : ""}` };
}

export async function submitMessage(_: FormState, fd: FormData): Promise<FormState> {
  const values = toObj(fd);
  if (values.company) return { ok: true, message: "Thanks!" };

  const parsed = messageSchema.safeParse(values);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };

  if (!(await rateLimit("contact"))) return { ok: false, message: "Too many messages. Please try again later.", values };
  const m = parsed.data;
  await prisma.message.create({ data: m });
  await notify(`New message from ${m.name}`, { Name: m.name, Phone: m.phone || "-", Email: m.email || "-", Subject: m.subject || "-", Message: m.body });
  return { ok: true, message: "Thanks for your message. We'll get back to you soon." };
}

export async function subscribeNewsletter(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("company")) return { ok: true, message: "You're on the list!" }; // honeypot
  const email = String(fd.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!(await rateLimit("contact"))) return { ok: false, message: "Too many requests. Please try again later." };
  await prisma.message.create({ data: { name: "Newsletter subscriber", email, subject: "Newsletter signup", body: "Subscribed from the homepage." } });
  return { ok: true, message: "You're on the list — see you soon." };
}
