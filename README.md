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
| Site domain for share links, messages, the CV link and QR code | `lib/site.ts` (`domain`) |
| What every buy button does (swap in Stripe here) | `lib/checkout.ts` (`startCheckout`) |
| All saved data, including the mock "unlocked" flag (swap in a database here) | `lib/store.ts` |
| Guide chapters | `content/guide.ts` |
| Message templates | `lib/templates.ts` |
| Dashboard and tools | `app/dashboard/**`, `components/` |
| Public player page | `app/player/[slug]/page.tsx` |
| Colours (accent green, near-black background) | `app/globals.css` (`@theme`) |
| Logo (round badge plus wordmark) | `components/Logo.tsx`, `public/images/badge-mark.jpg`; tab icon `app/icon.png` |
| Front page sections and copy | `components/Hero.tsx`, `Marquee.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Journey.tsx`, `Included.tsx` |
| "Your road to signed" milestones | `components/Journey.tsx` (`STEPS`) |
| Animations | keyframes and utilities at the end of `app/globals.css`; scroll reveals in `components/Reveal.tsx` |
| Images | `public/images/badge.jpg` (front page), `hero.jpg`, `problem.jpg`, `scout.jpg` |

All copy is placeholder.

## Components and animation

Reusable UI lives in `components/ui/`, the folder shadcn/ui uses, so components copied from
shadcn, 21st.dev and similar libraries drop in with their usual `@/components/ui/...` imports.
`components/ui/index.tsx` holds the shared form styles; `components/ui/timeline.tsx` is the
pinned horizontal-scroll timeline (GSAP ScrollTrigger and SplitText), adapted to take its
milestones as props.

shadcn itself is not initialised (there is no `components.json`). Nothing here needs it. If
you later want the shadcn CLI, run `npx shadcn@latest init`, and check what it changes in
`app/globals.css` so its theme variables don't override the site's colours.

The front page animations are CSS (hero intro, badge, ticker, buttons) plus GSAP for scroll
reveals and the timeline. All of them are switched off for visitors whose device asks for
reduced motion; the content then simply shows in place.

## Members area

Buying unlocks `/dashboard` and four tools. Every dashboard page checks access first
(`components/AccessGate.tsx`); the public player page does not.

| Tool | Address | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Progress from each tool and the follow-ups due today or overdue |
| Profile Builder | `/dashboard/profile` | Form with a live player card; autosaves. Makes the public page and a one-page PDF CV with a QR code |
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

## Football CV

`components/CvDocument.tsx` lays out the one-page A4 CV and `lib/cv.tsx` builds it in the
browser. Sections the player left empty are left out, and the CV is rendered at several
sizes so the largest one that still fits on one page is kept. Full and sparse profiles both
fill the page. The profile link and QR code use the domain in `lib/site.ts`.

Phone and email are always on the CV. On the public player page they show only if the
player leaves "Show my phone and email on my public page" ticked.

## Guide content

Paste real chapters into `content/guide.ts`. Leave a blank line between paragraphs,
start a line with `## ` for a subheading and `- ` for a bullet. Each chapter needs a
unique `id`.
