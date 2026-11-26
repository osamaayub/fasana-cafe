"use client";

import { useEffect, useState } from "react";
import type { OpeningHour } from "@/lib/types";
import { isOpenNow, lahoreNow, to12h } from "@/lib/format";

/** Live status, computed in the browser so cached pages stay accurate. */
export function OpenBadge({ hours }: { hours: OpeningHour[] }) {
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const open = isOpenNow(hours);
      const { day } = lahoreNow();
      const todayH = hours.find((h) => h.dayOfWeek === day);
      let label = "Closed now";
      if (open) {
        // if we're in yesterday's after-midnight window, show yesterday's closing time
        const nowMin = lahoreNow().minutes;
        const y = hours.find((h) => h.dayOfWeek === (day + 6) % 7);
        const closing = todayH && nowMin >= toMin(todayH.opensAt) ? todayH.closesAt : y?.closesAt ?? "00:00";
        label = `Open now, until ${to12h(closing).toLowerCase()}`;
      } else if (todayH && !todayH.closed && lahoreNow().minutes < toMin(todayH.opensAt)) {
        label = `Opens today at ${to12h(todayH.opensAt)}`;
      }
      setState({ open, label });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return (
    <span className="inline-flex min-h-6 items-center gap-2 text-sm font-medium" aria-live="polite">
      {state && (
        <>
          <span className="relative flex h-2.5 w-2.5">
            {state.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state.open ? "bg-emerald-500" : "bg-stone-400"}`} />
          </span>
          {state.label}
        </>
      )}
    </span>
  );
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
