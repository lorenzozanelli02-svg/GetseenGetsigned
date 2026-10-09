import Image from "next/image";
import hero from "@/public/images/hero.jpg";
import { BuyButton } from "./BuyButton";
import { Eyebrow } from "./Eyebrow";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden lg:items-center">
      {/* The only image loaded eagerly: it's the largest thing above the fold. */}
      <Image
        src={hero}
        alt="A footballer in a black kit walks away across a floodlit pitch at night, towards a goal and a small stand lit in green."
        fill
        preload
        fetchPriority="high"
        placeholder="blur"
        // Cropped with object-cover: on screens taller than 16:9 the photo renders ~178vh wide.
        sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
        className="-z-20 object-cover object-[75%_center] lg:object-[center_20%]"
      />
      {/* Mobile: dark gradient at the bottom where the text sits; the player stays clear above it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-bg from-25% via-bg/70 via-50% to-transparent to-75% lg:hidden" />
      {/* Desktop: darken the empty left side under the text. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-linear-to-r from-bg/85 via-bg/45 via-40% to-transparent to-65% lg:block" />
      {/* Top fade behind the header, bottom fade into the page. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-bg/80 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-bg to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-40 pb-14 sm:px-6 lg:px-8 lg:py-40">
        <div className="max-w-xl">
          <Eyebrow>The playbook for getting scouted</Eyebrow>
          <h1
            id="hero-title"
            className="mt-4 font-display text-[2.9rem] leading-[0.92] font-extrabold tracking-[0.005em] uppercase text-balance sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
          >
            You&rsquo;re good enough. <span className="text-accent">Now get seen.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/80 sm:text-lg">
            The step-by-step plan for getting in front of scouts, standing out at trials and turning interest into a
            contract.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BuyButton />
            <a href="#how-it-works" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
