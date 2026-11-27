"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-11-27" -> local Date at midnight (the picker works in local dates; we only care about the day). */
const toDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Date field that opens a calendar. Value, min and max are "YYYY-MM-DD" strings so the
 * caller decides the time zone (the booking form uses Lahore time).
 */
export function DateField({
  value,
  min,
  max,
  onChange,
  label,
  invalid,
  describedBy,
}: {
  value: string;
  min: string;
  max: string;
  onChange: (v: string) => void;
  label: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  // Close on outside click or Escape, and hand focus back to the field.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = toDate(value);
  const pretty = selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const short = selected.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={`${label}: ${pretty}. Change date`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`input flex w-full items-center gap-3 text-left ${open ? "border-ink/60 ring-4 ring-lamp/25" : ""}`}
      >
        <Calendar className="h-[18px] w-[18px] shrink-0 text-ember" />
        <span className="min-w-0 flex-1 truncate font-medium">
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{pretty}</span>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={`Choose a ${label.toLowerCase()}`}
          className="fasana-rdp fasana-pop absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-line bg-sheet p-3 shadow-[0_24px_48px_-20px_rgba(22,33,59,.45)] sm:right-auto sm:p-4"
        >
          <DayPicker
            mode="single"
            required
            selected={selected}
            onSelect={(d) => {
              if (!d) return;
              onChange(toStr(d));
              setOpen(false);
              buttonRef.current?.focus();
            }}
            defaultMonth={selected}
            startMonth={toDate(min)}
            endMonth={toDate(max)}
            disabled={[{ before: toDate(min) }, { after: toDate(max) }]}
            weekStartsOn={1}
            showOutsideDays
            autoFocus
          />
          <p className="mt-2 px-1 text-xs text-muted">Bookings open up to 3 months ahead.</p>
        </div>
      )}
    </div>
  );
}
