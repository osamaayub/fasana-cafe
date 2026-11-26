import type { Metadata } from "next";
import { getHours, getSettings } from "@/lib/data";
import { ReservationForm } from "@/components/reservation-form";
import { SectionImage } from "@/components/section-image";
import { HoursList } from "@/components/hours-list";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Book a table", description: "Book a table at Fasana Café, Bahria Town.", alternates: { canonical: "/reserve" } };

export default async function ReservePage() {
  const [s, hours] = await Promise.all([getSettings(), getHours()]);
  const tel = s.phone.replace(/\s/g, "");
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[40rem] rounded-full bg-glow blur-3xl" />
      <div className="container-x relative grid gap-10 pb-20 pt-12 lg:grid-cols-[1fr_1.5fr] lg:gap-14 lg:pt-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-6xl leading-[1.02] sm:text-7xl">Book a table</h1>
          <p className="mt-4 max-w-sm text-lg text-muted">Pick a time and we&apos;ll confirm by call or WhatsApp. For tonight, or for groups over 30, calling is quickest.</p>
          <a href={`tel:${tel}`} className="btn-ghost mt-6">Call {s.phone}</a>
          <SectionImage src={s.reserveImage} alt="" variant="reserve" sizes="400px" className="mt-10 hidden aspect-[4/3] rounded-3xl lg:block" />
          <div className="mt-10 hidden lg:block"><HoursList hours={hours} /></div>
        </div>
        <div className="rounded-[1.75rem] border border-line bg-sheet p-6 shadow-[0_30px_60px_-36px_rgba(22,33,59,.35)] sm:p-10">
          <ReservationForm />
        </div>
      </div>
    </div>
  );
}
