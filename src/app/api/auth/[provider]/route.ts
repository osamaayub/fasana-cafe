import { NextResponse, type NextRequest } from "next/server";
import { isEnabled, isProvider, OAUTH_COOKIE, startAuth } from "@lib/oauth";
import { safeNext } from "@lib/user-session";
import { rateLimit } from "@lib/rate-limit";

export const dynamic = "force-dynamic";

/** Step 1: send the visitor to Google or GitHub. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const back = (error: string) => NextResponse.redirect(new URL(`/signin?error=${error}`, req.url));
  if (!isProvider(provider) || !isEnabled(provider)) return back("provider-off");
  if (!(await rateLimit("oauth", 20, 15 * 60 * 1000))) return back("too-many");

  const { url, state, verifier } = startAuth(provider);
  const next = safeNext(req.nextUrl.searchParams.get("next"), "");
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ provider, state, verifier, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // must survive the top-level redirect back from the provider
    path: "/api/auth",
    maxAge: 10 * 60,
  });
  return res;
}
