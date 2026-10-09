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
| Checkout link for every buy button | `lib/site.ts` (`checkoutUrl`) |
| Colours (accent green, near-black background) | `app/globals.css` (`@theme`) |
| Wordmark | `components/Logo.tsx` |
| Sections and copy | `components/Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Included.tsx` |
| Images | `public/images/hero.jpg`, `problem.jpg`, `scout.jpg` |

All copy is placeholder.

## Images

- Imported statically through `next/image`, which serves AVIF/WebP at the right width for each screen.
- The hero is preloaded with high fetch priority; the other two use `loading="lazy"`.
- The source JPEGs are recompressed (progressive, quality 80).
- Every image edge that sits inside the page fades into `--color-bg` with gradients, and text over an image always has a dark gradient behind it.
