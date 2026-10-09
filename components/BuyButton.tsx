import { SITE } from "@/lib/site";

export function BuyButton({
  children = "Get the playbook",
  size = "lg",
  className = "",
}: {
  children?: React.ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  const sizing = size === "sm" ? "min-h-10 px-5 text-sm" : "min-h-13 px-7 text-base";
  return (
    <a
      href={SITE.checkoutUrl}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent font-semibold text-on-accent shadow-[0_0_36px_-8px_var(--color-accent)] transition-colors hover:bg-accent-hover ${sizing} ${className}`}
    >
      {children}
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 10h11M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
