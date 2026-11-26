import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/user-session";

export const dynamic = "force-dynamic";

/** Minimal profile for prefilling forms on cached pages. Never returns secrets. */
export async function GET() {
  const user = await getCurrentUser();
  const headers = { "Cache-Control": "private, no-store" };
  if (!user) return NextResponse.json({ user: null }, { status: 401, headers });
  const { name, email, phone, seatingPref } = user;
  return NextResponse.json({ user: { name, email, phone, seatingPref } }, { headers });
}
