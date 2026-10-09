"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAPTERS, type Chapter } from "@/content/guide";
import { getReadChapters, setChapterRead } from "@/lib/store";
import { GuideText, readingMinutes } from "./GuideText";
import { card, Loading, PageHeader, primaryButton, secondaryButton, textLink } from "./ui";

/** Read ticks for chapters that still exist (old ids from removed chapters are ignored). */
function useReadChapters() {
  const [read, setRead] = useState<Set<string> | null>(null);
  useEffect(() => {
    getReadChapters().then((ids) => setRead(new Set(ids)));
  }, []);
  async function toggle(id: string, isRead: boolean) {
    setRead(new Set(await setChapterRead(id, isRead)));
  }
  const count = read ? CHAPTERS.filter((c) => read.has(c.id)).length : 0;
  return { read, toggle, count };
}

const chapterHref = (c: Chapter) => `/dashboard/guide/${c.id}`;

export function GuideHome() {
  const { read, toggle, count } = useReadChapters();
  if (!read) return <Loading />;
  const next = CHAPTERS.find((c) => !read.has(c.id));

  return (
    <div className="grid gap-8">
      <PageHeader title="The Guide" intro="Work through the chapters in order, or jump to the one you need. Tick each one off as you go.">
        {next && (
          <Link href={chapterHref(next)} className={primaryButton}>
            {count === 0 ? "Start reading" : "Continue reading"}
          </Link>
        )}
      </PageHeader>

      <Progress count={count} />

      <ol className="grid gap-3">
        {CHAPTERS.map((c, i) => (
          <ChapterRow key={c.id} chapter={c} number={i + 1} isRead={read.has(c.id)} onToggle={toggle} />
        ))}
      </ol>
    </div>
  );
}

function Progress({ count }: { count: number }) {
  const pct = Math.round((count / CHAPTERS.length) * 100);
  return (
    <div className="max-w-md">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">
          {count} of {CHAPTERS.length}
        </span>{" "}
        chapters read
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={CHAPTERS.length} aria-label="Guide progress">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReadTick({ chapter, isRead, onToggle }: { chapter: Chapter; isRead: boolean; onToggle: (id: string, read: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(chapter.id, !isRead)}
      aria-pressed={isRead}
      aria-label={`Mark "${chapter.title}" as ${isRead ? "unread" : "read"}`}
      className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
        isRead ? "border-accent bg-accent text-on-accent" : "border-line text-transparent hover:border-accent hover:text-accent/50"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6">
        <path d="M5 10.5l3.2 3L15 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ChapterRow({ chapter, number, isRead, onToggle }: { chapter: Chapter; number: number; isRead: boolean; onToggle: (id: string, read: boolean) => void }) {
  return (
    <li className={`${card} flex items-center gap-4 p-4 sm:p-5`} data-chapter={chapter.id}>
      <span className="w-8 shrink-0 font-display text-2xl font-extrabold text-accent tabular-nums">{String(number).padStart(2, "0")}</span>
      <Link href={chapterHref(chapter)} className="group min-w-0 flex-1">
        <span className="block font-semibold group-hover:text-accent">{chapter.title}</span>
        <span className="mt-0.5 block text-sm text-muted">{chapter.summary}</span>
      </Link>
      <span className="hidden shrink-0 text-xs text-muted sm:block">{readingMinutes(chapter.body)} min</span>
      <ReadTick chapter={chapter} isRead={isRead} onToggle={onToggle} />
    </li>
  );
}

export function ChapterView({ index }: { index: number }) {
  const { read, toggle, count } = useReadChapters();
  if (!read) return <Loading />;
  const chapter = CHAPTERS[index];
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];
  const isRead = read.has(chapter.id);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-16">
      <aside className="hidden lg:block">
        <div className="sticky top-6 grid gap-5">
          <Link href="/dashboard/guide" className={`text-sm ${textLink}`}>
            All chapters
          </Link>
          <Progress count={count} />
          <nav aria-label="Chapters">
            <ol className="grid gap-1">
              {CHAPTERS.map((c, i) => (
                <li key={c.id}>
                  <Link
                    href={chapterHref(c)}
                    aria-current={i === index ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${i === index ? "bg-accent/10 text-accent" : "text-ink/75 hover:text-accent"}`}
                  >
                    <span className="w-5 shrink-0 tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1">{c.title}</span>
                    {read.has(c.id) && <span className="text-accent" aria-label="read">✓</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </aside>

      <article className="min-w-0 max-w-2xl">
        <Link href="/dashboard/guide" className={`text-sm lg:hidden ${textLink}`}>
          All chapters
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent lg:mt-0">
          Chapter {index + 1} of {CHAPTERS.length} · {readingMinutes(chapter.body)} min read
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl">{chapter.title}</h1>
        <div className="mt-8">
          <GuideText body={chapter.body} />
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <button type="button" onClick={() => toggle(chapter.id, !isRead)} aria-pressed={isRead} className={isRead ? secondaryButton : primaryButton}>
            {isRead ? "✓ Read · mark as unread" : "Mark as read"}
          </button>
          <nav aria-label="Chapter navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={chapterHref(prev)} className={`${card} block p-4 transition-colors hover:border-accent`} rel="prev">
                <span className="text-xs text-muted">← Previous</span>
                <span className="mt-1 block font-semibold">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={chapterHref(next)} className={`${card} block p-4 text-right transition-colors hover:border-accent`} rel="next">
                <span className="text-xs text-muted">Next →</span>
                <span className="mt-1 block font-semibold">{next.title}</span>
              </Link>
            ) : (
              <Link href="/dashboard/guide" className={`${card} block p-4 text-right transition-colors hover:border-accent`}>
                <span className="text-xs text-muted">Finished</span>
                <span className="mt-1 block font-semibold">Back to all chapters</span>
              </Link>
            )}
          </nav>
        </div>
      </article>
    </div>
  );
}
