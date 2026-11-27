"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitReservation } from "@actions/public";
import type { FormState } from "@lib/validation";
import { Alert, Field, Honeypot, IconInput, Submit, SuccessBox, useLiveErrors } from "./form-bits";
import { Book, Check, Mail, Phone, Star, Sun, User } from "./icons";
import { DateField } from "./date-field";

const initial: FormState = { ok: false };
const TZ = "Asia/Karachi";
const BOOK_AHEAD_DAYS = 90;

const lahoreDate = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Date.now() + offsetDays * 864e5));

const lahoreMinutes = () => {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const [h, m] = p.split(":").map(Number);
  return h * 60 + m;
};

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

/** 30-minute slots from opening until the last seating. */
function slots(open = "10:00", lastSeating = "23:30") {
  const out: string[] = [];
  for (let m = toMin(open); m <= toMin(lastSeating); m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
}

const label12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

const asDate = (d: string) => new Date(`${d}T12:00:00+05:00`);
const fmt = (d: string, o: Intl.DateTimeFormatOptions) => asDate(d).toLocaleDateString("en-GB", { ...o, timeZone: TZ });

const periods = [
  { name: "Daytime", from: 0, to: 17 * 60 },
  { name: "Evening", from: 17 * 60, to: 21 * 60 },
  { name: "Late", from: 21 * 60, to: 24 * 60 },
];

const seatingOptions = [
  { v: "any", t: "Wherever’s free", d: "Fastest to confirm", icon: Star },
  { v: "indoor", t: "Indoors", d: "Near the bookshelves", icon: Book },
  { v: "outdoor", t: "Terrace", d: "Air-conditioned outdoor seating", icon: Sun },
];

export function ReservationForm() {
  const [key, setKey] = useState(0);
  return <Inner key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Step({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex w-full items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lamp text-xs font-bold text-night">{n}</span>
        <span className="min-w-0">
          <span className="block font-serif text-2xl leading-7">{title}</span>
          {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
        </span>
      </legend>
      <div className="mt-5 space-y-6">{children}</div>
    </fieldset>
  );
}

function SubLabel({ children, id }: { children: React.ReactNode; id?: string }) {
  return <p id={id} className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>;
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useActionState(submitReservation, initial);
  const v = state.values ?? {};
  const { e, onInput } = useLiveErrors(state.errors);
  const aria = (n: string) => (e[n] ? { "aria-invalid": true as const, "aria-describedby": `${n}-error` } : {});

  const today = lahoreDate(0);
  const tomorrow = lahoreDate(1);
  const lastDay = lahoreDate(BOOK_AHEAD_DAYS);
  const [date, setDate] = useState(v.date ?? today);
  const [guests, setGuests] = useState(Number(v.guests ?? 2));
  const [bigGroup, setBigGroup] = useState(Number(v.guests ?? 2) > 6);
  const [seating, setSeating] = useState(v.seating ?? "any");

  const times = useMemo(() => {
    const all = slots();
    if (date !== today) return all;
    const now = lahoreMinutes() + 30; // at least 30 minutes' notice
    return all.filter((t) => toMin(t) >= now);
  }, [date, today]);
  const [time, setTime] = useState(v.time ?? "");
  const chosenTime = times.includes(time) ? time : times.find((t) => t >= "19:30") ?? times[0] ?? "";

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

  if (state.ok) return <SuccessBox title="Request received" message={state.message} onReset={onReset} actionLabel="Make another booking" />;

  const whenLabel = date === today ? "Today" : date === tomorrow ? "Tomorrow" : fmt(date, { weekday: "short", day: "numeric", month: "short" });

  const pill = (on: boolean) =>
    `transition-[background-color,box-shadow,transform,color] ${on ? "bg-ink text-mist shadow-[0_8px_18px_-10px_rgba(22,33,59,.7)]" : "bg-sheet text-ink ring-1 ring-line hover:-translate-y-0.5 hover:ring-ink/40"}`;

  return (
    <form action={action} onInput={onInput} className="relative space-y-10" noValidate>
      <Honeypot />
      <Alert msg={state.message} />

      {/* 1. When */}
      <Step n="1" title="When" hint="Same-day bookings need about 30 minutes' notice.">
        <div>
          <SubLabel id="date-label">Date</SubLabel>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2" role="group" aria-label="Quick dates">
              {[
                { d: today, t: "Today" },
                { d: tomorrow, t: "Tomorrow" },
              ].map(({ d, t }) => (
                <button key={t} type="button" onClick={() => setDate(d)} aria-pressed={date === d} className={`h-12 flex-1 rounded-full px-5 text-sm font-semibold sm:flex-none ${pill(date === d)}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <DateField value={date} min={today} max={lastDay} onChange={setDate} label="Date" invalid={!!e.date} describedBy={e.date ? "date-error" : undefined} />
            </div>
          </div>
          <input type="hidden" name="date" value={date} />
          {e.date && <p id="date-error" className="field-error" role="alert">{e.date}</p>}
        </div>

        <div>
          <SubLabel id="guests-label">Guests</SubLabel>
          <div role="radiogroup" aria-labelledby="guests-label" className="grid grid-cols-7 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => {
              const on = !bigGroup && guests === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${n} ${n === 1 ? "guest" : "guests"}`}
                  onClick={() => {
                    setBigGroup(false);
                    setGuests(n);
                  }}
                  className={`h-11 rounded-full text-[15px] sm:w-11 font-semibold tabular-nums ${pill(on)}`}
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={bigGroup}
              onClick={() => {
                setBigGroup(true);
                if (guests < 7) setGuests(8);
              }}
              className={`h-11 rounded-full text-[15px] font-semibold sm:px-4 ${pill(bigGroup)}`}
            >
              7+
            </button>
          </div>
          {bigGroup && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-mist/60 px-3 py-2.5">
              <div className="flex items-center gap-1" role="group" aria-label="Group size">
                <button type="button" onClick={() => setGuests((g) => Math.max(7, g - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-sheet text-lg font-semibold ring-1 ring-line hover:ring-ink/40" aria-label="Fewer guests">−</button>
                <span className="w-12 text-center text-lg font-semibold tabular-nums" aria-live="polite">{guests}</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(30, g + 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-sheet text-lg font-semibold ring-1 ring-line hover:ring-ink/40" aria-label="More guests">+</button>
              </div>
              <p className="text-sm text-muted">Up to 30 online. Bigger group? Call us.</p>
            </div>
          )}
          <input type="hidden" name="guests" value={guests} />
          {e.guests && <p id="guests-error" className="field-error" role="alert">{e.guests}</p>}
        </div>

        <div>
          <SubLabel id="time-label">Time</SubLabel>
          {times.length ? (
            <div role="radiogroup" aria-labelledby="time-label" className="space-y-4">
              {periods.map((p) => {
                const list = times.filter((t) => toMin(t) >= p.from && toMin(t) < p.to);
                if (!list.length) return null;
                return (
                  <div key={p.name}>
                    <p className="mb-2 text-sm text-muted">{p.name}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {list.map((t) => {
                        const on = chosenTime === t;
                        return (
                          <button key={t} type="button" role="radio" aria-checked={on} onClick={() => setTime(t)} className={`rounded-xl py-2.5 text-sm font-medium tabular-nums ${pill(on)}`}>
                            {label12(t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-mist px-4 py-3 text-sm">We&apos;re closing soon. Pick another day or call us.</p>
          )}
          <input type="hidden" name="time" value={chosenTime} />
          {e.time && <p id="time-error" className="field-error" role="alert">{e.time}</p>}
        </div>
      </Step>

      {/* 2. Where */}
      <Step n="2" title="Where" hint="We'll do our best, but seating requests aren't guaranteed.">
        <div role="radiogroup" aria-label="Seating" className="grid gap-2.5 sm:grid-cols-3">
          {seatingOptions.map(({ v: val, t, d, icon: Icon }) => {
            const on = seating === val;
            return (
              <label
                key={val}
                className={`relative flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-[box-shadow,background-color,transform] sm:flex-col sm:items-start sm:gap-3 ${on ? "bg-glow/70 ring-2 ring-ink" : "bg-sheet ring-1 ring-line hover:-translate-y-0.5 hover:ring-ink/40"}`}
              >
                <input type="radio" name="seating" value={val} checked={on} onChange={() => setSeating(val)} className="peer sr-only" />
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? "bg-ink text-lamp" : "bg-mist text-ember"}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{t}</span>
                  <span className="mt-0.5 block text-sm text-muted">{d}</span>
                </span>
                <span aria-hidden className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full ${on ? "bg-ink text-mist" : "ring-1 ring-line"}`}>
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lamp-2" />
              </label>
            );
          })}
        </div>
      </Step>

      {/* 3. Who */}
      <Step n="3" title="Your details" hint="So we can confirm your booking.">
        {checked && !me && (
          <p className="flex items-center gap-3 rounded-xl bg-mist/70 px-4 py-3 text-sm">
            <User className="h-4 w-4 shrink-0 text-ember" />
            <span>
              <Link href="/signin?next=/reserve" className="font-semibold underline underline-offset-2">Sign in</Link> to fill this in for you and keep track of your bookings.
            </span>
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2" key={me ? "me" : "guest"}>
          <Field label="Your name" name="name" error={e.name}>
            <IconInput icon={User}>
              <input id="name" name="name" required autoComplete="name" defaultValue={v.name ?? me?.name} className="input" {...aria("name")} />
            </IconInput>
          </Field>
          <Field label="Phone or WhatsApp" name="phone" error={e.phone} hint="We’ll confirm on this number">
            <IconInput icon={Phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03xx xxxxxxx" defaultValue={v.phone ?? me?.phone} className="input" {...aria("phone")} />
            </IconInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email (optional)" name="email" error={e.email}>
              <IconInput icon={Mail}>
                <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email ?? me?.email} className="input" {...aria("email")} />
              </IconInput>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Anything we should know? (optional)" name="notes" error={e.notes}>
              <textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="A birthday, a high chair, allergies…" defaultValue={v.notes} className="input min-h-24 resize-y py-3" />
            </Field>
          </div>
        </div>
      </Step>

      {/* Summary and submit */}
      <div className="rounded-2xl bg-ink p-5 text-mist sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lamp">Your request</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4" aria-live="polite">
          {[
            ["Date", whenLabel],
            ["Time", chosenTime ? label12(chosenTime) : "Pick a time"],
            ["Guests", `${guests} ${guests === 1 ? "guest" : "guests"}`],
            ["Seating", seating === "any" ? "Any table" : seating === "outdoor" ? "Terrace" : "Indoors"],
          ].map(([k, val]) => (
            <div key={k}>
              <dt className="text-xs text-mist/60">{k}</dt>
              <dd className="mt-0.5 font-semibold">{val}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <Submit pendingText="Sending your request…" className="btn-primary w-full py-4 text-base">
            Request this table
          </Submit>
        </div>
      </div>
      <p className="-mt-6 text-center text-sm text-muted">Your table is confirmed when we call or message you back.</p>
    </form>
  );
}
