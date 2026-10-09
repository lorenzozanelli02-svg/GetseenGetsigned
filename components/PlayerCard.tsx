import { ageFrom, formatDate } from "@/lib/dates";
import { careerRows, cleanList, formatHeight, POSITION_NAMES, statItems } from "@/lib/profile";
import type { Profile } from "@/lib/store";
import { embedUrl, isLink } from "@/lib/video";

const label = "text-xs font-semibold uppercase tracking-[0.18em] text-muted";

/**
 * The player card. Used as the live preview in the Profile Builder (preview=true shows
 * placeholders for the key fields) and as the public player page. Empty sections are hidden.
 */
export function PlayerCard({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
  const age = ageFrom(profile.dob);
  const height = formatHeight(profile.heightCm);
  const video = embedUrl(profile.highlightUrl);
  const stats = statItems(profile);
  const hasStats = stats.some((s) => s.value);
  const career = careerRows(profile);
  const strengths = cleanList(profile.strengths);
  const honours = cleanList(profile.honours);
  const club = [profile.club.trim(), profile.level.trim()].filter(Boolean).join(" · ");
  const { coach, contact, college } = profile;
  const positions = profile.positions.map((p) => POSITION_NAMES[p] ?? p).join(" / ");
  const showContact = preview || profile.showContactPublic;
  const hasContact = !!(contact.phone.trim() || contact.email.trim());

  const collegeRows = [
    ["Graduating", college.graduationYear.trim() && `Class of ${college.graduationYear.trim()}`],
    ["GPA", college.gpa.trim()],
    ["Intended major", college.major.trim()],
  ].filter(([, v]) => v);

  return (
    <article className="@container overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_0_80px_-40px_var(--color-accent)]">
      <div className="grid gap-5 bg-[radial-gradient(120%_100%_at_100%_0%,rgb(59_229_132/0.13),transparent_60%)] p-5 @md:grid-cols-[9.5rem_minmax(0,1fr)] @md:p-7">
        <div className="aspect-[4/5] w-32 overflow-hidden rounded-2xl bg-bg ring-1 ring-line @md:w-full">
          {profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- user upload stored as a data URL
            <img src={profile.photo} alt={`Photo of ${profile.name || "the player"}`} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted/40" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-12" fill="currentColor">
                <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.5-8 5.5V21h16v-1.5c0-3-3.6-5.5-8-5.5Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{positions || (preview ? "Your position" : "")}</p>
          <h2 className="mt-2 font-display text-[2.6rem] leading-[0.9] font-extrabold uppercase break-words @md:text-[3.25rem]">
            {profile.name || <span className="text-muted/50">Your name</span>}
          </h2>
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3.5">
            <Meta label="Club" value={club} preview={preview} wide />
            <Meta label="Age" value={age !== null ? String(age) : ""} preview={preview} />
            <Meta label="Foot" value={profile.foot} preview={preview} />
            <Meta label="Height" value={height} preview={preview} wide />
            <Meta label="Based in" value={contact.location.trim()} preview={false} wide />
          </dl>
        </div>
      </div>

      {(hasStats || preview) && (
        <div className="border-y border-line px-5 py-5 @md:px-7">
          <p className={label}>{profile.stats.season.trim() ? `${profile.stats.season.trim()} season` : "This season"}</p>
          <dl className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
            {stats.map((s) => (
              <div key={s.label} className="flex min-w-0 flex-col-reverse">
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{s.label}</dt>
                <dd className="font-display text-5xl leading-none font-extrabold text-accent tabular-nums @md:text-6xl">
                  {s.value || <span className="text-muted/30">0</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="grid gap-7 p-5 @md:p-7">
        {video ? (
          <div className="aspect-video overflow-hidden rounded-xl bg-bg ring-1 ring-line">
            <iframe
              src={video}
              title={`${profile.name || "Player"} highlights`}
              className="size-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : isLink(profile.highlightUrl) ? (
          <VideoLink href={profile.highlightUrl} label="Watch highlights" />
        ) : (
          preview && (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-line px-6 text-center text-sm text-muted">
              Your highlight video plays here. Paste a YouTube or Vimeo link.
            </div>
          )
        )}
        {isLink(profile.matchUrl) && <VideoLink href={profile.matchUrl} label="Watch a full match" />}

        {profile.bio.trim() && <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink/85">{profile.bio.trim()}</p>}

        {strengths.length > 0 && (
          <div>
            <h3 className={label}>Key strengths</h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {strengths.map((s) => (
                <li key={s} className="rounded-full bg-accent/12 px-3 py-1 text-sm font-semibold text-accent">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The current club is already at the top, so the list only appears once there are previous clubs. */}
        {career.length > 1 && (
          <div>
            <h3 className={label}>Career history</h3>
            <ul className="mt-2 divide-y divide-line">
              {career.map((c) => (
                <li key={c.key} className="flex items-start justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">
                      {c.club}
                      {c.current && <span className="ml-2 rounded-full bg-accent/12 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-accent">Current</span>}
                    </p>
                    {c.level && <p className="text-sm text-muted">{c.level}</p>}
                  </div>
                  {c.years && <p className="shrink-0 text-right text-sm text-muted tabular-nums">{c.years}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {honours.length > 0 && (
          <div>
            <h3 className={label}>Honours</h3>
            <ul className="mt-2.5 grid gap-1.5 text-[15px]">
              {honours.map((h) => (
                <li key={h} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3.5 shrink-0 bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {collegeRows.length > 0 && (
          <div>
            <h3 className={label}>US college</h3>
            <dl className="mt-2 grid gap-1.5 text-[15px]">
              {collegeRows.map(([k, v]) => (
                <div key={k} className="flex flex-wrap gap-x-2">
                  <dt className="text-muted">{k}:</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {(coach.name.trim() || preview) && (
          <div className="rounded-2xl border border-line bg-bg/60 p-4">
            <h3 className={label}>Coach reference</h3>
            {coach.name.trim() ? (
              <div className="mt-2 text-[15px]">
                <p className="font-semibold">{coach.name}</p>
                {coach.club.trim() && <p className="text-muted">{coach.club}</p>}
                {coach.contact.trim() && <ContactValue value={coach.contact.trim()} />}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted/60">Name, club and contact of a coach who can vouch for you.</p>
            )}
          </div>
        )}

        {hasContact && showContact && (
          <div>
            <h3 className={label}>
              Contact{" "}
              {preview && !profile.showContactPublic && <span className="font-normal normal-case tracking-normal text-muted/70">· hidden on your public page</span>}
            </h3>
            <div className="mt-2 grid gap-1 text-[15px]">
              {contact.phone.trim() && (
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="w-fit text-accent underline-offset-4 hover:underline">
                  {contact.phone.trim()}
                </a>
              )}
              {contact.email.trim() && <ContactValue value={contact.email.trim()} />}
            </div>
          </div>
        )}

        {!preview && profile.updatedAt && <p className="text-xs text-muted">Updated {formatDate(profile.updatedAt.slice(0, 10))}</p>}
      </div>
    </article>
  );
}

function Meta({ label, value, preview, wide }: { label: string; value: string; preview: boolean; wide?: boolean }) {
  if (!value && !preview) return null;
  return (
    <div className={`min-w-0 ${wide ? "col-span-2 @lg:col-span-1" : ""}`}>
      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold break-words">{value || <span className="font-normal text-muted/50">—</span>}</dd>
    </div>
  );
}

function VideoLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-accent transition-colors hover:border-accent"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
        <path d="M6 4.5v11l9-5.5-9-5.5Z" />
      </svg>
      {label}
    </a>
  );
}

function ContactValue({ value }: { value: string }) {
  if (/^\S+@\S+\.\S+$/.test(value)) {
    return (
      <a href={`mailto:${value}`} className="w-fit break-all text-accent underline-offset-4 hover:underline">
        {value}
      </a>
    );
  }
  return <p className="break-words">{value}</p>;
}
