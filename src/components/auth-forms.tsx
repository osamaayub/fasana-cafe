"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset, resetPassword, signIn, signUp } from "@/app/(site)/account/actions";
import type { FormState } from "@/lib/validation";
import { Field, Honeypot, Submit, useLiveErrors } from "./form-bits";
import { PasswordInput } from "./password-input";

const initial: FormState = { ok: false };
const Alert = ({ msg }: { msg?: string }) => (msg ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{msg}</p> : null);
const aria = (e: Record<string, string>, n: string) => (e[n] ? { "aria-invalid": true as const, "aria-describedby": `${n}-error` } : {});

export function SignInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(signIn, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  const v = state.values ?? {};
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      {notice && !state.message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      <Alert msg={state.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={v.email} className="input" {...aria(e, "email")} />
      </Field>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <Link href="/forgot-password" className="text-sm text-ember hover:underline">Forgot it?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" invalid={!!e.password} describedBy={e.password ? "password-error" : undefined} />
        {e.password && <p id="password-error" className="field-error" role="alert">{e.password}</p>}
      </div>
      <Submit pendingText="Signing in…">Sign in</Submit>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUp, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  const v = state.values ?? {};
  return (
    <form action={action} onInput={onInput} className="relative space-y-5" noValidate>
      <Honeypot />
      <Alert msg={state.message} />
      <Field label="Your name" name="name" error={e.name}>
        <input id="name" name="name" autoComplete="name" required defaultValue={v.name} className="input" {...aria(e, "name")} />
      </Field>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={v.email} className="input" {...aria(e, "email")} />
      </Field>
      <Field label="Password" name="password" error={e.password} hint="At least 10 characters, with a number or symbol">
        <PasswordInput id="password" name="password" autoComplete="new-password" meter invalid={!!e.password} describedBy={e.password ? "password-error" : undefined} />
      </Field>
      <Field label="Confirm password" name="confirm" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={!!e.confirm} describedBy={e.confirm ? "confirm-error" : undefined} />
      </Field>
      <Submit pendingText="Creating your account…">Create account</Submit>
      <p className="text-center text-xs text-muted">We only use your details for bookings. No spam.</p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestReset, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  if (state.ok) return <p role="status" className="text-center leading-relaxed">{state.message}</p>;
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className="input" {...aria(e, "email")} />
      </Field>
      <Submit pendingText="Sending…">Send reset link</Submit>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      <Alert msg={state.message ?? e.token} />
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" error={e.password} hint="At least 10 characters, with a number or symbol">
        <PasswordInput id="password" name="password" autoComplete="new-password" meter invalid={!!e.password} />
      </Field>
      <Field label="Confirm new password" name="confirm" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={!!e.confirm} />
      </Field>
      <Submit pendingText="Saving…">Save new password</Submit>
    </form>
  );
}
