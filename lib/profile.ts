import { SITE_URL } from "./site";
import type { Profile } from "./store";

export const POSITIONS = ["GK", "RB", "CB", "LB", "RWB", "LWB", "DM", "CM", "AM", "RM", "LM", "RW", "LW", "CF", "ST"];

export const POSITION_NAMES: Record<string, string> = {
  GK: "Goalkeeper", RB: "Right back", CB: "Centre back", LB: "Left back", RWB: "Right wing back",
  LWB: "Left wing back", DM: "Defensive midfielder", CM: "Central midfielder", AM: "Attacking midfielder",
  RM: "Right midfielder", LM: "Left midfielder", RW: "Right winger", LW: "Left winger", CF: "Centre forward", ST: "Striker",
};

/**
 * Where each position sits on a pitch drawn with the player's team attacking upwards:
 * x from the left touchline (0) to the right (1), y from the opponent's goal line (0) to their own (1).
 * Used by the position picker and the pitch on the CV.
 */
export const PITCH_SPOTS: Record<string, { x: number; y: number }> = {
  ST: { x: 0.5, y: 0.08 }, CF: { x: 0.5, y: 0.19 }, LW: { x: 0.17, y: 0.16 }, RW: { x: 0.83, y: 0.16 },
  AM: { x: 0.5, y: 0.31 }, LM: { x: 0.14, y: 0.41 }, CM: { x: 0.5, y: 0.45 }, RM: { x: 0.86, y: 0.41 },
  LWB: { x: 0.14, y: 0.59 }, DM: { x: 0.5, y: 0.58 }, RWB: { x: 0.86, y: 0.59 },
  LB: { x: 0.18, y: 0.75 }, CB: { x: 0.5, y: 0.74 }, RB: { x: 0.82, y: 0.75 }, GK: { x: 0.5, y: 0.91 },
};

const DEFENSIVE = ["GK", "RB", "CB", "LB", "RWB", "LWB"];

/** Goalkeepers and defenders, the players for whom clean sheets count. */
export function isDefensive(profile: Profile): boolean {
  return profile.positions.some((p) => DEFENSIVE.includes(p));
}

export const STRENGTHS = [
  "Pace", "Work rate", "Passing range", "Vision", "Dribbling", "1v1 defending", "Aerial ability", "Finishing",
  "Pressing", "Ball carrying", "Leadership", "Set pieces", "Crossing", "Positional sense", "Shot stopping", "Distribution",
];

export const MAX_POSITIONS = 3;
export const MAX_STRENGTHS = 3;
export const BIO_MAX = 300;
export const MAX_CAREER = 6;
export const MAX_HONOURS = 6;

export const LEVELS = [
  "Academy (Category 1-2)", "Academy (Category 3-4)", "National League (Step 1)", "National League North/South (Step 2)",
  "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "County league", "Sunday league", "University", "High school", "ECNL / MLS Next",
];

/** Common intended majors for US college recruits, offered as suggestions. */
export const MAJORS = [
  "Undecided", "Business", "Sports management", "Kinesiology", "Exercise science", "Sports science", "Communications",
  "Psychology", "Engineering", "Computer science", "Nursing", "Education", "Marketing", "Finance", "Criminal justice",
];

/** 150 to 210 cm, for the height dropdown. */
export const HEIGHTS_CM = Array.from({ length: 61 }, (_, i) => String(150 + i));

