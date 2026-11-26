"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl sm:text-7xl">The kettle boiled over</h1>
      <p className="mt-3 max-w-sm text-muted">Something went wrong on our end. Give it another pour.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary px-7 py-3">Try again</button>
        <Link href="/" className="btn-ghost px-7 py-3">Back home</Link>
      </div>
    </div>
  );
}
