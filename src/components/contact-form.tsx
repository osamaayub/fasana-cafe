"use client";

import { useActionState, useState } from "react";
import { submitMessage } from "@actions/public";
import type { FormState } from "@lib/validation";
import { Alert, Field, Honeypot, IconInput, Submit, SuccessBox, useLiveErrors } from "./form-bits";
import { Mail, MessageSquare, Phone, Send, User } from "./icons";

const initial: FormState = { ok: false };

const subjects = ["General question", "Private event or large group", "Feedback", "Bookstore", "Other"];

export function ContactForm() {
  const [key, setKey] = useState(0);
  return <Inner key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useActionState(submitMessage, initial);
  const v = state.values ?? {};
  const { e, onInput } = useLiveErrors(state.errors);
  const aria = (n: string) => (e[n] ? { "aria-invalid": true, "aria-describedby": `${n}-error` } : {});
  const [subject, setSubject] = useState(v.subject ?? "General question");
  const [body, setBody] = useState(v.body ?? "");

  if (state.ok) return <SuccessBox title="Message sent" message={state.message} onReset={onReset} />;

  const step = (n: string, title: string, hint?: string) => (
    <div className="flex items-baseline gap-3">
      <span className="flex h-7 w-7 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-lamp text-xs font-bold text-night">{n}</span>
      <div>
        <p className="font-serif text-xl leading-none">{title}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );

  return (
    <form action={action} onInput={onInput} className="relative space-y-9" noValidate>
      <Honeypot />
      <Alert msg={state.message} />

      {/* Who */}
      <section>
        {step("1", "Who are you?", "So we know who to reply to.")}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" error={e.name}>
            <IconInput icon={User}>
              <input id="name" name="name" required autoComplete="name" placeholder="Your name" defaultValue={v.name} className="input" {...aria("name")} />
            </IconInput>
          </Field>
          <Field label="Phone" name="phone" error={e.phone} hint="Optional if you give an email">
            <IconInput icon={Phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03xx xxxxxxx" defaultValue={v.phone} className="input" {...aria("phone")} />
            </IconInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email" name="email" error={e.email} hint="Optional if you give a phone number">
              <IconInput icon={Mail}>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={v.email} className="input" {...aria("email")} />
              </IconInput>
            </Field>
          </div>
        </div>
      </section>

      {/* What */}
      <section>
        {step("2", "What's it about?", "Pick the closest match.")}
        <input type="hidden" name="subject" value={subject} />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Subject">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              aria-pressed={subject === s}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${subject === s ? "bg-ink text-mist shadow-md" : "bg-sheet text-ink ring-1 ring-line hover:-translate-y-0.5 hover:bg-tint hover:ring-ink/40"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Message */}
      <section>
        {step("3", "Your message", "A sentence or two is plenty.")}
        <div className="relative mt-4">
          <IconInput icon={MessageSquare}>
            <textarea
              id="body"
              name="body"
              rows={5}
              required
              minLength={10}
              maxLength={2000}
              value={body}
              onChange={(ev) => setBody(ev.target.value)}
              placeholder="Tell us what's on your mind…"
              className="input resize-y pb-8"
              {...aria("body")}
            />
          </IconInput>
          <span className="pointer-events-none absolute bottom-3 right-4 text-xs tabular-nums text-muted">{body.length}/2000</span>
        </div>
        {e.body && <p id="body-error" className="field-error" role="alert">{e.body}</p>}
      </section>

      <div className="border-t border-line pt-6">
        <Submit pendingText="Sending…"><Send className="h-4 w-4" />Send message</Submit>
        <p className="mt-3 text-center text-sm text-muted">We usually reply within a few hours — faster on WhatsApp.</p>
      </div>
    </form>
  );
}