/** The football season running on `date` (a new one starts in July), e.g. "2025/26". */
export function seasonOf(date = new Date()): string {
  const start = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

/** This season and last season, for the season dropdown. */
export function seasonOptions(date = new Date()): string[] {
  const now = seasonOf(date);
  const start = Number(now.slice(0, 4));
  return [now, `${start - 1}/${String(start).slice(2)}`];
}

/** This year back 15 years, for the previous clubs dropdowns. */
export function careerYears(date = new Date()): string[] {
  return Array.from({ length: 16 }, (_, i) => String(date.getFullYear() - i));
}

/** Last year to six years ahead, for the college graduation year dropdown. */
export function graduationYears(date = new Date()): string[] {
  return Array.from({ length: 8 }, (_, i) => String(date.getFullYear() - 1 + i));
}

export function slugify(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function publicPath(profile: Profile): string {
  return `/player/${slugify(profile.name) || "player"}-${profile.id}`;
}

/** Shareable link on the live domain from lib/site.ts (never localhost): copied links, messages, CV and QR code. */
export function publicUrl(profile: Profile): string {
  return `${SITE_URL}${publicPath(profile)}`;
}

/** "183 cm (6′0″)" */
export function formatHeight(cm: string): string {
  const n = Number(cm);
  if (!n || n < 100 || n > 230) return "";
  const totalInches = Math.round(n / 2.54);
  return `${Math.round(n)} cm (${Math.floor(totalInches / 12)}′${totalInches % 12}″)`;
}

export function positionLabel(profile: Profile): string {
  return profile.positions.join(" / ");
}

/** "2021–23", "2021", or "" */
export function formatYears(from: string, to: string): string {
  if (from && to && from !== to) return `${from}–${from.slice(0, 2) === to.slice(0, 2) ? to.slice(2) : to}`;
  return from || to;
}

export type CareerRow = { key: string; club: string; years: string; level: string; current: boolean };

/** The current club first (with its level), then previous clubs with their years. */
export function careerRows(profile: Profile): CareerRow[] {
  const rows: CareerRow[] = [];
  if (profile.club.trim()) {
    rows.push({ key: "current", club: profile.club.trim(), years: profile.stats.season.trim(), level: profile.level.trim(), current: true });
  }
  for (const c of profile.career) {
    if (c.club.trim()) rows.push({ key: c.id, club: c.club.trim(), years: formatYears(c.from, c.to), level: "", current: false });
  }
  return rows;
}

export function cleanList(items: string[]): string[] {
  return items.map((i) => i.trim()).filter(Boolean);
}

/** This season's numbers. Clean sheets only for goalkeepers and defenders. */
export function statItems(profile: Profile) {
  const { appearances, goals, assists, cleanSheets } = profile.stats;
  const items = [
    { key: "appearances", label: "Apps", long: "Appearances", value: appearances },
    { key: "goals", label: "Goals", long: "Goals", value: goals },
    { key: "assists", label: "Assists", long: "Assists", value: assists },
  ];
  if (isDefensive(profile)) items.push({ key: "cleanSheets", label: "Clean sheets", long: "Clean sheets", value: cleanSheets });
  return items;
}

/** The three things a profile can't be shared without. */
export function missingRequired(profile: Profile): string[] {
  return [
    !profile.name.trim() && "name",
    !profile.positions.length && "position",
    !profile.club.trim() && "current club",
  ].filter(Boolean) as string[];
}

/** What a complete profile has. Everything in "Add more" (previous clubs, honours, college) is extra. */
export function profileChecklist(profile: Profile | null) {
  const p = profile;
  return [
    { label: "Name", done: !!p?.name.trim() },
    { label: "Photo", done: !!p?.photo },
    { label: "Date of birth", done: !!p?.dob },
    { label: "Town or city", done: !!p?.contact.location.trim() },
    { label: "Phone or email", done: !!(p?.contact.phone.trim() || p?.contact.email.trim()) },
    { label: "Position", done: !!p?.positions.length },
    { label: "Preferred foot", done: !!p?.foot },
    { label: "Height", done: !!formatHeight(p?.heightCm ?? "") },
    { label: "Current club and level", done: !!(p?.club.trim() && p?.level.trim()) },
    { label: "Season stats", done: !!p?.stats.appearances },
    { label: "Highlight video", done: !!p?.highlightUrl.trim() },
    { label: "Key strengths", done: !!p && cleanList(p.strengths).length > 0 },
    { label: "Bio", done: !!p?.bio.trim() },
    { label: "Coach reference", done: !!(p?.coach.name.trim() && p?.coach.contact.trim()) },
  ];
}

export function profileProgress(profile: Profile | null) {
  const list = profileChecklist(profile);
  const done = list.filter((i) => i.done).length;
  return { done, total: list.length, complete: done === list.length, missing: list.filter((i) => !i.done).map((i) => i.label) };
}

/** A starting bio built from what the player has filled in, so they edit rather than write from nothing. */
export function exampleBio(profile: Profile): string {
  const position = POSITION_NAMES[profile.positions[0]]?.toLowerCase() || "player";
  const foot = profile.foot === "Both" ? "Two-footed" : profile.foot ? `${profile.foot}-footed` : "";
  const who = [foot, foot ? position : position.charAt(0).toUpperCase() + position.slice(1)].filter(Boolean).join(" ");
  const club = profile.club.trim() ? ` playing for ${profile.club.trim()}` : "";
  const strengths = cleanList(profile.strengths).map((s) => s.toLowerCase());
  const best =
    strengths.length > 1 ? `My best qualities are ${strengths.slice(0, -1).join(", ")} and ${strengths.at(-1)}.` : strengths.length ? `My best quality is ${strengths[0]}.` : "I work hard for the team and keep improving every season.";
  return `${who}${club}. ${best} I'm looking for a trial at a higher level.`;
}
