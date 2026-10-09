// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adapted for Get Seen Get Signed: milestones come in as props (alternating above and
// below the line), the photo uses next/image, headings take the site's display font,
// and the section clips its own overflow so the 100vw track never scrolls the page sideways.
"use client";

import Image, { type StaticImageData } from "next/image";
import { type CSSProperties, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP, with `revertOnUpdate: true`: every run gets
   its own gsap.context, and the previous run's tweens and ScrollTriggers are reverted before
   the next. (The original kept one context for the component's lifetime, so when the
   reduced-motion preference was read after hydration, the scroll animations from the first
   run kept overriding the static state.) A callback may return its own cleanup. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;

  useLayoutEffect(() => {
    const el = scope && typeof scope === "object" && "current" in scope ? scope.current : (scope as Element | null);
    let cleanup: (() => void) | undefined;
    const ctx = gsap.context(() => {
      const ret = callback();
      if (typeof ret === "function") cleanup = ret;
    }, el ?? undefined);
    return () => {
      cleanup?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type TimelineItem = {
  /** Unique, letters, numbers and dashes only (used in class names). */
  id: string;
  /** Short heading, e.g. "Week 1". */
  label: string;
  content: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

export type TimelineProps = {
  /** In order. They alternate above and below the line; the layout is tuned for 7 (4 above, 3 below). */
  items: TimelineItem[];
  id?: string;
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  image: StaticImageData | string;
  imageAlt: string;
  /** CSS object-position for the photo. */
  imagePosition?: string;
  /** Extra classes for the title and milestone headings, e.g. a display font. */
  headingClassName?: string;
  /** Reveal animation duration, in seconds. */
  duration?: number;
  /** Fallback reveal duration when `duration` is omitted, in seconds. */
  scrollDuration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getServerReducedMotionSnapshot);
}

/** Scroll windows (percent of the section) in which each milestone draws in; spread evenly for any count. */
function revealWindows(count: number, mobile: boolean): [number, number][] {
  const [first, last, length] = mobile ? [22, 69, 10] : [6, 65, 20];
  return Array.from({ length: count }, (_, i) => {
    const start = count > 1 ? first + ((last - first) * i) / (count - 1) : first;
    return [start, start + length];
  });
}

export default function Timeline({
  items,
  id = "journey",
  title = "Product Storyline",
  periodLabel = "2020-2026",
  textColor = "var(--color-foreground, #000000)",
  mutedTextColor = "var(--color-muted-foreground, #3f3f46)",
  activeColor = "#ff5f00",
  backgroundColor = "var(--color-background, #ffffff)",
  image,
  imageAlt,
  imagePosition = "center",
  headingClassName = "",
  duration,
  scrollDuration = 1.2,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animationDuration = duration ?? scrollDuration;
  const normalizedDuration = Math.max(0.2, animationDuration);
  const topItems = items.filter((_, i) => i % 2 === 0);
  const bottomItems = items.filter((_, i) => i % 2 === 1);
  const sectionStyle: CSSProperties = { color: textColor, backgroundColor };
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isMobile = window.innerWidth < 600;
      const slidePercent = isMobile ? -57 : -65;
      const lineWidth = isMobile ? "65%" : "98%";
      const lineStart = isMobile ? "top 30%" : "top 25%";
      const slideEnd = isMobile ? "82% 50%" : "92% bottom";
      const lineEnd = isMobile ? "80% 50%" : "92% bottom";

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: slideEnd, scrub: true },
        defaults: { ease: "none" },
      });
      tl.fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: slidePercent });

      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }

      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: { trigger: section, start: lineStart, end: lineEnd, scrub: true },
      });
    },
    { dependencies: [reducedMotion], scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.title-${item.id}`, { opacity: 1, clearProps: "transform" });
          gsap.set(`.description-${item.id}`, { opacity: 1, clearProps: "transform" });
        });
        return;
      }

      items.forEach((item) => {
        gsap.set(`.jl-${item.id}`, { scaleY: 0, transformOrigin: "bottom bottom" });
        gsap.set(`.jd-${item.id}`, { scale: 0 });
        gsap.set(`.title-${item.id}`, { opacity: 1 });
        gsap.set(`.description-${item.id}`, { opacity: 1 });
      });

      const titleSplits: Partial<Record<string, SplitTextInstance>> = {};
      const descriptionSplits: Partial<Record<string, SplitTextInstance>> = {};

      items.forEach((item) => {
        titleSplits[item.id] = new SplitText(`.title-${item.id}`, { type: "chars, words, lines", mask: "lines" });
        descriptionSplits[item.id] = new SplitText(`.description-${item.id}`, { type: "chars, words, lines", mask: "lines" });
      });

      const createItemTimeline = (item: JourneyItemWithSide, startPos: number, endPos: number) => {
        const lineSelector = `.jl-${item.id}`;
        const dotSelector = `.jd-${item.id}`;
        const titleLines = titleSplits[item.id]?.lines || [];
        const descriptionLines = descriptionSplits[item.id]?.lines || [];

        if (!item.top) gsap.set(lineSelector, { transformOrigin: "top top" });

        const timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: `${startPos}% 30%`, end: `${endPos}% 50%`, scrub: true },
        });

        timeline
          .to(lineSelector, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(dotSelector, { scale: 1, duration: normalizedDuration * 0.4 }, "<")
          .fromTo(
            titleLines,
            { y: 100 },
            { y: 0, delay: -0.8 * normalizedDuration, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
          )
          .fromTo(descriptionLines, { y: 100 }, { y: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" }, "<");

        return timeline;
      };

      const windows = revealWindows(items.length, window.innerWidth < 600);
      items.forEach((item, index) => {
        const [startPos, endPos] = windows[index];
        createItemTimeline({ ...item, top: index % 2 === 0 }, startPos, endPos);
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);

      return () => {
        Object.values(titleSplits).forEach((split) => split?.revert?.());
        Object.values(descriptionSplits).forEach((split) => split?.revert?.());
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion, items], scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id={id} className="relative h-[200vw] w-full overflow-x-clip max-[600px]:h-[400vh]" style={sectionStyle}>
      <div className="sticky top-[0%] flex h-screen w-screen flex-col justify-center overflow-hidden max-[600px]:top-[5%] max-[600px]:block max-[600px]:pt-[10%]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          <div className="relative h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            <Image src={image} alt={imageAlt} fill draggable={false} sizes="(max-width: 600px) 85vw, 30vw" className="object-cover" style={{ objectPosition: imagePosition }} />
          </div>

          <div className="relative h-full w-full">
            <div className="absolute top-[49%] left-0 flex h-fit w-full -translate-y-1/2 items-center">
              <div className="h-[.8vw] w-[.8vw] rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]" style={activeStyle}></div>
              <div className="journey-line h-px w-[0%] rounded-full" style={activeStyle}></div>
              <div className="h-[.8vw] w-[.8vw] rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]" style={activeStyle}></div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className={`w-[65%] text-[3vw] leading-[0.95] max-[600px]:text-[8.5vw] ${headingClassName}`}>{title}</h2>
              </div>

              <div className="flex h-full w-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topItems.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[30vw] px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
                  >
                    <div className="absolute top-0 bottom-0 left-0 h-full w-full">
                      <div className={`relative aspect-square size-[1vw] translate-x-[-50%] rounded-full max-[600px]:size-[2.5vw] jd-${item.id}`} style={activeStyle}></div>
                      <div className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id}`} style={activeStyle}></div>
                    </div>

                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                      <h3 className={`title-${item.id} text-[2.5vw] leading-none max-[600px]:text-[6.4vw] ${headingClassName}`}>{item.label}</h3>
                      <p className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:w-[90%] max-[600px]:text-[4.8vw]`} style={mutedTextStyle}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] pt-[2vw] max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                <p className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]" style={mutedTextStyle}>
                  {periodLabel}
                </p>
              </div>

              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[600px]:ml-[7vw] max-[600px]:gap-x-[40vw]">
                {bottomItems.map((item) => (
                  <div key={`bottom-${item.id}`} className="relative h-full w-[25vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]">
                    <div className="absolute bottom-[-1%] left-0 h-full w-full">
                      <div className={`h-[94%] w-px origin-top rounded-full max-[600px]:h-full jl-${item.id}`} style={activeStyle}></div>
                      <div className={`relative aspect-square size-[1vw] w-auto translate-x-[-50%] rounded-full max-[600px]:size-[2.5vw] jd-${item.id}`} style={activeStyle}></div>
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      <h3 className={`title-${item.id} text-[2.5vw] leading-none max-[600px]:text-[6.4vw] ${headingClassName}`}>{item.label}</h3>
                      <p className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:w-[90%] max-[600px]:text-[4.8vw]`} style={mutedTextStyle}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type JourneyItemWithSide = TimelineItem & { top: boolean };
