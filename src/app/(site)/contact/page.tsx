import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { ContactForm } from "@/components/contact-form";
import { MapEmbed } from "@/components/map-embed";
import { PageHeader } from "@/components/page-header";
import { Chat, Phone, Pin } from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Contact", description: "Call, WhatsApp or message Fasana Café.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const s = await getSettings();
  const tel = s.phone.replace(/\s/g, "");
  const ways = [
    { href: `tel:${tel}`, icon: Phone, title: "Call us", body: s.phone, ext: false },
    { href: `https://wa.me/${s.whatsapp}`, icon: Chat, title: "WhatsApp", body: "Usually the quickest reply", ext: true },
    { href: s.mapsUrl, icon: Pin, title: "Visit", body: "Sector C, Bahria Town", ext: true },
  ];
  return (
    <>
      <PageHeader title="Say hello" intro="Questions, private events, feedback or a book you're looking for. Pick whatever's easiest.">
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {ways.map((w) => (
            <a key={w.title} href={w.href} {...(w.ext ? { target: "_blank", rel: "noopener" } : {})}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-sheet p-5 transition-all hover:-translate-y-0.5 hover:border-lamp hover:shadow-[0_16px_30px_-20px_rgba(22,33,59,.4)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-glow text-ember"><w.icon className="h-5 w-5" /></span>
              <span><span className="block font-semibold">{w.title}</span><span className="text-sm text-muted">{w.body}</span></span>
            </a>
          ))}
        </div>
      </PageHeader>

      <div className="container-x grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <div>
          <h2 className="mb-8 text-4xl">Send a message</h2>
          <ContactForm />
        </div>
        <div className="flex flex-col gap-4">
          <MapEmbed query={s.mapEmbedQuery || `${s.latitude},${s.longitude}`} title={`Map showing ${s.name}`} />
          <p className="text-sm text-muted">{s.address}</p>
        </div>
      </div>
    </>
  );
}
