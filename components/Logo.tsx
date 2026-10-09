/** Text wordmark: "GET SEEN" in white, "GET SIGNED" in the accent green. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-[22px] font-extrabold uppercase leading-none tracking-[0.03em] whitespace-nowrap sm:text-2xl ${className}`}
    >
      Get Seen <span className="text-accent">Get Signed</span>
    </span>
  );
}
