import Image from "next/image";
import Link from "next/link";
import { getFeatured, getHighlights, getHours, getMenu, getSettings } from "@lib/data";
import { OpenBadge } from "@ui/open-badge";
import { HoursList } from "@ui/hours-list";
import { MenuEntry } from "@ui/menu-entry";
import { MenuPreview } from "@ui/menu-preview";
import { NewsletterForm } from "@ui/newsletter-form";
import { ContactForm } from "@ui/contact-form";
import { ReservationForm } from "@ui/reservation-form";
import { MapEmbed } from "@ui/map-embed";
import { directionsLink, mapsLink } from "@lib/maps";
import { SectionImage } from "@ui/section-image";
import { PhotoStrip } from "@ui/photo-strip";
import { Reveal } from "@ui/reveal";
import { RestaurantJsonLd } from "@ui/json-ld";
import { Book, Chat, Clock, Coffee, Phone, Pin, Star, iconFor } from "@ui/icons";
import { siteUrl } from "@lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [s, hours, highlights, featured, menuCats] = await Promise.all([getSettings(), getHours(), getHighlights(), getFeatured(), getMenu()]);
  const dishCount = menuCats.reduce((n, c) => n + c.items.length, 0);
  const igHandle = s.instagram?.split("/").filter(Boolean).pop();
  const tel = s.phone.replace(/\s/g, "");
  const gallery = s.galleryImages.split("\n").filter(Boolean);
  const foodPhoto = gallery[1] || s.storyImage;

  return (
    <>
      <RestaurantJsonLd s={s} hours={hours} url={siteUrl} />

      {/* Hero — editorial split with photo collage */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-48 top-[-10rem] h-[30rem] w-[38rem] rounded-full bg-glow blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-40 bottom-[-12rem] h-[26rem] w-[32rem] rounded-full bg-lamp/15 blur-3xl" />
        <div className="container-x relative grid items-center gap-14 pb-16 pt-10 md:pt-16 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-24">
          {/* Copy */}
          <div className="relative">
            <p className="anim-ink inline-flex items-center gap-2 rounded-full bg-glow px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ember ring-1 ring-ember/15">
              Café · Kitchen · Bookstore — Bahria Town
            </p>
            <h1 className="anim-ink display mt-6 text-6xl leading-[0.98] text-ink sm:text-7xl xl:text-[5.4rem]">{s.heroTitle}</h1>
            <p className="anim-rise mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">{s.heroSubtitle}</p>
            <div className="anim-rise mt-9 flex flex-wrap items-center gap-3">
              <Link href="/reserve" className="btn-primary px-8 py-4 text-base">Book a table</Link>
              <Link href="/menu" className="btn-ghost px-8 py-4 text-base">See the menu</Link>
              {s.foodpandaUrl && (
                <a href={s.foodpandaUrl} target="_blank" rel="noopener" className="group inline-flex items-center gap-1.5 px-2 py-3 text-sm font-semibold text-ember transition-colors hover:text-ink">
                  Order delivery <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </a>
              )}
            </div>
            {featured.some((f) => f.imageUrl) && (
              <div className="anim-rise mt-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Fresh from the kitchen</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {featured.filter((f) => f.imageUrl).slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href="/menu"
                      className="group flex items-center gap-2.5 rounded-2xl border border-line bg-sheet py-1.5 pl-1.5 pr-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-lamp/60 hover:shadow-md"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                        <Image src={item.imageUrl} alt="" fill sizes="40px" quality={90} className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      </span>
                      <span className="text-sm font-medium text-ink">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Pin className="h-4 w-4 text-ember" />{s.address}</span>
              {s.googleRating > 0 && (
                <a href={mapsLink(s)} target="_blank" rel="noopener" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                  <Star className="h-4 w-4 fill-lamp text-lamp-2" />
                  <span className="font-semibold text-ink">{s.googleRating.toFixed(1)}</span> on Google
                </a>
              )}
              {hours.length > 0 && (
                <span className="hidden items-center gap-1.5 sm:flex"><Clock className="h-4 w-4 text-ember" /><OpenBadge hours={hours} /></span>
              )}
            </div>
          </div>

          {/* Photo collage */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-ink-2 shadow-[0_40px_80px_-40px_rgba(22,33,59,.5)]">
              {s.heroImage ? (
                <Image src={s.heroImage} alt={s.name} fill priority sizes="(min-width: 1024px) 46vw, 90vw" quality={90} className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_20%_0%,#2a3a5f_0%,#16213b_55%,#0e1628_100%)]">
                  <Coffee className="h-16 w-16 text-lamp/30" />
                </div>
              )}
            </div>
            {/* accent polaroids */}
            <div className="absolute -left-5 top-8 hidden w-36 rotate-[-6deg] overflow-hidden rounded-2xl border-4 border-sheet shadow-xl sm:block lg:-left-10 lg:w-44">
              <div className="relative aspect-square">
                <Image src={gallery[0] || s.storyImage || s.heroImage} alt="" fill sizes="180px" quality={90} className="object-cover" />
              </div>
            </div>
            <div className="absolute -right-4 bottom-24 hidden w-40 rotate-[5deg] overflow-hidden rounded-2xl border-4 border-sheet shadow-xl sm:block lg:-right-8 lg:w-48">
              <div className="relative aspect-[4/5]">
                <Image src={gallery[2] || s.reserveImage || s.heroImage} alt="" fill sizes="190px" quality={90} className="object-cover" />
              </div>
            </div>
            {/* floating status card */}
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-line bg-sheet/95 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(22,33,59,.5)] backdrop-blur sm:left-8">
              {s.googleRating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-lamp text-lamp-2" />
                  <span className="text-sm font-bold text-ink">{s.googleRating.toFixed(1)}</span>
                </span>
              )}
              {hours.length > 0 && (
                <span className="hidden items-center gap-1.5 border-l border-line pl-3 text-xs font-medium text-muted sm:flex">
                  <Clock className="h-3.5 w-3.5 text-ember" /><OpenBadge hours={hours} />
                </span>
              )}
            </div>
            {/* bookstore chip */}
            <div className="absolute -top-4 right-2 flex items-center gap-2 rounded-full border border-line bg-sheet px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink shadow-lg sm:right-6">
              <Book className="h-4 w-4 text-ember" /> Books inside
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="overflow-hidden border-y border-ink bg-lamp py-3.5 text-night" aria-hidden>
        <div className="marquee flex w-max items-center gap-8 whitespace-nowrap text-sm font-bold uppercase tracking-[0.18em]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8">
              {["Freshly brewed coffee", "Rare & second-hand books", "A quiet corner to read", "Continental kitchen", "Cooled terrace seating", "Open till midnight"].map((t) => (
                <span key={t} className="flex items-center gap-8"><span>{t}</span><span className="text-night/50">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <PhotoStrip images={gallery} />

      {/* Literary pull-quote */}
      <section className="border-y border-line bg-sheet" aria-label="A note from Fasana">
        <div className="container-x py-16 md:py-20">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="font-urdu text-3xl leading-[1.9] text-ink/80" lang="ur" dir="rtl" aria-hidden>کتاب، کافی، اور تھوڑی سی خاموشی</p>
              <p className="mt-5 font-serif text-2xl italic leading-relaxed text-ink/70 sm:text-3xl">“Books, coffee, and a little quiet.”</p>
              <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted">— The Fasana way</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Favourites */}
      {featured.length > 0 && (
        <section className="container-x py-20 md:py-28" aria-labelledby="favourites">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow">Most ordered</p>
              <h2 id="favourites" className="display mt-3 text-5xl sm:text-6xl">What people come back for</h2>
              <span aria-hidden className="heading-rule" />
              <p className="mt-5 max-w-sm text-muted">The dishes regulars order again and again.</p>
              <SectionImage src={foodPhoto} alt="A plate from the kitchen" variant="story" sizes="(min-width: 1024px) 460px, 100vw" className="mt-8 aspect-[4/3] rounded-[2rem]" />
            </Reveal>
            <Reveal delay={120}>
              <div className="divide-y divide-line border-y border-ink">
                {featured.map((item) => <MenuEntry key={item.id} item={item} note={item.category.name} orderUrl={s.foodpandaUrl} />)}
              </div>
              <Link href="/menu" className="btn-dark mt-8 px-7 py-3.5 transition-transform hover:-translate-y-0.5">Read the full menu</Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Menu preview — tabbed tasting flight */}
      {dishCount > 0 && (
        <section className="bg-tint" aria-labelledby="menu-preview">
          <div className="container-x py-20 md:py-28">
            <Reveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">From the kitchen</p>
                  <h2 id="menu-preview" className="display mt-3 text-5xl sm:text-6xl">Explore the menu</h2>
                  <span aria-hidden className="heading-rule" />
                </div>
                <p className="max-w-xs text-sm text-muted">{dishCount} dishes across {menuCats.length} sections — tap any plate for the full story.</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <MenuPreview categories={menuCats} orderUrl={s.foodpandaUrl} />
            </Reveal>
          </div>
        </section>
      )}

      {/* The place */}
      <section aria-labelledby="place">
        <div className="container-x grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <SectionImage src={s.storyImage} alt="Books stacked on a café table" variant="story" sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3] rounded-[2rem]" />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">The place</p>
            <h2 id="place" className="display mt-3 text-5xl sm:text-6xl">Part café, part bookstore.</h2>
            <span aria-hidden className="heading-rule" />
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
            <Link href="/about" className="link-underline mt-9 inline-block text-sm">Read our story</Link>
          </Reveal>
        </div>
      </section>

      {/* Visit */}
      <section className="relative overflow-hidden bg-ink text-mist">
        <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-60" />
        <div className="container-x relative grid gap-10 py-20 md:py-24 lg:grid-cols-[1fr_1.35fr]">
          <Reveal>
            <p className="eyebrow !text-mist/70">Visit us</p>
            <h2 id="visit" className="display mt-3 text-5xl sm:text-6xl">Come by tonight</h2>
            <span aria-hidden className="heading-rule !bg-mist/25" />
            <p className="mt-5 max-w-sm text-mist/70">{s.address}</p>
            <div className="mt-8"><HoursList hours={hours} dark /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={directionsLink(s)} target="_blank" rel="noopener" className="btn-primary">Get directions</a>
              <a href={`tel:${tel}`} className="btn-outline-light"><Phone className="h-4 w-4" />Call {s.phone}</a>
            </div>
          </Reveal>
          <MapEmbed query={s.mapEmbedQuery || `${s.latitude},${s.longitude}`} title={`Map showing ${s.name}`} />
        </div>
      </section>

      {/* Instagram + newsletter */}
      <section className="border-y border-line bg-sheet">
        <div className={`container-x grid gap-10 py-16 md:py-20 ${s.instagram ? "lg:grid-cols-2 lg:items-center" : ""}`}>
          {s.instagram && (
            <Reveal>
              <p className="eyebrow">Shared moments</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">Follow the mornings</h2>
              <span aria-hidden className="heading-rule" />
              <p className="mt-5 max-w-sm text-muted">
                Tag {igHandle ? `@${igHandle}` : "us"} in your Fasana moments — flat whites, quiet corners and the occasional book recommendation.
              </p>
              <a href={s.instagram} target="_blank" rel="noopener" className="btn-dark mt-7 px-6 py-3">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
                @{igHandle ?? "fasanabyreadings"}
              </a>
            </Reveal>
          )}
          <Reveal delay={120} className={s.instagram ? "" : "mx-auto w-full max-w-2xl"}>
            <div className="rounded-[2rem] border border-line bg-paper p-7 sm:p-9">
              <p className="eyebrow">Stay in the loop</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">Good coffee. Great news.</h2>
              <p className="mt-4 text-muted">New dishes, quiet-hour events and the occasional giveaway — straight to your inbox.</p>
              <div className="mt-7"><NewsletterForm /></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Get in touch — working contact form */}
      <section className="bg-tint" aria-labelledby="get-in-touch">
        <div className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">Get in touch</p>
            <h2 id="get-in-touch" className="display mt-3 text-5xl sm:text-6xl">Say hello</h2>
            <span aria-hidden className="heading-rule" />
            <p className="mt-5 max-w-sm text-muted">Questions, private events, feedback or a book you&apos;re hunting for. Pick whatever&apos;s easiest — we read everything.</p>
            <ul className="mt-8 space-y-4 text-sm">
              <li><a href={`tel:${tel}`} className="flex items-center gap-3 font-semibold transition-colors hover:text-ember"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sheet text-ember ring-1 ring-line"><Phone className="h-4.5 w-4.5" /></span>{s.phone}</a></li>
              <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-3 font-semibold transition-colors hover:text-ember"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sheet text-ember ring-1 ring-line"><Chat className="h-4.5 w-4.5" /></span>WhatsApp us</a></li>
              <li><a href={mapsLink(s)} target="_blank" rel="noopener" className="flex items-center gap-3 font-semibold transition-colors hover:text-ember"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sheet text-ember ring-1 ring-line"><Pin className="h-4.5 w-4.5" /></span>{s.address}</a></li>
            </ul>
            <Link href="/contact" className="link-underline mt-8 inline-block text-sm">Or use the full contact page</Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="card p-6 sm:p-10">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Booking — live reservation form */}
      <section className="container-x py-20 md:py-28" aria-labelledby="book-table">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">Reservations</p>
            <h2 id="book-table" className="display mt-3 text-5xl sm:text-6xl">Save a seat by the window?</h2>
            <span aria-hidden className="heading-rule" />
            <p className="mt-5 max-w-sm text-muted">Pick a time below — slots update live, and we confirm by call or WhatsApp. For groups over 30, calling is quickest.</p>
            {hours.length > 0 && <p className="mt-6"><OpenBadge hours={hours} /></p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${tel}`} className="btn-ghost"><Phone className="h-4 w-4" />Call {s.phone}</a>
              <Link href="/reserve" className="link-underline self-center text-sm">Full booking page</Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-[1.75rem] border border-line bg-sheet p-6 shadow-[0_30px_60px_-36px_rgba(22,33,59,.35)] sm:p-10">
              <ReservationForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
