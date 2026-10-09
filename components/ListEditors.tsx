"use client";

import { useState } from "react";
import type { CareerEntry } from "@/lib/store";
import { emptyCareerEntry } from "@/lib/store";
import { inputClass, secondaryButton } from "./ui";

const removeButton =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger";

function RemoveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}

/** Up to `max` short tags, typed or picked from suggestions. */
export function TagInput({ id, tags, onChange, suggestions, max, maxLength = 24 }: { id: string; tags: string[]; onChange: (tags: string[]) => void; suggestions: string[]; max: number; maxLength?: number }) {
  const [draft, setDraft] = useState("");
  const full = tags.length >= max;
  const add = (tag: string) => {
    const t = tag.trim().slice(0, maxLength);
    if (!t || full || tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...tags, t]);
    setDraft("");
  };
  return (
    <div className="grid gap-3">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Your strengths">
          {tags.map((t) => (
            <li key={t} className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pr-1 pl-3 text-sm font-semibold text-on-accent">
              {t}
              <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-black/15">
                <RemoveIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          disabled={full}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={full ? `That's ${max}. Remove one to add another.` : "Type a strength and press Enter"}
          className={`${inputClass} disabled:opacity-50`}
        />
        <button type="button" onClick={() => add(draft)} disabled={full || !draft.trim()} className={`${secondaryButton} shrink-0 px-4`}>
          Add
        </button>
      </div>
      {!full && (
        <div className="flex flex-wrap gap-1.5" aria-label="Suggestions">
          {suggestions
            .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="min-h-8 cursor-pointer rounded-full border border-line px-3 text-xs font-medium text-ink/75 transition-colors hover:border-accent hover:text-accent">
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/** A list of one-line entries with add and remove. */
export function LineList({ idPrefix, items, onChange, max, placeholder, addLabel, itemLabel }: { idPrefix: string; items: string[]; onChange: (items: string[]) => void; max: number; placeholder: string; addLabel: string; itemLabel: string }) {
  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            id={`${idPrefix}-${i}`}
            aria-label={`${itemLabel} ${i + 1}`}
            value={item}
            maxLength={90}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={i === 0 ? placeholder : ""}
            className={inputClass}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`} className={removeButton}>
            <RemoveIcon />
          </button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, ""])} className={`${secondaryButton} w-fit`}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Previous clubs, each with seasons, level, appearances and goals. */
export function CareerEditor({ entries, onChange, max }: { entries: CareerEntry[]; onChange: (entries: CareerEntry[]) => void; max: number }) {
  const set = (i: number, key: keyof CareerEntry, value: string) => onChange(entries.map((e, j) => (j === i ? { ...e, [key]: value } : e)));
  return (
    <div className="grid gap-3">
      {entries.map((e, i) => (
        <div key={e.id} className="grid gap-3 rounded-xl border border-line bg-bg/50 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Club
              <input id={`career-${i}-club`} value={e.club} maxLength={50} onChange={(ev) => set(i, "club", ev.target.value)} className={inputClass} />
            </label>
            <button type="button" onClick={() => onChange(entries.filter((_, j) => j !== i))} aria-label={`Remove ${e.club || `club ${i + 1}`}`} className={removeButton}>
              <RemoveIcon />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1.4fr_0.8fr_0.8fr]">
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Seasons
              <input id={`career-${i}-seasons`} value={e.seasons} maxLength={16} onChange={(ev) => set(i, "seasons", ev.target.value)} placeholder="2023–25" className={inputClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Level
              <input id={`career-${i}-level`} value={e.level} maxLength={40} list="level-options" onChange={(ev) => set(i, "level", ev.target.value)} className={inputClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Apps
              <input id={`career-${i}-apps`} type="number" inputMode="numeric" min={0} value={e.appearances} onChange={(ev) => set(i, "appearances", ev.target.value)} className={inputClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Goals
              <input id={`career-${i}-goals`} type="number" inputMode="numeric" min={0} value={e.goals} onChange={(ev) => set(i, "goals", ev.target.value)} className={inputClass} />
            </label>
          </div>
        </div>
      ))}
      {entries.length < max && (
        <button type="button" onClick={() => onChange([...entries, emptyCareerEntry()])} className={`${secondaryButton} w-fit`}>
          + Add a previous club
        </button>
      )}
    </div>
  );
}
