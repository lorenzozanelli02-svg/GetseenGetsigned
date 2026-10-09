import { unlockAccess } from "./access";

export const DASHBOARD_PATH = "/dashboard";

/**
 * The one place payments happen. Every buy button on the site calls this.
 *
 * Now (mock): unlock access in this browser and go straight to the dashboard.
 *
 * Later (Stripe): replace the body with a request to your own API route that
 * creates a Checkout Session, then `window.location.assign(session.url)`. Set
 * the session's success_url to DASHBOARD_PATH and unlock access from the
 * Stripe webhook rather than here.
 */
export async function startCheckout(): Promise<void> {
  unlockAccess();
  window.location.assign(DASHBOARD_PATH);
}
