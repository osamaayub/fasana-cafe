import Image from "next/image";
import type { MenuItem } from "@lib/types";
import { formatPrice } from "@lib/format";
import { Coffee, Star } from "./icons";

/** Wraps the parts of `text` that match any search term in <mark>. Matching ignores case and accents. */
function Highlight({ text, terms }: { text: string; terms?: string[] }) {
  if (!terms?.length || !text) return <>{text}</>;
  // Accent stripping keeps one character per letter for Latin text, so indexes line up with the original.
  const plain = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (plain.length !== text.length) return <>{text}</>;
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of terms) {
    for (let i = plain.indexOf(t); t && i !== -1; i = plain.indexOf(t, i + t.length)) marks.fill(true, i, i + t.length);
  }
  const out: React.ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marks[i] !== marks[start]) {
      const part = text.slice(start, i);
      out.push(marks[start] ? <mark key={start} className="rounded-[3px] bg-lamp/40 text-inherit">{part}</mark> : part);
      start = i;
    }
  }
  return <>{out}</>;
}

function Price({ price, small }: { price: number | null | undefined; small?: boolean }) {
  return price == null ? (
    <span className="shrink-0 rounded-full border border-dashed border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">Ask staff</span>
  ) : (
    <span className={`shrink-0 rounded-full bg-lamp font-semibold tabular-nums text-night ${small ? "px-2.5 py-0.5 text-sm" : "px-3 py-1"}`}>{formatPrice(price)}</span>
  );
}

/**
 * Menu card. On phones it's a compact row (thumbnail, name, price) so the whole menu is quick to scan;
 * from the small breakpoint up it becomes a photo card. `variant="feature"` keeps the photo card everywhere.
 */
export function MenuCard({
  item,
  note,
  onSelect,
  highlight,
  variant = "list",
}: {
  item: MenuItem;
  note?: string;
  onSelect?: () => void;
  highlight?: string[];
  variant?: "list" | "feature";
}) {
  const row = variant === "list";
  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `${item.name}, ${item.price == null ? "ask staff for price" : formatPrice(item.price)}. View details` : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } } : undefined}
      className={`card group flex h-full overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(22,33,59,.4)] ${row ? "flex-row sm:flex-col" : "flex-col"} ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className={`relative shrink-0 overflow-hidden bg-ink-2 ${row ? "m-3 h-24 w-24 rounded-2xl sm:m-0 sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-none" : "aspect-[16/10]"}`}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" quality={85} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 96px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_20%_0%,#2a3a5f_0%,#16213b_55%,#0e1628_100%)]">
            <Coffee className={`text-lamp/30 transition-transform duration-500 group-hover:scale-110 group-hover:text-lamp/50 ${row ? "h-7 w-7 sm:h-10 sm:w-10" : "h-10 w-10"}`} />
          </div>
        )}
        {item.featured && (
          <span className={`absolute left-3 top-3 items-center gap-1 rounded-full bg-sheet/95 px-2.5 py-1 text-[11px] font-semibold text-ember shadow-sm backdrop-blur ${row ? "hidden sm:inline-flex" : "inline-flex"}`}>
            <Star className="h-3 w-3 fill-current" /> Favourite
          </span>
        )}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${row ? "py-3 pr-4 sm:p-5" : "p-5"}`}>
        <div className={`flex justify-between gap-3 ${row ? "flex-col items-start sm:flex-row" : "items-start"}`}>
          <h3 className={`font-serif leading-snug ${row ? "text-lg sm:text-[1.3rem]" : "text-[1.3rem]"}`}>
            {row && item.featured && <Star aria-label="Favourite" className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5 fill-current text-ember sm:hidden" />}
            <Highlight text={item.name} terms={highlight} />
          </h3>
          {row ? (
            <>
              <span className="hidden sm:mt-1 sm:block"><Price price={item.price} /></span>
            </>
          ) : (
            <span className="mt-1"><Price price={item.price} /></span>
          )}
        </div>
        {item.description && (
          <p className={`mt-1.5 text-sm leading-relaxed text-muted ${row ? "line-clamp-2 sm:mt-2 sm:line-clamp-3" : "mt-2 line-clamp-3"}`}>
            <Highlight text={item.description} terms={highlight} />
          </p>
        )}
        {row && <span className="mt-auto pt-2 sm:hidden"><Price price={item.price} small /></span>}
        {note && <p className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wider text-ember">{note}</p>}
      </div>
    </article>
  );
}
