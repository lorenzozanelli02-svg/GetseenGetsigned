"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuyButton } from "./BuyButton";
import { Logo } from "./Logo";

const NAV = [
  { href: "#problem", label: "The problem" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#included", label: "What's included" },
];

/** Fixed header: see-through over the hero, then a blurred dark bar once the page scrolls. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled ? "border-line/80 bg-bg/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Get Seen Get Signed, home">
          <Logo markSize={36} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="group relative text-sm font-medium text-ink/80 transition-colors hover:text-accent">
              {item.label}
              <span aria-hidden="true" className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
          <BuyButton size="sm">Get started</BuyButton>
        </nav>
      </div>
    </header>
  );
}
