import Image from "next/image";
import scout from "@/public/images/scout.jpg";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

/** Lead-in to the pinned journey timeline that follows it on the page. */
export function HowItWorks() {
  return (
    <Reveal as="section" id="how-it-works" aria-labelledby="how-title" className="relative isolate scroll-mt-20">
      <div className="relative mx-auto max-w-[1600px]">
        <div className="relative aspect-video w-full overflow-hidden">
          <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
            <Image
              src={scout}
              alt="A footballer stands with hands behind their back on a floodlit pitch at night, facing the goal, while a scout on the touchline studies a glowing tablet."
              fill
              placeholder="blur"
              sizes="(min-width: 1600px) 1600px, 100vw"
              className="object-cover"
            />
          </div>
          {/* Fade the edges into the page. Side fades only matter once the screen is wider than the 1600px cap. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-bg to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg via-bg/60 to-transparent" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[8%] bg-linear-to-r from-bg to-transparent min-[1601px]:block" />
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[8%] bg-linear-to-l from-bg to-transparent min-[1601px]:block" />
        </div>

        {/* Mobile: below the photo. Desktop: in the empty centre of the photo, between the player and the scout. */}
        <div className="relative -mt-6 px-4 text-center sm:-mt-12 lg:absolute lg:inset-x-0 lg:top-[11%] lg:mt-0">
          <div className="relative mx-auto max-w-md lg:max-w-xl">
            <div aria-hidden="true" className="absolute -inset-x-16 -inset-y-12 -z-10 hidden bg-[radial-gradient(closest-side,rgb(5_8_7/0.75),transparent)] lg:block" />
            <div data-reveal="up">
              <Eyebrow>How it works</Eyebrow>
            </div>
            <h2 id="how-title" data-reveal="split" className="mt-4 font-display text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl lg:text-7xl">
              Get where the <span className="text-accent [text-shadow:0_0_28px_rgb(59_229_132/0.45)]">scouts are looking</span>
            </h2>
            <p data-reveal="up" className="mt-5 text-base leading-relaxed text-ink/80 sm:text-lg">
              Seven steps from unseen to signed. Keep scrolling.
            </p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-2xl text-accent">
              ↓
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
