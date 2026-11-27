# Fasana Café

Website for **Fasana Café**, a book-themed café and kitchen above the Readings bookstore in Sector C, Bahria Town, Lahore.

One Next.js app runs the public website, table bookings, customer accounts and a staff admin panel. Staff can change every text, photo, price and opening hour from the admin panel, so the café never needs a developer for content updates.

**Stack:** Next.js 16 (App Router) · React 19 · Prisma 7 · PostgreSQL (Prisma Postgres) · Tailwind CSS 4 · TypeScript

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Security](#security)
- [Google and GitHub sign-in](#google-and-github-sign-in)
- [Deployment](#deployment)
- [Changing the database schema](#changing-the-database-schema)
- [Content and photo credits](#content-and-photo-credits)
- [Troubleshooting](#troubleshooting)

---

## Features

### Public website

- Pages: Home, Menu, About, Gallery, FAQ, Contact and Reserve, all responsive, with light and dark mode
- Menu with category tabs, live search, dish details and prices in PKR ("Ask staff" when no price is published)
- Table booking with date and 30-minute time slots, guest count, seating choice and an "Add to calendar" file after booking
- Contact form and newsletter sign-up, both with server-side validation, a spam honeypot and per-IP rate limits
- "Open now / Closed now" badge worked out in the visitor's browser in Lahore time, so cached pages stay correct
- WhatsApp chat button, click-to-call, Google Maps embed and directions
- SEO: per-page metadata, Open Graph and Twitter cards, `CafeOrCoffeeShop` JSON-LD, `sitemap.xml` and `robots.txt`
- Fast: public pages are prerendered and cached for one hour, and fonts are self-hosted

### Customer accounts

- Sign up and sign in with email, Google or GitHub, plus forgot and reset password
- Sign-up (email or social) signs the customer in and opens a short profile step: phone or WhatsApp, seating preference, dietary notes and an offers opt-in
- Account page with upcoming and past bookings, self-service cancel, profile editing and password change
- List of signed-in devices with sign-out per device or everywhere, plus account deletion
- Saved details fill in the booking form automatically

### Admin panel (`/admin`)

Staff sign in with the admin email and password from the environment variables. This login is separate from customer accounts.

- **Dashboard:** pending bookings, upcoming bookings and unread messages
- **Reservations:** filter, confirm or cancel, send a one-click WhatsApp confirmation, delete
- **Messages:** contact form messages and newsletter sign-ups, mark read or unread, delete
- **Menu:** add, edit and delete categories and items, set prices, feature or hide items, change the order
- **Settings:** business details, page texts, links, hero and section images, photo strip and opening hours
- Optional email alerts for new bookings and messages through [Resend](https://resend.com)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, Server Actions |
| Database | PostgreSQL on [Prisma Postgres](https://www.prisma.io/postgres), through Prisma 7 and `@prisma/adapter-pg` |
| Styling | Tailwind CSS 4 (configured in `src/app/globals.css`) |
| Auth | Custom: scrypt password hashing and database sessions you can revoke; signed JWT cookie (`jose`) for admin |
| Validation | zod |
| Email | Resend (optional) |
| Fonts | Self-hosted Instrument Sans and Instrument Serif, plus a Nastaliq subset for the Urdu wordmark |
| Hosting | Vercel (any Node.js host works) |
| CI | GitHub Actions |

---

## Getting started

### Requirements

- Node.js 20 or newer (CI uses Node 22)
- A PostgreSQL database. We use **Prisma Postgres**, which has a free tier.

### 1. Create a Prisma Postgres database

1. Sign in at [console.prisma.io](https://console.prisma.io).
2. Create a new database.
3. Click **Connect** and copy the **direct** connection string. It starts with `postgres://` and points to `db.prisma.io:5432`.

Use the direct `postgres://` URL. The `prisma+postgres://` URL does not work with the `pg` adapter this project uses.

Any other PostgreSQL database (Neon, Supabase, a local Docker container) also works.

### 2. Install and run

```bash
git clone https://github.com/osamaayub/fasana-cafe.git
cd fasana-cafe

npm install                  # installs packages and generates the Prisma client
cp .env.example .env.local   # then fill in the values (see below)
npm run setup                # creates the tables and loads the Fasana starter content
npm run dev                  # http://localhost:3000
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env.local`.

---

## Environment variables

Put your values in `.env.local` for local work. This file is gitignored. On Vercel, add the same variables in the project settings. Both Next.js and `prisma.config.ts` read `.env.local` first and then `.env`.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. For Prisma Postgres, use the direct `postgres://...@db.prisma.io:5432/...` URL. |
| `ADMIN_EMAIL` | Yes | Email for the staff admin login |
| `ADMIN_PASSWORD` | Yes | Password for the staff admin login. Use a strong one. |
| `AUTH_SECRET` | Yes | Random string of 32+ characters that signs the admin session cookie. Generate one with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public address of the site, for example `https://fasanacafe.pk`. Used for SEO, the sitemap, JSON-LD and password-reset links. |
| `RESEND_API_KEY` | No | Turns on email alerts and password-reset emails. Without it, reset emails are not sent. |
| `NOTIFY_EMAIL_TO` | No | Where staff alerts are sent |
| `NOTIFY_EMAIL_FROM` | No | Sender address for Resend. In production it must use a domain verified in Resend. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Turns on "Continue with Google". See [Google and GitHub sign-in](#google-and-github-sign-in). |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | No | Turns on "Continue with GitHub". |
| `LOG_RESET_LINKS` | Local only | Set to `1` to print password-reset links in the server log when no email provider is set up |

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run typecheck` | Check types with `tsc --noEmit` |
| `npm run setup` | Apply migrations and load starter content (first-time setup) |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Load starter content. Existing settings and menu are left as they are. |
| `npm run studio` | Open Prisma Studio to browse the data |
| `npm run vercel-build` | What Vercel runs: generate, migrate, seed, then build |

---

## Project structure

```text
src/
├── app/
│   ├── (site)/                 Public site and customer accounts
│   │   ├── page.tsx            Home
│   │   ├── menu/  about/  gallery/  faq/  contact/
│   │   ├── reserve/            Table booking
│   │   ├── signin/  signup/  forgot-password/  reset-password/
│   │   └── account/            Account page and profile setup
│   ├── admin/                  Staff panel with its own login
│   │   ├── login/
│   │   └── (panel)/            Dashboard, reservations, messages, menu, settings
│   ├── api/me/route.ts         Signed-in user's details for the booking form
│   ├── api/auth/[provider]/    Google and GitHub sign-in (start and callback)
│   ├── fonts/                  Self-hosted fonts
│   ├── layout.tsx  globals.css Root layout, fonts and theme
│   └── sitemap.ts  robots.ts  not-found.tsx
├── actions/                    Server Actions: public.ts, account.ts, admin.ts
├── components/                 Shared UI (import as @ui/*)
├── lib/                        Data access, auth, sessions, OAuth, maps links, validation, email (import as @lib/*)
└── proxy.ts                    Protects /account and /admin routes
prisma/
├── schema.prisma               Data model
├── migrations/                 SQL migrations
└── seed.ts                     Starter content: settings, hours, menu, highlights
.github/workflows/ci.yml        CI: Postgres, migrate, seed, typecheck, build
```

### Data model

- **Content:** `Settings` (one row with business details, texts and images), `OpeningHour`, `Category`, `MenuItem`, `Highlight`
- **Customers:** `User` (login and profile), `OAuthAccount` (linked Google or GitHub logins), `Session` (hashed tokens), `PasswordResetToken` (hashed, single use)
- **Bookings and inbox:** `Reservation`, `Message`

---

## How it works

### Rendering and caching

Public pages are prerendered and refreshed every hour (`revalidate = 3600`). When staff save a change in the admin panel, the affected pages are refreshed right away, so the live site updates without a redeploy. Account and admin pages are always rendered fresh and sent with `Cache-Control: private, no-store`.

### Customer sessions

- Passwords are hashed with scrypt (N=32768, a random salt per user) and compared in constant time.
- Sign-in creates a random token in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only a SHA-256 hash of the token is stored, so sessions can be ended from the server ("sign out everywhere", password change, account deletion).
- Sessions last 30 days and extend while the customer is active.

### Bookings

The booking form offers today, tomorrow or a chosen date, 30-minute slots with at least 30 minutes' notice in Lahore time, a guest counter and a seating choice. Signed-in customers get their details filled in from `/api/me`. Each booking is validated on the server, rate limited and checked with a honeypot, then appears in **Admin > Reservations** for staff to confirm.

### Admin login

`/admin` uses its own session cookie signed with `AUTH_SECRET`. It has nothing to do with customer accounts. `src/proxy.ts` sends anyone without a valid session to the login page.

---

## Security

- **No account guessing:** sign-in and forgot-password give the same response whether or not the email exists
- **Lockout:** an account locks for 15 minutes after 5 wrong passwords
- **Rate limits** per IP on sign-in, sign-up, password reset, booking, contact and admin login
- **Password rules:** at least 10 characters, with letters plus a number or symbol, and common passwords blocked
- **Reset links** are single use, expire after 1 hour, are stored hashed, and sign out all devices when used
- **Social sign-in:** OAuth state check plus PKCE, and a Google or GitHub login is linked to an existing account only when the provider confirms the email is verified
- **Safe redirects:** the `?next=` parameter only allows paths on this site
- **CSRF:** Next.js Server Actions check the request's Origin header
- **Security headers:** HSTS (production), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`
- **Input validation** with zod in `src/lib/validation.ts` and `src/lib/account-validation.ts`

> **Note:** rate limits are kept in memory, so each server instance counts on its own. That is fine for a small site. For strict limits across many Vercel instances, move them to Redis (for example Upstash).

---

## Google and GitHub sign-in

The "Continue with Google" and "Continue with GitHub" buttons appear only after you add that provider's keys. Without keys, the sign-in page shows the email form only, so visitors never see a button that does not work.

How accounts work:

- A new person gets an account with no password. They can add one later from **Account > Security > Set a password**.
- If someone signs in with Google or GitHub using the same verified email as an existing account, the two are linked, so they keep their bookings.
- GitHub often hides a person's email on their profile, so the site reads their primary verified email instead. Someone with no verified email on GitHub is asked to use email sign-up.
- New social accounts go to the short profile step (phone and seating) before booking.

### Google

1. Open [Google Cloud Console](https://console.cloud.google.com) and create or pick a project.
2. In **Google Auth Platform**, click **Get started**. Add the app name "Fasana Café" and a support email, choose **External**, and finish.
3. In **Branding**, add the home page and `https://YOUR-DOMAIN/privacy` as the privacy policy link.
4. In **Clients**, click **Create client** and choose **Web application**. Add `https://YOUR-DOMAIN/api/auth/google/callback` under **Authorized redirect URIs** (and `http://localhost:3000/api/auth/google/callback` for local testing).
5. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Google shows the secret only once.
6. In **Audience**, click **Publish app** so anyone can sign in, not just test users.

### GitHub

1. On GitHub, go to **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. Application name `Fasana Café`, homepage URL `https://YOUR-DOMAIN`.
3. Authorization callback URL: `https://YOUR-DOMAIN/api/auth/github/callback`. You can add `http://localhost:3000/api/auth/github/callback` as a second callback URL for local testing.
4. Click **Register application**, copy the **Client ID**, then click **Generate a new client secret** and copy it straight away. GitHub shows it only once.
5. Put them in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

The redirect address is built from `NEXT_PUBLIC_SITE_URL`, so it must match the address you registered exactly. After adding keys on Vercel, redeploy.

---

## Deployment

### Vercel (recommended)

1. On [vercel.com](https://vercel.com), choose **Add New > Project** and import this repository.
2. Add every variable from `.env.example`. Use your production Prisma Postgres `DATABASE_URL`, a new `AUTH_SECRET` and your live `NEXT_PUBLIC_SITE_URL`. Add the Resend values if you want emails.
3. Deploy. Vercel runs `npm run vercel-build`, which generates the Prisma client, applies migrations, loads starter content (only into an empty database, never over admin edits) and builds the site.
4. Connect your domain, update `NEXT_PUBLIC_SITE_URL` to it and redeploy so SEO tags and reset emails use the final address.

After that, every push to `main` deploys automatically and every pull request gets a preview link.

### Continuous integration

Every push and pull request runs `.github/workflows/ci.yml`. It starts a PostgreSQL 16 database, applies migrations, loads the seed data, type-checks and builds. A broken change fails CI before it reaches production.

### Other hosts

Any Node.js 20+ host works:

```bash
npm ci
npm run db:migrate
npm run build
npm run start
```

---

## Changing the database schema

1. Edit `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name describe-the-change`. This creates a migration and regenerates the client.
3. Commit the new folder in `prisma/migrations/`. The generated client in `src/generated/` is gitignored and is rebuilt on install and build.

---

## Content and photo credits

- Business details come from the café's public Google listing.
- Menu prices come from the café's Foodpanda page (November 2026) and may differ in the café. Items without a published price show "Ask staff".
- The About text is a draft. Replace it in **Admin > Settings** with the owners' own words.
- Starter photos are free stock images from [Unsplash](https://unsplash.com/license), credited in `src/lib/photos.ts` and `src/lib/dish-photos.ts`. They are not photos of Fasana. Replace them with the café's own photos, with permission, in **Admin > Settings** and **Admin > Menu**.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm run setup` or `npm run dev` cannot reach the database | Check `DATABASE_URL` in `.env.local`. For Prisma Postgres, use the direct `postgres://...@db.prisma.io:5432/...` URL, not `prisma+postgres://`. |
| Admin login says the password is wrong | `ADMIN_EMAIL` and `ADMIN_PASSWORD` must match `.env.local` exactly. Restart `npm run dev` after changing them. |
| Password-reset emails never arrive | Set `RESEND_API_KEY` and `NOTIFY_EMAIL_FROM`. For local testing, set `LOG_RESET_LINKS=1` to print the links in the terminal. |
| Pages show old content after an admin edit | Refresh with Ctrl+Shift+R. The server updates on save, but your browser may have cached the old page. |
| `prisma migrate deploy` fails on Vercel or in CI | Make sure `DATABASE_URL` points to a database the host can reach. With Prisma Postgres, use the direct URL. |

---

## License

Private project for Fasana Café. All rights reserved.
