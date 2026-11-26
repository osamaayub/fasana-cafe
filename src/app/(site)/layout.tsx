import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getHours, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, hours] = await Promise.all([getSettings(), getHours()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <SiteHeader name={s.name} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <SiteFooter s={s} hours={hours} />
      <WhatsAppFab number={s.whatsapp} name={s.name} />
    </>
  );
}
