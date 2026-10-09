"use client";

import { useEffect, useState } from "react";
import { hasAccess } from "@/lib/store";
import { BuyButton } from "./BuyButton";
import { Eyebrow } from "./Eyebrow";
import { Loading } from "./ui";

/** Only unlocked users see the dashboard and its tools. */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<boolean | null>(null);
  useEffect(() => {
    hasAccess().then(setAccess);
  }, []);

  if (access === null) return <Loading />;
  if (access) return children;
  return (
    <div className="max-w-xl py-6">
      <Eyebrow>Members only</Eyebrow>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl">
        You don&rsquo;t have <span className="text-accent">access yet</span>
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
        Get lifetime access to unlock your dashboard, the Profile Builder, Message Builder, Outreach Tracker and the
        Guide.
      </p>
      <BuyButton className="mt-8" />
    </div>
  );
}
