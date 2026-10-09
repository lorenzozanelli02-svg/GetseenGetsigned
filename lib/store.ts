/**
 * The data layer. Every read and write of saved data in the app goes through
 * this file, and nothing else touches storage.
 *
 * Today it stores everything in the browser's localStorage. To move to a real
 * database, re-implement the exported functions below (same names, same types)
 * so they call your API. They are already async, so no calling code has to
 * change.
 */

/* ---------- Types ---------- */

export type Foot = "" | "Right" | "Left" | "Both";

export type CareerEntry = {
  id: string;
  club: string;
  /** Four-digit years, e.g. "2021" to "2023". Either can be blank. */
  from: string;
  to: string;
};

export type Profile = {
  /** Stable short id; the end of the public link, so links survive name changes. */
  id: string;
  /** Required. */
  name: string;
  /** JPEG data URL, resized before saving. */
  photo: string;
  /** YYYY-MM-DD */
  dob: string;
  /** Required: at least one. The first is the main position. */
  positions: string[];
  foot: Foot;
  heightCm: string;
  /** Required. */
  club: string;
  level: string;
  stats: { season: string; appearances: string; goals: string; assists: string; cleanSheets: string };
  highlightUrl: string;
  matchUrl: string;
  /** Up to 3, picked from STRENGTHS in lib/profile.ts. */
  strengths: string[];
  /** Up to 300 characters. */
  bio: string;
  coach: { name: string; club: string; contact: string };
  contact: { phone: string; email: string; location: string };
  /** Whether phone and email appear on the public player page. They are always on the CV. */
  showContactPublic: boolean;
  /* Optional extras ("Add more" in the Profile Builder). */
  /** Previous clubs, most recent first. The current club is added automatically where shown. */
  career: CareerEntry[];
  honours: string[];
  /** For US college recruiting. */
  college: { graduationYear: string; gpa: string; major: string };
  updatedAt: string;
};

export type RecipientType = "non-league" | "trial" | "us-college";

export type SavedMessage = {
  id: string;
  type: RecipientType;
  club: string;
  contactName: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactStatus = "sent" | "replied" | "trial-offered" | "no-reply";

export type Contact = {
  id: string;
  club: string;
  contactName: string;
  role: string;
  /** YYYY-MM-DD */
  dateSent: string;
  status: ContactStatus;
  /** YYYY-MM-DD, or "" for none. */
  followUpDate: string;
  notes: string;
  createdAt: string;
};

export type NewContact = Omit<Contact, "id" | "createdAt">;

/* ---------- localStorage plumbing (private to this file) ---------- */

const KEYS = {
  access: "gsgs-access",
  profile: "gsgs-profile",
  messages: "gsgs-messages",
  contacts: "gsgs-contacts",
  guide: "gsgs-guide-read",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Throws StorageFullError if the browser refuses the write (usually a full quota). */
function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    throw new StorageFullError(err);
  }
}

