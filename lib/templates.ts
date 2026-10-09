import { ageFrom, formatDate } from "./dates";
import { formatHeight, POSITION_NAMES } from "./profile";
import type { Profile, RecipientType } from "./store";

/**
 * Message templates for the Message Builder. Each recipient type has its own tone.
 * Anything missing from the player's profile shows as [square brackets] to fill in.
 */

export const RECIPIENTS: Record<RecipientType, { label: string; tone: string; role: string }> = {
  "non-league": {
    label: "Non-league manager",
    tone: "Short and direct. Works by email, text or WhatsApp.",
    role: "Manager",
  },
  trial: {
    label: "Trial request",
    tone: "Polite and structured, for academies and recruitment staff.",
    role: "Head of recruitment",
  },
  "us-college": {
    label: "US college coach",
    tone: "Formal, in the format college coaches expect, with academics.",
    role: "Head coach",
  },
};

export type MessageInput = { type: RecipientType; club: string; contactName: string; profile: Profile | null; profileUrl: string };

export function buildMessage({ type, club, contactName, profile, profileUrl }: MessageInput): { subject: string; body: string } {
  const p = profile;
  const name = p?.name.trim() || "[Your name]";
  const target = club.trim() || "[club name]";
  const contact = contactName.trim();
  const positions = p?.positions.map((x) => POSITION_NAMES[x] ?? x) ?? [];
  const position = positions[0]?.toLowerCase() || "[your position]";
  const positionTitle = positions[0] || "[Position]";
  const allPositions = positions.join(", ") || "[your positions]";
  const age = ageFrom(p?.dob ?? "");
  const ageText = age !== null ? `${age}-year-old` : "[age]-year-old";
  const anAge = /^(8|11|18)\b/.test(ageText) ? `an ${ageText}` : `a ${ageText}`;
  const currentClub = p?.club.trim() || "[your current club]";
  const level = p?.level.trim();
  const clubWithLevel = level ? `${currentClub} (${level})` : currentClub;
  const height = formatHeight(p?.heightCm ?? "") || "[height]";
  const foot = p?.foot ? `${p.foot === "Both" ? "Two" : p.foot}-footed` : "[Right/Left]-footed";
  const season = p?.stats.season.trim() || "this";
  const video = p?.highlightUrl.trim() || "[link to your highlights]";
  const match = p?.matchUrl.trim();
  const link = profileUrl || "[your profile link]";
  const coach = p?.coach;
  const coachLine = coach?.name.trim() ? [coach.name.trim(), coach.club.trim(), coach.contact.trim()].filter(Boolean).join(", ") : "";
  const statLine = seasonStats(p);

  if (type === "non-league") {
    return {
      subject: `${positionTitle} looking for a club: ${name}`,
      body: [
        `Hi ${contact.split(/\s+/)[0] || "there"},`,
        "",
        `I'm ${name}, ${anAge} ${position} currently playing for ${clubWithLevel}. I'm looking to step up and would love the chance to come and train with ${target}.`,
        "",
        statLine ? `This season I've ${statLine}.` : "[One line about your season so far.]",
        "",
        `Highlights: ${video}`,
        ...(match ? [`Full match: ${match}`] : []),
        `My profile: ${link}`,
        "",
        `I'm ${foot.toLowerCase()}, ${height}, and can get to training any night that suits you.`,
        "",
        "Thanks for your time,",
        name,
      ].join("\n"),
    };
  }

  if (type === "trial") {
    return {
      subject: `Trial request: ${name}, ${position}${age !== null ? ` (${age})` : ""}`,
      body: [
        `Dear ${contact || "Sir or Madam"},`,
        "",
        `My name is ${name} and I'm ${anAge} ${position} at ${clubWithLevel}. I'm writing to ask whether ${target} would consider me for a trial.`,
        "",
        "A quick summary:",
        `- Position: ${allPositions}`,
        `- ${foot}, ${height}`,
        `- ${season === "this" ? "This season" : `${season} season`}: ${statLine || "[appearances, goals, assists]"}`,
        "",
        `Highlights: ${video}`,
        ...(match ? [`Full match: ${match}`] : []),
        `Player profile and CV: ${link}`,
        ...(coachLine ? ["", `My coach, ${coachLine}, is happy to give a reference.`] : []),
        "",
        "I'd be grateful for the chance to show what I can do in person and can fit around your trial dates.",
        "",
        "Kind regards,",
        name,
      ].join("\n"),
    };
  }

  // US college coach
  const coachSurname = contact.split(/\s+/).pop();
  return {
    subject: `[Class of 20XX] ${positionTitle}: ${name}, ${currentClub}`,
    body: [
      `Dear Coach ${coachSurname || ""}`.trimEnd() + ",",
      "",
      `My name is ${name}, and I am a ${position} currently playing for ${clubWithLevel}. I am very interested in ${target} and your soccer program, and I would like to be considered for a roster spot for [fall 20XX].`,
      "",
      "Player information:",
      "- Graduation year: [Class of 20XX]",
      `- Date of birth: ${p?.dob ? formatDate(p.dob) : "[date of birth]"}`,
      `- Position: ${allPositions}`,
      `- Height: ${height}`,
      `- Preferred foot: ${p?.foot || "[Right/Left]"}`,
      `- ${season === "this" ? "This season" : `${season} season`}: ${statLine || "[appearances, goals, assists]"}`,
      "",
      "Academics:",
      "- GPA: [your GPA]",
      "- Intended major: [your intended major]",
      "",
      `Highlight video: ${video}`,
      ...(match ? [`Full match: ${match}`] : []),
      `Player profile: ${link}`,
      ...(coachLine ? [`Reference: ${coachLine}`] : []),
      "",
      "I would welcome any feedback and would love to learn more about your program and what you look for in a recruit. Thank you for your time.",
      "",
      "Sincerely,",
      name,
    ].join("\n"),
  };
}

/** "played 24 games, scored 9 and set up 7", or "" when no stats are filled in. */
function seasonStats(p: Profile | null): string {
  if (!p) return "";
  const { appearances, goals, assists, cleanSheets } = p.stats;
  const parts = [
    appearances && `played ${appearances} games`,
    goals && `scored ${goals}`,
    assists && `set up ${assists}`,
    cleanSheets && `kept ${cleanSheets} clean sheets`,
  ].filter(Boolean) as string[];
  if (parts.length < 2) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}
