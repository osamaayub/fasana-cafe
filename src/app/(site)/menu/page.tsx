import type { Metadata } from "next";
import { getHours, getMenu, getSettings } from "@lib/data";
import { MenuBrowser } from "@ui/menu-browser";
import { OpenBadge } from "@ui/open-badge";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Menu", description: "Soups, mains, pasta, sandwiches, desserts and drinks.", alternates: { canonical: "/menu" } };

export default async function MenuPage() {
  const [categories, s, hours] = await Promise.all([getMenu(), getSettings(), getHours()]);
  return (
    <>
      <header className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-48 h-[30rem] w-[40rem] rounded-full bg-glow blur-3xl" />
        <div className="container-x relative py-14 md:py-20">
          {hours.length > 0 && <p className="anim-ink mb-4"><OpenBadge hours={hours} /></p>}
          <p className="anim-ink eyebrow">Kitchen & bar</p>
          <h1 className="anim-ink mt-3 text-7xl sm:text-8xl">The menu</h1>
          <span aria-hidden className="anim-rise heading-rule" />
          <p className="anim-rise mt-4 max-w-[58ch] text-lg text-muted">
            Prices are in rupees. Where it says “Ask staff”, check the price with us on the day.
            {s.foodpandaUrl && (
              <> Staying in? <a href={s.foodpandaUrl} target="_blank" rel="noopener" className="font-semibold text-ember underline-offset-4 hover:underline">Order delivery on Foodpanda</a>.</>
            )}
          </p>
        </div>
      </header>
      <div className="container-x pb-24 pt-2 lg:pt-6">
        <MenuBrowser categories={categories} orderUrl={s.foodpandaUrl} />
      </div>
    </>
  );
}
