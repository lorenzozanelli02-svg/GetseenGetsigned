import { ageFrom } from "./dates";
import { cleanList, isDefensive, MAJORS, POSITION_NAMES, seasonOf } from "./profile";
import type { Profile } from "./store";

/*
 * Writes the "Profile" paragraph at the top of the CV from the player's answers.
 *
 * It follows the house style of a professional CV: short, confident sentences with
 * no "I" and no he/she, and only facts the player gave. Anything left blank is
 * simply left out, so the paragraph reads cleanly however much is filled in.
 */

/** How each strength tag reads after "Stands out for …". */
const STRENGTH_PHRASES: Record<string, string> = {
  Pace: "real pace",
  "Work rate": "a relentless work rate",
  "Passing range": "a wide passing range",
  Vision: "the vision to unlock a defence",
  Dribbling: "close control and dribbling",
  "1v1 defending": "strong one-on-one defending",
  "Aerial ability": "dominance in the air",
  Finishing: "clinical finishing",
  Pressing: "intensity in the press",
  "Ball carrying": "driving forward with the ball",
  Leadership: "natural leadership",
  "Set pieces": "quality from set pieces",
  Crossing: "dangerous crossing",
  "Positional sense": "excellent positional sense",
  "Shot stopping": "sharp shot stopping",
  Distribution: "accurate distribution",
};

/** How each position reads after "Can also play …". */
const ALSO_PLAYS: Record<string, string> = {
  GK: "in goal",
  RB: "at right back",
  CB: "at centre back",
  LB: "at left back",
  RWB: "at right wing back",
  LWB: "at left wing back",
  DM: "as a defensive midfielder",
  CM: "in central midfield",
  AM: "as an attacking midfielder",
  RM: "on the right of midfield",
  LM: "on the left of midfield",
  RW: "on the right wing",
  LW: "on the left wing",
  CF: "as a centre forward",
  ST: "up front",
};

/** "a", "a and b", "a, b and c" */
function listJoin(items: string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? "An" : "A");
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "6′0″" from centimetres, or "" */
function feetInches(cm: string): string {
  const n = Number(cm);
  if (!n || n < 100 || n > 230) return "";
  const inches = Math.round(n / 2.54);
  return `${Math.floor(inches / 12)}′${inches % 12}″`;
}

/** Where the player's level sits, read after the club name. */
function levelPhrase(level: string): string {
  const l = level.trim();
  if (!l) return "";
  const step = l.match(/^Step (\d)$|\(Step (\d)\)$/);
  if (l === "National League (Step 1)") return " in the National League";
  if (step) return ` at Step ${step[1] ?? step[2]} of the non-league pyramid`;
  const academy = l.match(/^Academy \(Category (\d)-(\d)\)$/);
  if (academy) return ` at Category ${academy[1]}–${academy[2]} academy level`;
  const fixed: Record<string, string> = {
    "County league": " in county league football",
    "Sunday league": " in Sunday league football",
    University: " in university football",
    "High school": " at high school level",
    "ECNL / MLS Next": " in ECNL / MLS Next",
  };
  if (fixed[l]) return fixed[l];
  // A league the player typed themselves, e.g. "Isthmian League".
  if (/league$/i.test(l)) return ` in ${/^the /i.test(l) ? "" : "the "}${l}`;
  return ` (${l})`;
}

/** Number from a stats box, or null when it was left blank. */
const num = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));

export function writeProfile(p: Profile, today = new Date()): string {
  const sentences: string[] = [];
  const main = POSITION_NAMES[p.positions[0]]?.toLowerCase() ?? "";
  const club = p.club.trim();

  // Who they are and where they play.
  const foot = p.foot === "Both" ? "two-footed" : p.foot ? `${p.foot.toLowerCase()}-footed` : "";
  const age = ageFrom(p.dob);
  const height = feetInches(p.heightCm);
  const details = [age !== null && `aged ${age}`, height && `standing ${height}`].filter(Boolean).join(" and ");
  const playing = club ? `currently playing for ${club}${levelPhrase(p.level)}` : "";
  if (main || foot) {
    const role = [foot, main || "player"].filter(Boolean).join(" ");
    const opener = `${article(role)} ${role}`;
    if (details && playing) sentences.push(`${opener}, ${details}, ${playing}.`);
    else if (details) sentences.push(`${opener}, ${details}.`);
    else if (playing) sentences.push(`${opener} ${playing}.`);
    else sentences.push(`${opener}.`);
  } else if (playing) {
    sentences.push(`${playing.charAt(0).toUpperCase()}${playing.slice(1)}.`);
  }

  // What they're good at, in their own choice of strengths.
  const strengths = cleanList(p.strengths).map((s) => STRENGTH_PHRASES[s] ?? s.toLowerCase());
  if (strengths.length) sentences.push(`Stands out for ${listJoin(strengths)}.`);

  // Other positions.
  const others = p.positions.slice(1).map((pos) => ALSO_PLAYS[pos]).filter(Boolean);
  if (others.length) sentences.push(`Can also play ${listJoin(others)}.`);

  // This season's numbers. Zeros and blanks are left out.
  const apps = num(p.stats.appearances);
  const extras = [
    isDefensive(p) && num(p.stats.cleanSheets) ? count(num(p.stats.cleanSheets)!, "clean sheet", "clean sheets") : "",
    num(p.stats.goals) ? count(num(p.stats.goals)!, "goal", "goals") : "",
    num(p.stats.assists) ? count(num(p.stats.assists)!, "assist", "assists") : "",
  ].filter(Boolean);
  const season = p.stats.season.trim() || seasonOf(today);
  const current = season === seasonOf(today);
  const when = current ? `so far in the ${season} season` : `in the ${season} season`;
  if (apps) {
    sentences.push(`${current ? "Has made" : "Made"} ${count(apps, "appearance", "appearances")} ${when}${extras.length ? `, with ${listJoin(extras)}` : ""}.`);
  } else if (extras.length) {
    sentences.push(`${current ? "Has" : "Recorded"} ${listJoin(extras)} ${when}.`);
  }

  // Where they've played before.
  const previous = p.career.map((c) => c.club.trim()).filter(Boolean);
  if (previous.length) {
    sentences.push(`Previously played for ${listJoin(previous.slice(0, 3))}${previous.length > 3 ? ", among other clubs" : ""}.`);
  }

  // What they're looking for: US college if they've filled that in, otherwise the next step up.
  const { graduationYear, gpa, major } = p.college;
  const subject = major.trim();
  const studying = subject && subject.toLowerCase() !== "undecided" ? ` while studying ${MAJORS.includes(subject) ? subject.toLowerCase() : subject}` : "";
  if (graduationYear.trim()) {
    const done = Number(graduationYear) < today.getFullYear();
    sentences.push(`${done ? "Graduated" : "Graduating"} in ${graduationYear.trim()}${gpa.trim() ? ` with a ${gpa.trim()} GPA` : ""} and ${done ? "now " : ""}looking to play college soccer in the US${studying}.`);
  } else if (gpa.trim() || studying) {
    sentences.push(`Looking to play college soccer in the US${studying}${gpa.trim() ? `, with a ${gpa.trim()} GPA` : ""}.`);
  } else if (sentences.length) {
    const where = p.contact.location.trim();
    sentences.push(`${where ? `Based in ${where} and looking` : "Looking"} for a trial at a higher level.`);
  }

  return sentences.join(" ");
}
