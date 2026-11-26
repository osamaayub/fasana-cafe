"use client";

import { useEffect, useState } from "react";
import type { OpeningHour } from "@/lib/types";
import { DAYS, lahoreNow, to12h } from "@/lib/format";

export function HoursList({ hours, dark = false }: { hours: OpeningHour[]; dark?: boolean }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(lahoreNow().day), []);
  return (
    <ul className="text-[15px]">
      {hours.map((h) => {
        const isToday = h.dayOfWeek === today;
        return (
          <li
            key={h.dayOfWeek}
            className={`flex justify-between gap-4 border-b py-2.5 last:border-0 ${dark ? "border-mist/10" : "border-line"} ${isToday ? "font-semibold" : dark ? "text-mist/70" : "text-muted"}`}
          >
            <span>{DAYS[h.dayOfWeek]}{isToday && <span className="ml-2 rounded-full bg-lamp px-2 py-0.5 text-xs font-semibold text-ink">Today</span>}</span>
            <span className="tabular-nums">{h.closed ? "Closed" : `${to12h(h.opensAt)} to ${to12h(h.closesAt)}`}</span>
          </li>
        );
      })}
    </ul>
  );
}
