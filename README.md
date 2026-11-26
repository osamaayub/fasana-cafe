# Fasana Café

The website for **Fasana Café** — a café and bookstore in Bahria Town, Lahore. Built with **Next.js 15 (App Router)**, **Prisma 7**, **PostgreSQL**, and **Tailwind CSS 4**.

A single codebase powers the public site, customer accounts, table booking, and a password-protected staff admin panel — all content is editable from the admin, no code changes needed.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Security model](#security-model)
- [Admin panel](#admin-panel)
- [Deployment](#deployment)
- [Changing the database schema](#changing-the-database-schema)
- [Content notes](#content-notes)
- [Troubleshooting](#troubleshooting)

---

## Features

### Public site

- Home, Menu, About, Reserve, and Contact pages — fully responsive
- Every word and image comes from the database and can be edited in the admin panel (hero text, opening hours, business info, photos)
- Menu with category tabs, live search, and prices in PKR ("Ask staff" when no price is published)
- Reservation form and contact form with server-side validation (zod), a spam honeypot, and per-IP rate limiting
- Live **Open now / Closed now** badge computed in the visitor's browser (Lahore time), so cached pages stay accurate
- WhatsApp chat button, click-to-call, Google Maps embed, and directions
- SEO: per-page metadata, Open Graph / Twitter cards, `CafeOrCoffeeShop` JSON-LD, `sitemap.xml`, `robots.txt`
- Performance: public pages are statically prerendered and cached (ISR, 1 hour). Saving in admin revalidates them instantly. Fonts are self-hosted; almost no JavaScript ships to the browser

### Customer accounts

- Sign up, sign in, forgot password, and reset password flows
- Guided profile setup after sign-up: name, phone/WhatsApp, preferred seating (indoors / terrace / no preference), dietary notes, and an opt-in for offers
- **My account** dashboard:
  - Upcoming and past bookings with one-click self-service cancel
  - Profile editing (booking details are pre-filled on the reservation form)
  - Password change (signs out every other device)
  - List of signed-in devices with per-device sign-out and "sign out everywhere"
  - Account deletion
- Dietary notes and seating preference automatically apply to new bookings

### Admin panel (`/admin`)

Separate login (env credentials, not a customer account):

- **Dashboard** — pending bookings, upcoming bookings, unread messages at a glance
- **Reservations** — filter, confirm or cancel, one-click WhatsApp confirmation to the guest, delete
- **Messages** — read/unread, delete
- **Menu** — add, edit, delete categories and items; set prices; mark items featured or hidden; drag-free reordering
- **Settings** — business info, marketing texts, links, hero/story/booking images, photo strip, opening hours
- Optional email alerts for new bookings and messages via [Resend](https://resend.com)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, React 19, Server Actions |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Styling | Tailwind CSS 4 (CSS-first config in `globals.css`) |
| Auth | Custom: scrypt password hashing, database-backed revocable sessions |
| Validation | zod |
| Fonts | Self-hosted Instrument Sans/Serif + a Nastaliq subset for the Urdu wordmark |
| Email | Resend (optional) |
| Hosting | Vercel (any Node host works) |

---

## Quick start

```bash
npm install                 # installs deps and runs `prisma generate`
cp .env.example .env.local  # then fill it in (see below)
npm run setup               # applies migrations and seeds the Fasana data
npm run dev                 # → http://localhost:3000  (admin at /admin)
```

> You need a PostgreSQL database. The easiest option is **Prisma Postgres** (free tier):
> console.prisma.io → create a database → **Connect** → copy the direct `postgres://...` URL into `DATABASE_URL`.
> Any other Postgres (Neon, Supabase, local Docker) works too.

First admin login: the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env.local`.

---

## Environment variables

Secrets live in **`.env.local`** locally (gitignored) and in the host's env vars on Vercel. `.env` holds only non-secret defaults; `prisma.config.ts` loads `.env.local` first, then `.env`, and Next.js does the same — so `npm run dev`, `prisma migrate`, `prisma db seed`, and `npm run studio` all see the same values.

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string. For Prisma Postgres use the **direct** `postgres://USER:PASS@db.prisma.io:5432/...` URL (the `prisma+postgres://` URL won't work with the `pg` adapter). Local dev: the `fasana-db` Docker container (`docker start fasana-db`, `localhost:55432`). |
| `ADMIN_EMAIL` | ✅ | Staff admin login email |
| `ADMIN_PASSWORD` | ✅ | Staff admin login password — use a strong one |
| `AUTH_SECRET` | ✅ | Random 32+ char string for signing admin session cookies. Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL of the site, e.g. `https://fasanacafe.pk`. Used for SEO, sitemap, reset links, and JSON-LD. |
| `RESEND_API_KEY` | optional | Enables email alerts (bookings/messages) **and** password-reset emails. Without it, reset emails can't be delivered — fine for local dev, not for production. |
| `NOTIFY_EMAIL_TO` | optional | Where staff alerts go |
| `NOTIFY_EMAIL_FROM` | optional | Sender address for Resend (must be a verified domain in production) |
| `LOG_RESET_LINKS` | dev only | Set to `1` to print password-reset links to the server log when no email provider is configured |

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run setup` | `prisma migrate deploy` + seed (first-time setup) |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Load/update the Fasana starter content |
| `npm run studio` | Open Prisma Studio |
| `npm run vercel-build` | What Vercel runs: generate → migrate → seed → build |

---

## Project structure

```
src/
├── app/
│   ├── (site)/                  # Public site + customer accounts
│   │   ├── page.tsx              #   Home
│   │   ├── menu/  about/  contact/
│   │   ├── reserve/              #   Table booking
│   │   ├── signin/  signup/  forgot-password/  reset-password/
│   │   └── account/              #   Dashboard + profile setup
│   ├── admin/                    # Staff panel (own login)
│   │   ├── login/
│   │   └── (panel)/              #   dashboard, reservations, messages, menu, settings
│   ├── api/me/route.ts           #   Current-user JSON for the booking form
│   ├── layout.tsx  globals.css   #   Root layout, fonts, theme tokens
│   └── sitemap.ts  robots.ts  not-found.tsx
├── actions/                      #   Server actions: public.ts, account.ts, admin.ts
├── components/                   # Shared UI (header, footer, forms, icons…) — import as @ui/*
└── lib/                          # Data access, auth, sessions, validation, email — import as @lib/*
prisma/
├── schema.prisma                 # Data model
├── migrations/                   # SQL migrations
└── seed.ts                       # Starter content (settings, hours, menu, highlights)
.github/workflows/ci.yml          # CI: Postgres + migrate + seed + typecheck + build
```

### Data model (high level)

- **Content**: `Settings` (one row — business info, texts, images), `OpeningHour`, `Category`/`MenuItem`, `Highlight`
- **Customers**: `User` (credentials + profile), `Session` (hashed tokens), `PasswordResetToken` (hashed, single-use)
- **Bookings & inbox**: `Reservation`, `Message`

---

## How it works

**Rendering & caching**

Public pages are prerendered with `revalidate = 3600`. Admin writes call `revalidatePath`/`revalidateTag`, so the live site updates immediately after a save while staying fast for visitors. Account pages are `force-dynamic` and send `Cache-Control: private, no-store`.

**Accounts & sessions**

- Passwords are hashed with **scrypt** (N=32768, random salt per user, timing-safe compare). `src/lib/password.ts` also burns CPU on unknown-email sign-ins so response times don't reveal whether an account exists.
- On sign-in a random 256-bit token goes into an `httpOnly`, `SameSite=Lax`, `Secure`-in-prod cookie; only its SHA-256 hash is stored in the `Session` table — so sessions can be revoked server-side ("sign out everywhere", password change, admin delete).
- Sessions last 30 days and slide forward on activity.

**Booking flow**

The reservation form offers today/tomorrow/custom date, 30-minute time slots (filtered to ≥30 min notice, Lahore time), a guest counter, and seating preference. Signed-in users are detected via the `fasana_name` hint cookie and their profile is fetched from `/api/me` to pre-fill details. Submissions are validated server-side, rate-limited, honeypot-protected, and land in the admin Reservations list for staff to confirm (with a one-click WhatsApp message to the guest).

**Admin auth**

`/admin` uses its own signed session cookie derived from `AUTH_SECRET` — completely separate from customer accounts.

---

## Security model

- No account enumeration: sign-in and forgot-password return identical responses whether or not the email exists
- Account lockout: 15 minutes after 5 failed passwords, plus per-IP rate limits on sign-in, sign-up, reset, booking, and contact forms (in-memory; see note below)
- Password rules: 10+ chars, letters plus a number or symbol, common-password and email-name blocklist
- Reset links: single-use, expire after 1 hour, stored hashed; using one signs out all devices
- Open-redirect protection on `?next=` (`safeNext` allows only same-site paths)
- CSRF: Next.js server actions verify the Origin header
- Security headers: HSTS (production), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`
- All user input validated with zod schemas in `src/lib/validation.ts` and `src/lib/account-validation.ts`

> **Rate limits are in-memory** — fine on a single instance (e.g. one Vercel function warm at a time is not guaranteed; for strict limits at scale, move them to Redis/Upstash).

---

## Admin panel

1. Visit `/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. **Reservations** is the daily driver: confirm tables, message guests on WhatsApp, cancel.
3. **Menu** and **Settings** are where you edit all public content — hero copy, photos (paste image URLs, one per line for the strip), hours, prices, the About story.
4. Email alerts (optional): set `RESEND_API_KEY` + `NOTIFY_EMAIL_TO` to get pinged on new bookings and messages.

---

## Deployment

### GitHub → Vercel (recommended)

**1. Push to GitHub**

```bash
git remote add origin https://github.com/<you>/fasana-cafe.git
git push -u origin main
```

Every push runs `.github/workflows/ci.yml`: it boots Postgres, applies migrations, seeds, type-checks, and builds — a broken change shows a red ❌ before it can reach production.

**2. Deploy on Vercel**

1. Import the repo at vercel.com → **Add New → Project**.
2. Add every variable from `.env.example` (use the **production** `DATABASE_URL`, a real `AUTH_SECRET`, your live `NEXT_PUBLIC_SITE_URL`, and Resend keys if you want email).
3. Deploy. Vercel runs `npm run vercel-build` = generate → `migrate deploy` → seed (only fills an **empty** database; it never overwrites your admin edits) → `next build`.
4. Point your domain at the project, update `NEXT_PUBLIC_SITE_URL`, and redeploy so SEO and reset emails use the final URL.

From then on, `git push` to `main` redeploys automatically and pull requests get preview URLs.

### Other hosts

Any Node.js host works: build with `npm run build`, run migrations with `npm run db:migrate`, serve with `npm run start`.

---

## Changing the database schema

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name describe-the-change` (creates a migration + regenerates the client).
3. Commit both `prisma/migrations/` and `src/generated/` is gitignored — the client is regenerated on `postinstall`/`build`.

---

## Content notes

- Business details come from the café's public Google listing.
- Menu prices come from their Foodpanda page (Nov 2026) and may differ in-store; items without a published price show "Ask staff".
- The About text is a **placeholder draft** — replace it in Admin → Settings with the owner's own words.
- Starter photos are free stock from Unsplash (Unsplash License): coffee by nik radzi, books by Miriana Dorobanțu, book and coffee by Esra Afşar, café interior by Haberdoedas, pasta by Eaters Collective, café shelf by Sam Grozyan. They're mood shots, not Fasana — replace them with the café's own photos (with permission) in Admin → Settings.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot resolve environment variable: DATABASE_URL` on `prisma generate` | Create `.env` from `.env.example` first |
| Sign-up works but reset emails never arrive | Set `RESEND_API_KEY` + `NOTIFY_EMAIL_TO`, or `LOG_RESET_LINKS=1` in dev to print links to the console |
| Admin says wrong password | Check `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`; they must match exactly |
| Pages show stale content after admin edits | Hard-refresh; ISR revalidates on save, but the browser may cache |
| `prisma migrate deploy` fails in CI/Vercel | Check `DATABASE_URL` points at a Postgres the host can reach (use the direct `db.prisma.io` URL, not the pooled `pgbouncer` one) |

---

## License

Private project — all rights reserved unless stated otherwise.
