import Image from "next/image";
import type { MenuItem } from "@lib/types";
import { formatPrice, parseOptions } from "@lib/format";
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

/** Price pill. Never wraps; shows "from" when the dish comes in several sizes or proteins. */
export function Price({ price, from, small }: { price: number | null | undefined; from?: boolean; small?: boolean }) {
  return price == null ? (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">Ask staff</span>
  ) : (
    <span className={`inline-flex shrink-0 items-baseline gap-1 whitespace-nowrap rounded-full bg-lamp font-semibold tabular-nums text-night ${small ? "px-2.5 py-0.5 text-sm" : "px-3 py-1 text-[15px]"}`}>
      {from && <span className="text-[11px] font-medium uppercase tracking-wide text-night/70">from</span>}
      {formatPrice(price)}
    </span>
  );
}

/**
 * Menu card. On phones it's a compact row (thumbnail, name, price) so the whole menu is quick to scan;
 * from the small breakpoint up it becomes a photo card. `variant="feature"` keeps the photo card everywhere.
 * The name stays on one line on photo cards (the full name is in the tooltip and the details pop-up).
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
  const opts = parseOptions(item.options);
  const priceLine = (small?: boolean) => (
    <div className="flex min-w-0 items-center gap-2">
      <Price price={item.price} from={opts.length > 1} small={small} />
      {opts.length > 1 && <span className="truncate text-xs text-muted">{opts.map((o) => o.label).join(" · ")}</span>}
    </div>
  );

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `${item.name}, ${item.price == null ? "ask staff for price" : `${opts.length > 1 ? "from " : ""}${formatPrice(item.price)}`}. View details` : undefined}
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
        <h3
          title={item.name}
          className={`font-serif leading-snug ${row ? "line-clamp-2 text-lg sm:line-clamp-none sm:truncate sm:text-[1.3rem]" : "truncate text-[1.3rem]"}`}
        >
          {row && item.featured && <Star aria-label="Favourite" className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5 fill-current text-ember sm:hidden" />}
          <Highlight text={item.name} terms={highlight} />
        </h3>
        <div className={row ? "mt-2 hidden sm:block" : "mt-2"}>{priceLine()}</div>
        {item.description && (
          <p className={`text-sm leading-relaxed text-muted ${row ? "mt-1.5 line-clamp-2 sm:mt-3 sm:line-clamp-3" : "mt-3 line-clamp-3"}`}>
            <Highlight text={item.description} terms={highlight} />
          </p>
        )}
        {row && <div className="mt-auto pt-2 sm:hidden">{priceLine(true)}</div>}
        {note && <p className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wider text-ember">{note}</p>}
      </div>
    </article>
  );
}
