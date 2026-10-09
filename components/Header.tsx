import Link from "next/link";
import { BuyButton } from "./BuyButton";
import { Logo } from "./Logo";

const NAV = [
  { href: "#problem", label: "The problem" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#included", label: "What's included" },
];

/** Sits on top of the hero image; the hero adds a top fade so it stays readable. */
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Get Seen Get Signed, home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-ink/80 transition-colors hover:text-accent">
              {item.label}
            </a>
          ))}
          <BuyButton size="sm">Get started</BuyButton>
        </nav>
      </div>
    </header>
  );
}
