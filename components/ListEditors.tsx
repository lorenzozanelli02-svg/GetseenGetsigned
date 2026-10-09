"use client";

import { careerYears } from "@/lib/profile";
import type { CareerEntry } from "@/lib/store";
import { emptyCareerEntry } from "@/lib/store";
import { Select } from "./ProfileInputs";
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

/** Previous clubs: name, plus the years there picked from dropdowns. */
export function CareerEditor({ entries, onChange, max }: { entries: CareerEntry[]; onChange: (entries: CareerEntry[]) => void; max: number }) {
  const set = (i: number, key: keyof CareerEntry, value: string) => onChange(entries.map((e, j) => (j === i ? { ...e, [key]: value } : e)));
  const years = careerYears();
  const yearOptions = (current: string) => (current && !years.includes(current) ? [current, ...years] : years);
  return (
    <div className="grid gap-3">
      {entries.map((e, i) => (
        <div key={e.id} className="grid gap-3 rounded-xl border border-line bg-bg/50 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-ink/90">
              Club
              <input id={`career-${i}-club`} value={e.club} maxLength={50} onChange={(ev) => set(i, "club", ev.target.value)} placeholder="e.g. Norton United" className={inputClass} />
            </label>
            <button type="button" onClick={() => onChange(entries.filter((_, j) => j !== i))} aria-label={`Remove ${e.club || `club ${i + 1}`}`} className={removeButton}>
              <RemoveIcon />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["from", "to"] as const).map((key) => (
              <label key={key} className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink/90">
                {key === "from" ? "From" : "To"}
                <Select id={`career-${i}-${key}`} value={e[key]} onChange={(ev) => set(i, key, ev.target.value)}>
                  <option value="">Year</option>
                  {yearOptions(e[key]).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </label>
            ))}
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
