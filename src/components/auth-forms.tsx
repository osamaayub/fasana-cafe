"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset, resetPassword, signIn, signUp } from "@actions/account";
import type { FormState } from "@lib/validation";
import { Alert, Field, Honeypot, IconInput, Notice, Submit, useLiveErrors } from "./form-bits";
import { PasswordInput } from "./password-input";
import { Mail, Shield, User } from "./icons";

const initial: FormState = { ok: false };
const aria = (e: Record<string, string>, n: string) => (e[n] ? { "aria-invalid": true as const, "aria-describedby": `${n}-error` } : {});

const trust = (
  <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
    <Shield className="h-3.5 w-3.5 text-ember" /> Your details stay private — we only use them for bookings.
  </p>
);

export function SignInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(signIn, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  const v = state.values ?? {};
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      {notice && !state.message && <Notice msg={notice} />}
      <Alert msg={state.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" error={e.email}>
        <IconInput icon={Mail}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required defaultValue={v.email} className="input" {...aria(e, "email")} />
        </IconInput>
      </Field>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <Link href="/forgot-password" className="text-sm text-ember transition-colors hover:text-ink hover:underline">Forgot it?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" invalid={!!e.password} describedBy={e.password ? "password-error" : undefined} />
        {e.password && <p id="password-error" className="field-error" role="alert">{e.password}</p>}
      </div>
      <Submit pendingText="Signing in…">Sign in</Submit>
      <div className="pt-1">{trust}</div>
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
        <IconInput icon={User}>
          <input id="name" name="name" autoComplete="name" placeholder="Your name" required defaultValue={v.name} className="input" {...aria(e, "name")} />
        </IconInput>
      </Field>
      <Field label="Email" name="email" error={e.email}>
        <IconInput icon={Mail}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required defaultValue={v.email} className="input" {...aria(e, "email")} />
        </IconInput>
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
  if (state.ok) return <Notice msg={state.message} />;
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      <Field label="Email" name="email" error={e.email}>
        <IconInput icon={Mail}>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required defaultValue={state.values?.email} className="input" {...aria(e, "email")} />
        </IconInput>
      </Field>
      <Submit pendingText="Sending…">Send reset link</Submit>
      <div className="pt-1">{trust}</div>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, initial);
  const { e, onInput } = useLiveErrors(state.errors);
  return (
    <form action={action} onInput={onInput} className="space-y-5" noValidate>
      <Notice msg={state.ok ? state.message : undefined} />
      <Alert msg={!state.ok ? state.message ?? e.token : undefined} />
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
