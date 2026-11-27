import Link from "next/link";
import type { OpeningHour, Settings } from "@lib/types";
import { DAYS, to12h } from "@lib/format";
import { mapsLink } from "@lib/maps";
import { HideOnAuth } from "./hide-on-auth";
import { Wordmark } from "./wordmark";
import { OpenBadge } from "./open-badge";
import { Arrow, Chat, Instagram, Phone, Pin } from "./icons";

const explore = [
  { href: "/menu", label: "Menu" },
  { href: "/reserve", label: "Book a table" },
  { href: "/about", label: "Our story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/signin", label: "Sign in" },
];

const socials = (s: Settings) => [
  s.instagram && { href: s.instagram, label: "Instagram" },
  s.facebook && { href: s.facebook, label: "Facebook" },
  { href: `https://wa.me/${s.whatsapp}`, label: "WhatsApp" },
].filter(Boolean) as { href: string; label: string }[];

export function SiteFooter({ s, hours }: { s: Settings; hours: OpeningHour[] }) {
  const allSame = hours.length > 0 && hours.every((h) => !h.closed && h.opensAt === hours[0].opensAt && h.closesAt === hours[0].closesAt);
  const tel = s.phone.replace(/\s/g, "");
  return (
    <footer className="relative overflow-hidden bg-night text-frost/75">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-lamp/10 blur-3xl" />

      {/* CTA band (hidden on sign-in screens) */}
      <HideOnAuth>
      <div className="relative border-b border-frost/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-6 py-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lamp/80">Reservations</p>
            <h2 className="mt-2 font-serif text-3xl text-frost sm:text-4xl">Save a seat by the window?</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-frost/60">
              {hours.length > 0 && <OpenBadge hours={hours} />}
              <span>Tables go quickly on weekends — booking takes under a minute.</span>
            </p>
          </div>
          <Link href="/reserve" className="btn-primary px-7 py-3.5 text-base">
            Book a table <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </HideOnAuth>

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Wordmark name={s.name} className="text-frost" tone="dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{s.tagline}</p>
          <div className="mt-6 flex gap-2.5">
            {socials(s).map((soc) => (
              <a
                key={soc.label}
                href={soc.href}
                target="_blank"
                rel="noopener"
                aria-label={soc.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-frost/15 text-frost/70 transition-all hover:-translate-y-0.5 hover:border-lamp hover:text-lamp"
              >
                {soc.label === "Instagram" ? <Instagram className="h-4.5 w-4.5" /> : soc.label === "Facebook" ? <FacebookIcon /> : <Chat className="h-4.5 w-4.5" />}
              </a>
            ))}
          </div>
        </div>
        <nav className="text-sm" aria-label="Explore">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-frost/50">Explore</h2>
          <ul className="space-y-2.5">
            {explore.map((l) => (
              <li key={l.href}><Link href={l.href} className="transition-colors hover:text-lamp">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-frost/50">Find us</h2>
          <p className="flex items-start gap-2 leading-relaxed"><Pin className="mt-0.5 h-4 w-4 shrink-0 text-lamp/70" />{s.address}</p>
          <a href={mapsLink(s)} target="_blank" rel="noopener" className="mt-3 inline-block text-lamp hover:underline">Open in Google Maps</a>
        </div>
        <div className="text-sm">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-frost/50">Hours</h2>
          {allSame ? (
            <p>Every day<br />{to12h(hours[0].opensAt)} to {to12h(hours[0].closesAt).toLowerCase()}</p>
          ) : (
            <ul className="space-y-1.5">
              {hours.map((h) => (
                <li key={h.dayOfWeek} className="flex justify-between gap-4">
                  <span>{DAYS[h.dayOfWeek].slice(0, 3)}</span>
                  <span>{h.closed ? "Closed" : `${to12h(h.opensAt)} – ${to12h(h.closesAt)}`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-sm">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-frost/50">Talk to us</h2>
          <ul className="space-y-2.5">
            <li><a href={`tel:${tel}`} className="flex items-center gap-2 hover:text-frost"><Phone className="h-4 w-4 text-lamp/70" />{s.phone}</a></li>
            <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-frost"><Chat className="h-4 w-4 text-lamp/70" />WhatsApp us</a></li>
            {s.foodpandaUrl && <li><a href={s.foodpandaUrl} target="_blank" rel="noopener" className="hover:text-frost">Order on Foodpanda</a></li>}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-frost/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-frost/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {s.name}. Made with care in Lahore.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/reserve" className="hover:text-frost">Book a table</Link><Link href="/contact" className="hover:text-frost">Contact</Link><Link href="/menu" className="hover:text-frost">Menu</Link><Link href="/privacy" className="hover:text-frost">Privacy</Link></nav>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden>
      <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}
