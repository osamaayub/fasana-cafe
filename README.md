# Fasana Café

[![CI](https://github.com/osamaayub/fasana-cafe/actions/workflows/ci.yml/badge.svg)](https://github.com/osamaayub/fasana-cafe/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Prisma 7](https://img.shields.io/badge/Prisma-7-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

Website, table booking and back office for **Fasana Café**, a book-themed café above the Readings bookstore in Bahria Town, Lahore.

**Live:** https://fasana-cafe-ten.vercel.app

One Next.js app does three jobs:

1. **Marketing site.** Menu, gallery and opening hours, served as cached static pages.
2. **Bookings and accounts.** Guests book a table, get email confirmations and manage their bookings.
3. **Admin panel.** Staff edit all content and handle bookings and messages. Nothing on the site needs a developer to change.

```bash
npm install && cp .env.example .env.local   # fill in DATABASE_URL, ADMIN_*, AUTH_SECRET
npm run setup && npm run dev                # http://localhost:3000, admin at /admin
```

---

## Contents

- [Architecture](#architecture)
- [Key design decisions](#key-design-decisions)
- [Local development](#local-development)
- [Configuration](#configuration)
- [Transactional email](#transactional-email)
- [Data model](#data-model)
- [Menu data and seeding](#menu-data-and-seeding)
- [Security model](#security-model)
- [Deployment and operations](#deployment-and-operations)
- [Project layout](#project-layout)
- [Conventions](#conventions)
- [Known limitations and roadmap](#known-limitations-and-roadmap)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    P[Public pages<br/>static, cached 1h]
    F[Forms<br/>booking, contact, newsletter]
    A[Admin panel]
  end

  subgraph Vercel["Next.js 16 on Vercel"]
    RSC[Server Components]
    SA[Server Actions<br/>zod validation, rate limit, honeypot]
    PX[proxy.ts<br/>route guard]
    AF["after()<br/>post-response jobs"]
  end

  DB[(Postgres<br/>Prisma Postgres)]
  MAIL[SMTP or Resend]
  OAUTH[Google / GitHub OAuth]

  P --> RSC --> DB
  F --> SA --> DB
  A --> PX --> SA
  SA -- revalidatePath --> RSC
  SA --> AF --> MAIL
  PX -. sign-in .-> OAUTH
```

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, Server Actions | One deployable unit. Forms work without client-side JS. No separate API to version. |
| Data | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` | Typed queries and reviewable SQL migrations. The driver adapter runs on serverless. |
| Styling | Tailwind CSS 4, tokens in `src/app/globals.css` | No runtime CSS. One place for the brand colours. |
| Validation | zod, shared by client hints and server checks | The server is the source of truth. The schemas sit in `src/lib/validation.ts`. |
| Auth | In-house: scrypt, hashed DB sessions, OAuth 2 + PKCE | The scope is small and the code is easy to audit. Sessions can be revoked, unlike stateless JWTs. |
| Email | Nodemailer (SMTP) or the Resend HTTP API | SMTP works with no domain. Resend gives better delivery once a domain is verified. |
| UI libs | `react-day-picker`, in-house SVG icons (`@ui/icons`) | Accessible date picker that matches the theme. No icon package to ship. |
| Hosting / CI | Vercel, GitHub Actions | Every PR gets a preview deploy. CI builds against a real Postgres. |

---

## Key design decisions

Short records of the decisions that are not obvious from the code.

**1. Static-first public pages with on-demand revalidation.**
Public routes use `revalidate = 3600`, and admin actions call `revalidatePath` after each write. Visitors get pages from the CDN, and staff edits still show up straight away. The "Open now" badge is worked out in the browser in Asia/Karachi time, so a cached page never shows the wrong status.

**2. Server Actions instead of a REST API.**
Every action follows the same pipeline: honeypot, then zod, then the rate limit, then the database write, then side effects. Validation errors come back as `FormState`, so forms work without JS and keep what the user typed. The only route handlers are `/api/me` (fills in the booking form) and the OAuth callbacks.

**3. Side effects never block the user.**
Emails are scheduled with `after()` from `next/server`. They run once the response has been sent. If the provider is slow or down, the booking is still saved and the guest still sees a success message. `sendEmail` never throws. It logs the error and returns `false`.

**4. Database sessions, not JWTs, for customers.**
The cookie holds a random token, and only its SHA-256 hash is stored. This is what makes "sign out everywhere", sign-out on password change and account deletion actually work. The admin panel is separate on purpose: a single staff login with a `jose`-signed cookie, kept apart from customer accounts.

**5. Content lives in the database, defaults live in code.**
`prisma/seed.ts` loads starter content into an empty database and never overwrites what staff have changed. The one exception is the menu, which has its own version (see [Menu data and seeding](#menu-data-and-seeding)).

**6. Dates are strings in Lahore local time.**
`Reservation.date` is `YYYY-MM-DD` and `time` is `HH:MM`, both in Asia/Karachi time. A booking is a wall-clock time at a physical place, so storing it as UTC would only add bugs. Every "today" check uses `Intl.DateTimeFormat(..., { timeZone: "Asia/Karachi" })`.

---

## Local development

**Requirements:** Node.js 20+ (CI uses 22) and any PostgreSQL 14+ database. A local Docker container, Neon, Supabase and Prisma Postgres all work.

```bash
git clone https://github.com/osamaayub/fasana-cafe.git && cd fasana-cafe
npm install                    # also runs prisma generate
cp .env.example .env.local     # fill in the required values below
npm run setup                  # migrate + seed
npm run dev
```

Quick local database:

```bash
docker run -d --name fasana-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fasana -p 5432:5432 postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fasana"
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run typecheck` | `tsc --noEmit`. Run it before you push, because CI does. |
| `npm run build` / `start` | Production build and serve |
| `npm run setup` | `migrate deploy` + `db seed` |
| `npm run db:migrate` / `db:seed` | Each step on its own |
| `npm run studio` | Prisma Studio |
| `npm run vercel-build` | What Vercel runs: generate, migrate, seed, build |

---

## Configuration

All configuration comes from environment variables. `.env.example` is the canonical list with comments. Next.js and `prisma.config.ts` read `.env.local` first, then `.env`.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres URL. For Prisma Postgres, use the **direct** `postgres://…@db.prisma.io:5432` URL. `prisma+postgres://` does not work with the pg adapter. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes | Staff login for `/admin` |
| `AUTH_SECRET` | yes | 32+ random characters (`openssl rand -base64 32`). Signs the admin cookie. |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin. Used for SEO, the sitemap, OAuth redirect URIs and links in emails. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | no | Email over SMTP. Takes priority over Resend. |
| `RESEND_API_KEY` | no | Email through Resend |
| `NOTIFY_EMAIL_FROM` | no | Sender. With Gmail it must be the Gmail address. With Resend it must be on a verified domain. |
| `NOTIFY_EMAIL_TO` | no | Staff alerts. Falls back to the café email in Admin > Settings. |
| `GOOGLE_CLIENT_ID` / `_SECRET` | no | Turns on "Continue with Google" |
| `GITHUB_CLIENT_ID` / `_SECRET` | no | Turns on "Continue with GitHub" |
| `LOG_RESET_LINKS` | dev only | `1` prints password-reset links to the server log |

Optional integrations stay off until they are configured. A missing key hides the feature (for example, the social sign-in buttons). It never leaves a broken button.

> **Previews share production data.** On Vercel, Preview deployments currently use the same `DATABASE_URL` as Production. A PR that changes migrations or the seed changes the live database as soon as its preview builds. Give Preview its own database before you merge risky schema work.

---

## Transactional email

Code: `src/lib/email.ts`. Call sites: `src/actions/*.ts`.

| Trigger | Recipient | Email |
| --- | --- | --- |
| Booking submitted | Guest (form email, or the account email if signed in) | "Your request is in": details, link to My account |
| Booking submitted | Staff | Alert with all fields |
| Staff sets status to **confirmed** | Guest | "Your table is confirmed": Google Calendar link, directions |
| Staff sets status to **cancelled** | Guest | "We couldn't confirm your table": rebook link |
| Guest cancels from My account | Guest | Cancellation receipt |
| Contact form | Guest + staff | Copy of the message / alert |
| Newsletter sign-up | Subscriber | Welcome email, sent once per address |
| Forgot password | User | Reset link |

Rules the code follows:

- **Transport priority:** SMTP if all of `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` are set, then Resend, then nothing. With no transport, the site behaves exactly as before.
- **Non-blocking:** every send runs in `after()` (see decision 3).
- **No duplicates:** status emails go out only when the status actually changes and the booking is still upcoming. A repeat newsletter sign-up is accepted without sending another email.
- **Templates** are table-based inline-CSS HTML, which is what email clients actually render. Each has a plain-text twin and a hidden preheader. They read the café name, address and phone from `Settings`, so they never go stale. `Reply-To` is the café email.

**Going live**

- *Fastest (no domain):* a Gmail account with 2-Step Verification turned on and an [App Password](https://myaccount.google.com/apppasswords). Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASS`, and `NOTIFY_EMAIL_FROM="Fasana Café <that@gmail.com>"`. Gmail allows about 500 messages a day, which is plenty here.
- *Best deliverability:* verify a domain in Resend (SPF + DKIM records), then set `RESEND_API_KEY` and `NOTIFY_EMAIL_FROM="Fasana Café <bookings@your-domain>"`. Without a verified domain, Resend only delivers to the account owner's own address.

Redeploy after changing env vars on Vercel.

---

## Data model

```mermaid
erDiagram
  User ||--o{ Session : has
  User ||--o{ OAuthAccount : links
  User ||--o{ PasswordResetToken : requests
  User ||--o{ Reservation : books
  Category ||--o{ MenuItem : contains
```

- **Content:** `Settings` (one row: business details, page texts, images, `menuVersion`), `OpeningHour`, `Category`, `MenuItem`, `Highlight`
- **Identity:** `User`, `OAuthAccount`, `Session` (hashed token), `PasswordResetToken` (hashed, single use, 1 hour)
- **Operations:** `Reservation` (`pending | confirmed | cancelled`, indexed on `[status, date]`), `Message` (contact form and newsletter sign-ups)

`MenuItem.options` stores price variants as `"Chicken 2030 | Beef 2475"`. It is parsed by `parseOptions()` in `src/lib/format.ts`, and the card shows "from" the lowest price.

**Schema changes:** edit `prisma/schema.prisma`, run `npx prisma migrate dev --name <change>`, and commit the new `prisma/migrations/*` folder. Migrations are applied on deploy by `prisma migrate deploy`, so write them to be backward compatible with the code currently running (add first, remove later). The generated client in `src/generated/` is gitignored.

---

## Menu data and seeding

The full menu (218 items from the café's August 2026 brochures) lives in `prisma/menu-data.ts`, together with a `MENU_VERSION` string.

On every deploy, `seed.ts`:

1. Creates the settings, hours and highlights **only if they are missing**. Staff edits are never overwritten.
2. Replaces the whole menu, in one transaction, **only if `MENU_VERSION` differs** from `Settings.menuVersion`. It then stores the new version, so this runs once per menu release.
3. Fills in a stock photo for any dish whose image is empty (`fillMissingPhotos`, using `src/lib/dish-photos.ts`).

To ship a new printed menu: update `menu-data.ts`, bump `MENU_VERSION`, open a PR. Be aware that this throws away menu edits made in the admin panel since the last release.

---

## Security model

| Threat | Control |
| --- | --- |
| Credential stuffing / brute force | Per-IP rate limits (in memory, 5 per 10 minutes by default) and a 15-minute lockout after 5 failed passwords |
| Account enumeration | Sign-in and forgot-password return the same response whether or not the account exists |
| Weak passwords | At least 10 characters, letters plus a digit or symbol, common-password blocklist. Hashed with scrypt (N=32768) and compared in constant time. |
| Session theft | `httpOnly`, `SameSite=Lax`, `Secure` cookies. Only token hashes are stored. Sessions can be revoked per device or everywhere. |
| OAuth attacks | `state` + PKCE. Accounts are linked only on a provider-verified email. |
| Open redirect | `?next=` only accepts same-site paths |
| CSRF | Server Actions check `Origin`. Mutations are never GETs. |
| Spam | Honeypot field on public forms, plus rate limits |
| Clickjacking etc. | HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP |
| Header injection in email | Recipients come only from validated input. All template values are HTML-escaped. |

Secrets live only in environment variables and are never committed. To report a vulnerability, email the maintainer instead of opening a public issue.

---

## Deployment and operations

**Pipeline:** PR, then CI (Postgres 16 service: migrate, seed, typecheck, build), then a Vercel preview, then merge to `main`, which deploys to production. `vercel-build` runs migrations and the seed before `next build`, so a failed migration stops the deploy before any new code goes live.

**First deploy on Vercel**

1. Import the repo and add the variables from [Configuration](#configuration).
2. Deploy, connect the domain, set `NEXT_PUBLIC_SITE_URL` to it, and redeploy.
3. Register the OAuth callback URLs (`/api/auth/google/callback`, `/api/auth/github/callback`) for that domain.

**Other hosts:** `npm ci && npm run db:migrate && npm run build && npm run start` on Node 20+.

**Runbook**

| Situation | Action |
| --- | --- |
| Deploy fails with `P1001` (can't reach database) | `DATABASE_URL` is wrong or rotated. Paste the direct URL again in Vercel and redeploy. |
| Guests say they got no confirmation email | Check the Vercel function logs for `email:` lines. Check that the transport env vars exist for the right environment. With Resend, check the domain is verified. |
| Bad deploy | Vercel > Deployments > previous build > **Promote to Production**. Migrations do not roll back, so fix forward if the schema changed. |
| Menu disappeared or doubled | The seed is transactional, so look for a failed `vercel-build`. Re-running the deploy re-applies the current `MENU_VERSION`. |
| Admin password forgotten | Change `ADMIN_PASSWORD` in Vercel and redeploy |

---

## Project layout

```text
src/
  app/
    (site)/            public pages, booking, auth pages, /account
    admin/             login + (panel): dashboard, reservations, messages, menu, settings
    api/               /api/me, /api/auth/[provider]/{start,callback}
  actions/             Server Actions: public.ts, account.ts, admin.ts
  components/          UI (@ui/*): menu-browser, menu-card, dish-dialog, reservation-form, date-field, …
  lib/                 (@lib/*) data access, auth, sessions, OAuth, validation, email, format
  proxy.ts             guards /account and /admin
prisma/
  schema.prisma  migrations/  seed.ts  menu-data.ts
.github/workflows/ci.yml
```

---

## Conventions

- **Branches and PRs:** `feat/…`, `fix/…`. Keep PRs small, and give each one a preview link and a short test plan. Squash or merge commits are both fine, but `main` must always be deployable.
- **Server first:** read data in Server Components and write it in Server Actions. Use client components only for interaction (search, dialogs, the date picker).
- **Validation:** every input is parsed with zod on the server, even when the client already checked it.
- **Time:** use the helpers in `src/lib/format.ts`. Never use the server's local time.
- **Styling:** use Tailwind utilities and the tokens in `globals.css`. Avoid arbitrary colours. Test at 320 px wide: there is a global `.grid > * { min-width: 0 }` rule and `overflow-x: clip` on `html`/`body` to stop sideways scrolling.
- **Accessibility:** dialogs are portalled to `document.body`, move focus to their close button and close on Esc. Interactive elements have visible focus rings.

---

## Known limitations and roadmap

- Rate limits are per instance and kept in memory. Move them to Redis (Upstash) if traffic grows.
- There are no automated UI tests. Playwright smoke tests for booking, sign-in and admin confirm are the next step.
- There is no real newsletter sending. Sign-ups are stored in `Message`, and campaigns are sent by hand. Exporting to a mailing tool and adding a one-click unsubscribe link would close this gap.
- There is no table-capacity check. Staff confirm availability by hand.
- Preview and Production share one database (see [Configuration](#configuration)).

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Cannot reach the database | Use the direct `postgres://` URL, not `prisma+postgres://` |
| Admin login rejected | `ADMIN_EMAIL` / `ADMIN_PASSWORD` must match exactly. Restart `npm run dev` after changing them. |
| No emails locally | Set up SMTP or Resend. For password resets only, `LOG_RESET_LINKS=1` prints the links. |
| Old content after an admin edit | Hard refresh. The server has already revalidated the page. |
| Social button missing | That provider's client ID or secret is not set |

---

## Content credits

Business details come from the café's public Google listing. The menu and prices come from the café's brochures (August 2026), and prices in the café may differ. The stock photos are from [Unsplash](https://unsplash.com/license) (credited in `src/lib/photos.ts` and `src/lib/dish-photos.ts`) and are **not** photos of Fasana. Replace them with the café's own photos in the admin panel.

## License

Private project for Fasana Café. All rights reserved.
