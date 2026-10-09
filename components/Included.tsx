import { BuyButton } from "./BuyButton";
import { Eyebrow } from "./Eyebrow";

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
    <section id="included" aria-labelledby="included-title" className="scroll-mt-8 px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>What&rsquo;s included</Eyebrow>
          <h2 id="included-title" className="mt-4 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl lg:text-6xl">
            Everything you need to <span className="text-accent">get signed</span>
          </h2>
        </div>

        <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span aria-hidden="true" className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent ring-1 ring-accent/30">
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 10.5l3.2 3L15 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div
          id="buy"
          className="mt-16 scroll-mt-8 rounded-3xl border border-accent/25 bg-[radial-gradient(120%_140%_at_50%_0%,rgb(59_229_132/0.14),transparent_60%)] px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          <h2 className="font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl">
            Ready to <span className="text-accent">get seen?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink/80 sm:text-lg">
            Put yourself in front of the people who make the decisions.
          </p>
          <BuyButton className="mt-8" />
        </div>
      </div>
    </section>
  );
}
