"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/tracker", label: "Tracker" },
  { href: "/dashboard/guide", label: "Guide" },
];

export function DashboardNav() {
  const path = usePathname();
  const scroller = useRef<HTMLElement>(null);

  // On narrow screens the row scrolls sideways; bring the current tool into view.
  useEffect(() => {
    const box = scroller.current;
    const active = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (box && active) box.scrollLeft = active.offsetLeft - (box.clientWidth - active.clientWidth) / 2;
  }, [path]);

  return (
    <nav
      ref={scroller}
      aria-label="Dashboard"
      className="-mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:mx-0 sm:px-0 sm:[mask-image:none]"
    >
      <ul className="flex min-w-max gap-1 pr-6 sm:pr-0">
        {ITEMS.map((item) => {
          const active = item.href === "/dashboard" ? path === item.href : path.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                  active ? "bg-accent/12 text-accent" : "text-ink/75 hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
