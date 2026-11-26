import "server-only";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Sends an email via Resend if RESEND_API_KEY is set. Returns true if sent. Never throws. */
export async function notifyTo(to: string, subject: string, lines: Record<string, string | number>) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  const html = `<h2>${esc(subject)}</h2><table cellpadding="6">${Object.entries(lines)
    .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.NOTIFY_EMAIL_FROM || "onboarding@resend.dev", to, subject, html }),
    });
    return res.ok;
  } catch (e) {
    console.error("email failed", e);
    return false;
  }
}

/** Staff notification for new bookings and messages. */
export async function notify(subject: string, lines: Record<string, string | number>) {
  await notifyTo(process.env.NOTIFY_EMAIL_TO ?? "", subject, lines);
}
