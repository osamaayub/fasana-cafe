import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@lib/session";

const USER_COOKIE = "fasana_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Customer area: quick cookie check here; the page itself validates the session in the database.
  if (pathname.startsWith("/account")) {
    if (!req.cookies.get(USER_COOKIE)) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return withNoStore(NextResponse.next());
  }

  // Staff admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return withNoStore(NextResponse.next());
  }
  return NextResponse.next();
}

function withNoStore(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
