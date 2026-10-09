import Image from "next/image";
import problem from "@/public/images/problem.jpg";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

const PAINS = [
  "No footage a scout would actually sit through",
  "No contacts at the clubs you want to play for",
  "No plan for the trial, if one ever comes",
];

export function Problem() {
  return (
    <Reveal as="section" id="problem" aria-labelledby="problem-title" className="relative isolate scroll-mt-20 overflow-hidden lg:py-36">
      {/* Player kneels on the left of the photo, so the image anchors left and the copy sits on the right. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:absolute lg:inset-y-0 lg:left-0 lg:-z-10 lg:aspect-auto lg:w-[70%]">
        <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
          <Image
            src={problem}
            alt="A footballer kneels alone on a wet, floodlit pitch at night with their head in their hands, while a lone figure stands by the far goal."
            fill
            placeholder="blur"
            sizes="(min-width: 640px) 100vw, 134vw"
            className="object-cover object-[30%_center]"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-bg to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg to-transparent" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-3/5 bg-linear-to-l from-bg via-bg/70 to-transparent lg:block" />
      </div>

      <div className="relative mx-auto -mt-16 grid max-w-7xl px-4 pb-20 sm:-mt-24 sm:px-6 lg:mt-0 lg:grid-cols-2 lg:px-8 lg:pb-0">
        <div className="lg:col-start-2 lg:pl-8 xl:pl-16">
          <div data-reveal="up">
            <Eyebrow>The problem</Eyebrow>
          </div>
          <h2 id="problem-title" data-reveal="split" className="mt-4 font-display text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl lg:text-7xl">
            Talent isn&rsquo;t the problem. <span className="text-accent [text-shadow:0_0_28px_rgb(59_229_132/0.45)]">Nobody&rsquo;s watching.</span>
          </h2>
          <p data-reveal="up" className="mt-6 text-base leading-relaxed text-ink/80 sm:text-lg">
            You train, you play, you put the work in. Then the final whistle goes and nobody who could change your career even knew you were
            there.
          </p>
          <ul data-reveal="stagger" className="mt-7 space-y-3">
            {PAINS.map((pain) => (
              <li key={pain} className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface/60 px-4 py-3 text-[15px] text-ink/90 backdrop-blur-sm sm:text-base">
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
                  <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
                  </svg>
                </span>
                {pain}
              </li>
            ))}
          </ul>
          <p data-reveal="up" className="mt-7 text-base leading-relaxed text-muted">
            Good players get missed every weekend. Not because they aren&rsquo;t good enough, but because they&rsquo;re invisible.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
