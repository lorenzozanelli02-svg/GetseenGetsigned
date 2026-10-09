import { followUpState } from "./dates";
import type { Contact, ContactStatus } from "./store";

export const STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "trial-offered", label: "Trial offered" },
  { value: "no-reply", label: "No reply" },
];

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label])) as Record<ContactStatus, string>;

export function statusClass(status: ContactStatus): string {
  return {
    sent: "border-line bg-transparent text-ink/85",
    replied: "border-accent/40 bg-accent/12 text-accent",
    "trial-offered": "border-accent bg-accent text-on-accent",
    "no-reply": "border-dashed border-line bg-transparent text-muted",
  }[status];
}

/** Newest first. */
export function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => b.dateSent.localeCompare(a.dateSent) || b.createdAt.localeCompare(a.createdAt));
}

/** Follow-ups due today or overdue, most overdue first. */
export function dueFollowUps(contacts: Contact[]) {
  return contacts
    .map((c) => ({ contact: c, due: followUpState(c.followUpDate) }))
    .filter((x): x is { contact: Contact; due: NonNullable<ReturnType<typeof followUpState>> } => x.due !== null)
    .sort((a, b) => b.due.days - a.due.days);
}

export function trackerStats(contacts: Contact[]) {
  const clubs = new Set(contacts.map((c) => c.club.trim().toLowerCase()).filter(Boolean));
  return {
    clubs: clubs.size,
    replies: contacts.filter((c) => c.status === "replied" || c.status === "trial-offered").length,
    trials: contacts.filter((c) => c.status === "trial-offered").length,
  };
}

export function dueLabel(due: { kind: "due" | "overdue"; days: number }): string {
  return due.kind === "due" ? "Due today" : `Overdue by ${due.days} day${due.days === 1 ? "" : "s"}`;
}
