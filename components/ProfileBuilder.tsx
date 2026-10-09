"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ageFrom } from "@/lib/dates";
import { resizeImage } from "@/lib/image";
import {
  BIO_MAX,
  cleanList,
  exampleBio,
  formatHeight,
  graduationYears,
  HEIGHTS_CM,
  isDefensive,
  LEVELS,
  MAJORS,
  MAX_CAREER,
  MAX_HONOURS,
  MAX_STRENGTHS,
  missingRequired,
  seasonOf,
  seasonOptions,
  slugify,
  statItems,
  STRENGTHS,
} from "@/lib/profile";
import { emptyProfile, getProfile, saveProfile, type Foot, type Profile } from "@/lib/store";
import { isLink } from "@/lib/video";
import { writeProfile } from "@/lib/writeProfile";
import { CareerEditor, LineList } from "./ListEditors";
import { PlayerCard } from "./PlayerCard";
import { ProfileActions } from "./ProfileActions";
import { ChoiceButtons, chipClass, DateOfBirth, PitchPicker, Select, Stepper, Switch } from "./ProfileInputs";
import { card, Field, inputClass, Loading, PageHeader, primaryButton, secondaryButton } from "./ui";

const STEPS = [
  { short: "You", title: "You", intro: "Who you are and how a club can reach you." },
  { short: "Football", title: "Your football", intro: "Where you play and who for." },
  { short: "Season", title: "This season", intro: "Your numbers so far. Leave blank anything you don't know." },
  { short: "Video", title: "Your video", intro: "Scouts watch before they read. One good link is enough." },
  { short: "About you", title: "About you", intro: "What kind of player you are, and a coach who can vouch for it." },
];
/** The step index for the summary shown after step 5. */
const OVERVIEW = STEPS.length;
const LEVEL_OTHER = "__other";

type Errors = Partial<Record<"name" | "positions" | "club", string>>;
type SaveState = "idle" | "saving" | "saved" | "error";

/** Required fields that are still empty, on one step or all of them. */
function requiredErrors(p: Profile, step?: number): Errors {
  const e: Errors = {};
  const on = (s: number) => step === undefined || step === s;
  if (on(0) && !p.name.trim()) e.name = "Add your name to carry on.";
  if (on(1) && !p.positions.length) e.positions = "Tap at least one position.";
  if (on(1) && !p.club.trim()) e.club = "Add your current club. Between clubs? Put your last one.";
  return e;
}

/** One line on what each step has, for the summary. Empty means the step was skipped. */
function stepSummary(p: Profile, step: number): string {
  const join = (parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" · ");
  const age = ageFrom(p.dob);
  switch (step) {
    case 0:
      return join([p.name.trim(), p.contact.location.trim(), age !== null && `Age ${age}`, (p.contact.phone.trim() || p.contact.email.trim()) && "Contact added"]);
    case 1:
      return join([p.positions.join(" / "), p.club.trim(), p.level.trim(), p.foot && `${p.foot} foot`, formatHeight(p.heightCm).split(" (")[0]]);
    case 2:
      return join(statItems(p).filter((s) => s.value).map((s) => `${s.value} ${s.label.toLowerCase()}`));
    case 3:
      return join([isLink(p.highlightUrl) && "Highlights", isLink(p.matchUrl) && "Full match"]);
    case 4:
      return join([cleanList(p.strengths).join(", "), p.bio.trim() && "Bio", p.coach.name.trim() && `Reference: ${p.coach.name.trim()}`]);
    default:
      return "";
  }
}

