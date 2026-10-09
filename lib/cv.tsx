import { publicUrl, slugify } from "./profile";
import type { Profile } from "./store";

const MIN_SCALE = 0.72;
const MAX_SCALE = 2.2;

/**
 * Builds the one-page PDF in the browser and downloads it. The PDF and QR libraries load only when needed.
 *
 * The CV is rendered at different scales and the largest one that still fits on a single
 * A4 page is kept, so a full profile and a sparse one both fill the page.
 */
export async function downloadCv(profile: Profile): Promise<void> {
  const blob = await buildCv(profile);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(profile.name) || "player"}-football-cv.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function buildCv(profile: Profile): Promise<Blob> {
  const [{ pdf }, { CvDocument }, QRCode] = await Promise.all([import("@react-pdf/renderer"), import("@/components/CvDocument"), import("qrcode")]);
  const link = publicUrl(profile);
  const qr = await QRCode.toDataURL(link, { margin: 0, width: 360, errorCorrectionLevel: "M", color: { dark: "#07100b", light: "#ffffff" } });
  const render = (scale: number) => pdf(<CvDocument profile={profile} profileUrl={link} qr={qr} scale={scale} />).toBlob();

  let blob = await render(MAX_SCALE);
  if ((await pageCount(blob)) === 1) return blob;

  // Binary search for the largest scale that fits on one page.
  let lo = MIN_SCALE;
  let hi = MAX_SCALE;
  let best: Blob | null = null;
  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    blob = await render(mid);
    if ((await pageCount(blob)) === 1) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best ?? render(MIN_SCALE);
}

async function pageCount(blob: Blob): Promise<number> {
  return (await blob.text()).match(/\/Type\s*\/Page(?![a-zA-Z])/g)?.length ?? 0;
}
