"use client";

import { useActionState, useState } from "react";
import { changePassword, deleteAccount, saveProfile } from "@actions/account";
import type { FormState } from "@lib/validation";
import { Alert, Field, IconInput, Notice, Submit, useLiveErrors } from "./form-bits";
import { PasswordInput } from "./password-input";
import { Mail, Phone, User } from "./icons";

const initial: FormState = { ok: false };
type Profile = { name: string; phone: string; seatingPref: string; dietaryNotes: string; marketingOptIn: boolean };

export function ProfileForm({ profile, from }: { profile: Profile; from: "setup" | "account" }) {
  const [state, action] = useActionState(saveProfile, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  const v = { ...profile, ...(state.values ?? {}) };
  const [seat, setSeat] = useState(v.seatingPref || "any");
  const aria = (n: string) => (e[n] ? { "aria-invalid": true as const, "aria-describedby": `${n}-error` } : {});
  return (
    <form action={action} onInput={onInput} className="space-y-6" noValidate>
      <input type="hidden" name="from" value={from} />
      <Notice msg={state.ok ? state.message : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" error={e.name}>
          <IconInput icon={User}>
            <input id="name" name="name" autoComplete="name" defaultValue={v.name} className="input" {...aria("name")} />
          </IconInput>
        </Field>
        <Field label="Phone or WhatsApp" name="phone" error={e.phone} hint="We use this to confirm bookings">
          <IconInput icon={Phone}>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" defaultValue={v.phone} className="input" {...aria("phone")} />
          </IconInput>
        </Field>
      </div>
      <fieldset>
        <legend className="label">Where do you usually like to sit?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[{ v: "any", t: "No preference" }, { v: "indoor", t: "Indoors" }, { v: "outdoor", t: "Terrace" }].map((o) => (
            <label key={o.v} className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-medium ring-1 transition-all ${seat === o.v ? "bg-ink text-mist ring-ink shadow-[0_10px_24px_-14px_rgba(22,33,59,.8)]" : "bg-sheet ring-line hover:-translate-y-0.5 hover:ring-ink/40"}`}>
              <input type="radio" name="seatingPref" value={o.v} checked={seat === o.v} onChange={() => setSeat(o.v)} className="sr-only" />
              {o.t}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Allergies or dietary needs (optional)" name="dietaryNotes" error={e.dietaryNotes} hint="Added to your bookings so the kitchen knows">
        <textarea id="dietaryNotes" name="dietaryNotes" rows={2} defaultValue={v.dietaryNotes} placeholder="e.g. no nuts, vegetarian" className="input" />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist/60 px-4 py-3 text-sm ring-1 ring-line transition-colors hover:bg-mist">
        <input type="checkbox" name="marketingOptIn" defaultChecked={profile.marketingOptIn} className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]" />
        <span>Tell me about new dishes, book events and offers. <span className="text-muted">You can turn this off anytime.</span></span>
      </label>
      <Submit pendingText="Saving…" className={from === "setup" ? "btn-dark w-full py-4 text-base" : "btn-dark px-7 py-3"}>
        {from === "setup" ? "Save and continue" : "Save profile"}
      </Submit>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate key={state.ok ? "done" : "form"}>
      <Notice msg={state.ok ? state.message : undefined} />
      <Alert msg={!state.ok ? state.message : undefined} />
      <Field label="Current password" name="current" error={e.current}>
        <PasswordInput id="current" name="current" autoComplete="current-password" invalid={!!e.current} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" name="password" error={e.password}>
          <PasswordInput id="password" name="password" autoComplete="new-password" meter invalid={!!e.password} />
        </Field>
        <Field label="Confirm new password" name="confirm" error={e.confirm}>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={!!e.confirm} />
        </Field>
      </div>
      <Submit pendingText="Changing…" className="btn-dark px-7 py-3">Change password</Submit>
    </form>
  );
}

export function DeleteAccountForm({ email, hasPassword = true }: { email: string; hasPassword?: boolean }) {
  const [state, action] = useActionState(deleteAccount, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  return (
    <form action={action} onInput={onInput} className="space-y-4" noValidate>
      <p className="text-sm text-muted">This removes your profile and signs you out everywhere. Bookings you already made stay with the café so they can still seat you.</p>
      <Alert msg={state.message} />
      <Field label={`Type ${email} to confirm`} name="confirmEmail" error={e.confirmEmail}>
        <IconInput icon={Mail}>
          <input id="confirmEmail" name="confirmEmail" autoComplete="off" className="input" />
        </IconInput>
      </Field>
      {hasPassword && (
        <Field label="Password" name="password" error={e.password}>
          <PasswordInput id="delete-password" name="password" autoComplete="current-password" invalid={!!e.password} />
        </Field>
      )}
      <Submit pendingText="Deleting…" className="btn bg-red-700 px-6 py-3 text-white hover:bg-red-800">Delete my account</Submit>
    </form>
  );
}
