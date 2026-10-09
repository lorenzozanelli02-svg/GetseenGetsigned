"use client";

import { startCheckout } from "@/lib/checkout";

export function BuyButton({
  children = "Get lifetime access",
  size = "lg",
  className = "",
}: {
  children?: React.ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  const sizing = size === "sm" ? "min-h-10 px-5 text-sm" : "min-h-13 px-7 text-base";
  return (
    <button
      type="button"
      onClick={() => startCheckout()}
      className={`btn-shine group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent font-semibold text-on-accent shadow-[0_0_36px_-8px_var(--color-accent)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_48px_-6px_var(--color-accent)] active:translate-y-0 ${sizing} ${className}`}
    >
      {children}
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 10h11M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
