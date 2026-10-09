"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import { downloadCv } from "@/lib/cv";
import { publicPath, publicUrl } from "@/lib/profile";
import type { Profile } from "@/lib/store";
import { primaryButton, secondaryButton } from "./ui";

/** Share and download buttons, used in the Profile Builder and on the public player page. */
export function ProfileActions({
  profile,
  showViewLink = false,
  beforeAction,
}: {
  profile: Profile;
  showViewLink?: boolean;
  /** Called first, e.g. to save pending edits so the public page and PDF are current. */
  beforeAction?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [cvState, setCvState] = useState<"idle" | "working" | "error">("idle");
  const ready = profile.name.trim().length > 0;

  async function copy() {
    beforeAction?.();
    if (await copyText(publicUrl(profile))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function download() {
    beforeAction?.();
    setCvState("working");
    try {
      await downloadCv(profile);
      setCvState("idle");
    } catch (err) {
      console.error(err);
      setCvState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {showViewLink && (
          <a
            href={ready ? publicPath(profile) : undefined}
            target="_blank"
            rel="noopener"
            onClick={() => beforeAction?.()}
            aria-disabled={!ready}
            className={`${secondaryButton} ${ready ? "" : "pointer-events-none opacity-50"}`}
          >
            View public page
          </a>
        )}
        <button type="button" onClick={copy} disabled={!ready} className={secondaryButton}>
          <span aria-live="polite">{copied ? "Link copied" : "Copy share link"}</span>
        </button>
        <button type="button" onClick={download} disabled={!ready || cvState === "working"} className={primaryButton}>
          {cvState === "working" ? "Making your CV…" : "Download football CV"}
        </button>
      </div>
      {!ready && <p className="text-xs text-muted">Add your name to get a share link and CV.</p>}
      {cvState === "error" && <p className="text-xs text-danger">The CV couldn&rsquo;t be made. Check your connection and try again.</p>}
    </div>
  );
}
