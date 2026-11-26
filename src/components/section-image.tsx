import Image from "next/image";

type Variant = "hero" | "story" | "reserve";

/**
 * Shows the café's photo when one is set in admin, otherwise a designed placeholder
 * in the brand palette (book spines under a lamp), so the layout never looks empty.
 */
export function SectionImage({
  src, alt, variant, priority = false, sizes, className = "",
}: { src?: string; alt: string; variant: Variant; priority?: boolean; sizes: string; className?: string }) {
  return (
    <div className={`group relative overflow-hidden ${src ? "bg-tint" : "bg-ink-2"} ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
      ) : (
        <Placeholder variant={variant} />
      )}
    </div>
  );
}

const spines = [
  { w: 9, h: 62, c: "#f0b44c" }, { w: 6, h: 70, c: "#5f7f6b" }, { w: 11, h: 56, c: "#e7ebe2" },
  { w: 7, h: 74, c: "#c9873a" }, { w: 10, h: 64, c: "#36476b" }, { w: 6, h: 58, c: "#f0b44c" },
  { w: 12, h: 68, c: "#8fa894" }, { w: 8, h: 52, c: "#e7ebe2" }, { w: 9, h: 72, c: "#5f7f6b" },
];

function Placeholder({ variant }: { variant: Variant }) {
  const shelfY = variant === "story" ? [38, 78] : [78];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`glow-${variant}`} cx="50%" cy={variant === "hero" ? "18%" : "10%"} r="70%">
          <stop offset="0" stopColor="#f0b44c" stopOpacity=".55" />
          <stop offset=".45" stopColor="#f0b44c" stopOpacity=".08" />
          <stop offset="1" stopColor="#16213b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="#1b2846" />
      <rect width="100" height="100" fill={`url(#glow-${variant})`} />
      {/* pendant lamp */}
      <line x1="50" y1="0" x2="50" y2={variant === "hero" ? 14 : 6} stroke="#e7ebe2" strokeOpacity=".4" strokeWidth=".4" />
      <path d={variant === "hero" ? "M42 20 Q50 10 58 20 Z" : "M44 11 Q50 4 56 11 Z"} fill="#f0b44c" />
      {shelfY.map((y, si) => {
        let x = variant === "reserve" ? 22 : 8;
        const set = variant === "reserve" ? spines.slice(0, 6) : spines;
        return (
          <g key={y}>
            {set.map((s, i) => {
              const scale = variant === "story" ? 0.42 : 0.5;
              const h = s.h * scale;
              const el = <rect key={i} x={x} y={y - h} width={s.w * (variant === "reserve" ? 0.9 : 0.85)} height={h} rx=".6" fill={s.c} opacity={si ? 0.85 : 1} />;
              x += s.w * (variant === "reserve" ? 0.9 : 0.85) + 0.8;
              return el;
            })}
            <rect x="0" y={y} width="100" height="1.6" fill="#0e1628" />
          </g>
        );
      })}
      {variant !== "story" && (
        /* cup on the shelf */
        <g transform={variant === "reserve" ? "translate(64 64.5)" : "translate(74 64.5)"} fill="none" stroke="#e7ebe2" strokeWidth="1.1" strokeLinecap="round">
          <path d="M0 4h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5z" fill="#e7ebe2" fillOpacity=".12" />
          <path d="M10 6h1.5a2 2 0 0 1 0 4H10" />
          <path d="M3 1.5c0-1 1-1 1-2M6.5 1.5c0-1 1-1 1-2" strokeOpacity=".6" />
        </g>
      )}
    </svg>
  );
}
