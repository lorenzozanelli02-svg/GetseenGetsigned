"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ageFrom } from "@/lib/dates";
import { resizeImage } from "@/lib/image";
import { formatHeight, formatWeight, LEVELS, MAX_CAREER, MAX_HONOURS, MAX_STRENGTHS, POSITION_NAMES, POSITIONS, STRENGTHS, TRAVEL_OPTIONS } from "@/lib/profile";
import { emptyProfile, getProfile, saveProfile, type Foot, type Profile } from "@/lib/store";
import { embedUrl, isLink } from "@/lib/video";
import { CareerEditor, LineList, TagInput } from "./ListEditors";
import { PlayerCard } from "./PlayerCard";
import { ProfileActions } from "./ProfileActions";
import { Field, inputClass, Loading, PageHeader, secondaryButton, Section } from "./ui";

const MAX_POSITIONS = 3;
const BIO_MAX = 500;

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

  const text = (key: "name" | "dob" | "heightCm" | "club" | "level" | "highlightUrl" | "matchUrl" | "bio" | "lookingFor") =>
    ({ id: `profile-${key}`, value: profile[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update({ [key]: e.target.value }) });
  const stat = (key: keyof Profile["stats"]) =>
    ({ id: `profile-stat-${key}`, value: profile.stats[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => update({ stats: { ...profile.stats, [key]: e.target.value } }) });
  const coach = (key: keyof Profile["coach"]) =>
    ({ id: `profile-coach-${key}`, value: profile.coach[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => update({ coach: { ...profile.coach, [key]: e.target.value } }) });
  /** Inputs for the grouped fields: contact, physical, availability, education. */
  function group<G extends "contact" | "physical" | "availability" | "education">(g: G, key: keyof Profile[G] & string) {
    const current = profile![g] as Record<string, string>;
    return { id: `profile-${g}-${key}`, value: current[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => update({ [g]: { ...current, [key]: e.target.value } } as Partial<Profile>) };
  }

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

            <Field label="Date of birth" htmlFor="profile-dob" hint={age !== null ? `Age ${age}` : undefined}>
              <input {...text("dob")} type="date" className={`${inputClass} sm:max-w-56`} max={new Date().toISOString().slice(0, 10)} />
            </Field>

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

          <Section title="What you're looking for">
            <Field label="In one line" htmlFor="profile-lookingFor" hint="Shown near the top of your card and CV.">
              <input {...text("lookingFor")} className={inputClass} maxLength={120} placeholder="e.g. A trial at Step 3 or above, or a US college scholarship for fall 2027" />
            </Field>
          </Section>

          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="profile-contact-phone">
                <input {...group("contact", "phone")} type="tel" autoComplete="tel" className={inputClass} maxLength={30} />
              </Field>
              <Field label="Email" htmlFor="profile-contact-email">
                <input {...group("contact", "email")} type="email" autoComplete="email" className={inputClass} maxLength={80} />
              </Field>
              <Field label="Town or city" htmlFor="profile-contact-location">
                <input {...group("contact", "location")} autoComplete="address-level2" className={inputClass} maxLength={40} placeholder="e.g. Leeds" />
              </Field>
              <Field label="Nationality" htmlFor="profile-contact-nationality">
                <input {...group("contact", "nationality")} className={inputClass} maxLength={40} placeholder="e.g. English" />
              </Field>
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/90">
              <input
                id="profile-showContactPublic"
                type="checkbox"
                checked={profile.showContactPublic}
                onChange={(e) => update({ showContactPublic: e.target.checked })}
                className="mt-0.5 size-4 accent-[var(--color-accent)]"
              />
              <span>
                Show my phone and email on my public page
                <span className="block text-xs text-muted">They&rsquo;re always on your CV. If you&rsquo;re under 18, ask a parent or guardian first.</span>
              </span>
            </label>
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

          <Section title="Career history">
            <p className="-mt-1 text-xs leading-relaxed text-muted">Your previous clubs, most recent first. Your current club and this season&rsquo;s numbers are added at the top automatically.</p>
            <CareerEditor entries={profile.career} onChange={(career) => update({ career })} max={MAX_CAREER} />
          </Section>

          <Section title="Key strengths">
            <Field label={`Up to ${MAX_STRENGTHS} short tags`} htmlFor="profile-strength-input">
              <TagInput id="profile-strength-input" tags={profile.strengths} onChange={(strengths) => update({ strengths })} suggestions={STRENGTHS} max={MAX_STRENGTHS} />
            </Field>
          </Section>

          <Section title="Honours and representative football">
            <p className="-mt-1 text-xs leading-relaxed text-muted">County, district or school squads, academy spells and awards. One per line.</p>
            <LineList
              idPrefix="profile-honour"
              items={profile.honours}
              onChange={(honours) => update({ honours })}
              max={MAX_HONOURS}
              itemLabel="Honour"
              addLabel="Add an honour"
              placeholder="e.g. West Riding County FA U18 squad (2025)"
            />
          </Section>

          <Section title="Physical">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Height (cm)" htmlFor="profile-heightCm" hint={height ? height.replace(/^\d+ cm /, "") : "e.g. 180"}>
                <input {...text("heightCm")} type="number" inputMode="numeric" min={120} max={220} className={inputClass} placeholder="180" />
              </Field>
              <Field label="Weight (kg)" htmlFor="profile-physical-weightKg" hint={formatWeight(profile.physical.weightKg).replace(/^\d+ kg /, "") || "e.g. 72"}>
                <input {...group("physical", "weightKg")} type="number" inputMode="numeric" min={30} max={150} className={inputClass} placeholder="72" />
              </Field>
              <Field label="Sprint time (optional)" htmlFor="profile-physical-sprint">
                <input {...group("physical", "sprint")} className={inputClass} maxLength={30} placeholder="e.g. 30 m in 4.1 s" />
              </Field>
              <Field label="Fitness test (optional)" htmlFor="profile-physical-fitness">
                <input {...group("physical", "fitness")} className={inputClass} maxLength={40} placeholder="e.g. Bleep test level 13.4" />
              </Field>
            </div>
          </Section>

          <Section title="Availability">
            <Field label="When you can trial" htmlFor="profile-availability-trials">
              <input {...group("availability", "trials")} className={inputClass} maxLength={80} placeholder="e.g. Weekends and Tuesday evenings, from November" />
            </Field>
            <Field label="How far you can travel" htmlFor="profile-availability-travel" hint="Pick one or type your own.">
              <input {...group("availability", "travel")} list="travel-options" className={inputClass} maxLength={60} placeholder="e.g. Up to 50 miles" />
              <datalist id="travel-options">
                {TRAVEL_OPTIONS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </Field>
          </Section>

          <Section title="Education">
            <Field label="School or college" htmlFor="profile-education-school">
              <input {...group("education", "school")} className={inputClass} maxLength={60} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Grades" htmlFor="profile-education-grades" hint="GCSEs, A levels, BTEC, or GPA for US colleges.">
                <input {...group("education", "grades")} className={inputClass} maxLength={90} />
              </Field>
              <Field label="Graduation year" htmlFor="profile-education-graduationYear">
                <input {...group("education", "graduationYear")} type="number" inputMode="numeric" min={2015} max={2040} className={inputClass} placeholder="2026" />
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
