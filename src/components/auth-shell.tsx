export function AuthShell({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-glow blur-3xl" />
      <div className="container-x relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-14">
        <div className="w-full max-w-md">
          <h1 className="text-center text-5xl sm:text-6xl">{title}</h1>
          {intro && <p className="mx-auto mt-3 max-w-sm text-center text-muted">{intro}</p>}
          <div className="mt-8 rounded-[1.75rem] border border-line bg-sheet p-6 shadow-[0_30px_60px_-36px_rgba(22,33,59,.35)] sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
