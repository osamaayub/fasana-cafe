import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { finishAuth, isEnabled, isProvider, OAUTH_COOKIE, OAuthError, userForProfile } from "@lib/oauth";
import { safeNext, startSession } from "@lib/user-session";

export const dynamic = "force-dynamic";

const sameString = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Step 2: Google or Facebook sends the visitor back here with a one-time code. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
  const back = (error: string) => NextResponse.redirect(new URL(`/signin?error=${error}`, req.url));

  if (!isProvider(provider) || !isEnabled(provider)) return back("provider-off");
  const q = req.nextUrl.searchParams;
  // The visitor pressed Cancel on the Google/Facebook screen.
  if (q.get("error")) return back("cancelled");

  let saved: { provider?: string; state?: string; verifier?: string; next?: string } = {};
  try {
    saved = raw ? JSON.parse(raw) : {};
  } catch {}
  const code = q.get("code");
  const state = q.get("state") ?? "";
  if (!code || !saved.state || saved.provider !== provider || !sameString(state, saved.state)) return back("expired");

  try {
    const profile = await finishAuth(provider, code, saved.verifier ?? "");
    const { user, created } = await userForProfile(provider, profile);
    await startSession(user.id, user.name.trim().split(/\s+/)[0] ?? "");
    const dest = created || !user.profileComplete ? "/account/setup" : safeNext(saved.next, "/account");
    return NextResponse.redirect(new URL(dest, req.url));
  } catch (e) {
    if (e instanceof OAuthError) return back(e.code);
    console.error("oauth callback failed", provider, e instanceof Error ? e.message : e);
    return back("failed");
  }
}
