import Image from "next/image";

/** Endless, slowly moving strip of photos. Pauses on hover; static for reduced-motion users. */
export function PhotoStrip({ images }: { images: string[] }) {
  if (images.length < 3) return null;
  const loop = [...images, ...images];
  return (
    <section aria-label="Photos" className="overflow-hidden py-4">
      <div className="marquee flex w-max gap-4">
        {loop.map((src, i) => (
          <div
            key={i}
            aria-hidden={i >= images.length}
            className={`relative h-56 shrink-0 overflow-hidden rounded-3xl bg-tint sm:h-72 ${i % 3 === 1 ? "w-56 sm:w-72" : "w-72 sm:w-[26rem]"}`}
          >
            <Image src={src} alt="" fill sizes="420px" className="object-cover transition-transform duration-700 hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  );
}
