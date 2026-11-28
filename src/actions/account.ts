"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@lib/prisma";
import { rateLimit } from "@lib/rate-limit";
import { notifyTo } from "@lib/notify";
import { bookingCancelledEmail, sendEmail } from "@lib/email";
import { siteUrl } from "@lib/site";
import { burnTime, hashPassword, verifyPassword } from "@lib/password";
import {
  endOtherSessions, endSession, getCurrentUser, hashToken, requireUser, safeNext, startSession, updateHint,
} from "@lib/user-session";
import { changePasswordSchema, email as emailSchema, profileSchema, resetSchema, signInSchema, signUpSchema } from "@lib/account-validation";
import { fieldErrors, type FormState } from "@lib/validation";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const vals = (fd: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? "")]));
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

/* ---------- sign up ---------- */
export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const values = vals(fd, ["name", "email"]);
  if (fd.get("company")) return { ok: false, message: "Something went wrong. Try again." }; // honeypot
  const parsed = signUpSchema.safeParse({ ...values, password: fd.get("password") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  if (!(await rateLimit("signup", 5, 60 * 60 * 1000))) return { ok: false, message: "Too many sign-ups from this network. Try again in an hour.", values };

  const { name, email, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, values, errors: { email: "This email already has an account. Sign in, or reset your password." } };
  }
  const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  // Sign the new customer in and take them to step 2 (phone and seating), instead of asking for the password again.
  await startSession(user.id, firstName(user.name));
  redirect("/account/setup");
}

/* ---------- sign in ---------- */
export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const values = vals(fd, ["email"]);
  const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  if (!(await rateLimit("signin", 10, 15 * 60 * 1000))) return { ok: false, message: "Too many attempts. Wait 15 minutes and try again.", values };

  const generic: FormState = { ok: false, message: "That email and password don't match. Check them, or reset your password.", values };
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  // No account, or one created with Google/GitHub that has no password yet.
  if (!user || !user.passwordHash) {
    await burnTime(password);
    return generic;
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, message: "This account is paused for 15 minutes after several wrong passwords. Try again later, or reset your password.", values };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const fails = user.failedLogins + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: fails >= MAX_FAILS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails },
    });
    return generic;
  }
  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  await startSession(user.id, firstName(user.name));
  redirect(safeNext(String(fd.get("next") ?? ""), user.profileComplete ? "/account" : "/reserve"));
}

export async function signOut() {
  await endSession();
  redirect("/signin?notice=signed-out");
}

/* ---------- password reset ---------- */
export async function requestReset(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(fd.get("email"));
  if (!parsed.success) return { ok: false, errors: { email: "Enter a valid email address" }, values: vals(fd, ["email"]) };
  const done: FormState = { ok: true, message: `If ${parsed.data} has an account, we've sent a link to reset the password. It works for 1 hour.` };
  if (!(await rateLimit("reset", 5, 60 * 60 * 1000))) return done;

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user) return done; // same answer either way, so nobody can test which emails have accounts
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({ data: { id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  const link = `${siteUrl}/reset-password?token=${token}`;
  const sent = await notifyTo(user.email, "Reset your Fasana Café password", {
    Hello: firstName(user.name) || "there",
    "Reset link (valid 1 hour)": link,
    "Didn't ask for this?": "Ignore this email. Your password won't change.",
  });
  if (!sent && (process.env.NODE_ENV !== "production" || process.env.LOG_RESET_LINKS === "1")) console.info(`[dev] Password reset link for ${user.email}: ${link}`);
  return done;
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({ token: fd.get("token"), password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const row = await prisma.passwordResetToken.findUnique({ where: { id: hashToken(parsed.data.token) }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false, message: "This reset link has expired or was already used. Ask for a new one." };
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(parsed.data.password), passwordChangedAt: new Date(), failedLogins: 0, lockedUntil: null } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }), // sign out every device
  ]);
  await startSession(row.userId, firstName(row.user.name));
  redirect("/account?notice=password-reset");
}

/* ---------- profile ---------- */
export async function saveProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser({ allowIncomplete: true });
  const values = vals(fd, ["name", "phone", "seatingPref", "dietaryNotes"]);
  const parsed = profileSchema.safeParse({ ...values, marketingOptIn: fd.get("marketingOptIn") === "on" });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  await prisma.user.update({ where: { id: user.id }, data: { ...parsed.data, profileComplete: true } });
  await updateHint(firstName(parsed.data.name));
  if (fd.get("from") === "setup") redirect("/account?notice=welcome");
  revalidatePath("/account");
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser({ allowIncomplete: true });
  const parsed = changePasswordSchema.safeParse({ current: fd.get("current"), password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await rateLimit("change-pw", 5, 15 * 60 * 1000))) return { ok: false, message: "Too many attempts. Wait 15 minutes." };
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return { ok: false, errors: { current: "That's not your current password" } };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password), passwordChangedAt: new Date() } });
  await endOtherSessions(user.id, user.sessionId);
  revalidatePath("/account");
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

export async function revokeSession(fd: FormData) {
  const user = await requireUser({ allowIncomplete: true });
  await prisma.session.deleteMany({ where: { id: String(fd.get("id")), userId: user.id, NOT: { id: user.sessionId } } });
  revalidatePath("/account");
}

export async function signOutEverywhere() {
  const user = await requireUser({ allowIncomplete: true });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await endSession();
  redirect("/signin?notice=signed-out-everywhere");
}

/* ---------- bookings ---------- */
export async function cancelMyReservation(fd: FormData) {
  const user = await requireUser({ allowIncomplete: true });
  // only the owner can cancel, and only upcoming bookings
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const id = Number(fd.get("id"));
  const { count } = await prisma.reservation.updateMany({
    where: { id, userId: user.id, date: { gte: today }, status: { not: "cancelled" } },
    data: { status: "cancelled" },
  });
  if (count) {
    const booking = await prisma.reservation.findUnique({ where: { id } });
    const to = booking?.email || user.email;
    if (booking && to) after(async () => void (await sendEmail(await bookingCancelledEmail({ ...booking, email: to }, "guest"))));
  }
  revalidatePath("/account");
  revalidatePath("/admin", "layout");
}

/* ---------- delete ---------- */
export async function deleteAccount(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (String(fd.get("confirmEmail") ?? "").trim().toLowerCase() !== user.email) {
    return { ok: false, errors: { confirmEmail: "Type your email exactly to confirm" } };
  }
  // Accounts made with Google/GitHub have no password; the signed-in session plus the typed email confirm it.
  if (user.passwordHash && !(await verifyPassword(String(fd.get("password") ?? ""), user.passwordHash))) {
    return { ok: false, errors: { password: "That's not your password" } };
  }
  await prisma.user.delete({ where: { id: user.id } }); // sessions cascade; bookings keep their details but lose the link
  await endSession();
  redirect("/?notice=account-deleted");
}
