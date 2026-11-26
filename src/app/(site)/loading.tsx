export default function Loading() {
  return (
    <div className="container-x animate-pulse py-16" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-24 rounded-full bg-mist" />
      <div className="mt-6 h-14 w-2/3 rounded-2xl bg-mist" />
      <div className="mt-4 h-4 w-1/2 rounded-full bg-mist" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-3xl bg-mist/70" />
        ))}
      </div>
    </div>
  );
}
