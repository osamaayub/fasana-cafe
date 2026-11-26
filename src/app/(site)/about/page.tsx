import type { Metadata } from "next";
import Link from "next/link";
import { getHighlights, getSettings } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { SectionImage } from "@/components/section-image";
import { iconFor } from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Our story", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const [s, highlights] = await Promise.all([getSettings(), getHighlights()]);
  const [first, ...rest] = s.about.split(/\n{2,}/);
  return (
    <>
      <PageHeader title="Our story" />
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
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-ember" />
                  <div>
                    <h2 className="font-sans text-base font-semibold">{h.title}</h2>
                    <p className="text-muted">{h.description}</p>
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
