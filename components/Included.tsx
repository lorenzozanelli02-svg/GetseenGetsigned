import { BuyButton } from "./BuyButton";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

const ITEMS = [
  { title: "The Get Seen playbook", text: "How scouting works at every level, and exactly where you fit in." },
  { title: "Highlight reel blueprint", text: "What to film, how to cut it and what to leave out." },
  { title: "Player profile template", text: "A one-page profile that answers a scout's questions before they ask." },
  { title: "Outreach scripts", text: "Ready-to-send emails and messages for clubs, coaches and agents." },
  { title: "Trial preparation plan", text: "The week before, the day itself and what to do after the final whistle." },
  { title: "Club tracker", text: "Every contact, trial and follow-up in one place." },
];

export function Included() {
  return (
    <Reveal as="section" id="included" aria-labelledby="included-title" className="scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div data-reveal="up">
            <Eyebrow>What&rsquo;s included</Eyebrow>
          </div>
          <h2 id="included-title" data-reveal="split" className="mt-4 font-display text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl lg:text-7xl">
            Everything you need to <span className="text-accent [text-shadow:0_0_28px_rgb(59_229_132/0.45)]">get signed</span>
          </h2>
        </div>

        <ul data-reveal="stagger" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <li
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/60"
            >
              <span aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-accent/0 blur-3xl transition-colors duration-500 group-hover:bg-accent/20" />
              <span className="font-display text-sm font-extrabold tracking-[0.2em] text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ul>

        <div data-reveal="up" className="border-spin mt-16 rounded-3xl p-px">
          <div className="rounded-[calc(1.5rem-1px)] bg-bg bg-[radial-gradient(120%_140%_at_50%_0%,rgb(59_229_132/0.16),transparent_60%)] px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="font-display text-5xl leading-[0.92] font-extrabold uppercase text-balance sm:text-6xl">
              Ready to <span className="neon-text">get seen?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink/80 sm:text-lg">Put yourself in front of the people who make the decisions.</p>
            <BuyButton className="mt-8" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