export function ProfileBuilder() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [levelOther, setLevelOther] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const pending = useRef<Profile | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const top = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    getProfile().then((p) => {
      const loaded = p ?? emptyProfile();
      setProfile(loaded);
      // Returning players land on the summary; new ones start at step 1.
      if (missingRequired(loaded).length === 0) setStep(OVERVIEW);
    });
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

  // After moving to another step, bring it into view and move focus to its heading.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    // 90px clears the preview strip pinned to the top on phones.
    if (top.current && top.current.getBoundingClientRect().top < 90) top.current.scrollIntoView({ block: "start" });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function update(changes: Partial<Profile>) {
    if (!profile) return;
    const next = { ...profile, ...changes };
    setProfile(next);
    // Clear an error as soon as the field is filled in.
    setErrors((e) => {
      const still = requiredErrors(next);
      return Object.fromEntries(Object.keys(e).filter((k) => k in still).map((k) => [k, e[k as keyof Errors]]));
    });
    pending.current = next;
    setSaveState("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
  }

  function goTo(next: number) {
    flush();
    moved.current = true;
    setStep(next);
  }

  function onNext() {
    if (!profile) return;
    const last = step === STEPS.length - 1;
    const e = requiredErrors(profile, last ? undefined : step);
    setErrors(e);
    if (e.name) {
      if (step === 0) document.getElementById("profile-name")?.focus();
      else goTo(0);
    } else if (e.positions || e.club) {
      if (step === 1) document.getElementById(e.positions ? "position-ST" : "profile-club")?.focus();
      else goTo(1);
    } else {
      goTo(last ? OVERVIEW : step + 1);
    }
  }

  if (!profile) return <Loading />;

  const text = (key: "name" | "club" | "highlightUrl" | "matchUrl" | "bio") => ({
    id: `profile-${key}`,
    value: profile[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update({ [key]: e.target.value }),
  });
  function nested<G extends "contact" | "coach" | "college">(g: G, key: keyof Profile[G] & string) {
    const current = profile![g] as Record<string, string>;
    return {
      id: `profile-${g}-${key}`,
      value: current[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update({ [g]: { ...current, [key]: e.target.value } } as Partial<Profile>),
    };
  }
  const setStat = (key: keyof Profile["stats"], value: string) => update({ stats: { ...profile.stats, [key]: value, season: profile.stats.season || seasonOf() } });

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

  const error = (msg?: string) => (msg ? <span className="text-danger">{msg}</span> : undefined);
  const badLink = (v: string) => v.trim() !== "" && !isLink(v);
  const showOtherLevel = levelOther || (profile.level !== "" && !LEVELS.includes(profile.level));
  const heights = profile.heightCm && !HEIGHTS_CM.includes(profile.heightCm) ? [profile.heightCm, ...HEIGHTS_CM] : HEIGHTS_CM;
  const seasons = seasonOptions();
  if (profile.stats.season && !seasons.includes(profile.stats.season)) seasons.push(profile.stats.season);
  const strengthOptions = [...STRENGTHS, ...profile.strengths.filter((s) => !STRENGTHS.includes(s))];
  const strengthsFull = profile.strengths.length >= MAX_STRENGTHS;
  const example = exampleBio(profile);

  const steps: React.ReactNode[] = [
    // 1. You
    <>
      <Field label="Full name" htmlFor="profile-name" required hint={error(errors.name)}>
        <input {...text("name")} className={inputClass} autoComplete="name" placeholder="e.g. Jamie Walker" maxLength={60} aria-invalid={!!errors.name} />
      </Field>

      <Field label="Photo" htmlFor="profile-photo" hint={error(photoError) ?? "A clear head-and-shoulders shot or an action photo."}>
        <div className="flex items-center gap-3">
          <Avatar profile={profile} className="size-14 text-lg" />
          <label htmlFor="profile-photo" className={secondaryButton}>
            {profile.photo ? "Change photo" : "Add a photo"}
          </label>
          <input id="profile-photo" type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
          {profile.photo && (
            <button type="button" onClick={() => update({ photo: "" })} className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-accent">
              Remove
            </button>
          )}
        </div>
      </Field>

      <DateOfBirth value={profile.dob} onChange={(dob) => update({ dob })} />

      <Field label="Town or city" htmlFor="profile-contact-location">
        <input {...nested("contact", "location")} autoComplete="address-level2" className={inputClass} maxLength={40} placeholder="e.g. Leeds" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="profile-contact-phone">
          <input {...nested("contact", "phone")} type="tel" inputMode="tel" autoComplete="tel" className={inputClass} maxLength={30} />
        </Field>
        <Field label="Email" htmlFor="profile-contact-email">
          <input {...nested("contact", "email")} type="email" inputMode="email" autoComplete="email" className={inputClass} maxLength={80} />
        </Field>
      </div>

      <Switch id="profile-showContactPublic" checked={profile.showContactPublic} onChange={(showContactPublic) => update({ showContactPublic })}>
        Show my phone and email on my public page
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">They&rsquo;re always on your CV. Under 18? Ask a parent or guardian first.</span>
      </Switch>
    </>,

    // 2. Your football
    <>
      <PitchPicker value={profile.positions} onChange={(positions) => update({ positions })} invalid={!!errors.positions} />
      {errors.positions && <p className="-mt-3 text-xs text-danger">{errors.positions}</p>}

      <ChoiceButtons
        name="profile-foot"
        label="Preferred foot"
        value={profile.foot}
        onChange={(foot) => update({ foot: foot as Foot })}
        options={[
          { value: "Right", label: "Right" },
          { value: "Left", label: "Left" },
          { value: "Both", label: "Both" },
        ]}
      />

      <Field label="Height" htmlFor="profile-heightCm">
        <Select id="profile-heightCm" value={profile.heightCm} onChange={(e) => update({ heightCm: e.target.value })} className="sm:max-w-64">
          <option value="">Pick your height</option>
          {heights.map((h) => (
            <option key={h} value={h}>
              {formatHeight(h) || `${h} cm`}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Current club" htmlFor="profile-club" required hint={error(errors.club)}>
        <input {...text("club")} className={inputClass} placeholder="e.g. Hartley Town FC" maxLength={60} aria-invalid={!!errors.club} />
      </Field>

      <Field label="Level" htmlFor="profile-level">
        <Select
          id="profile-level"
          value={showOtherLevel ? LEVEL_OTHER : profile.level}
          onChange={(e) => {
            const v = e.target.value;
            setLevelOther(v === LEVEL_OTHER);
            update({ level: v === LEVEL_OTHER ? "" : v });
          }}
        >
          <option value="">Pick a level</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
          <option value={LEVEL_OTHER}>Something else</option>
        </Select>
      </Field>
      {showOtherLevel && (
        <Field label="Your level" htmlFor="profile-level-other">
          <input id="profile-level-other" value={profile.level} onChange={(e) => update({ level: e.target.value })} className={inputClass} maxLength={50} placeholder="e.g. Isthmian League" autoFocus />
        </Field>
      )}
    </>,

    // 3. This season
    <>
      <Field label="Season" htmlFor="profile-stat-season">
        <Select id="profile-stat-season" value={profile.stats.season || seasonOf()} onChange={(e) => update({ stats: { ...profile.stats, season: e.target.value } })} className="max-w-48">
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {statItems(profile).map((s) => (
          <Stepper key={s.key} id={`profile-stat-${s.key}`} label={s.long} value={s.value} onChange={(v) => setStat(s.key as keyof Profile["stats"], v)} />
        ))}
      </div>
      {!isDefensive(profile) && <p className="text-xs text-muted">Goalkeepers and defenders also get a clean sheets count.</p>}
    </>,

    // 4. Your video
    <>
      <Field
        label="Highlight video link"
        htmlFor="profile-highlightUrl"
        hint={
          error(badLink(profile.highlightUrl) ? "Paste the full link, starting with https://" : undefined) ?? (
            <>
              On YouTube, set the video to <strong className="font-semibold text-ink">Unlisted</strong>: only people with the link can watch it, and it won&rsquo;t show up in search. Vimeo, Hudl and Veo links work too.
            </>
          )
        }
      >
        <input {...text("highlightUrl")} type="url" inputMode="url" autoComplete="off" className={inputClass} placeholder="https://youtu.be/…" />
      </Field>
      <Field
        label="Full match link (optional)"
        htmlFor="profile-matchUrl"
        hint={error(badLink(profile.matchUrl) ? "Paste the full link, starting with https://" : undefined) ?? "Scouts often like to see a whole game."}
      >
        <input {...text("matchUrl")} type="url" inputMode="url" autoComplete="off" className={inputClass} placeholder="https://" />
      </Field>
    </>,

    // 5. About you
    <>
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-ink/90">Key strengths</legend>
        <p aria-live="polite" className="mt-1 mb-3 text-xs text-muted">
          Pick {MAX_STRENGTHS}. {profile.strengths.length} of {MAX_STRENGTHS} picked.
        </p>
        <div className="flex flex-wrap gap-2">
          {strengthOptions.map((s) => {
            const on = profile.strengths.includes(s);
            return (
              <button
                key={s}
                id={`strength-${slugify(s)}`}
                type="button"
                aria-pressed={on}
                disabled={!on && strengthsFull}
                onClick={() => update({ strengths: on ? profile.strengths.filter((x) => x !== s) : [...profile.strengths, s] })}
                className={`${chipClass(on)} min-h-10 px-3.5`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Short bio" htmlFor="profile-bio" hint={`${profile.bio.length}/${BIO_MAX} characters. How you play and what you're looking for.`}>
        <textarea {...text("bio")} rows={4} maxLength={BIO_MAX} className={inputClass} placeholder="A few sentences about your game" />
      </Field>
      {!profile.bio.trim() && (
        <div className="-mt-1 rounded-xl border border-dashed border-line p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Example from your answers</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{example}</p>
          <button type="button" onClick={() => update({ bio: example.slice(0, BIO_MAX) })} className="mt-3 min-h-10 cursor-pointer text-sm font-semibold text-accent underline-offset-4 hover:underline">
            Use this and edit it
          </button>
        </div>
      )}

      <fieldset className="grid min-w-0 gap-4">
        <legend className="mb-1 text-sm font-medium text-ink/90">
          Coach reference <span className="text-xs font-normal text-muted">· ask them first</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coach's name" htmlFor="profile-coach-name">
            <input {...nested("coach", "name")} className={inputClass} maxLength={60} />
          </Field>
          <Field label="Their club" htmlFor="profile-coach-club">
            <input {...nested("coach", "club")} className={inputClass} maxLength={60} />
          </Field>
        </div>
        <Field label="Email or phone" htmlFor="profile-coach-contact">
          <input {...nested("coach", "contact")} className={inputClass} maxLength={80} />
        </Field>
      </fieldset>
    </>,
  ];

  const optional = step >= 2;

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8">
      <PageHeader title="Profile Builder" intro="Five quick steps. Only your name, position and club are needed. Skip anything else." introClassName="hidden sm:block">
        <SaveStatus state={saveState} error={saveError} />
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-12">
        <div className="grid min-w-0 grid-cols-1 gap-5">
          {/* On phones the preview is a compact strip, pinned to the top of the screen, that opens into the full card. */}
          <div className="sticky top-0 z-20 -mx-4 -my-2 bg-bg/92 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
            <PreviewStrip profile={profile} showStats={step === 2} open={previewOpen} onToggle={() => setPreviewOpen((o) => !o)} />
          </div>
          {previewOpen && (
            <div id="full-preview" className="lg:hidden">
              <PlayerCard profile={profile} preview />
            </div>
          )}

          <div ref={top} className="scroll-mt-24 lg:scroll-mt-4">
            <Progress step={step} onJump={goTo} />
          </div>

          {step === OVERVIEW ? (
            <Overview profile={profile} headingRef={heading} onEdit={goTo} flush={flush} update={update} />
          ) : (
            <form
              noValidate
              aria-labelledby="step-title"
              onSubmit={(e) => {
                e.preventDefault();
                onNext();
              }}
              className="grid grid-cols-1 gap-5"
            >
              <section className={`${card} grid min-w-0 grid-cols-1 gap-5 p-5 sm:p-6`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 id="step-title" ref={heading} tabIndex={-1} className="font-display text-3xl leading-none font-extrabold uppercase focus:outline-none sm:text-4xl">
                      {STEPS[step].title}
                    </h2>
                    {optional && <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Optional</span>}
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{STEPS[step].intro}</p>
                  {step < 2 && (
                    <p className="mt-1 text-xs text-muted">
                      <span className="text-accent">*</span> Required. Everything else can be skipped.
                    </p>
                  )}
                </div>
                {steps[step]}
              </section>

              <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-line bg-bg/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                {step > 0 && (
                  <button id="step-back" type="button" onClick={() => goTo(step - 1)} className={secondaryButton}>
                    <span aria-hidden="true">←</span> Back
                  </button>
                )}
                <button id="step-next" type="submit" className={`${primaryButton} ml-auto min-w-36 flex-1 sm:flex-none`}>
                  {step === STEPS.length - 1 ? "Finish" : "Next"} <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="hidden min-w-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto lg:pb-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Live preview</h2>
          <PlayerCard profile={profile} preview />
        </div>
      </div>
    </div>
  );
}

function Progress({ step, onJump }: { step: number; onJump: (step: number) => void }) {
  const done = step === OVERVIEW;
  return (
    <nav aria-label="Profile steps">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {done ? "All 5 steps done" : `Step ${step + 1} of ${STEPS.length}`}
        {!done && <span className="ml-2 font-medium normal-case tracking-normal text-muted sm:hidden">{STEPS[step].title}</span>}
      </p>
      <ol className="mt-2 grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s.short}>
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={i === step ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.title}`}
              className="group flex w-full cursor-pointer flex-col gap-1.5 py-1.5 text-left"
            >
              <span
                className={`h-1.5 w-full rounded-full transition-colors ${
                  done || i < step ? "bg-accent" : i === step ? "bg-accent shadow-[0_0_12px_0_var(--color-accent)]" : "bg-line group-hover:bg-muted/40"
                }`}
              />
              <span className={`hidden truncate text-xs sm:block ${i === step ? "font-semibold text-ink" : "text-muted group-hover:text-ink"}`}>{s.short}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Overview({
  profile,
  headingRef,
  onEdit,
  flush,
  update,
}: {
  profile: Profile;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onEdit: (step: number) => void;
  flush: () => void;
  update: (changes: Partial<Profile>) => void;
}) {
  const first = profile.name.trim().split(/\s+/)[0];
  return (
    <div className="grid grid-cols-1 gap-5">
      <section className={`${card} grid grid-cols-1 gap-4 border-accent/35 bg-[radial-gradient(120%_120%_at_100%_0%,rgb(59_229_132/0.12),transparent_60%)] p-5 sm:p-6`}>
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl leading-none font-extrabold uppercase focus:outline-none sm:text-4xl">
            {first ? `You're set, ${first}` : "You're set"}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Share your page with clubs or download your CV. You can change anything at any time.</p>
        </div>
        <ProfileActions profile={profile} showViewLink beforeAction={flush} />
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="cv-profile-title">
        <h3 id="cv-profile-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Your CV profile
        </h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink/90">{writeProfile(profile)}</p>
        <p className="mt-2.5 text-xs leading-relaxed text-muted">Written for you from your answers and printed at the top of your CV. Change an answer and it updates.</p>
      </section>

      <ol className={`${card} divide-y divide-line`} aria-label="Your answers">
        {STEPS.map((s, i) => {
          const summary = stepSummary(profile, i);
          return (
            <li key={s.short} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${summary ? "bg-accent text-on-accent" : "border border-line text-muted"}`}
              >
                {summary ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.title}</p>
                <p className={`truncate text-sm ${summary ? "text-muted" : "text-muted/60"}`}>{summary || "Skipped"}</p>
              </div>
              <button type="button" onClick={() => onEdit(i)} aria-label={`Edit ${s.title}`} className="min-h-10 shrink-0 cursor-pointer rounded-full px-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10">
                {summary ? "Edit" : "Add"}
              </button>
            </li>
          );
        })}
      </ol>

      <AddMore profile={profile} update={update} />
    </div>
  );
}

function AddMore({ profile, update }: { profile: Profile; update: (changes: Partial<Profile>) => void }) {
  const college = profile.college;
  const added =
    profile.career.filter((c) => c.club.trim()).length + cleanList(profile.honours).length + (Object.values(college).some((v) => v.trim()) ? 1 : 0);
  const years = graduationYears();
  if (college.graduationYear && !years.includes(college.graduationYear)) years.unshift(college.graduationYear);
  const setCollege = (key: keyof Profile["college"], value: string) => update({ college: { ...college, [key]: value } });
  const subhead = "text-xs font-semibold uppercase tracking-[0.18em] text-accent";

  return (
    <details id="add-more" className={`${card} group`}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-semibold">
            Add more <span className="font-normal text-muted">(optional)</span>
          </span>
          <span className="mt-0.5 block text-sm text-muted">Previous clubs, honours and US college details</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {added > 0 && <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">{added} added</span>}
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>

      <div className="grid grid-cols-1 gap-8 border-t border-line px-5 py-6 sm:px-6">
        <section className="grid gap-3">
          <div>
            <h3 className={subhead}>Previous clubs</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">Most recent first. Your current club is added at the top automatically.</p>
          </div>
          <CareerEditor entries={profile.career} onChange={(career) => update({ career })} max={MAX_CAREER} />
        </section>

        <section className="grid gap-3">
          <div>
            <h3 className={subhead}>Honours</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">County, district or school squads, academy spells and awards.</p>
          </div>
          <LineList
            idPrefix="profile-honour"
            items={profile.honours}
            onChange={(honours) => update({ honours })}
            max={MAX_HONOURS}
            itemLabel="Honour"
            addLabel="Add an honour"
            placeholder="e.g. County FA U18 squad (2025)"
          />
        </section>

        <section className="grid gap-3">
          <div>
            <h3 className={subhead}>US college</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">Only if you&rsquo;re applying to play college soccer in the US.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr_1.3fr]">
            <Field label="Graduation year" htmlFor="profile-college-graduationYear">
              <Select id="profile-college-graduationYear" value={college.graduationYear} onChange={(e) => setCollege("graduationYear", e.target.value)}>
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="GPA" htmlFor="profile-college-gpa">
              <input
                id="profile-college-gpa"
                value={college.gpa}
                onChange={(e) => setCollege("gpa", e.target.value.replace(/[^\d.]/g, "").slice(0, 4))}
                inputMode="decimal"
                className={inputClass}
                placeholder="e.g. 3.6"
              />
            </Field>
            <Field label="Intended major" htmlFor="profile-college-major">
              <input id="profile-college-major" value={college.major} onChange={(e) => setCollege("major", e.target.value)} list="major-options" maxLength={40} className={inputClass} placeholder="Pick or type" />
              <datalist id="major-options">
                {MAJORS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
          </div>
        </section>
      </div>
    </details>
  );
}

/** Phone preview: name plus one line, which shows the season's numbers while they're being filled in. */
function PreviewStrip({ profile, showStats, open, onToggle }: { profile: Profile; showStats: boolean; open: boolean; onToggle: () => void }) {
  const sub = [profile.positions.join(" / "), profile.club.trim()].filter(Boolean).join(" · ");
  const stats = statItems(profile)
    .filter((s) => s.value)
    .map((s) => `${s.value} ${s.label.toLowerCase()}`)
    .join(" · ");
  return (
    <div className={`${card} flex items-center gap-3 p-2.5`}>
      <Avatar profile={profile} className="size-12 text-base" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-none font-semibold uppercase tracking-[0.18em] text-accent">Live preview</p>
        <p className="mt-1 truncate font-display text-lg leading-tight font-extrabold uppercase">{profile.name.trim() || <span className="text-muted/50">Your name</span>}</p>
        {showStats && stats ? <p className="truncate text-xs font-semibold text-accent">{stats}</p> : <p className="truncate text-xs text-muted">{sub || "Position · Club"}</p>}
      </div>
      <button type="button" aria-expanded={open} aria-controls="full-preview" onClick={onToggle} className={`${secondaryButton} min-h-10 shrink-0 px-4`}>
        {open ? "Hide" : "Full card"}
      </button>
    </div>
  );
}

function Avatar({ profile, className = "" }: { profile: Profile; className?: string }) {
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg font-display font-extrabold text-accent ring-1 ring-line ${className}`}>
      {profile.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- user upload stored as a data URL
        <img src={profile.photo} alt="" className="size-full object-cover" />
      ) : (
        initials || (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-1/2 text-muted/50" fill="currentColor">
            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.5-8 5.5V21h16v-1.5c0-3-3.6-5.5-8-5.5Z" />
          </svg>
        )
      )}
    </span>
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
