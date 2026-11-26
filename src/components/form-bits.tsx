"use client";
import { useState } from "react";

import { useFormStatus } from "react-dom";

export function Submit({ children, pendingText = "Sending…", className = "btn-dark w-full py-4 text-base" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Field({
  label, name, error, children, hint,
}: { label: string; name: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${name}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

/** Hidden field bots fill in and humans don't see. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function SuccessBox({ title, message, onReset, actionLabel = "Send another" }: { title: string; message?: string; onReset: () => void; actionLabel?: string }) {
  return (
    <div role="status" className="py-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lamp text-ink">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5 9-10" /></svg>
      </span>
      <p className="mt-5 font-serif text-4xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-muted">{message}</p>
      <button type="button" onClick={onReset} className="btn-ghost mt-8">{actionLabel}</button>
    </div>
  );
}

/** Hides a field's server error as soon as the person edits that field. */
export function useLiveErrors(errors: Record<string, string> | undefined) {
  const [edited, setEdited] = useState<{ src?: Record<string, string>; names: Set<string> }>({ names: new Set() });
  const names = edited.src === errors ? edited.names : new Set<string>();
  const live: Record<string, string> = {};
  for (const [k, v] of Object.entries(errors ?? {})) if (!names.has(k)) live[k] = v;
  const onInput = (ev: React.FormEvent<HTMLFormElement>) => {
    const name = (ev.target as HTMLInputElement).name;
    if (name && errors?.[name] && !names.has(name)) setEdited({ src: errors, names: new Set(names).add(name) });
  };
  return { e: live, onInput };
}
