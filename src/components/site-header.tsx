"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "./icons";
import { Wordmark } from "./wordmark";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )fasana_name=([^;]*)/);
    setWho(m ? decodeURIComponent(m[1]) : null);
  }, [pathname]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`sticky top-0 z-40 bg-paper/95 text-ink transition-shadow duration-300 ${scrolled ? "shadow-[0_1px_0_var(--color-line),0_10px_30px_-20px_rgba(22,33,59,.35)]" : ""}`}>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label={`${name} home`}><Wordmark name={name} /></Link>
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-lamp after:transition-transform after:duration-300 ${active ? "text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"}`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href={who ? "/account" : "/signin"} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
            {who ? (
              <><span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper" aria-hidden>{who[0]?.toUpperCase()}</span>{who}</>
            ) : "Sign in"}
          </Link>
          <Link href="/reserve" className="btn-primary">Book a table</Link>
        </nav>
        <button
          type="button"
          className="-mr-2 rounded-full p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 bg-paper md:hidden"
      >
        <div className="container-x flex h-full flex-col pb-10 pt-6">
          {[{ href: "/", label: "Home" }, ...links].map((l) => (
            <Link key={l.href} href={l.href} className="border-b border-line py-4 font-serif text-4xl text-ink">
              {l.label}
            </Link>
          ))}
          <Link href={who ? "/account" : "/signin"} className="border-b border-line py-4 font-serif text-4xl text-ink">{who ? "My account" : "Sign in"}</Link>
          <Link href="/reserve" className="btn-primary mt-auto py-4 text-base">Book a table</Link>
        </div>
      </nav>
    </header>
  );
}
