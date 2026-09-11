# 🔗 Ultralink

One link. Your entire world. Ultralink is a website builder for creators and agencies —
build a fast, branded link page and see real analytics behind every click.

![Ultralink](public/ultralink-poster.jpg)

## ⌨️ Tech Stack

| Area        | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router)                                       |
| UI          | React 19 + React Compiler                                     |
| Language    | TypeScript                                                    |
| Styling     | Tailwind CSS v4                                               |
| Database    | [Supabase](https://supabase.com) — Postgres, auth, storage    |
| Payments    | [Stripe](https://stripe.com) — subscriptions + webhooks       |
| Email       | [Resend](https://resend.com)                                  |
| Drag & drop | [dnd-kit](https://dndkit.com) — link reordering               |
| Charts      | [Recharts](https://recharts.org) — analytics dashboard        |
| Icons       | Lucide                                                        |
| Hosting     | Vercel                                                        |

## 🚀 Features

**On your page**
- **Conversion-ready designs** — pages tuned to convert, or styled to match your brand.
- **Deep linking** — your links open in the real browser, not a broken in-app one.
- **Blazing fast** — pages load instantly, even on slow connections.
- **Unlimited links** — create as many link pages as your plan allows.
- **Simple or advanced** — easy for your first link, deep when you need it.

**Growth & control**
- **Real analytics** — clicks, CTR, countries, devices, time on page, and top links.
- **Win-Back** — offer leaving visitors a second link before they go.
- **Country blocking** — restrict your page to specific countries.
- **18+ age gate** — a clean, compliant age screen for mature content.
- **Active badge 🟢** — show a live "active now" badge to build trust.
- **Team access** — let your assistant create links and track data for you.

**In the dashboard**
- Link page builder with live preview (profile, links, socials, design, advanced tabs)
- Analytics with a date-range picker
- Revenue tracking and account/billing settings
- Admin view gated to a single `ADMIN_USER_ID`

**Coming soon**
- **Custom domains** — put your own domain on your page: your brand, your URL. Not built yet; the
  dashboard route and the homepage feature card are both marked "coming soon".

## 🎞️ Live Demo

[ultralink.bio](https://ultralink.bio)

### 📺 Introduction

<video src="public/Ultralink%20Intro.mp4" poster="public/ultralink-poster.jpg" controls muted playsinline width="100%">
  Your renderer can't play embedded video —
  <a href="public/Ultralink%20Intro.mp4">watch Ultralink Intro.mp4</a> instead.
</video>

## 🚦 Getting Started

**Prerequisites:** Node.js 20+, a Supabase project, and Stripe/Resend accounts (test mode is fine).

1. **Clone and install**
   ```bash
   git clone https://github.com/lvfranek/Ultralink.git
   cd Ultralink
   npm install
   ```

2. **Set up the database.** In your Supabase project's SQL editor, run every file in
   [`supabase/migrations/`](supabase/migrations/) in filename order, then create a **public** bucket
   named `media` under Storage and run [`supabase/storage-policies.sql`](supabase/storage-policies.sql).

3. **Configure your environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the values — see [Environment](#-environment) below. `.env.example` documents where to
   find each one.

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. *(Optional)* **Forward Stripe webhooks locally** so subscription changes reach the app:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## 🔑 Environment

All variables are documented inline in [`.env.example`](.env.example). The groups are:

| Group | Variables | Notes |
| ----- | --------- | ----- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | The service role key must never reach the browser. |
| Site URL | `NEXT_PUBLIC_SITE_URL` | Single source of truth for absolute URLs (Stripe redirects, sign-out, invite emails). **Must be set at build time** — it's inlined into the bundle. |
| Email | `RESEND_API_KEY` | Needs "Sending" permission and a verified sending domain. |
| Stripe | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Use `pk_test_` / `sk_test_` keys in development. |
| Stripe prices | `STRIPE_PRICE_<TIER>_MONTHLY` / `_ANNUAL` | One pair per tier (1, 3, 10, 25, 50, 100, 200, 400 link pages). Each price needs metadata `{ tier, interval }`. Annual is billed yearly at roughly a 25% discount. |
| Admin | `DISCORD_WEBHOOK_URL`, `DISCORD_BUGS_WEBHOOK_URL`, `DISCORD_FEATURES_WEBHOOK_URL`, `ADMIN_USER_ID` | All optional. Discord notifications silently no-op when unset, so signup and payment flows never fail. `/admin` 404s for everyone but `ADMIN_USER_ID`. |

Never commit `.env.local`.

## 📁 Project Structure

```
src/
  app/
    (marketing)/          Landing page, help center, privacy, terms
    (auth)/               Login, auth callback + email confirm
    (dashboard)/
      dashboard/          Links, analytics, revenue, account (+ domains placeholder)
      admin/              Admin-only overview (gated by ADMIN_USER_ID)
    [slug]/               Public link pages (+ blocked state)
    r/[link_id]/          Click-tracking redirect route
    checkout/             Stripe Checkout entry point
    invite/accept/        Team invite acceptance
    actions/              Server actions (links, pages, billing, team, analytics, …)
    api/
      stripe/webhook/     Stripe subscription webhook handler
      track/winback/      Win-Back interaction tracking
      account/delete/     Account deletion
      auth/signout/
  components/
    marketing/            Hero, features, pricing, FAQ, help center
    dashboard/            Shell, sidebar, modals, page-builder/
    public/               Public page view, age gate, win-back overlay, social icons
    ui/
  lib/
    supabase/             Browser, server, and service-role clients + types
    stripe/               Stripe server client + price/tier mapping
    analytics/            Analytics helpers
    notifications/        Discord webhooks
supabase/
  migrations/             Schema migrations (run in filename order)
  storage-policies.sql    Policies for the public `media` bucket
```

## ☁️ Deployment

The reference deployment runs on [Vercel](https://vercel.com), connected to this GitHub repo.

1. Import the repository into Vercel.
2. Add every variable from `.env.example` under **Project Settings → Environment Variables**. Set
   `NEXT_PUBLIC_SITE_URL` to your production URL *before* the first build — it's inlined at build
   time, not read at runtime.
3. Create a Stripe webhook pointing at `https://<your-domain>/api/stripe/webhook`, subscribed to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Deploy. Pushes to the default branch redeploy automatically.

## 📜 Available Scripts

| Command         | What it does                        |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start the Next.js dev server        |
| `npm run build` | Production build                    |
| `npm run start` | Serve the production build          |
| `npm run lint`  | Run ESLint over the project         |

## 📚 Additional Resources

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
- [Stripe documentation](https://docs.stripe.com)
- [Resend documentation](https://resend.com/docs)
