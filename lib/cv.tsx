import { publicUrl, slugify } from "./profile";
import type { Profile } from "./store";

/** Builds the one-page PDF in the browser and downloads it. The PDF library loads only when needed. */
export async function downloadCv(profile: Profile): Promise<void> {
  const [{ pdf }, { CvDocument }] = await Promise.all([import("@react-pdf/renderer"), import("@/components/CvDocument")]);
  const blob = await pdf(<CvDocument profile={profile} profileUrl={publicUrl(profile)} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(profile.name) || "player"}-football-cv.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
