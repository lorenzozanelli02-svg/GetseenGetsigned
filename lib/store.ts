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
  /** e.g. "2023–25" */
  seasons: string;
  level: string;
  appearances: string;
  goals: string;
};

export type Profile = {
  /** Stable short id; the end of the public link, so links survive name changes. */
  id: string;
  name: string;
  /** JPEG data URL, resized before saving. */
  photo: string;
  /** YYYY-MM-DD */
  dob: string;
  positions: string[];
  foot: Foot;
  heightCm: string;
  club: string;
  level: string;
  stats: { season: string; appearances: string; goals: string; assists: string; cleanSheets: string };
  highlightUrl: string;
  matchUrl: string;
  coach: { name: string; club: string; contact: string };
  bio: string;
  contact: { phone: string; email: string; location: string; nationality: string };
  /** Whether phone and email appear on the public player page. They are always on the CV. */
  showContactPublic: boolean;
  /** One line. */
  lookingFor: string;
  /** Up to 4 short tags. */
  strengths: string[];
  /** Previous clubs, most recent first. The current club is added automatically where shown. */
  career: CareerEntry[];
  honours: string[];
  physical: { weightKg: string; sprint: string; fitness: string };
  availability: { trials: string; travel: string };
  education: { school: string; grades: string; graduationYear: string };
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
    coach: { name: "", club: "", contact: "" },
    bio: "",
    contact: { phone: "", email: "", location: "", nationality: "" },
    showContactPublic: true,
    lookingFor: "",
    strengths: [],
    career: [],
    honours: [],
    physical: { weightKg: "", sprint: "", fitness: "" },
    availability: { trials: "", travel: "" },
    education: { school: "", grades: "", graduationYear: "" },
    updatedAt: "",
  };
}

export function emptyCareerEntry(): CareerEntry {
  return { id: newId(), club: "", seasons: "", level: "", appearances: "", goals: "" };
}

export async function getProfile(): Promise<Profile | null> {
  const saved = read<(Partial<Profile> & { previousClubs?: string }) | null>(KEYS.profile, null);
  if (!saved) return null;
  // Merge over an empty profile so older saves pick up fields added later.
  const base = emptyProfile();
  const { previousClubs, ...rest } = saved;
  const profile: Profile = {
    ...base,
    ...rest,
    stats: { ...base.stats, ...saved.stats },
    coach: { ...base.coach, ...saved.coach },
    contact: { ...base.contact, ...saved.contact },
    physical: { ...base.physical, ...saved.physical },
    availability: { ...base.availability, ...saved.availability },
    education: { ...base.education, ...saved.education },
  };
  // Older profiles kept previous clubs as text, one per line, e.g. "Norton United (2023–25)".
  if (!saved.career && previousClubs) {
    profile.career = previousClubs
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
        return { ...emptyCareerEntry(), club: m ? m[1] : line, seasons: m ? m[2] : "" };
      });
  }
  return profile;
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
