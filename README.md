# Fasana Café website

Next.js 15 (App Router) + Prisma 7 + PostgreSQL (Prisma Postgres) + Tailwind CSS 4.

## Features

**Public site**
- Home, Menu, About, Reserve, Contact pages, fully responsive
- All content comes from the database and can be edited in the admin panel
- Menu with category tabs and live search
- Reservation form and contact form, with server-side validation, spam honeypot and rate limiting
- Live "Open now / Closed now" badge (Lahore time)
- WhatsApp chat button, click-to-call, Google Maps embed and directions
- SEO: per-page metadata, Open Graph, `CafeOrCoffeeShop` JSON-LD, sitemap.xml, robots.txt
- Performance: pages are prerendered and cached (ISR). When you save something in admin, the live pages refresh straight away. Fonts are self-hosted and very little JavaScript is sent to the browser

**Customer accounts**
- Sign up, sign in, forgot password and reset password pages
- Profile setup right after sign-up (phone, seating preference, dietary needs, offers opt-in)
- My account: upcoming and past bookings with self-service cancel, profile editing, password change, list of signed-in devices with remote sign-out, sign out everywhere, delete account
- Signed-in guests get the booking form pre-filled, and their dietary notes are added to every booking

**Security**
- Passwords hashed with scrypt (N=32768) and a random salt per user; timing-safe comparison
- Sessions stored in the database and revocable. The cookie holds a random 256-bit token (httpOnly, SameSite=Lax, Secure in production), and only its SHA-256 hash is stored
- Password change or reset signs out every other device
- Account lock for 15 minutes after 5 wrong passwords, plus per-IP rate limits on sign-in, sign-up, reset and forms
- No account enumeration: sign-in and forgot-password give the same answer whether or not the email exists, and unknown emails take as long as wrong passwords
- Reset links are single-use, expire after 1 hour, and are stored hashed
- Password rules: 10+ characters, letters plus a number or symbol, common passwords and your email name blocked
- Open-redirect protection on `?next=`, honeypot on public forms, Next.js server-action origin checks (CSRF)
- Security headers: HSTS (production), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP
- Account and admin pages are never cached (`Cache-Control: private, no-store`)

**Admin panel (`/admin`)**
- Login with email and password from env (signed, httpOnly session cookie)
- Dashboard: pending bookings, upcoming bookings, unread messages
- Reservations: filter, confirm or cancel, one-click WhatsApp confirmation, delete
- Messages: read/unread, delete
- Menu: add, edit and delete categories and items, set prices, mark items featured or hidden, change the order
- Settings: business info, texts, links, hero image, opening hours
- Optional email alerts for new bookings and messages through Resend

## Setup

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill it in (see below)
npm run setup               # creates the tables and loads the Fasana data
npm run dev                 # http://localhost:3000 , admin at /admin
```

### `.env`
| Key | What to put |
|---|---|
| `DATABASE_URL` | Prisma Postgres: console.prisma.io > your database > **Connect** > copy the direct `postgres://...@db.prisma.io:5432/...` URL. (The `prisma+postgres://` URL won't work with this setup.) Any other Postgres works too. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Your admin login. Use a strong password. |
| `AUTH_SECRET` | Random string, 32+ chars: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Live domain, e.g. `https://fasanacafe.pk` |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_TO` | Email for staff alerts **and password-reset emails**. Without it, customers can't reset forgotten passwords. |
| `LOG_RESET_LINKS` | Local testing only: set to `1` to print reset links in the server log |

## Put it on GitHub and go live on Vercel

**1. GitHub**
```bash
# create an empty repo on github.com first (no README), then:
git remote add origin https://github.com/<your-username>/fasana-cafe.git
git push -u origin main
```
Every push runs `.github/workflows/ci.yml`: it spins up Postgres, applies migrations, seeds, type-checks and builds, so a broken change shows a red X before it reaches the live site.

**2. Vercel** (free Hobby plan)
1. vercel.com > Add New > Project > import the `fasana-cafe` repo.
2. Add the environment variables from `.env.example` (`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `RESEND_API_KEY` + `NOTIFY_EMAIL_TO` for emails).
3. Deploy. Vercel runs `npm run vercel-build`, which applies database migrations, seeds the café data if the database is empty (it never overwrites admin edits), then builds.
4. After that, every `git push` to `main` redeploys automatically, and pull requests get preview links.

Set `NEXT_PUBLIC_SITE_URL` to the final address (e.g. `https://fasana-cafe.vercel.app` or the café's own domain) and redeploy, so SEO links and password-reset emails point to the right place.

## Changing the database schema
Edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name what-changed`.

## Content notes
- The business details come from the café's public Google listing.
- Menu prices come from their Foodpanda page (Nov 2026) and may differ in-store. Items without a published price show "Ask staff".
- The About text is a placeholder draft. Replace it with the owner's own words.
- Starter photos are free stock from Unsplash (Unsplash License): coffee by nik radzi, books by Miriana Dorobanțu, book and coffee by Esra Afşar, café interior by Haberdoedas, pasta by Eaters Collective, café shelf by Sam Grozyan. They are mood shots, not Fasana. Replace them in Admin > Settings (hero, story, booking and the home photo strip) with the café's own photos, with permission.

## Notes
- Staff admin uses its own login (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), separate from customer accounts.
- Rate limits are kept in memory, which is fine on one server. If you run several instances, move them to Redis (e.g. Upstash).
