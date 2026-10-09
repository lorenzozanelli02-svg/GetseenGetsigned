# Get Seen Get Signed: landing page

Next.js (App Router) + Tailwind CSS v4, dark theme only.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | File |
| --- | --- |
| What every buy button does (swap in Stripe here) | `lib/checkout.ts` (`startCheckout`) |
| Mock "unlocked" state | `lib/access.ts` |
| Dashboard | `app/dashboard/page.tsx`, `components/Dashboard.tsx` |
| Colours (accent green, near-black background) | `app/globals.css` (`@theme`) |
| Wordmark | `components/Logo.tsx` |
| Sections and copy | `components/Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Included.tsx` |
| Images | `public/images/hero.jpg`, `problem.jpg`, `scout.jpg` |

All copy is placeholder.

## Buying (mock)

Until real payments are connected, every buy button calls `startCheckout()` in
`lib/checkout.ts`. It stores an "unlocked" flag in the browser's localStorage and
opens `/dashboard`. The dashboard has a "Reset test access" button to lock it again.

To connect Stripe, change only `startCheckout()`: create a Checkout Session on the
server, redirect to its URL, and grant access from the Stripe webhook instead of
the browser. The comment in that file lists the steps.

The dashboard's tools (Profile Builder, Message Builder, Outreach Tracker, Guide)
are not built yet and show as "Coming soon".

## Images

- Imported statically through `next/image`, which serves AVIF/WebP at the right width for each screen.
- The hero is preloaded with high fetch priority; the other two use `loading="lazy"`.
- The source JPEGs are recompressed (progressive, quality 80).
- Every image edge that sits inside the page fades into `--color-bg` with gradients, and text over an image always has a dark gradient behind it.
