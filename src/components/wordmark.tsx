export function Wordmark({ name, className = "", tone = "light" }: { name: string; className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={`inline-flex items-baseline gap-2.5 ${className}`}>
      <span lang="ur" dir="rtl" className={`font-urdu text-[1.35rem] leading-none ${tone === "dark" ? "text-lamp" : "text-lamp-2"}`} aria-hidden>فسانہ</span>
      <span className="font-serif text-xl leading-none">{name}</span>
    </span>
  );
}
