"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/tracker", label: "Tracker" },
  { href: "/dashboard/guide", label: "Guide" },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
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
