/** Consistent section intro: eyebrow label + balanced serif heading + optional supporting text. */
export function SectionHeading({ eyebrow, title, intro, dark = false, align = "left" }: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className={`eyebrow ${dark ? "text-lamp" : ""}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-4xl leading-[1.05] sm:text-5xl ${dark ? "text-mist" : ""}`}>{title}</h2>
      <span aria-hidden className={`heading-rule ${align === "center" ? "mx-auto" : ""} ${dark ? "bg-mist/25" : ""}`} />
      {intro && <div className={`mt-5 text-lg leading-relaxed ${dark ? "text-mist/70" : "text-muted"}`}>{intro}</div>}
    </div>
  );
}
