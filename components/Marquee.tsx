const WORDS = ["Get seen", "Get signed", "Build your profile", "Message clubs", "Win the trial"];

function Bolt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 sm:size-7" fill="currentColor">
      <path d="M13.5 2 4 13.5h6.5L9 22l11-13h-7l.5-7Z" />
    </svg>
  );
}

/** A tilted green ticker between sections. Decorative, so hidden from screen readers. */
export function Marquee() {
  const half = [...WORDS, ...WORDS, ...WORDS];
  return (
    <div aria-hidden="true" className="relative z-10 overflow-x-clip py-8">
      <div className="-rotate-2 scale-x-105 border-y border-accent bg-accent py-3 text-on-accent shadow-[0_0_70px_-12px_var(--color-accent)]">
        <div className="anim-marquee flex w-max" style={{ "--t": "40s" } as React.CSSProperties}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {half.map((w, i) => (
                <span key={i} className="flex items-center gap-6 px-6 font-display text-3xl leading-none font-extrabold whitespace-nowrap uppercase sm:text-4xl">
                  {w}
                  <Bolt />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
