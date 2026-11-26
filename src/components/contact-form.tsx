"use client";

import { useActionState, useState } from "react";
import { submitMessage } from "@/app/actions";
import type { FormState } from "@/lib/validation";
import { Field, Honeypot, Submit, SuccessBox, useLiveErrors } from "./form-bits";

const initial: FormState = { ok: false };

export function ContactForm() {
  const [key, setKey] = useState(0);
  return <Inner key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useActionState(submitMessage, initial);
  const v = state.values ?? {};
  const { e, onInput } = useLiveErrors(state.errors);
  const aria = (n: string) => (e[n] ? { "aria-invalid": true, "aria-describedby": `${n}-error` } : {});

  if (state.ok) return <SuccessBox title="Message sent" message={state.message} onReset={onReset} />;

  return (
    <form action={action} onInput={onInput} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <Honeypot />
      {state.message && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</p>}
      <div className="sm:col-span-2">
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" required autoComplete="name" defaultValue={v.name} className="input" {...aria("name")} />
        </Field>
      </div>
      <Field label="Phone" name="phone" error={e.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className="input" {...aria("phone")} />
      </Field>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} className="input" {...aria("email")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Subject" name="subject">
          <select id="subject" name="subject" defaultValue={v.subject ?? "General question"} className="input">
            <option>General question</option>
            <option>Private event or large group</option>
            <option>Feedback</option>
            <option>Bookstore</option>
            <option>Other</option>
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Message" name="body" error={e.body}>
          <textarea id="body" name="body" rows={5} required defaultValue={v.body} className="input" {...aria("body")} />
        </Field>
      </div>
      <div className="sm:col-span-2"><Submit>Send message</Submit></div>
    </form>
  );
}
