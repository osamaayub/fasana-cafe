import Link from "next/link";
import type { OpeningHour, Settings } from "@/lib/types";
import { DAYS, to12h } from "@/lib/format";
import { Wordmark } from "./wordmark";

export function SiteFooter({ s, hours }: { s: Settings; hours: OpeningHour[] }) {
  const allSame = hours.length > 0 && hours.every((h) => !h.closed && h.opensAt === hours[0].opensAt && h.closesAt === hours[0].closesAt);
  const tel = s.phone.replace(/\s/g, "");
  return (
    <footer className="bg-night text-mist/75">
      <div className="container-x grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark name={s.name} className="text-mist" tone="dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{s.tagline}</p>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold text-mist">Find us</h2>
          <p className="leading-relaxed">{s.address}</p>
          <a href={s.mapsUrl} target="_blank" rel="noopener" className="mt-2 inline-block text-lamp hover:underline">Open in Google Maps</a>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold text-mist">Hours</h2>
          {allSame ? (
            <p>Every day<br />{to12h(hours[0].opensAt)} to {to12h(hours[0].closesAt).toLowerCase()}</p>
          ) : (
            <ul className="space-y-1">
              {hours.map((h) => (
                <li key={h.dayOfWeek} className="flex justify-between gap-4">
                  <span>{DAYS[h.dayOfWeek].slice(0, 3)}</span>
                  <span>{h.closed ? "Closed" : `${to12h(h.opensAt)} to ${to12h(h.closesAt)}`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold text-mist">Talk to us</h2>
          <ul className="space-y-1.5">
            <li><a href={`tel:${tel}`} className="hover:text-mist">{s.phone}</a></li>
            <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="hover:text-mist">WhatsApp</a></li>
            {s.instagram && <li><a href={s.instagram} target="_blank" rel="noopener" className="hover:text-mist">Instagram</a></li>}
            {s.facebook && <li><a href={s.facebook} target="_blank" rel="noopener" className="hover:text-mist">Facebook</a></li>}
            {s.foodpandaUrl && <li><a href={s.foodpandaUrl} target="_blank" rel="noopener" className="hover:text-mist">Order delivery on Foodpanda</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-mist/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-mist/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {s.name}</p>
          <nav className="flex gap-5"><Link href="/reserve" className="hover:text-mist">Book a table</Link><Link href="/contact" className="hover:text-mist">Contact</Link></nav>
        </div>
      </div>
    </footer>
  );
}
