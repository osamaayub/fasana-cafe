"use client";

import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/signin", "/signup", "/forgot-password", "/reset-password", "/account/setup"];

/** Keeps sign-in screens focused: hides floating buttons and promo bands on those pages. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`)) ? null : <>{children}</>;
}
