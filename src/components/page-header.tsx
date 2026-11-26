export function PageHeader({ title, intro, eyebrow, children }: { title: string; intro?: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden text-ink">
      <div aria-hidden className="glow-wash -right-32 -top-32 h-96 w-[36rem]" />
      <div className="container-x relative py-14 md:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`display max-w-3xl ${eyebrow ? "mt-4" : ""} text-6xl sm:text-7xl`}>{title}</h1>
        {intro && <p className="mt-4 max-w-[58ch] text-lg text-muted">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
