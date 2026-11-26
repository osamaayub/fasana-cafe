export function MapEmbed({ query, title }: { query: string; title: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className="relative min-h-80 flex-1 overflow-hidden rounded-3xl bg-ink-2">
      <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full grayscale-[35%] contrast-[1.05]" />
    </div>
  );
}
