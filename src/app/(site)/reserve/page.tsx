import type { Metadata } from "next";
import { getHours, getSettings } from "@lib/data";
import { ReservationForm } from "@ui/reservation-form";
import { SectionImage } from "@ui/section-image";
import { HoursList } from "@ui/hours-list";
import { OpenBadge } from "@ui/open-badge";
import { Calendar, Chat, Check } from "@ui/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Book a table", description: "Book a table at Fasana Café, Bahria Town.", alternates: { canonical: "/reserve" } };

const steps = [
  { icon: Calendar, title: "Pick a time", body: "Today, tomorrow, or any day — slots update live." },
  { icon: Chat, title: "We confirm", body: "A call or WhatsApp, usually within the hour." },
  { icon: Check, title: "Pull up a chair", body: "Your details are saved for next time." },
];

export default async function ReservePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [{ welcome }, s, hours] = await Promise.all([searchParams, getSettings(), getHours()]);
  const tel = s.phone.replace(/\s/g, "");
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[40rem] rounded-full bg-glow blur-3xl" />
      <div className="container-x relative grid gap-10 pb-20 pt-12 lg:grid-cols-[1fr_1.5fr] lg:gap-14 lg:pt-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {hours.length > 0 && <p className="mb-4"><OpenBadge hours={hours} /></p>}
          <p className="eyebrow">Reservations</p>
          <h1 className="mt-3 text-6xl leading-[1.02] sm:text-7xl">Book a table</h1>
          <span aria-hidden className="heading-rule" />
          <p className="mt-5 max-w-sm text-lg text-muted">Pick a time and we&apos;ll confirm by call or WhatsApp. For tonight, or for groups over 30, calling is quickest.</p>
          <a href={`tel:${tel}`} className="btn-ghost mt-6">Call {s.phone}</a>

          <ol className="mt-10 space-y-5">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sheet text-ember ring-1 ring-line"><Icon className="h-4.5 w-4.5" /></span>
                <div>
                  <p className="text-sm font-semibold"><span className="mr-1.5 text-muted">{i + 1}.</span>{title}</p>
                  <p className="mt-0.5 text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <SectionImage src={s.reserveImage} alt="" variant="reserve" sizes="400px" className="mt-10 hidden aspect-[4/3] rounded-3xl lg:block" />
          <div className="mt-10 hidden lg:block"><HoursList hours={hours} /></div>
        </div>
        <div className="min-w-0 rounded-[1.75rem] border border-line bg-sheet p-5 shadow-[0_30px_60px_-36px_rgba(22,33,59,.35)] sm:p-10">
          {welcome === "1" && (
            <p role="status" className="mb-6 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <Check className="h-4 w-4 shrink-0" />
              <span>Welcome aboard! Your details are saved — pick a time below and we&apos;ll confirm by WhatsApp or call.</span>
            </p>
          )}
          <ReservationForm />
        </div>
      </div>
    </div>
  );
}
