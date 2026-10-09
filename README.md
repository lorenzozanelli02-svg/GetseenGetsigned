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
| All saved data, including the mock "unlocked" flag (swap in a database here) | `lib/store.ts` |
| Guide chapters | `content/guide.ts` |
| Message templates | `lib/templates.ts` |
| Dashboard and tools | `app/dashboard/**`, `components/` |
| Public player page | `app/player/[slug]/page.tsx` |
| Colours (accent green, near-black background) | `app/globals.css` (`@theme`) |
| Wordmark | `components/Logo.tsx` |
| Sections and copy | `components/Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Included.tsx` |
| Images | `public/images/hero.jpg`, `problem.jpg`, `scout.jpg` |

All copy is placeholder.

## Members area

Buying unlocks `/dashboard` and four tools. Every dashboard page checks access first
(`components/AccessGate.tsx`); the public player page does not.

| Tool | Address | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Progress from each tool and the follow-ups due today or overdue |
| Profile Builder | `/dashboard/profile` | Form with a live player card; autosaves. Makes the public page and a one-page PDF CV |
| Message Builder | `/dashboard/messages` | Messages for non-league managers, trial requests and US college coaches, filled in from the profile |
| Outreach Tracker | `/dashboard/tracker` | Clubs contacted, status and follow-ups. Table on desktop, cards on mobile |
| Guide | `/dashboard/guide` | Chapters with previous/next and read ticks |
| Player page | `/player/<name>-<id>` | The public player card with Copy share link and Download football CV |

## Buying (mock)

Until real payments are connected, every buy button calls `startCheckout()` in
`lib/checkout.ts`. It sets the "unlocked" flag and opens `/dashboard`. The dashboard
has a "Reset test access" button to lock it again.

To connect Stripe, change only `startCheckout()`: create a Checkout Session on the
server, redirect to its URL, and grant access from the Stripe webhook instead of
the browser. The comment in that file lists the steps.

## Saved data

Everything is saved in the browser's localStorage through `lib/store.ts`, and nothing
else reads or writes storage. To move to a real database, re-implement the functions
in that file (same names and types) to call your API. They are already async.

Until then:

- Data stays in the browser it was entered in. A different browser or device starts empty.
- A player's public link only opens in their own browser. Anyone else sees "Player not found".
- Anyone can unlock the dashboard for free.

## Guide content

Paste real chapters into `content/guide.ts`. Leave a blank line between paragraphs,
start a line with `## ` for a subheading and `- ` for a bullet. Each chapter needs a
unique `id`.
