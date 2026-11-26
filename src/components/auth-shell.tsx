import Image from "next/image";
import { Book, Calendar, Coffee, Shield, Star } from "./icons";
import { getSettings } from "@lib/data";

const perks = [
  { icon: Calendar, text: "Book a table in a few taps" },
  { icon: Book, text: "Your bookings and favourites, all in one place" },
  { icon: Star, text: "Member offers and new dishes, when they land" },
];

export async function AuthShell({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const s = await getSettings();
  const photos = [s.heroImage, s.storyImage, s.reserveImage, ...s.galleryImages.split("\n").filter(Boolean)]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

  return (
    <div className="grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.02fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink text-mist lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-lamp/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-sage/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-10 opacity-[0.06]">
          <Coffee className="h-72 w-72" />
        </div>

        <p lang="ur" dir="rtl" className="relative font-urdu text-[6rem] leading-[1.7] text-mist/90 xl:text-[7rem]" aria-hidden>
          فسانہ
        </p>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lamp">Fasana Café</p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-[1.1] text-sheet xl:text-5xl">
            A table, a book, and a cup that remembers you.
          </h2>
          <ul className="mt-9 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5 text-sm text-mist/75">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist/10 text-lamp">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-10 flex items-center gap-2 text-xs text-mist/50">
            <Shield className="h-3.5 w-3.5" /> Your details stay private. We only use them for bookings.
          </p>

          {/* Real café photos */}
          {photos.length > 0 && (
            <div className="mt-10 flex gap-3">
              {photos.map((src, i) => (
                <div
                  key={src}
                  className={`relative h-28 flex-1 overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-mist/15 ${i === 1 ? "-translate-y-3" : ""}`}
                >
                  <Image src={src} alt="" quality={90} fill sizes="(min-width: 1024px) 180px, 0px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Form side */}
      <div className="relative flex items-center justify-center overflow-hidden px-5 py-14 sm:px-10 lg:py-10">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[44rem] -translate-x-1/2 rounded-full bg-glow blur-3xl" />
        <div className="relative w-full max-w-md">
          {photos[0] && (
            <div className="relative mx-auto mb-6 aspect-[2/1] w-40 overflow-hidden rounded-2xl shadow-lg lg:hidden">
              <Image src={photos[0]} alt="" quality={90} fill sizes="160px" className="object-cover" />
            </div>
          )}
          <p lang="ur" dir="rtl" className="mb-4 text-center font-urdu text-4xl leading-[1.6] text-ink/80 lg:hidden" aria-hidden>
            فسانہ
          </p>
          <h1 className="text-center text-5xl sm:text-6xl">{title}</h1>
          {intro && <p className="mx-auto mt-3 max-w-sm text-center text-muted">{intro}</p>}
          <div className="mt-8 rounded-[1.75rem] border border-line bg-sheet p-6 shadow-[0_30px_60px_-36px_rgba(22,33,59,.35)] sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
