/**
 * Mock access state, stored in this browser's localStorage until real payments
 * are connected. Once Stripe is live, decide access on your server (from a
 * verified Checkout Session or webhook) instead of trusting the browser.
 */
const KEY = "gsgs-access";

export function hasAccess(): boolean {
  try {
    return localStorage.getItem(KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function unlockAccess(): void {
  try {
    localStorage.setItem(KEY, "unlocked");
  } catch {
    // Storage blocked (e.g. some private modes): the dashboard will show as locked.
  }
}

export function resetAccess(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}
