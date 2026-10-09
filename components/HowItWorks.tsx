import Image from "next/image";
import scout from "@/public/images/scout.jpg";
import { Eyebrow } from "./Eyebrow";

const STEPS = [
  {
    title: "Build your profile",
    text: "A highlight reel and one-page player profile that tell a scout what they need to know in under two minutes.",
  },
  {
    title: "Get in front of clubs",
    text: "Contact the right coaches, scouts and trial days, and follow up without being ignored.",
  },
  {
    title: "Win the trial",
    text: "Arrive prepared, play your game and leave the people watching with a reason to call you back.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative isolate scroll-mt-8 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-[1600px]">
        <div className="relative aspect-video w-full">
          <Image
            src={scout}
            alt="A footballer stands with hands behind their back on a floodlit pitch at night, facing the goal, while a scout on the touchline studies a glowing tablet."
            fill
            placeholder="blur"
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover"
          />
          {/* Fade the edges into the page. Side fades only matter once the screen is wider than the 1600px cap. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-bg to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg via-bg/60 to-transparent" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[8%] bg-linear-to-r from-bg to-transparent min-[1601px]:block" />
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[8%] bg-linear-to-l from-bg to-transparent min-[1601px]:block" />
        </div>

        {/* Mobile: below the photo. Desktop: in the empty centre of the photo, between the player and the scout. */}
        <div className="relative -mt-6 px-4 text-center sm:-mt-12 lg:absolute lg:inset-x-0 lg:top-[11%] lg:mt-0">
          <div className="relative mx-auto max-w-md lg:max-w-lg">
            {/* Subtle dark pool behind the text so it reads over the floodlight haze. */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-16 -inset-y-12 -z-10 hidden bg-[radial-gradient(closest-side,rgb(5_8_7/0.75),transparent)] lg:block"
            />
            <Eyebrow>How it works</Eyebrow>
            <h2 id="how-title" className="mt-4 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl lg:text-6xl">
              Get where the <span className="text-accent">scouts are looking</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/80 sm:text-lg">
              Three steps from unseen to on the shortlist.
            </p>
          </div>
        </div>
      </div>

      <ol className="relative mx-auto mt-10 grid max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:-mt-28 lg:px-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-line bg-surface/80 p-6 backdrop-blur-sm">
            <span className="font-display text-3xl font-extrabold text-accent tabular-nums">0{i + 1}</span>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
