import "server-only";
import { sendEmail } from "./email";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Plain key/value email (used for password resets). Goes through the same SMTP/Resend transport. Never throws. */
export async function notifyTo(to: string, subject: string, lines: Record<string, string | number>) {
  if (!to) return false;
  const entries = Object.entries(lines);
  const html = `<h2>${esc(subject)}</h2><table cellpadding="6">${entries
    .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  const text = [subject, "", ...entries.map(([k, v]) => `${k}: ${v}`)].join("\n");
  return sendEmail({ to, subject, html, text });
}