export class StorageFullError extends Error {
  constructor(cause: unknown) {
    super("This browser couldn't save your changes. Its storage may be full.", { cause });
  }
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

const now = () => new Date().toISOString();

/* ---------- Access (mock payments) ---------- */

export async function hasAccess(): Promise<boolean> {
  return read<string | null>(KEYS.access, null) === "unlocked";
}

export async function unlockAccess(): Promise<void> {
  write(KEYS.access, "unlocked");
}

export async function resetAccess(): Promise<void> {
  try {
    localStorage.removeItem(KEYS.access);
  } catch {
    // Nothing stored, nothing to clear.
  }
}

/* ---------- Profile ---------- */

export function emptyProfile(): Profile {
  return {
    id: newId(),
    name: "",
    photo: "",
    dob: "",
    positions: [],
    foot: "",
    heightCm: "",
    club: "",
    level: "",
    stats: { season: "", appearances: "", goals: "", assists: "", cleanSheets: "" },
    highlightUrl: "",
    matchUrl: "",
    strengths: [],
    bio: "",
    coach: { name: "", club: "", contact: "" },
    contact: { phone: "", email: "", location: "" },
    showContactPublic: true,
    career: [],
    honours: [],
    college: { graduationYear: "", gpa: "", major: "" },
    updatedAt: "",
  };
}

export function emptyCareerEntry(): CareerEntry {
  return { id: newId(), club: "", from: "", to: "" };
}

/** Saved data from any earlier version of the profile, before fields were added or removed. */
type SavedProfile = Partial<Omit<Profile, "career">> & {
  career?: (Partial<CareerEntry> & { seasons?: string })[];
  previousClubs?: string;
  education?: { graduationYear?: string };
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const pick = <T extends Record<string, string>>(base: T, saved: unknown): T =>
  Object.fromEntries(Object.keys(base).map((k) => [k, str((saved as Record<string, unknown> | undefined)?.[k])])) as T;

/** "2023–25", "2022/23" or "2021-2024" from older saves, as four-digit years. */
function yearsFrom(text: string): { from: string; to: string } {
  const m = text.match(/(\d{4})(?:\s*[-–/]\s*(\d{2,4}))?/);
  if (!m) return { from: "", to: "" };
  const to = m[2] ? (m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : "";
  return { from: m[1], to };
}

/**
 * Builds a current Profile from whatever was saved. Only known fields are kept, so
 * fields removed from the app (weight, availability, nationality and so on) are dropped.
 */
function normalise(saved: SavedProfile): Profile {
  const base = emptyProfile();
  const career: CareerEntry[] = (saved.career ?? []).map((c) => ({
    id: str(c.id) || newId(),
    club: str(c.club),
    ...(c.from !== undefined || c.to !== undefined ? { from: str(c.from), to: str(c.to) } : yearsFrom(str(c.seasons))),
  }));
  // The first version kept previous clubs as text, one per line, e.g. "Norton United (2023–25)".
  if (!saved.career && saved.previousClubs) {
    for (const line of saved.previousClubs.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const m = line.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      career.push({ id: newId(), club: m ? m[1] : line, ...yearsFrom(m ? m[2] : "") });
    }
  }
  return {
    id: str(saved.id) || base.id,
    name: str(saved.name),
    photo: str(saved.photo),
    dob: str(saved.dob),
    positions: Array.isArray(saved.positions) ? saved.positions.filter((p) => typeof p === "string") : [],
    foot: (["Right", "Left", "Both"] as const).find((f) => f === saved.foot) ?? "",
    heightCm: str(saved.heightCm),
    club: str(saved.club),
    level: str(saved.level),
    stats: pick(base.stats, saved.stats),
    highlightUrl: str(saved.highlightUrl),
    matchUrl: str(saved.matchUrl),
    strengths: Array.isArray(saved.strengths) ? saved.strengths.filter((t) => typeof t === "string").slice(0, 3) : [],
    bio: str(saved.bio),
    coach: pick(base.coach, saved.coach),
    contact: pick(base.contact, saved.contact),
    showContactPublic: saved.showContactPublic !== false,
    career,
    honours: Array.isArray(saved.honours) ? saved.honours.filter((h) => typeof h === "string") : [],
    college: { ...pick(base.college, saved.college), ...(!saved.college && saved.education?.graduationYear ? { graduationYear: str(saved.education.graduationYear) } : {}) },
    updatedAt: str(saved.updatedAt),
  };
}

export async function getProfile(): Promise<Profile | null> {
  const saved = read<SavedProfile | null>(KEYS.profile, null);
  return saved ? normalise(saved) : null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const saved = { ...profile, updatedAt: now() };
  write(KEYS.profile, saved);
  return saved;
}

/** Public lookup for /player/[slug]. Matches on the id at the end of the slug. */
export async function getPublicProfile(slug: string): Promise<Profile | null> {
  const profile = await getProfile();
  const id = slug.split("-").pop();
  return profile && profile.id === id && profile.name.trim() ? profile : null;
}

/* ---------- Messages ---------- */

export async function listMessages(): Promise<SavedMessage[]> {
  return read<SavedMessage[]>(KEYS.messages, []);
}

/** Inserts or updates by id. */
export async function saveMessage(message: Omit<SavedMessage, "createdAt" | "updatedAt">): Promise<SavedMessage> {
  const all = await listMessages();
  const existing = all.find((m) => m.id === message.id);
  const saved: SavedMessage = { ...message, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
  write(KEYS.messages, existing ? all.map((m) => (m.id === message.id ? saved : m)) : [saved, ...all]);
  return saved;
}

/* ---------- Outreach contacts ---------- */

export async function listContacts(): Promise<Contact[]> {
  return read<Contact[]>(KEYS.contacts, []);
}

export async function addContact(contact: NewContact): Promise<Contact> {
  const saved: Contact = { ...contact, id: newId(), createdAt: now() };
  write(KEYS.contacts, [saved, ...(await listContacts())]);
  return saved;
}

export async function updateContact(id: string, changes: Partial<NewContact>): Promise<Contact> {
  const all = await listContacts();
  const current = all.find((c) => c.id === id);
  if (!current) throw new Error("That contact no longer exists.");
  const saved = { ...current, ...changes };
  write(KEYS.contacts, all.map((c) => (c.id === id ? saved : c)));
  return saved;
}

export async function deleteContact(id: string): Promise<void> {
  write(KEYS.contacts, (await listContacts()).filter((c) => c.id !== id));
}

/* ---------- Guide progress ---------- */

export async function getReadChapters(): Promise<string[]> {
  return read<string[]>(KEYS.guide, []);
}

export async function setChapterRead(chapterId: string, isRead: boolean): Promise<string[]> {
  const current = new Set(await getReadChapters());
  if (isRead) current.add(chapterId);
  else current.delete(chapterId);
  const next = [...current];
  write(KEYS.guide, next);
  return next;
}
