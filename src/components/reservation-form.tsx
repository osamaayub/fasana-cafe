"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitReservation } from "@/app/actions";
import type { FormState } from "@/lib/validation";
import { Field, Honeypot, Submit, SuccessBox, useLiveErrors } from "./form-bits";

const initial: FormState = { ok: false };

const lahoreDate = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date(Date.now() + offsetDays * 864e5));

const lahoreMinutes = () => {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const [h, m] = p.split(":").map(Number);
  return h * 60 + m;
};

/** 30-minute slots from opening until the last seating. */
function slots(open = "10:00", lastSeating = "23:30") {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out: string[] = [];
  for (let m = toMin(open); m <= toMin(lastSeating); m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
}

const label12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

export function ReservationForm() {
  const [key, setKey] = useState(0);
  return <Inner key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useActionState(submitReservation, initial);
  const v = state.values ?? {};
  const { e, onInput } = useLiveErrors(state.errors);
  const aria = (n: string) => (e[n] ? { "aria-invalid": true as const, "aria-describedby": `${n}-error` } : {});

  const today = lahoreDate(0);
  const tomorrow = lahoreDate(1);
  const [date, setDate] = useState(v.date ?? today);
  const [guests, setGuests] = useState(Number(v.guests ?? 2));
  const [seating, setSeating] = useState(v.seating ?? "any");

  const times = useMemo(() => {
    const all = slots();
    if (date !== today) return all;
    const now = lahoreMinutes() + 30; // at least 30 minutes' notice
    return all.filter((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) >= now);
  }, [date, today]);
  const [time, setTime] = useState(v.time ?? "");

  // Signed-in guests: prefill from their profile (the page itself is cached, so fetch on the client)
  const [me, setMe] = useState<{ name: string; phone: string; email: string; seatingPref: string } | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!document.cookie.includes("fasana_name=")) return setChecked(true);
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then(({ user }) => {
        if (user) {
          setMe(user);
          if (!v.seating && user.seatingPref) setSeating(user.seatingPref);
        }
      })
      .finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chosenTime = times.includes(time) ? time : times.find((t) => t >= "19:30") ?? times[0] ?? "";

  if (state.ok) return <SuccessBox title="Request received" message={state.message} onReset={onReset} actionLabel="Make another booking" />;

  const chip = (on: boolean) =>
    `rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${on ? "bg-ink text-mist" : "bg-sheet text-ink ring-1 ring-line hover:ring-ink/40"}`;

  return (
    <form action={action} onInput={onInput} className="relative space-y-7" noValidate>
      <Honeypot />
      {state.message && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</p>}

      {/* When */}
      <fieldset>
        <legend className="label">Day</legend>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={chip(date === today)} onClick={() => setDate(today)} aria-pressed={date === today}>Today</button>
          <button type="button" className={chip(date === tomorrow)} onClick={() => setDate(tomorrow)} aria-pressed={date === tomorrow}>Tomorrow</button>
          <label className="relative">
            <span className="sr-only">Pick another date</span>
            <input
              type="date" name="date" min={today} value={date} onChange={(ev) => setDate(ev.target.value)}
              className={`input w-auto rounded-full py-2 ${date !== today && date !== tomorrow ? "border-ink" : ""}`} {...aria("date")}
            />
          </label>
        </div>
        {e.date && <p id="date-error" className="field-error" role="alert">{e.date}</p>}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Time" name="time" error={e.time}>
          {times.length ? (
            <select id="time" name="time" value={chosenTime} onChange={(ev) => setTime(ev.target.value)} className="input" {...aria("time")}>
              {times.map((t) => <option key={t} value={t}>{label12(t)}</option>)}
            </select>
          ) : (
            <p className="rounded-xl bg-mist px-4 py-3 text-sm">We&apos;re closing soon. Pick tomorrow or call us.</p>
          )}
        </Field>
        <div>
          <span className="label" id="guests-label">Guests</span>
          <div className="flex items-center gap-2" role="group" aria-labelledby="guests-label">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-12 w-12 rounded-full bg-sheet text-xl ring-1 ring-line hover:ring-ink/40" aria-label="Fewer guests">−</button>
            <input name="guests" type="number" min={1} max={30} value={guests} onChange={(ev) => setGuests(Math.min(30, Math.max(1, Number(ev.target.value) || 1)))} className="input w-20 text-center text-lg font-semibold" aria-label="Number of guests" {...aria("guests")} />
            <button type="button" onClick={() => setGuests((g) => Math.min(30, g + 1))} className="h-12 w-12 rounded-full bg-sheet text-xl ring-1 ring-line hover:ring-ink/40" aria-label="More guests">+</button>
          </div>
          {e.guests && <p id="guests-error" className="field-error" role="alert">{e.guests}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="label">Where would you like to sit?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { v: "any", t: "Wherever’s free", d: "Fastest to confirm" },
            { v: "indoor", t: "Indoors", d: "Near the bookshelves" },
            { v: "outdoor", t: "Terrace", d: "Air-conditioned outdoor seating" },
          ].map((o) => (
            <label key={o.v} className={`cursor-pointer rounded-2xl p-4 ring-1 transition-colors ${seating === o.v ? "bg-ink text-mist ring-ink" : "bg-sheet ring-line hover:ring-ink/40"}`}>
              <input type="radio" name="seating" value={o.v} checked={seating === o.v} onChange={() => setSeating(o.v)} className="sr-only" />
              <span className="block font-semibold">{o.t}</span>
              <span className={`mt-0.5 block text-sm ${seating === o.v ? "text-mist/70" : "text-muted"}`}>{o.d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Who */}
      {checked && !me && (
        <p className="rounded-xl bg-mist px-4 py-3 text-sm">
          <Link href="/signin?next=/reserve" className="font-semibold underline">Sign in</Link> to fill this in automatically and keep track of your bookings.
        </p>
      )}
      <div className="grid gap-6 border-t border-line pt-7 sm:grid-cols-2" key={me ? "me" : "guest"}>
        <Field label="Your name" name="name" error={e.name}>
          <input id="name" name="name" required autoComplete="name" defaultValue={v.name ?? me?.name} className="input" {...aria("name")} />
        </Field>
        <Field label="Phone or WhatsApp" name="phone" error={e.phone} hint="We’ll confirm on this number">
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03xx xxxxxxx" defaultValue={v.phone ?? me?.phone} className="input" {...aria("phone")} />
        </Field>
        <Field label="Email (optional)" name="email" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email ?? me?.email} className="input" {...aria("email")} />
        </Field>
        <Field label="Anything we should know? (optional)" name="notes" error={e.notes}>
          <input id="notes" name="notes" placeholder="Birthday, high chair, allergies" defaultValue={v.notes} className="input" />
        </Field>
      </div>

      <div>
        <Submit pendingText="Sending your request…">Request a table for {guests}</Submit>
        <p className="mt-3 text-center text-sm text-muted">Your table is confirmed when we call or message you back.</p>
      </div>
    </form>
  );
}
