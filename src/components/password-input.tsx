"use client";

import { useState } from "react";

function score(p: string) {
  let s = 0;
  if (p.length >= 10) s++;
  if (p.length >= 14) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return Math.min(4, s);
}
const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
const colors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

export function PasswordInput({
  id, name, autoComplete, meter = false, invalid, describedBy, placeholder,
}: { id: string; name: string; autoComplete: string; meter?: boolean; invalid?: boolean; describedBy?: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const s = value ? (value.length < 10 ? 0 : score(value)) : -1;
  return (
    <div>
      <div className="relative">
        <input
          id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required
          value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
          className="input pr-20" aria-invalid={invalid || undefined} aria-describedby={describedBy}
          spellCheck={false} autoCapitalize="none"
        />
        <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} aria-controls={id}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:bg-mist hover:text-ink">
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {meter && s >= 0 && (
        <div className="mt-2 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.max(1, s) ? colors[s] : "bg-line"}`} />)}
          </div>
          <span className="w-16 text-right text-xs text-muted">{labels[s]}</span>
        </div>
      )}
    </div>
  );
}
