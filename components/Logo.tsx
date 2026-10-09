import Image from "next/image";
import mark from "@/public/images/badge-mark.jpg";

/** The round badge plus the "GET SEEN GET SIGNED" wordmark (the badge's own lettering is too small to read at this size). */
export function Logo({ className = "", markSize = 40, textClass = "text-[22px] sm:text-2xl" }: { className?: string; markSize?: number; textClass?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display leading-none font-extrabold tracking-[0.03em] whitespace-nowrap uppercase ${textClass} ${className}`}>
      <Image
        src={mark}
        alt=""
        width={markSize}
        height={markSize}
        className="shrink-0 rounded-full shadow-[0_0_18px_-4px_var(--color-accent)] ring-1 ring-accent/50"
      />
      <span>
        Get Seen <span className="text-accent">Get Signed</span>
      </span>
    </span>
  );
}
