"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublicProfile, type Profile } from "@/lib/store";
import { PlayerCard } from "./PlayerCard";
import { ProfileActions } from "./ProfileActions";
import { Loading, textLink } from "./ui";

export function PublicProfile({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  useEffect(() => {
    getPublicProfile(slug).then(setProfile);
  }, [slug]);

  if (profile === undefined) return <Loading />;
  if (!profile) {
    return (
      <div className="max-w-xl py-10">
        <h1 className="font-display text-4xl leading-[0.95] font-extrabold uppercase sm:text-5xl">Player not found</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          We couldn&rsquo;t find this player profile. Check the link is complete. While profiles are saved on the device
          they were made on, a link only opens in that player&rsquo;s own browser.
        </p>
        <Link href="/" className={`mt-6 inline-block text-sm ${textLink}`}>
          Go to Get Seen Get Signed
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      <PlayerCard profile={profile} />
      <ProfileActions profile={profile} />
    </div>
  );
}
