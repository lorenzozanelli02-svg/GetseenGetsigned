/** Renders a chapter body: blank lines split paragraphs, "## " starts a subheading, "- " starts a bullet. */
export function GuideText({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <div className="grid gap-5 text-[17px] leading-relaxed text-ink/90">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 1 && lines[0].startsWith("## ")) {
          return (
            <h2 key={i} className="mt-4 font-display text-2xl font-extrabold uppercase text-ink sm:text-3xl">
              {lines[0].slice(3)}
            </h2>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="grid gap-2">
              {lines.map((l) => (
                <li key={l} className="flex gap-3">
                  <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-accent" />
                  {l.slice(2)}
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
}
