import type { Metadata } from "next";
import Link from "next/link";
import { getHighlights, getSettings } from "@lib/data";
import { PageHeader } from "@ui/page-header";
import { SectionImage } from "@ui/section-image";
import { iconFor } from "@ui/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Our story", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const [s, highlights] = await Promise.all([getSettings(), getHighlights()]);
  const [first, ...rest] = s.about.split(/\n{2,}/);
  return (
    <>
      <PageHeader title="Our story" eyebrow="Since day one" />
      <div className="container-x pb-24">
        <SectionImage
          src={s.storyImage}
          alt={`Inside ${s.name}`}
          variant="story"
          sizes="(min-width: 1152px) 1088px, 100vw"
          className="aspect-[21/9] rounded-[2rem]"
        />
        <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-8 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-mist px-3 py-1.5 font-semibold text-ink">Opened April 2025</span>
              <span className="rounded-full bg-mist px-3 py-1.5 font-semibold text-ink">Above Readings bookstore</span>
              <span className="rounded-full bg-mist px-3 py-1.5 font-semibold text-ink">Bahria Town, Lahore</span>
            </div>
            <p className="font-serif text-3xl leading-snug sm:text-[2.1rem]">{first}</p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
              {rest.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/menu" className="btn-dark px-6 py-3">See the menu</Link>
              <Link href="/reserve" className="btn-ghost px-6 py-3">Book a table</Link>
            </div>
          </div>
          <ul className="space-y-6 lg:border-l lg:border-line lg:pl-10">
            {highlights.map((h) => {
              const Icon = iconFor(h.icon);
              return (
                <li key={h.id} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-glow text-ember ring-1 ring-line"><Icon className="h-5 w-5" /></span>
                  <div>
                    <h2 className="font-sans text-base font-semibold">{h.title}</h2>
                    <p className="mt-0.5 text-muted">{h.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
