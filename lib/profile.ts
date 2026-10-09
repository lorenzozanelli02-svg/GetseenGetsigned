import type { Profile } from "./store";

export const POSITIONS = ["GK", "RB", "CB", "LB", "RWB", "LWB", "DM", "CM", "AM", "RM", "LM", "RW", "LW", "CF", "ST"];

export const POSITION_NAMES: Record<string, string> = {
  GK: "Goalkeeper", RB: "Right back", CB: "Centre back", LB: "Left back", RWB: "Right wing back",
  LWB: "Left wing back", DM: "Defensive midfielder", CM: "Central midfielder", AM: "Attacking midfielder",
  RM: "Right midfielder", LM: "Left midfielder", RW: "Right winger", LW: "Left winger", CF: "Centre forward", ST: "Striker",
};

export const LEVELS = [
  "Academy (Category 1-2)", "Academy (Category 3-4)", "National League (Step 1)", "National League North/South (Step 2)",
  "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "County league", "Sunday league", "University", "High school", "ECNL / MLS Next",
];

export function slugify(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function publicPath(profile: Profile): string {
  return `/player/${slugify(profile.name) || "player"}-${profile.id}`;
}

export function publicUrl(profile: Profile): string {
  return `${window.location.origin}${publicPath(profile)}`;
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

export function previousClubList(profile: Profile): string[] {
  return profile.previousClubs.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function statItems(profile: Profile) {
  const { appearances, goals, assists, cleanSheets } = profile.stats;
  const items = [
    { label: "Apps", value: appearances },
    { label: "Goals", value: goals },
    { label: "Assists", value: assists },
  ];
  // Clean sheets only matter for goalkeepers and defenders, or if the player filled them in.
  const defensive = profile.positions.some((p) => ["GK", "RB", "CB", "LB", "RWB", "LWB"].includes(p));
  if (cleanSheets || defensive) items.push({ label: "Clean sheets", value: cleanSheets });
  return items;
}

/** What a complete profile needs. Previous clubs, full match link and clean sheets are optional. */
export function profileChecklist(profile: Profile | null) {
  const p = profile;
  return [
    { label: "Name", done: !!p?.name.trim() },
    { label: "Photo", done: !!p?.photo },
    { label: "Date of birth", done: !!p?.dob },
    { label: "Position", done: !!p?.positions.length },
    { label: "Preferred foot", done: !!p?.foot },
    { label: "Height", done: !!formatHeight(p?.heightCm ?? "") },
    { label: "Current club and level", done: !!(p?.club.trim() && p?.level.trim()) },
    { label: "Season stats", done: !!p?.stats.appearances },
    { label: "Highlight video", done: !!p?.highlightUrl.trim() },
    { label: "Coach reference", done: !!(p?.coach.name.trim() && p?.coach.contact.trim()) },
    { label: "Bio", done: !!p?.bio.trim() },
  ];
}

export function profileProgress(profile: Profile | null) {
  const list = profileChecklist(profile);
  const done = list.filter((i) => i.done).length;
  return { done, total: list.length, complete: done === list.length, missing: list.filter((i) => !i.done).map((i) => i.label) };
}
