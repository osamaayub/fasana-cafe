"use client";

import { useActionState, useState } from "react";
import { subscribeNewsletter } from "@actions/public";
import type { FormState } from "@lib/validation";
import { Alert, Honeypot, Submit, SuccessBox } from "./form-bits";
import { Mail, Send } from "./icons";

const initial: FormState = { ok: false };

export function NewsletterForm() {
  const [key, setKey] = useState(0);
  return <Inner key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useActionState(subscribeNewsletter, initial);
  if (state.ok) return <SuccessBox title="You're in" message={state.message} onReset={onReset} actionLabel="Done" />;
  return (
    <form action={action} className="relative">
      <Honeypot />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Email address</span>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="email" type="email" required placeholder="you@example.com" className="input rounded-full pl-11" />
        </label>
        <Submit className="btn-primary shrink-0 px-7 py-3.5">
          Subscribe <Send className="h-4 w-4" />
        </Submit>
      </div>
      <Alert msg={state.message && !state.ok ? state.message : undefined} />
      <p className="mt-3 text-xs text-muted">One email now and then — new dishes, events, nothing spammy. Unsubscribe anytime.</p>
    </form>
  );
}
