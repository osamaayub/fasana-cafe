"use client";

import { useState } from "react";
import { Calendar } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");
const icsTime = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Downloads a 2-hour calendar event. Pakistan is UTC+5 year-round (no DST). */
export function AddToCalendar({ name, date, time, guests, seating }: { name: string; date: string; time: string; guests: number; seating: string }) {
  const [added, setAdded] = useState(false);
  const add = () => {
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    const start = new Date(Date.UTC(y, m - 1, d, h - 5, min));
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const seat = seating === "any" ? "" : seating === "outdoor" ? " (terrace)" : " (indoors)";
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fasana Cafe//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${date}-${time}-${guests}@fasana`,
      `DTSTAMP:${icsTime(new Date())}`,
      `DTSTART:${icsTime(start)}`,
      `DTEND:${icsTime(end)}`,
      `SUMMARY:${esc(`Fasana Café — table for ${guests}${seat}`)}`,
      `DESCRIPTION:${esc(`${name}'s booking at Fasana Café, Bahria Town. ${guests} ${guests === 1 ? "guest" : "guests"}.`)}`,
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fasana-${date}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };
  return (
    <button type="button" onClick={add} className="btn-ghost px-4 py-2 text-xs">
      <Calendar className="h-3.5 w-3.5" />{added ? "Saved!" : "Add to calendar"}
    </button>
  );
}
