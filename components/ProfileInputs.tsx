"use client";

import { useState } from "react";
import { MAX_POSITIONS, PITCH_SPOTS, POSITION_NAMES } from "@/lib/profile";
import { inputClass } from "./ui";

/* Tap-first inputs for the Profile Builder, so players type as little as possible. */

export function chipClass(on: boolean) {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors select-none disabled:cursor-not-allowed disabled:opacity-35 ${
    on ? "border-accent bg-accent text-on-accent" : "border-line text-ink/85 hover:border-accent hover:text-accent"
  }`;
}

/** One choice from a row of buttons. Tapping the chosen one again clears it. */
export function ChoiceButtons<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T | "") => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-ink/90">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className={`${chipClass(value === o.value)} min-w-20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent`}>
            <input
              id={`${name}-${o.value}`}
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              onClick={() => value === o.value && onChange("")}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A native dropdown styled like the other inputs. */
export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select {...props} className={`${inputClass} min-h-11 cursor-pointer appearance-none pr-10`}>
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Whole numbers with big − and + buttons. Empty means "not filled in". */
export function Stepper({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const n = value === "" ? null : Number(value);
  const button =
    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl font-semibold text-accent transition-colors hover:bg-accent/12 disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-transparent";
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink/90">
        {label}
      </label>
      <div className="flex items-center rounded-2xl border border-line bg-bg p-1 focus-within:border-accent">
        <button type="button" aria-label={`Lower ${label.toLowerCase()}`} disabled={!n} onClick={() => onChange(String(Math.max(0, (n ?? 0) - 1)))} className={button}>
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          placeholder="–"
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 3))}
          className="w-full min-w-0 bg-transparent text-center font-display text-3xl leading-none font-extrabold text-ink tabular-nums placeholder:text-muted/40 focus:outline-none"
        />
        <button type="button" aria-label={`Raise ${label.toLowerCase()}`} disabled={(n ?? 0) >= 999} onClick={() => onChange(String((n ?? 0) + 1))} className={button}>
          +
        </button>
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Date of birth as three dropdowns (day, month, year). Saves only once all three are picked. */
export function DateOfBirth({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [parts, setParts] = useState(() => {
    const [y = "", m = "", d = ""] = value.split("-");
    return { d: d ? String(Number(d)) : "", m: m ? String(Number(m)) : "", y };
  });
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => String(thisYear - 6 - i));

  function set(key: "d" | "m" | "y", v: string) {
    const next = { ...parts, [key]: v };
    if (next.d && next.m && next.y) {
      const daysInMonth = new Date(Number(next.y), Number(next.m), 0).getDate();
      if (Number(next.d) > daysInMonth) next.d = String(daysInMonth);
      onChange(`${next.y}-${next.m.padStart(2, "0")}-${next.d.padStart(2, "0")}`);
    } else if (value) {
      onChange("");
    }
    setParts(next);
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-ink/90">Date of birth</legend>
      <div className="grid grid-cols-[1fr_1.25fr_1.35fr] gap-2">
        <Select id="profile-dob-day" aria-label="Day" value={parts.d} onChange={(e) => set("d", e.target.value)}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i} value={String(i + 1)}>
              {i + 1}
            </option>
          ))}
        </Select>
        <Select id="profile-dob-month" aria-label="Month" value={parts.m} onChange={(e) => set("m", e.target.value)}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </Select>
        <Select id="profile-dob-year" aria-label="Year" value={parts.y} onChange={(e) => set("y", e.target.value)}>
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </fieldset>
  );
}

/** An on/off switch. */
export function Switch({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: (on: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${checked ? "border-accent bg-accent" : "border-line bg-bg"}`}
      >
        <span aria-hidden="true" className={`size-5 rounded-full shadow transition-transform ${checked ? "translate-x-6 bg-on-accent" : "translate-x-1 bg-muted"}`} />
      </button>
      <div id={`${id}-label`} className="text-sm text-ink/90">
        {children}
      </div>
    </div>
  );
}

/** Pick up to three positions by tapping where you play on a pitch. The first pick is the main position. */
export function PitchPicker({ value, onChange, invalid }: { value: string[]; onChange: (positions: string[]) => void; invalid?: boolean }) {
  const full = value.length >= MAX_POSITIONS;
  const toggle = (pos: string) => {
    if (value.includes(pos)) onChange(value.filter((p) => p !== pos));
    else if (!full) onChange([...value, pos]);
  };
  const [main, ...others] = value.map((p) => POSITION_NAMES[p] ?? p);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-medium text-ink/90">
        Position <span className="text-accent">*</span>
      </legend>
      <p className="mb-3 text-xs leading-relaxed text-muted">Tap where you play, up to {MAX_POSITIONS}. Your first pick is your main position.</p>
      <div
        className={`relative mx-auto aspect-[68/90] w-full max-w-[21rem] overflow-hidden rounded-2xl border bg-[repeating-linear-gradient(180deg,rgb(59_229_132/0.07)_0_10%,rgb(59_229_132/0.03)_10%_20%)] ${
          invalid ? "border-danger" : "border-line"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 68 90" className="absolute inset-0 size-full" fill="none" stroke="rgb(241 245 242 / 0.16)" strokeWidth="0.5">
          <rect x="3" y="3" width="62" height="84" rx="1" />
          <line x1="3" y1="45" x2="65" y2="45" />
          <circle cx="34" cy="45" r="7.5" />
          <rect x="15" y="3" width="38" height="13" />
          <rect x="25" y="3" width="18" height="5" />
          <rect x="15" y="74" width="38" height="13" />
          <rect x="25" y="82" width="18" height="5" />
          <path d="M27.5 16a7 7 0 0 0 13 0M27.5 74a7 7 0 0 1 13 0" />
        </svg>
        {Object.entries(PITCH_SPOTS).map(([pos, { x, y }]) => {
          const order = value.indexOf(pos);
          const on = order !== -1;
          return (
            <button
              key={pos}
              id={`position-${pos}`}
              type="button"
              aria-pressed={on}
              aria-label={POSITION_NAMES[pos]}
              title={POSITION_NAMES[pos]}
              disabled={!on && full}
              onClick={() => toggle(pos)}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              className={`absolute flex h-10 min-w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border px-1.5 text-xs font-bold tracking-wide transition-[background-color,border-color,color,box-shadow] disabled:cursor-not-allowed disabled:opacity-35 ${
                on ? "border-accent bg-accent text-on-accent shadow-[0_0_22px_-4px_var(--color-accent)]" : "border-line bg-bg/85 text-ink/85 hover:border-accent hover:text-accent"
              }`}
            >
              {pos}
              {on && (
                <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-bg">
                  {order + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink/90">
        {main ? (
          <>
            <span className="text-muted">Main:</span> <span className="font-semibold">{main}</span>
            {others.length > 0 && (
              <>
                <span className="text-muted"> · Also:</span> {others.join(", ")}
              </>
            )}
          </>
        ) : null}
      </p>
    </fieldset>
  );
}
