"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Menu, Phone, X } from "./icons";
import { Wordmark } from "./wordmark";
import { OpenBadge } from "./open-badge";
import { ThemeToggle } from "./theme-toggle";
import type { OpeningHour } from "@lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name, hours = [], phone = "", whatsapp = "" }: { name: string; hours?: OpeningHour[]; phone?: string; whatsapp?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState<string | null>(null);
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
    <header className="sticky top-0 z-40 px-3 pb-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full border border-line/70 bg-paper/85 pl-5 pr-2 shadow-[0_12px_40px_-22px_rgba(22,33,59,.5)] backdrop-blur-xl">
        <Link href="/" aria-label={`${name} home`}><Wordmark name={name} /></Link>
        <nav aria-label="Main" className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap py-1 text-[13px] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-lamp after:transition-transform after:duration-300 lg:text-sm ${active ? "text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"}`}
              >
                {l.label}
              </Link>
            );
          })}
          {hours.length > 0 && <span className="hidden rounded-full border border-line px-3 py-1.5 text-xs xl:inline-flex"><OpenBadge hours={hours} /></span>}
          <ThemeToggle />
          <Link href="/reserve" className="btn-primary whitespace-nowrap px-4 py-2 text-[13px] lg:px-5 lg:py-2.5 lg:text-sm">Book a table</Link>
        </nav>
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Link href="/reserve" aria-label="Book a table" className="btn-primary h-10 w-10 !px-0">
            <Calendar className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="-mr-2 rounded-full p-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-20 bg-paper lg:hidden"
      >
        <div className="container-x flex h-full flex-col overflow-y-auto overscroll-contain pb-6 pt-3">
          {hours.length > 0 && <p className="mb-4 flex items-center gap-2 text-sm text-muted"><OpenBadge hours={hours} /></p>}
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-baseline gap-4 border-b border-line py-3 transition-colors hover:text-ember"
              style={{ animation: `rise .5s var(--ease-out-soft) both`, animationDelay: `${i * 40}ms` }}
            >
              <span className="w-6 text-xs tabular-nums text-muted/60">0{i + 1}</span>
              <span className="font-serif text-2xl text-ink transition-transform group-hover:translate-x-1">{l.label}</span>
            </Link>
          ))}
          <Link href={who ? "/account" : "/signin"} className="group flex items-baseline gap-4 border-b border-line py-3">
            <span className="w-6 text-xs tabular-nums text-muted/60">0{links.length + 1}</span>
            <span className="font-serif text-2xl text-ink transition-transform group-hover:translate-x-1">{who ? "My account" : "Sign in"}</span>
          </Link>
          <div className="mt-auto space-y-3 pt-6">
            <Link href="/reserve" className="btn-primary flex w-full py-4 text-base">Book a table</Link>
            <div className="flex items-center justify-center gap-5 text-sm text-muted">
              <ThemeToggle />
              {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-ink"><Phone className="h-4 w-4" />{phone}</a>}
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" className="hover:text-ink">WhatsApp us</a>}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
