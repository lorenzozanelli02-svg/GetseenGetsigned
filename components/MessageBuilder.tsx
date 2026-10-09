"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import { profileProgress, publicUrl } from "@/lib/profile";
import { addContact, getProfile, newId, saveMessage, type Profile, type RecipientType } from "@/lib/store";
import { buildMessage, RECIPIENTS } from "@/lib/templates";
import { card, EmptyNote, Field, inputClass, Loading, PageHeader, primaryButton, secondaryButton, textLink } from "./ui";

const FOLLOW_UP_DAYS = 7;

export function MessageBuilder() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [profileUrl, setProfileUrl] = useState("");

  const [type, setType] = useState<RecipientType>("non-league");
  const [club, setClub] = useState("");
  const [contactName, setContactName] = useState("");
  const [role, setRole] = useState(RECIPIENTS["non-league"].role);
  const [roleEdited, setRoleEdited] = useState(false);

  // While `edited` is false the text follows the template; once the user types, their text is kept.
  const [edited, setEdited] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [draftId, setDraftId] = useState(newId);
  const [copied, setCopied] = useState<"" | "subject" | "body">("");
  const [savedFollowUp, setSavedFollowUp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      if (p?.name.trim()) setProfileUrl(publicUrl(p));
    });
  }, []);

  const generated = useMemo(
    () => buildMessage({ type, club, contactName, profile: profile ?? null, profileUrl }),
    [type, club, contactName, profile, profileUrl],
  );
  const shownSubject = edited ? subject : generated.subject;
  const shownBody = edited ? body : generated.body;

  if (profile === undefined) return <Loading />;
  const progress = profileProgress(profile);

  function pickType(next: RecipientType) {
    setType(next);
    if (!roleEdited) setRole(RECIPIENTS[next].role);
  }

  function startEditing() {
    if (edited) return;
    setEdited(true);
    setSubject(generated.subject);
    setBody(generated.body);
  }

  async function recordMessage() {
    await saveMessage({ id: draftId, type, club: club.trim(), contactName: contactName.trim(), subject: shownSubject, body: shownBody });
  }

  async function copy(which: "subject" | "body") {
    setError("");
    if (!(await copyText(which === "subject" ? shownSubject : shownBody))) {
      setError("Copying didn't work in this browser. Select the text and copy it yourself.");
      return;
    }
    setCopied(which);
    setTimeout(() => setCopied(""), 2000);
    try {
      await recordMessage();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveToTracker() {
    setError("");
    if (!club.trim()) {
      setError("Add the club name before saving to your tracker.");
      document.getElementById("message-club")?.focus();
      return;
    }
    try {
      const followUpDate = addDays(todayISO(), FOLLOW_UP_DAYS);
      await recordMessage();
      await addContact({
        club: club.trim(),
        contactName: contactName.trim(),
        role: role.trim(),
        dateSent: todayISO(),
        status: "sent",
        followUpDate,
        notes: `${RECIPIENTS[type].label} message`,
      });
      setSavedFollowUp(followUpDate);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startNew() {
    setClub("");
    setContactName("");
    setEdited(false);
    setDraftId(newId());
    setSavedFollowUp("");
    setError("");
    document.getElementById("message-club")?.focus();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Message Builder"
        intro="Pick who you're writing to and add their details. The message fills in from your profile, and you can edit every word."
      />

      {!profile?.name.trim() ? (
        <EmptyNote href="/dashboard/profile" action="Fill in your profile">
          Messages fill in from your profile, which is empty at the moment. Until it&rsquo;s done, the gaps show as [square brackets].
        </EmptyNote>
      ) : (
        !progress.complete && (
          <EmptyNote href="/dashboard/profile" action="Finish your profile">
            Missing from your profile: {progress.missing.join(", ").toLowerCase()}. Gaps show as [square brackets].
          </EmptyNote>
        )
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="grid min-w-0 gap-6">
          <fieldset className="grid gap-3">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">1. Who are you writing to?</legend>
            {(Object.keys(RECIPIENTS) as RecipientType[]).map((key) => {
              const r = RECIPIENTS[key];
              const on = type === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                    on ? "border-accent bg-accent/8" : "border-line bg-surface hover:border-accent/50"
                  }`}
                >
                  <input type="radio" name="recipient" value={key} checked={on} onChange={() => pickType(key)} className="mt-1 accent-[var(--color-accent)]" />
                  <span>
                    <span className="block font-semibold">{r.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{r.tone}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className={`${card} grid gap-4 p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">2. Their details</p>
            <Field label={type === "us-college" ? "College" : "Club"} htmlFor="message-club">
              <input id="message-club" value={club} onChange={(e) => setClub(e.target.value)} className={inputClass} maxLength={80} placeholder={type === "us-college" ? "e.g. University of Vermont" : "e.g. Kingsford Athletic"} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Contact name" htmlFor="message-contact">
                <input id="message-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} maxLength={60} autoComplete="off" />
              </Field>
              <Field label="Their role" htmlFor="message-role" hint="Saved to your tracker.">
                <input
                  id="message-role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setRoleEdited(true);
                  }}
                  className={inputClass}
                  maxLength={60}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className={`${card} grid min-w-0 gap-4 p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">3. Your message</p>
            {edited && (
              <button type="button" onClick={() => setEdited(false)} className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-accent">
                Rebuild from template
              </button>
            )}
          </div>
          {edited && <p className="-mt-2 text-xs text-muted">You&rsquo;ve edited this message, so changes to the details above won&rsquo;t overwrite it.</p>}

          <Field label="Subject (for email)" htmlFor="message-subject">
            <div className="flex gap-2">
              <input
                id="message-subject"
                value={shownSubject}
                onChange={(e) => {
                  startEditing();
                  setSubject(e.target.value);
                }}
                className={inputClass}
              />
              <button type="button" onClick={() => copy("subject")} className={`${secondaryButton} shrink-0 px-4`}>
                {copied === "subject" ? "Copied" : "Copy"}
              </button>
            </div>
          </Field>
          <Field label="Message" htmlFor="message-body">
            <textarea
              id="message-body"
              value={shownBody}
              onChange={(e) => {
                startEditing();
                setBody(e.target.value);
              }}
              rows={18}
              className={`${inputClass} leading-relaxed`}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => copy("body")} className={primaryButton}>
              <span aria-live="polite">{copied === "body" ? "Message copied" : "Copy message"}</span>
            </button>
            <button type="button" onClick={saveToTracker} disabled={!!savedFollowUp} className={secondaryButton}>
              {savedFollowUp ? "Saved to tracker" : "Save to tracker"}
            </button>
            {savedFollowUp && (
              <button type="button" onClick={startNew} className="cursor-pointer text-sm font-semibold text-accent underline-offset-4 hover:underline">
                Write another message
              </button>
            )}
          </div>
          <div aria-live="polite" className="text-sm">
            {savedFollowUp && (
              <p className="text-muted">
                {club.trim()} is in your tracker with a follow-up on {formatDate(savedFollowUp)}.{" "}
                <Link href="/dashboard/tracker" className={textLink}>
                  Open tracker
                </Link>
              </p>
            )}
            {error && <p className="text-danger">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
