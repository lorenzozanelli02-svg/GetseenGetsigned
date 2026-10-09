"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Scroll-triggered reveals for everything inside. Mark elements with:
 *   data-reveal="split"    heading lines slide up from behind a mask
 *   data-reveal="up"       fades and rises into place
 *   data-reveal="stagger"  its children rise in one after another
 *   data-parallax          drifts slowly as the section scrolls past
 * Nothing animates when the visitor prefers reduced motion.
 */
export function Reveal({ children, className, as: Tag = "div", ...rest }: { children: React.ReactNode; className?: string; as?: "div" | "section" } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits: SplitText[] = [];
      root.querySelectorAll<HTMLElement>("[data-reveal='split']").forEach((el) => {
        splits.push(
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                rotate: 2,
                duration: 1,
                ease: "power4.out",
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: "top 86%" },
                // The masks clip text-shadow glows into boxes; release them once the lines are in.
                onComplete: () => gsap.set(self.masks, { overflow: "visible" }),
              }),
          }),
        );
      });
      root.querySelectorAll<HTMLElement>("[data-reveal='up']").forEach((el) => {
        gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });
      root.querySelectorAll<HTMLElement>("[data-reveal='stagger']").forEach((el) => {
        gsap.from(el.children, { y: 28, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 86%" } });
      });
      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      return () => splits.forEach((s) => s.revert());
    });
    return () => mm.revert();
  }, []);

  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={className} {...rest}>
      {children}
    </Tag>
  );
}
