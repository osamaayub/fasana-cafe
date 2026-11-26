import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@ui/page-header";
import { getSettings } from "@lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "FAQ", description: "Answers about booking, hours, menu and visiting Fasana Café.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const s = await getSettings();
  const faqs: [string, string][] = [
    ["Do I need an account to book a table?", "No — you can book as a guest in under a minute. Creating a free account just saves your details so booking is even faster next time."],
    ["How far ahead should I book?", "Weekends and evenings fill up quickly, so booking a day or two ahead is wise. Same-day tables are often available — try the booking page."],
    ["What are your opening hours?", "We're open every day — check the live hours on this page or call us and we'll confirm. Last orders are about 30 minutes before closing."],
    ["Is there outdoor seating?", "Yes — we have cooled terrace seating, weather permitting. Choose 'Terrace' when booking, or ask staff on arrival."],
    ["Can I bring my laptop and work here?", "Absolutely — Fasana is part café, part bookstore, and many guests settle in with a book or laptop. We just ask that you order something during busy hours."],
    ["Do you cater for kids and families?", "Yes — we have a dedicated kids' menu, high chairs, and a family-friendly atmosphere. Books are also available to browse while you wait."],
    ["Is there parking?", "Yes, ample parking is available in the Bahria Town commercial area right outside."],
    ["Can I order delivery?", "Yes — find us on foodpanda for delivery and takeaway across Lahore."],
    ["Do you host private events or birthday bookings?", "We'd love to host you. Message us through the contact page or on WhatsApp with your date, group size and occasion."],
    ["Is the menu prices-inclusive of taxes?", "All prices shown are in PKR. A 10% sales tax applies as per government regulations."],
  ];
  return (
    <>
      <PageHeader eyebrow="Good to know" title="Questions, answered" intro="Everything about booking, visiting and ordering at Fasana.">
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/reserve" className="btn-primary">Book a table</Link>
          <Link href="/contact" className="btn-ghost">Still curious? Ask us</Link>
        </div>
      </PageHeader>
      <div className="container-x max-w-3xl pb-24">
        <div className="divide-y divide-line rounded-3xl border border-line bg-sheet px-6 sm:px-8">
          {faqs.map(([q, a], i) => (
            <details key={q} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold transition-colors hover:text-ember [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-lg font-light text-ink transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Something else on your mind? <Link href={`/contact`} className="font-semibold text-ember hover:underline">Send us a message</Link> or call {s.phone}.
        </p>
      </div>
    </>
  );
}
