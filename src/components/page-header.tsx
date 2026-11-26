export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="text-ink">
      <div className="container-x py-14 md:py-20">
        <h1 className="max-w-3xl text-6xl leading-[1.02] sm:text-7xl">{title}</h1>
        {intro && <p className="mt-4 max-w-[58ch] text-lg text-muted">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
