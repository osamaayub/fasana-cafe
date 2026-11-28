import "server-only";
import { getSettings } from "./data";
import { siteUrl } from "./site";
import { to12h } from "./format";

/*
 * Transactional email.
 *
 * Transport, in order of preference:
 *   1. SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS): any provider, including a Gmail account with an
 *      app password. Works without owning a domain, so it is the quickest way to email guests.
 *   2. Resend (RESEND_API_KEY): best deliverability, but it only delivers to other people once
 *      you verify a domain you own. Until then it can only send to the Resend account's own address.
 *   3. Neither set: nothing is sent and the site works exactly as before.
 *
 * Sending never throws and never blocks a form: callers schedule it with `after()`.
 */

export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailConfigured() {
  return Boolean((process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.RESEND_API_KEY);
}

const fromAddress = () => process.env.NOTIFY_EMAIL_FROM || (process.env.SMTP_USER ? `Fasana Café <${process.env.SMTP_USER}>` : "Fasana Café <onboarding@resend.dev>");

/** Sends one email. Returns true when the provider accepted it. Never throws. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  if (!mail.to) return false;
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const { createTransport } = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT || 465);
      const transport = createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({ from: fromAddress(), to: mail.to, subject: mail.subject, html: mail.html, text: mail.text, replyTo: mail.replyTo });
      return true;
    }
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddress(), to: mail.to, subject: mail.subject, html: mail.html, text: mail.text, reply_to: mail.replyTo }),
      });
      if (!res.ok) console.error("email: resend rejected", res.status, await res.text().catch(() => ""));
      return res.ok;
    }
    console.warn("email: not sent, no transport configured (set SMTP_HOST, SMTP_USER, SMTP_PASS or RESEND_API_KEY)");
  } catch (e) {
    console.error("email: send failed", e);
  }
  return false;
}

/* ---------- layout ---------- */

type Block = {
  preheader: string;
  heading: string;
  intro: string;
  rows?: [string, string][];
  button?: { label: string; href: string };
  secondary?: { label: string; href: string };
  outro?: string;
};

type Cafe = Awaited<ReturnType<typeof getSettings>>;

/** Table-based HTML (what email clients actually support) plus a plain-text twin. */
function render(cafe: Cafe, b: Block) {
  const rows = (b.rows ?? [])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e1d6;color:#6b6f7b;font-size:14px;width:38%">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e6e1d6;color:#16213b;font-size:15px;font-weight:600">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const btn = (x: { label: string; href: string }, primary: boolean) =>
    `<a href="${esc(x.href)}" style="display:inline-block;margin:6px 8px 0 0;padding:13px 22px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none;${primary ? "background:#e7b04b;color:#16213b" : "background:#ffffff;color:#16213b;border:1px solid #d9d3c5"}">${esc(x.label)}</a>`;
  const contact = [cafe.phone && `Call ${esc(cafe.phone)}`, cafe.whatsapp && `<a href="https://wa.me/${cafe.whatsapp.replace(/\D/g, "")}" style="color:#9a5b1e">WhatsApp</a>`].filter(Boolean).join(" · ");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(b.heading)}</title></head>
<body style="margin:0;background:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(b.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="background:#16213b;border-radius:20px 20px 0 0;padding:22px 28px"><a href="${siteUrl}" style="color:#f4f1ea;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:22px">${esc(cafe.name)}</a></td></tr>
<tr><td style="background:#ffffff;padding:28px;border-radius:0 0 20px 20px">
<h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;line-height:1.25;color:#16213b">${esc(b.heading)}</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3b4152">${esc(b.intro)}</p>
${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${rows}</table>` : ""}
${b.button ? `<div style="margin:4px 0 14px">${btn(b.button, true)}${b.secondary ? btn(b.secondary, false) : ""}</div>` : ""}
${b.outro ? `<p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#6b6f7b">${esc(b.outro)}</p>` : ""}
</td></tr>
<tr><td style="padding:18px 8px;text-align:center;font-size:12px;line-height:1.6;color:#8a8d96">${esc(cafe.address)}<br>${contact}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    b.heading,
    "",
    b.intro,
    "",
    ...(b.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(b.button ? ["", `${b.button.label}: ${b.button.href}`] : []),
    ...(b.secondary ? [`${b.secondary.label}: ${b.secondary.href}`] : []),
    ...(b.outro ? ["", b.outro] : []),
    "",
    "--",
    cafe.name,
    cafe.address,
    cafe.phone ? `Phone: ${cafe.phone}` : "",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");

  return { html, text };
}

/* ---------- templates ---------- */

export type BookingForEmail = { id: number; userId?: number | null; name: string; email: string; date: string; time: string; guests: number; seating: string; notes?: string };

const prettyDate = (d: string) => new Date(`${d}T12:00:00+05:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" });
const seatingLabel = (s: string) => (s === "outdoor" ? "Terrace" : s === "indoor" ? "Indoors" : "Wherever's free");
const firstName = (n: string) => n.trim().split(/\s+/)[0] || "there";

/** Google Calendar link for a 90-minute visit, in Lahore time. */
function calendarLink(cafe: Cafe, b: BookingForEmail) {
  const start = `${b.date.replace(/-/g, "")}T${b.time.replace(":", "")}00`;
  const [h, m] = b.time.split(":").map(Number);
  const endMin = h * 60 + m + 90;
  const endDate = endMin >= 1440 ? new Date(new Date(`${b.date}T00:00:00Z`).getTime() + 864e5).toISOString().slice(0, 10).replace(/-/g, "") : b.date.replace(/-/g, "");
  const end = `${endDate}T${String(Math.floor((endMin % 1440) / 60)).padStart(2, "0")}${String(endMin % 60).padStart(2, "0")}00`;
  const q = new URLSearchParams({ action: "TEMPLATE", text: `Table at ${cafe.name}`, dates: `${start}/${end}`, ctz: "Asia/Karachi", location: cafe.address, details: `Table for ${b.guests}. Booking #${b.id}.` });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const bookingRows = (b: BookingForEmail): [string, string][] => [
  ["Date", prettyDate(b.date)],
  ["Time", to12h(b.time)],
  ["Guests", `${b.guests} ${b.guests === 1 ? "guest" : "guests"}`],
  ["Seating", seatingLabel(b.seating)],
  ...(b.notes ? ([["Notes", b.notes]] as [string, string][]) : []),
  ["Booking", `#${b.id}`],
];

async function build(to: string, subject: string, block: Block): Promise<Mail> {
  const cafe = await getSettings();
  return { to, subject, ...render(cafe, block), replyTo: cafe.email || undefined };
}

export async function bookingReceivedEmail(b: BookingForEmail) {
  const cafe = await getSettings();
  return build(b.email, `We've got your booking request: ${prettyDate(b.date)}, ${to12h(b.time)}`, {
    preheader: `Table for ${b.guests} at ${cafe.name}. We'll confirm shortly.`,
    heading: "Your request is in",
    intro: `Thanks ${firstName(b.name)}. We've received your request for a table at ${cafe.name}. It isn't confirmed yet: we'll check availability and send you another email (or call) once it's confirmed.`,
    rows: bookingRows(b),
    // guests without an account would only hit a sign-in wall, so link the menu instead
    button: b.userId ? { label: "View your bookings", href: `${siteUrl}/account` } : { label: "Browse the menu", href: `${siteUrl}/menu` },
    outro: `Need to change something? Reply to this email${cafe.phone ? ` or call ${cafe.phone}` : ""}.`,
  });
}

export async function bookingConfirmedEmail(b: BookingForEmail) {
  const cafe = await getSettings();
  return build(b.email, `Confirmed: your table on ${prettyDate(b.date)} at ${to12h(b.time)}`, {
    preheader: `See you on ${prettyDate(b.date)} at ${to12h(b.time)}.`,
    heading: "Your table is confirmed",
    intro: `Good news, ${firstName(b.name)}: your table at ${cafe.name} is confirmed. We look forward to seeing you.`,
    rows: bookingRows(b),
    button: { label: "Add to Google Calendar", href: calendarLink(cafe, b) },
    secondary: cafe.mapsUrl ? { label: "Get directions", href: cafe.mapsUrl } : undefined,
    outro: `Running late or can't make it? Let us know so we can give the table to someone else${cafe.phone ? `: ${cafe.phone}` : ""}.`,
  });
}

export async function bookingCancelledEmail(b: BookingForEmail, by: "guest" | "cafe") {
  const cafe = await getSettings();
  return build(b.email, `Booking cancelled: ${prettyDate(b.date)}, ${to12h(b.time)}`, {
    preheader: by === "guest" ? "Your cancellation went through." : "We couldn't hold this table.",
    heading: by === "guest" ? "Your booking is cancelled" : "We couldn't confirm your table",
    intro:
      by === "guest"
        ? `Hi ${firstName(b.name)}, as requested we've cancelled your booking at ${cafe.name}. Hope to see you another time.`
        : `Sorry ${firstName(b.name)}, we aren't able to hold a table for this time. Please pick another slot, or contact us and we'll try to fit you in.`,
    rows: bookingRows(b),
    button: { label: "Book another time", href: `${siteUrl}/reserve` },
  });
}

export async function messageReceivedEmail(m: { name: string; email: string; subject?: string; body: string }) {
  const cafe = await getSettings();
  return build(m.email, `We got your message${m.subject ? `: ${m.subject}` : ""}`, {
    preheader: `Thanks for writing to ${cafe.name}.`,
    heading: "Thanks for getting in touch",
    intro: `Hi ${firstName(m.name)}, your message reached ${cafe.name}. We usually reply within a day. Here's a copy for your records.`,
    rows: [...(m.subject ? ([["Subject", m.subject]] as [string, string][]) : []), ["Message", m.body]],
    outro: "If it's urgent, call or WhatsApp us instead.",
  });
}

export async function newsletterWelcomeEmail(email: string) {
  const cafe = await getSettings();
  return build(email, `You're on the ${cafe.name} list`, {
    preheader: "New dishes, events and the odd book recommendation.",
    heading: "Welcome to the list",
    intro: `Thanks for subscribing. We'll write occasionally with new dishes, events and offers from ${cafe.name}. No spam, ever.`,
    button: { label: "See the menu", href: `${siteUrl}/menu` },
    secondary: { label: "Book a table", href: `${siteUrl}/reserve` },
    outro: "Didn't sign up, or changed your mind? Reply with \"unsubscribe\" and we'll remove you.",
  });
}

/** Staff alert. Goes to NOTIFY_EMAIL_TO, falling back to the café email in Settings. */
export async function staffAlertEmail(subject: string, lines: Record<string, string | number>) {
  const cafe = await getSettings();
  const to = process.env.NOTIFY_EMAIL_TO || cafe.email;
  return build(to, subject, {
    preheader: subject,
    heading: subject,
    intro: "From the website:",
    rows: Object.entries(lines).map(([k, v]) => [k, String(v)]),
    button: { label: "Open admin", href: `${siteUrl}/admin` },
  });
}
