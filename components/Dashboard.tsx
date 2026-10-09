"use client";

import { useEffect, useState } from "react";
import { hasAccess, resetAccess } from "@/lib/access";
import { BuyButton } from "./BuyButton";
import { Eyebrow } from "./Eyebrow";

// None of these tools are built yet; they show as "Coming soon" and don't link anywhere.
const TOOLS = [
  { name: "Profile Builder", text: "Build your one-page player profile." },
  { name: "Message Builder", text: "Write messages to clubs, coaches and scouts." },
  { name: "Outreach Tracker", text: "Keep track of every club you contact." },
  { name: "Guide", text: "The step-by-step playbook for getting scouted." },
];

const titleClass = "mt-3 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl";

export function Dashboard() {
  // null until we've read localStorage, which only exists in the browser.
  const [access, setAccess] = useState<boolean | null>(null);
  useEffect(() => setAccess(hasAccess()), []);

  if (access === null) return <div className="min-h-64" aria-busy="true" />;

  if (!access) {
    return (
      <div className="max-w-xl">
        <Eyebrow>Dashboard</Eyebrow>
        <h1 className={titleClass}>
          You don&rsquo;t have <span className="text-accent">access yet</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Get lifetime access to unlock your dashboard and tools.
        </p>
        <BuyButton className="mt-8" />
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>Lifetime access</Eyebrow>
      <h1 className={titleClass}>
        Your <span className="text-accent">dashboard</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Test mode: access was unlocked without a payment. This changes once real payments are connected.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <li key={tool.name} className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{tool.name}</h2>
              <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">
                Coming soon
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{tool.text}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          resetAccess();
          setAccess(false);
        }}
        className="mt-10 cursor-pointer text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent"
      >
        Reset test access
      </button>
    </div>
  );
}
