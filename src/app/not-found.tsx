import Link from "next/link";
import { Coffee } from "@ui/icons";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-glow text-ember"><Coffee className="h-7 w-7" /></span>
      <p lang="ur" dir="rtl" className="mt-8 font-urdu text-5xl leading-[1.6] text-ink/70" aria-hidden>فسانہ</p>
      <h1 className="mt-2 text-6xl sm:text-7xl">This page steeped away</h1>
      <p className="mt-3 max-w-sm text-muted">The link might be old, or the page never existed. The coffee, thankfully, is still here.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary px-7 py-3">Back home</Link>
        <Link href="/menu" className="btn-ghost px-7 py-3">See the menu</Link>
      </div>
    </div>
  );
}
