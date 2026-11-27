"use client";

import { useActionState } from "react";
import type { OpeningHour, Settings } from "@lib/types";
import { DAYS } from "@lib/format";
import { saveSettings } from "@actions/admin";
import { Submit } from "@ui/form-bits";

type F = { name: keyof Settings; label: string; type?: string; area?: boolean; full?: boolean; hint?: string };
const fields: F[] = [
  { name: "name", label: "Business name" },
  { name: "tagline", label: "Tagline" },
  { name: "heroTitle", label: "Home headline", full: true },
  { name: "heroSubtitle", label: "Home intro text", area: true, full: true },
  { name: "about", label: "About page text", area: true, full: true, hint: "Blank line = new paragraph" },
  { name: "address", label: "Address", full: true },
  { name: "phone", label: "Phone (shown on site)" },
  { name: "whatsapp", label: "WhatsApp number", hint: "Digits with country code, e.g. 923005258219" },
  { name: "email", label: "Email", type: "email" },
  { name: "instagram", label: "Instagram URL", type: "url" },
  { name: "facebook", label: "Facebook URL", type: "url" },
  { name: "foodpandaUrl", label: "Foodpanda URL", type: "url" },
  { name: "mapsUrl", label: "Google Maps link", type: "url", hint: "In Google Maps, open the café, tap Share and paste the link here (maps.app.goo.gl/...)." },
  { name: "mapEmbedQuery", label: "Map search text", hint: "What the embedded map searches for" },
  { name: "heroImage", label: "Hero image URL (portrait, 4:5)", type: "url", full: true, hint: "Top of the home page. Leave empty to show the designed placeholder." },
  { name: "storyImage", label: "Story image URL (landscape, 3:2)", type: "url", full: true, hint: "Used on the home page and the Our story page." },
  { name: "reserveImage", label: "Booking image URL (square)", type: "url", full: true, hint: "Shown next to the booking form." },
  { name: "galleryImages", label: "Photo strip on the home page", area: true, full: true, hint: "One image link per line. 4 to 8 photos works best." },
  { name: "googleRating", label: "Google rating", type: "number" },
  { name: "googleReviews", label: "Google review count", type: "number" },
];

export function SettingsForm({ s, hours }: { s: Settings; hours: OpeningHour[] }) {
  const [state, action] = useActionState(saveSettings, {});
  return (
    <form action={action} className="max-w-3xl space-y-8">
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Saved. The live site is updated.</p>}
      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label className="label" htmlFor={f.name}>{f.label}</label>
            {f.area ? (
              <textarea id={f.name} name={f.name} rows={f.name === "about" || f.name === "galleryImages" ? 6 : 3} defaultValue={String(s[f.name] ?? "")} className="input" />
            ) : (
              <input id={f.name} name={f.name} type={f.type ?? "text"} step={f.name === "googleRating" ? "0.1" : undefined} defaultValue={String(s[f.name] ?? "")} className="input" />
            )}
            {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Opening hours</h2>
        <p className="mb-4 text-xs text-muted">Set closing to 00:00 for midnight. Times after midnight (e.g. 01:00) are treated as the next morning.</p>
        <div className="space-y-3">
          {hours.map((h) => (
            <div key={h.dayOfWeek} className="flex flex-wrap items-center gap-3">
              <span className="w-28 text-sm font-medium">{DAYS[h.dayOfWeek]}</span>
              <input type="time" name={`open_${h.dayOfWeek}`} defaultValue={h.opensAt} aria-label={`${DAYS[h.dayOfWeek]} opens`} className="input w-36" />
              <span className="text-muted">to</span>
              <input type="time" name={`close_${h.dayOfWeek}`} defaultValue={h.closesAt} aria-label={`${DAYS[h.dayOfWeek]} closes`} className="input w-36" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`closed_${h.dayOfWeek}`} defaultChecked={h.closed} /> Closed</label>
            </div>
          ))}
        </div>
      </div>
      <Submit pendingText="Saving…" className="btn-dark px-8 py-3">Save settings</Submit>
    </form>
  );
}
