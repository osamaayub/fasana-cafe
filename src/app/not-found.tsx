import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <h1 className="text-6xl">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
