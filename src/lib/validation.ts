import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20)
  .regex(/^[+\d][\d\s-]+$/, "Enter a valid phone number");

export const reservationSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    phone,
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).default(""),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
    guests: z.coerce.number().int().min(1, "At least 1 guest").max(30, "For groups over 30, please call us"),
    seating: z.enum(["any", "indoor", "outdoor"]).default("any"),
    notes: z.string().trim().max(500).default(""),
  })
  .refine(
    (v) => {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
      return v.date >= today;
    },
    { message: "Date can't be in the past", path: ["date"] }
  );

export const messageSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    phone: z.union([z.literal(""), phone]).default(""),
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).default(""),
    subject: z.string().trim().max(120).default(""),
    body: z.string().trim().min(10, "Message is too short").max(2000),
  })
  .refine((v) => v.phone || v.email, { message: "Give a phone number or email so we can reply", path: ["phone"] });

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
