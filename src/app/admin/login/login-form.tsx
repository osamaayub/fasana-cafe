"use client";

import { useActionState } from "react";
import { login } from "@actions/admin";
import { Submit } from "@ui/form-bits";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
      <Submit pendingText="Signing in…" className="btn-dark w-full py-3">Sign in</Submit>
    </form>
  );
}
