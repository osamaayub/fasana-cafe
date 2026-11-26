import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

export const USER_COOKIE = "fasana_session";
export const HINT_COOKIE = "fasana_name"; // first name only, readable by the browser for the header
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const secure = process.env.NODE_ENV === "production";

export async function startSession(userId: number, firstName: string) {
  const token = randomBytes(32).toString("base64url");
  const ua = ((await headers()).get("user-agent") ?? "").slice(0, 200);
  const expiresAt = new Date(Date.now() + TTL_MS);
  await prisma.session.create({ data: { id: sha256(token), userId, userAgent: ua, expiresAt } });
  const jar = await cookies();
  jar.set(USER_COOKIE, token, { httpOnly: true, secure, sameSite: "lax", path: "/", expires: expiresAt });
  setHint(jar, firstName, expiresAt);
}

function setHint(jar: Awaited<ReturnType<typeof cookies>>, firstName: string, expires: Date) {
  jar.set(HINT_COOKIE, encodeURIComponent(firstName || "Guest"), { httpOnly: false, secure, sameSite: "lax", path: "/", expires });
}

export async function updateHint(firstName: string) {
  setHint(await cookies(), firstName, new Date(Date.now() + TTL_MS));
}

/** Returns the signed-in user, or null. Expired sessions are deleted. Cached per request. */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  const id = sha256(token);
  const session = await prisma.session.findUnique({ where: { id }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id } }).catch(() => null);
    return null;
  }
  if (Date.now() - session.lastSeenAt.getTime() > RENEW_AFTER_MS) {
    await prisma.session.update({ where: { id }, data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + TTL_MS) } }).catch(() => null);
  }
  return { ...session.user, sessionId: id };
});

export async function requireUser(opts: { allowIncomplete?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!opts.allowIncomplete && !user.profileComplete) redirect("/account/setup");
  return user;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (token) await prisma.session.delete({ where: { id: sha256(token) } }).catch(() => null);
  jar.delete(USER_COOKIE);
  jar.delete(HINT_COOKIE);
}

export async function endOtherSessions(userId: number, keepId: string) {
  await prisma.session.deleteMany({ where: { userId, NOT: { id: keepId } } });
}

export const hashToken = sha256;

/** Only allow relative, same-site redirect targets. */
export function safeNext(next: string | null | undefined, fallback = "/account") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
