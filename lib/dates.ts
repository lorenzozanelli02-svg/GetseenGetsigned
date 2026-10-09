/** Dates are stored as local YYYY-MM-DD strings. */

export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86_400_000);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  return parseISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ageFrom(dob: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const birth = parseISO(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 100 ? age : null;
}

/** "due" = today, "overdue" = before today, null = later or no date. */
export function followUpState(followUpDate: string): { kind: "due" | "overdue"; days: number } | null {
  if (!followUpDate) return null;
  const days = daysBetween(followUpDate, todayISO());
  if (days === 0) return { kind: "due", days: 0 };
  if (days > 0) return { kind: "overdue", days };
  return null;
}
