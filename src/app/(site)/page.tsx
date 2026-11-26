import Link from "next/link";
import { getFeatured, getHighlights, getHours, getSettings } from "@/lib/data";
import { OpenBadge } from "@/components/open-badge";
import { HoursList } from "@/components/hours-list";
import { MenuEntry } from "@/components/menu-entry";
import { MapEmbed } from "@/components/map-embed";
import { SectionImage } from "@/components/section-image";
import { PhotoStrip } from "@/components/photo-strip";
import { Reveal } from "@/components/reveal";
import { RestaurantJsonLd } from "@/components/json-ld";
import { Phone, Star, iconFor } from "@/components/icons";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [s, hours, highlights, featured] = await Promise.all([getSettings(), getHours(), getHighlights(), getFeatured()]);
  const tel = s.phone.replace(/\s/g, "");
  const gallery = s.galleryImages.split("\n").filter(Boolean);
  const foodPhoto = gallery[1] || s.storyImage;

  return (
    <>
      <RestaurantJsonLd s={s} hours={hours} url={siteUrl} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-glow blur-3xl" />
        <div className="container-x relative grid items-center gap-14 pb-16 pt-8 md:grid-cols-[1.15fr_1fr] md:pb-24 md:pt-12">
          <div>
            <p lang="ur" dir="rtl" className="anim-ink text-left font-urdu text-[6.5rem] leading-[1.6] text-ink sm:text-[9rem] lg:text-[10.5rem]" aria-hidden>
              فسانہ
            </p>
            <p className="anim-rise mt-1 text-sm text-muted">
              <span className="font-serif text-lg text-ink">fasāna</span>, Urdu for a tale worth retelling
            </p>
            <h1 className="anim-rise mt-7 max-w-xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{s.heroTitle}</h1>
            <p className="anim-rise mt-6 max-w-[50ch] text-lg leading-relaxed text-muted">{s.heroSubtitle}</p>
            <div className="anim-rise mt-9 flex flex-wrap items-center gap-3">
              <Link href="/reserve" className="btn-primary px-7 py-3.5 text-base shadow-[0_12px_30px_-12px_rgba(227,157,38,.8)] transition-transform hover:-translate-y-0.5">Book a table</Link>
              <Link href="/menu" className="btn-ghost px-7 py-3.5 text-base transition-transform hover:-translate-y-0.5">See the menu</Link>
            </div>
          </div>

          <div className="anim-rise relative mx-auto w-full max-w-md md:mx-0 md:justify-self-end">
            <SectionImage
              src={s.heroImage}
              alt="Coffee and a book under a warm lamp"
              variant="hero"
              priority
              sizes="(min-width: 768px) 448px, 90vw"
              className="aspect-[4/5] rounded-t-[999px] rounded-b-[2rem] shadow-[0_40px_80px_-40px_rgba(22,33,59,.55)]"
            />
            {s.reserveImage && (
              <SectionImage
                src={s.reserveImage}
                alt=""
                variant="reserve"
                sizes="160px"
                className="absolute -left-8 bottom-24 hidden h-36 w-36 rounded-full border-[6px] border-paper shadow-xl sm:block lg:-left-14 lg:h-44 lg:w-44"
              />
            )}
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-line bg-sheet/95 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(22,33,59,.5)] backdrop-blur">
              <OpenBadge hours={hours} />
              {s.googleRating > 0 && (
                <a href={s.mapsUrl} target="_blank" rel="noopener" className="mt-1.5 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                  <Star className="h-4 w-4 fill-lamp text-lamp-2" />
                  {s.googleRating.toFixed(1)} from {s.googleReviews.toLocaleString()} Google reviews
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <PhotoStrip images={gallery} />

      {/* Favourites */}
      {featured.length > 0 && (
        <section className="container-x py-20 md:py-28" aria-labelledby="favourites">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-24 lg:self-start">
              <h2 id="favourites" className="text-5xl leading-[1.02] sm:text-6xl">What people come back for</h2>
              <p className="mt-4 max-w-sm text-muted">The dishes regulars order again and again.</p>
              <SectionImage src={foodPhoto} alt="A plate from the kitchen" variant="story" sizes="(min-width: 1024px) 460px, 100vw" className="mt-8 aspect-[4/3] rounded-[2rem]" />
            </Reveal>
            <Reveal delay={120}>
              <div className="divide-y divide-line border-y border-ink">
                {featured.map((item) => <MenuEntry key={item.id} item={item} note={item.category.name} />)}
              </div>
              <Link href="/menu" className="btn-dark mt-8 px-7 py-3.5 transition-transform hover:-translate-y-0.5">Read the full menu</Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* The place */}
      <section className="bg-tint" aria-labelledby="place">
        <div className="container-x grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <SectionImage src={s.storyImage} alt="Books stacked on a café table" variant="story" sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3] rounded-[2rem]" />
          </Reveal>
          <Reveal delay={120}>
            <h2 id="place" className="text-5xl leading-[1.02] sm:text-6xl">Part café, part bookstore.</h2>
            <ul className="mt-9 space-y-6">
              {highlights.map((h) => {
                const Icon = iconFor(h.icon);
                return (
                  <li key={h.id} className="flex gap-4">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sheet text-ember shadow-sm"><Icon className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-sans text-base font-semibold">{h.title}</h3>
                      <p className="mt-0.5 text-muted">{h.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link href="/about" className="mt-9 inline-block text-sm font-semibold underline decoration-lamp decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink">Read our story</Link>
          </Reveal>
        </div>
      </section>

      {/* Visit */}
      <section className="bg-ink text-mist" aria-labelledby="visit">
        <div className="container-x grid gap-10 py-20 md:py-24 lg:grid-cols-[1fr_1.35fr]">
          <Reveal>
            <h2 id="visit" className="text-5xl sm:text-6xl">Come by tonight</h2>
            <p className="mt-4 max-w-sm text-mist/70">{s.address}</p>
            <div className="mt-8"><HoursList hours={hours} dark /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={s.mapsUrl} target="_blank" rel="noopener" className="btn-primary">Get directions</a>
              <a href={`tel:${tel}`} className="btn-outline-light"><Phone className="h-4 w-4" />Call {s.phone}</a>
            </div>
          </Reveal>
          <MapEmbed query={s.mapEmbedQuery || `${s.latitude},${s.longitude}`} title={`Map showing ${s.name}`} />
        </div>
      </section>

      {/* Booking */}
      <section className="container-x py-20 md:py-28">
        <Reveal>
          <div className="grid items-stretch overflow-hidden rounded-[2rem] bg-sage text-white md:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-14">
              <h2 className="max-w-lg text-5xl leading-[1.02] sm:text-6xl">Coming as a family, or with friends?</h2>
              <p className="mt-4 max-w-md text-lg text-white/85">Tell us when, and we&apos;ll have a table waiting indoors or on the cooled terrace.</p>
              <Link href="/reserve" className="btn mt-9 bg-sheet px-7 py-3.5 text-base text-ink transition-transform hover:-translate-y-0.5">Book a table</Link>
            </div>
            <SectionImage src={s.reserveImage} alt="Coffee and a book on a marble table" variant="reserve" sizes="(min-width: 768px) 480px, 100vw" className="min-h-64" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
