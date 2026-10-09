"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAPTERS } from "@/content/guide";
import { formatDate } from "@/lib/dates";
import { profileProgress } from "@/lib/profile";
import { getProfile, getReadChapters, listContacts, listMessages, resetAccess, type Contact, type Profile } from "@/lib/store";
import { dueFollowUps, dueLabel, trackerStats } from "@/lib/tracker";
import { Eyebrow } from "./Eyebrow";
import { card, Loading, textLink } from "./ui";

type Data = { profile: Profile | null; messages: number; contacts: Contact[]; chaptersRead: number };

export function Dashboard() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    Promise.all([getProfile(), listMessages(), listContacts(), getReadChapters()]).then(([profile, messages, contacts, read]) =>
      setData({ profile, messages: messages.length, contacts, chaptersRead: CHAPTERS.filter((c) => read.includes(c.id)).length }),
    );
  }, []);

  if (!data) return <Loading />;
  const profile = profileProgress(data.profile);
  const tracker = trackerStats(data.contacts);
  const due = dueFollowUps(data.contacts);
  const firstName = data.profile?.name.trim().split(/\s+/)[0];

  return (
    <div className="grid gap-10">
      <div>
        <Eyebrow>Lifetime access</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl">
          Your <span className="text-accent">dashboard</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          {firstName ? `Welcome back, ${firstName}. ` : ""}Test mode: access was unlocked without a payment.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ul className="grid gap-4 sm:grid-cols-2">
          <ToolCard
            href="/dashboard/profile"
            name="Profile Builder"
            value={profile.complete ? "Complete" : `${profile.done}/${profile.total}`}
            detail={profile.complete ? "Your player card and CV are ready to share." : `Next: add your ${profile.missing[0].toLowerCase()}.`}
            progress={profile.done / profile.total}
            done={profile.complete}
          />
          <ToolCard
            href="/dashboard/messages"
            name="Message Builder"
            value={String(data.messages)}
            detail={data.messages === 1 ? "message written" : "messages written"}
          />
          <ToolCard
            href="/dashboard/tracker"
            name="Outreach Tracker"
            value={String(tracker.clubs)}
            detail={`${tracker.clubs === 1 ? "club" : "clubs"} contacted · ${tracker.replies} ${tracker.replies === 1 ? "reply" : "replies"}`}
          />
          <ToolCard
            href="/dashboard/guide"
            name="Guide"
            value={`${data.chaptersRead}/${CHAPTERS.length}`}
            detail="chapters read"
            progress={data.chaptersRead / CHAPTERS.length}
            done={data.chaptersRead === CHAPTERS.length}
          />
        </ul>

        <section aria-labelledby="due-title" className={`${card} p-5 sm:p-6`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="due-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Follow-ups due
            </h2>
            {due.length > 0 && <span className="font-display text-2xl font-extrabold text-warn tabular-nums">{due.length}</span>}
          </div>
          {due.length === 0 ? (
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              {data.contacts.length === 0
                ? "Follow-up dates you set in the Outreach Tracker show up here when they're due."
                : "Nothing due today. You're up to date."}
            </p>
          ) : (
            <ul className="mt-4 grid gap-1">
              {due.map(({ contact, due: d }) => (
                <li key={contact.id}>
                  <Link href="/dashboard/tracker" className="-mx-2 flex items-start justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-bg">
                    <span className="min-w-0">
                      <span className="block font-semibold break-words">{contact.club}</span>
                      <span className="block text-sm text-muted">
                        {[contact.contactName, `sent ${formatDate(contact.dateSent)}`].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className={`shrink-0 pt-0.5 text-xs font-semibold ${d.kind === "overdue" ? "text-danger" : "text-warn"}`}>{dueLabel(d)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/tracker" className={`mt-4 inline-block text-sm ${textLink}`}>
            Open tracker
          </Link>
        </section>
      </div>

      <button
        type="button"
        onClick={async () => {
          await resetAccess();
          window.location.reload();
        }}
        className="w-fit cursor-pointer text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent"
      >
        Reset test access
      </button>
    </div>
  );
}

function ToolCard({ href, name, value, detail, progress, done }: { href: string; name: string; value: string; detail: string; progress?: number; done?: boolean }) {
  return (
    <li>
      <Link href={href} className={`${card} group flex h-full flex-col p-5 transition-colors hover:border-accent sm:p-6`}>
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold">{name}</span>
          <span aria-hidden="true" className="text-muted transition-colors group-hover:text-accent">
            →
          </span>
        </span>
        <span className={`mt-5 font-display text-5xl leading-none font-extrabold tabular-nums ${done ? "text-accent" : "text-ink"}`}>{value}</span>
        <span className="mt-1.5 text-sm text-muted">{detail}</span>
        {progress !== undefined && (
          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        )}
      </Link>
    </li>
  );
}
