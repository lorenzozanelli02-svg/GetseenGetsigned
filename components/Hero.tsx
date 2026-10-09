import Image from "next/image";
import badge from "@/public/images/badge.jpg";
import { BuyButton } from "./BuyButton";

/** Headline split into characters on the server, so the rise animation is pure CSS and never flashes. */
const LINES = [
  { words: ["You’re", "good", "enough."], accent: false },
  { words: ["Now", "get", "seen."], accent: true },
];
const HEADLINE = "You’re good enough. Now get seen.";

const FEATURES = ["Player profile and CV", "Message templates", "Outreach tracker", "Step-by-step guide"];

/** Sparks drifting up off the badge: [left %, top %, sideways drift, duration s, delay ms]. */
const SPARKS: [number, number, number, number, number][] = [
  [18, 62, -20, 3.4, 0], [28, 80, 14, 2.8, 900], [44, 88, -10, 3.6, 400], [62, 84, 22, 3.1, 1500],
  [78, 66, 18, 2.9, 600], [84, 40, -16, 3.8, 1200], [12, 36, 12, 3.3, 1900], [55, 12, -22, 4, 2300],
];

type Vars = React.CSSProperties & Record<`--${string}`, string>;

export function Hero() {
  let char = 0;
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Backdrop: drifting floodlight glows and a running pitch grid, fading into the page. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="anim-drift absolute -top-1/3 -left-1/4 size-[70vmax] rounded-full bg-accent/10 blur-[120px]" style={{ "--t": "16s" } as Vars} />
        <div className="anim-drift absolute top-1/4 -right-1/3 size-[60vmax] rounded-full bg-accent/[0.07] blur-[140px]" style={{ "--t": "21s" } as Vars} />
        <div className="absolute inset-x-0 bottom-0 h-[45%] overflow-hidden [perspective:420px]">
          <div className="anim-grid absolute -inset-x-1/2 bottom-0 h-[160%] origin-bottom [mask-image:linear-gradient(to_top,black_10%,transparent_75%)] [transform:rotateX(64deg)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-bg to-transparent" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-4 px-4 pt-24 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-28">
        {/* The badge: strikes in, then floats with a pulsing glow inside two slow rings. */}
        <div className="relative mx-auto aspect-square w-[min(80vw,28rem)] lg:order-2 lg:w-full lg:max-w-[38rem]">
          <div aria-hidden="true" className="anim-glow absolute inset-[16%] rounded-full bg-accent/35 blur-[70px]" />
          <div aria-hidden="true" className="anim-spin-slow absolute inset-[2%] rounded-full border border-dashed border-accent/40" />
          <div aria-hidden="true" className="anim-spin-slow absolute inset-[8%] rounded-full border border-accent/15 [animation-direction:reverse] [animation-duration:70s]" />
          <div className="anim-badge absolute inset-[4%]" style={{ "--d": "120ms" } as Vars}>
            <div className="anim-float relative size-full">
              <Image
                src={badge}
                alt="The Get Seen Get Signed badge: a footballer volleying a glowing ball inside a round crest wrapped in green lightning, under floodlights."
                fill
                preload
                fetchPriority="high"
                sizes="(min-width: 1024px) 36rem, 80vw"
                className="object-cover [mask-image:radial-gradient(closest-side,black_72%,transparent_100%)]"
                style={{ objectPosition: "50.4% 49.7%" }}
              />
            </div>
          </div>
          {SPARKS.map(([left, top, dx, t, d]) => (
            <span
              key={`${left}-${top}`}
              aria-hidden="true"
              className="anim-spark absolute size-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_var(--color-accent)]"
              style={{ left: `${left}%`, top: `${top}%`, "--dx": `${dx}px`, "--t": `${t}s`, "--d": `${d}ms` } as Vars}
            />
          ))}
        </div>

        <div className="relative text-center lg:order-1 lg:text-left">
          <p className="anim-fade-up inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/[0.07] px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-accent uppercase sm:text-xs sm:tracking-[0.2em]" style={{ "--d": "100ms" } as Vars}>
            <span className="relative flex size-2" aria-hidden="true">
              <span className="anim-ping absolute inline-flex size-full rounded-full bg-accent" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            The playbook for getting scouted
          </p>

          <h1 id="hero-title" className="mt-6 font-display text-[3.5rem] leading-[0.86] font-extrabold uppercase sm:text-7xl lg:text-[5.4rem] xl:text-[6.25rem]">
            <span className="sr-only">{HEADLINE}</span>
            <span aria-hidden="true">
              {LINES.map((line) => (
                <span key={line.words.join(" ")} className="block">
                  {line.accent
                    ? // The green line flickers on like a floodlight; no mask, so its glow isn't clipped.
                      line.words.map((word) => (
                        <span key={word} className="neon-text mr-[0.2em] inline-block last:mr-0" style={{ "--d": "1050ms" } as Vars}>
                          {word}
                        </span>
                      ))
                    : // White words rise letter by letter from behind a mask.
                      line.words.map((word) => (
                        <span key={word} className="mr-[0.2em] inline-block overflow-hidden pt-[0.04em] pb-[0.1em] align-bottom last:mr-0">
                          {[...word].map((ch, i) => (
                            <span key={i} className="anim-rise" style={{ "--d": `${250 + char++ * 34}ms` } as Vars}>
                              {ch}
                            </span>
                          ))}
                        </span>
                      ))}
                </span>
              ))}
            </span>
          </h1>

          <p className="anim-fade-up mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink/80 sm:text-lg lg:mx-0" style={{ "--d": "1000ms" } as Vars}>
            The step-by-step plan for getting in front of scouts, standing out at trials and turning interest into a contract.
          </p>

          <div className="anim-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start" style={{ "--d": "1150ms" } as Vars}>
            <BuyButton />
            <a href="#how-it-works" className="group inline-flex items-center gap-2 text-sm font-semibold text-accent">
              See how it works
              <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
          </div>

          <ul className="anim-fade-up mt-9 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink/70 lg:justify-start" style={{ "--d": "1300ms" } as Vars}>
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 10.5l3.2 3L15 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
