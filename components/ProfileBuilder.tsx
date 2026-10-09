"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ageFrom } from "@/lib/dates";
import { resizeImage } from "@/lib/image";
import { formatHeight, LEVELS, POSITION_NAMES, POSITIONS } from "@/lib/profile";
import { emptyProfile, getProfile, saveProfile, type Foot, type Profile } from "@/lib/store";
import { embedUrl, isLink } from "@/lib/video";
import { PlayerCard } from "./PlayerCard";
import { ProfileActions } from "./ProfileActions";
import { Field, inputClass, Loading, PageHeader, secondaryButton, Section } from "./ui";

const MAX_POSITIONS = 3;
const BIO_MAX = 600;

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfileBuilder() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const pending = useRef<Profile | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getProfile().then((p) => setProfile(p ?? emptyProfile()));
  }, []);

  /** Writes any unsaved edits now. Safe to call at any time. */
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    saveProfile(next)
      .then(() => setSaveState("saved"))
      .catch((err: Error) => {
        setSaveState("error");
        setSaveError(err.message);
      });
  }, []);

  // Save when leaving the page with edits still waiting.
  useEffect(() => flush, [flush]);

  function update(changes: Partial<Profile>) {
    if (!profile) return;
    const next = { ...profile, ...changes };
    setProfile(next);
    pending.current = next;
    setSaveState("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
  }

  if (!profile) return <Loading />;

  const text = (key: "name" | "dob" | "heightCm" | "club" | "level" | "previousClubs" | "highlightUrl" | "matchUrl" | "bio") =>
    ({ id: `profile-${key}`, value: profile[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update({ [key]: e.target.value }) });
  const stat = (key: keyof Profile["stats"]) =>
    ({ id: `profile-stat-${key}`, value: profile.stats[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => update({ stats: { ...profile.stats, [key]: e.target.value } }) });
  const coach = (key: keyof Profile["coach"]) =>
    ({ id: `profile-coach-${key}`, value: profile.coach[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => update({ coach: { ...profile.coach, [key]: e.target.value } }) });

  function togglePosition(pos: string) {
    if (!profile) return;
    const has = profile.positions.includes(pos);
    if (!has && profile.positions.length >= MAX_POSITIONS) return;
    update({ positions: has ? profile.positions.filter((p) => p !== pos) : [...profile.positions, pos] });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    try {
      update({ photo: await resizeImage(file) });
    } catch (err) {
      setPhotoError((err as Error).message);
    }
  }

  const age = ageFrom(profile.dob);
  const height = formatHeight(profile.heightCm);
  const badLink = (v: string) => v.trim() !== "" && !isLink(v);

  return (
    <div className="grid gap-8">
      <PageHeader title="Profile Builder" intro="Fill in your details and your player card updates as you type. Everything saves automatically.">
        <SaveStatus state={saveState} error={saveError} />
      </PageHeader>

      <ProfileActions profile={profile} showViewLink beforeAction={flush} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-12">
        <form className="grid min-w-0 gap-5" onSubmit={(e) => e.preventDefault()} aria-label="Your player profile">
          <Section title="About you">
            <Field label="Full name" htmlFor="profile-name">
              <input {...text("name")} className={inputClass} autoComplete="name" placeholder="e.g. Jamie Walker" maxLength={60} />
            </Field>

            <Field label="Photo" htmlFor="profile-photo" hint={photoError ? <span className="text-danger">{photoError}</span> : "A clear head-and-shoulders shot or an action photo. JPEG or PNG."}>
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="profile-photo" className={secondaryButton}>
                  {profile.photo ? "Change photo" : "Upload photo"}
                </label>
                <input id="profile-photo" type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
                {profile.photo && (
                  <button type="button" onClick={() => update({ photo: "" })} className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-accent">
                    Remove
                  </button>
                )}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of birth" htmlFor="profile-dob" hint={age !== null ? `Age ${age}` : undefined}>
                <input {...text("dob")} type="date" className={inputClass} max={new Date().toISOString().slice(0, 10)} />
              </Field>
              <Field label="Height (cm)" htmlFor="profile-heightCm" hint={height ? height.replace(/^\d+ cm /, "") : "e.g. 180"}>
                <input {...text("heightCm")} type="number" inputMode="numeric" min={120} max={220} className={inputClass} placeholder="180" />
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <span id="positions-label" className="text-sm font-medium text-ink/90">
                Position(s) <span className="font-normal text-muted">· pick up to {MAX_POSITIONS}</span>
              </span>
              <div role="group" aria-labelledby="positions-label" className="flex flex-wrap gap-2">
                {POSITIONS.map((pos) => {
                  const on = profile.positions.includes(pos);
                  const full = !on && profile.positions.length >= MAX_POSITIONS;
                  return (
                    <button
                      key={pos}
                      type="button"
                      aria-pressed={on}
                      title={POSITION_NAMES[pos]}
                      disabled={full}
                      onClick={() => togglePosition(pos)}
                      className={`min-h-10 min-w-12 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                        on ? "border-accent bg-accent text-on-accent" : "border-line text-ink/80 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-ink/90">Preferred foot</legend>
              <div className="flex flex-wrap gap-2">
                {(["Right", "Left", "Both"] as Foot[]).map((foot) => (
                  <label
                    key={foot}
                    className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                      profile.foot === foot ? "border-accent bg-accent text-on-accent" : "border-line text-ink/80 hover:border-accent"
                    }`}
                  >
                    <input type="radio" name="foot" value={foot} checked={profile.foot === foot} onChange={() => update({ foot })} className="sr-only" />
                    {foot}
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section title="Club">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current club" htmlFor="profile-club">
                <input {...text("club")} className={inputClass} placeholder="e.g. Hartley Town FC" maxLength={60} />
              </Field>
              <Field label="Level" htmlFor="profile-level" hint="Pick one or type your own.">
                <input {...text("level")} list="level-options" className={inputClass} placeholder="e.g. Step 5" maxLength={50} />
                <datalist id="level-options">
                  {LEVELS.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Previous clubs" htmlFor="profile-previousClubs" hint="One per line, most recent first. Add years if you like, e.g. Norton United (2023–25).">
              <textarea {...text("previousClubs")} rows={3} className={inputClass} />
            </Field>
          </Section>

          <Section title="This season">
            <Field label="Season" htmlFor="profile-stat-season">
              <input {...stat("season")} className={`${inputClass} sm:max-w-40`} placeholder="2025/26" maxLength={12} />
            </Field>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Appearances" htmlFor="profile-stat-appearances">
                <input {...stat("appearances")} type="number" inputMode="numeric" min={0} className={inputClass} />
              </Field>
              <Field label="Goals" htmlFor="profile-stat-goals">
                <input {...stat("goals")} type="number" inputMode="numeric" min={0} className={inputClass} />
              </Field>
              <Field label="Assists" htmlFor="profile-stat-assists">
                <input {...stat("assists")} type="number" inputMode="numeric" min={0} className={inputClass} />
              </Field>
              <Field label="Clean sheets" htmlFor="profile-stat-cleanSheets">
                <input {...stat("cleanSheets")} type="number" inputMode="numeric" min={0} className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section title="Video">
            <Field
              label="Highlight video link"
              htmlFor="profile-highlightUrl"
              hint={
                badLink(profile.highlightUrl) ? (
                  <span className="text-danger">Paste the full link, starting with https://</span>
                ) : profile.highlightUrl && !embedUrl(profile.highlightUrl) ? (
                  "This link shows as a button. YouTube and Vimeo links play on your card."
                ) : (
                  "YouTube and Vimeo links play on your card. Hudl, Veo and other links show as a button."
                )
              }
            >
              <input {...text("highlightUrl")} type="url" inputMode="url" className={inputClass} placeholder="https://youtu.be/…" />
            </Field>
            <Field
              label="Full match link"
              htmlFor="profile-matchUrl"
              hint={badLink(profile.matchUrl) ? <span className="text-danger">Paste the full link, starting with https://</span> : "Optional. Scouts often want to see a whole game."}
            >
              <input {...text("matchUrl")} type="url" inputMode="url" className={inputClass} placeholder="https://" />
            </Field>
          </Section>

          <Section title="Coach reference">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Coach name" htmlFor="profile-coach-name">
                <input {...coach("name")} className={inputClass} maxLength={60} />
              </Field>
              <Field label="Their club" htmlFor="profile-coach-club">
                <input {...coach("club")} className={inputClass} maxLength={60} />
              </Field>
            </div>
            <Field label="Contact (email or phone)" htmlFor="profile-coach-contact" hint="Ask your coach before you share their details.">
              <input {...coach("contact")} className={inputClass} maxLength={80} />
            </Field>
          </Section>

          <Section title="Short bio">
            <Field
              label="About your game"
              htmlFor="profile-bio"
              hint={`2–4 sentences: how you play, your strengths and what you're looking for. ${profile.bio.length}/${BIO_MAX}`}
            >
              <textarea {...text("bio")} rows={5} maxLength={BIO_MAX} className={inputClass} />
            </Field>
          </Section>
        </form>

        <div className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto lg:pb-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Live preview</h2>
          <PlayerCard profile={profile} preview />
        </div>
      </div>
    </div>
  );
}

function SaveStatus({ state, error }: { state: SaveState; error: string }) {
  const label = { idle: "", saving: "Saving…", saved: "All changes saved", error }[state];
  return (
    <p aria-live="polite" className={`text-sm ${state === "error" ? "text-danger" : "text-muted"}`}>
      {label}
    </p>
  );
}
