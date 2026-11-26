import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, verifyToken } from "./session";

export async function requireAdmin() {
  const store = await cookies();
  const session = await verifyToken(store.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  return session;
}

export function checkCredentials(email: string, password: string) {
  const e = process.env.ADMIN_EMAIL ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  if (!e || !p) return false;
  const eq = (a: string, b: string) => {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  };
  // evaluate both to avoid leaking which one failed
  const okE = eq(email.trim().toLowerCase(), e.toLowerCase());
  const okP = eq(password, p);
  return okE && okP;
}
