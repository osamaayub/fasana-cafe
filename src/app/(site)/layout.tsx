import { SiteHeader } from "@ui/site-header";
import { SiteFooter } from "@ui/site-footer";
import { WhatsAppFab } from "@ui/whatsapp-fab";
import { HideOnAuth } from "@ui/hide-on-auth";
import { getHours, getSettings } from "@lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, hours] = await Promise.all([getSettings(), getHours()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sheet focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <SiteHeader name={s.name} hours={hours} phone={s.phone} whatsapp={s.whatsapp} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <SiteFooter s={s} hours={hours} />
      <HideOnAuth>
        <WhatsAppFab number={s.whatsapp} name={s.name} />
      </HideOnAuth>
    </>
  );
}
