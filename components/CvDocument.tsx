import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ageFrom, formatDate } from "@/lib/dates";
import { formatHeight, POSITION_NAMES, previousClubList, statItems } from "@/lib/profile";
import type { Profile } from "@/lib/store";

/* One-page A4 football CV, rendered in the browser with @react-pdf/renderer. */

let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const base = `${window.location.origin}/fonts/`;
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${base}inter-latin-400-normal.woff`, fontWeight: 400 },
      { src: `${base}inter-latin-600-normal.woff`, fontWeight: 600 },
      { src: `${base}inter-latin-700-normal.woff`, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Barlow Condensed",
    fonts: [
      { src: `${base}barlow-condensed-latin-700-normal.woff`, fontWeight: 700 },
      { src: `${base}barlow-condensed-latin-800-normal.woff`, fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsReady = true;
}

const C = { ink: "#0b120e", muted: "#56635c", line: "#dde4e0", green: "#13804a", band: "#07100b", accent: "#3be584", bandMuted: "#9aa8a0" };

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9.5, color: C.ink, backgroundColor: "#ffffff" },
  band: { backgroundColor: C.band, paddingHorizontal: 36, paddingVertical: 30, flexDirection: "row", gap: 24 },
  photo: { width: 108, height: 135, borderRadius: 6, objectFit: "cover" },
  photoEmpty: { width: 108, height: 135, borderRadius: 6, backgroundColor: "#16211b", alignItems: "center", justifyContent: "center" },
  initials: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, color: C.accent },
  head: { flex: 1, justifyContent: "center" },
  positions: { color: C.accent, fontWeight: 600, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" },
  name: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 38, color: "#ffffff", textTransform: "uppercase", marginTop: 4, lineHeight: 1 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, columnGap: 22, rowGap: 8 },
  metaLabel: { fontSize: 6.5, color: C.bandMuted, textTransform: "uppercase", letterSpacing: 1 },
  metaValue: { fontSize: 10, color: "#ffffff", fontWeight: 600, marginTop: 2 },
  stats: { flexDirection: "row", paddingHorizontal: 36, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: "flex-end" },
  season: { width: 90, fontSize: 7.5, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1.2, paddingBottom: 6 },
  stat: { flex: 1 },
  statValue: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 30, color: C.ink, lineHeight: 1 },
  statLabel: { fontSize: 7, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  body: { flexDirection: "row", paddingHorizontal: 36, paddingTop: 22, gap: 30 },
  main: { flex: 3 },
  side: { flex: 2 },
  section: { marginBottom: 18 },
  title: { fontSize: 7.5, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1.4, paddingBottom: 5, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  // lineHeight multiplies the style's own fontSize (react-pdf defaults it to 18), so set both.
  para: { fontSize: 9.5, lineHeight: 1.55 },
  strong: { fontWeight: 600 },
  muted: { color: C.muted },
  item: { fontSize: 9.5, marginBottom: 4, lineHeight: 1.4 },
  link: { color: C.green, textDecoration: "none" },
  footer: { position: "absolute", bottom: 22, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.muted, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
});

const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").slice(0, 48);

export function CvDocument({ profile, profileUrl }: { profile: Profile; profileUrl: string }) {
  registerFonts();
  const age = ageFrom(profile.dob);
  const height = formatHeight(profile.heightCm);
  const clubs = previousClubList(profile).slice(0, 8);
  const coach = profile.coach;
  const meta = [
    { label: "Age", value: age !== null ? `${age} (${formatDate(profile.dob)})` : "" },
    { label: "Foot", value: profile.foot },
    { label: "Height", value: height },
    { label: "Club", value: profile.club.trim() },
  ].filter((m) => m.value);
  const initials = profile.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Document title={`${profile.name} – Football CV`} author={profile.name} creator="Get Seen Get Signed">
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          {profile.photo ? (
            // react-pdf's Image has no alt prop; the name sits next to it.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={profile.photo} style={s.photo} />
          ) : (
            <View style={s.photoEmpty}>
              <Text style={s.initials}>{initials}</Text>
            </View>
          )}
          <View style={s.head}>
            {profile.positions.length > 0 && (
              <Text style={s.positions}>{profile.positions.map((p) => POSITION_NAMES[p] ?? p).join("  /  ")}</Text>
            )}
            <Text style={s.name}>{profile.name}</Text>
            <View style={s.metaRow}>
              {meta.map((m) => (
                <View key={m.label}>
                  <Text style={s.metaLabel}>{m.label}</Text>
                  <Text style={s.metaValue}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.stats}>
          <Text style={s.season}>{profile.stats.season.trim() ? `${profile.stats.season.trim()} season` : "This season"}</Text>
          {statItems(profile).map((st) => (
            <View key={st.label} style={s.stat}>
              <Text style={s.statValue}>{st.value || "0"}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.body}>
          <View style={s.main}>
            {profile.bio.trim() && (
              <View style={s.section}>
                <Text style={s.title}>Profile</Text>
                <Text style={s.para}>{profile.bio.trim()}</Text>
              </View>
            )}
            <View style={s.section}>
              <Text style={s.title}>Career</Text>
              {profile.club.trim() && (
                <Text style={s.item}>
                  <Text style={s.strong}>{profile.club.trim()}</Text>
                  {profile.level.trim() && <Text style={s.muted}>{`  ·  ${profile.level.trim()}`}</Text>}
                  <Text style={s.muted}>{"  ·  Current club"}</Text>
                </Text>
              )}
              {clubs.map((c) => (
                <Text key={c} style={s.item}>
                  {c}
                </Text>
              ))}
            </View>
          </View>

          <View style={s.side}>
            {(profile.highlightUrl.trim() || profile.matchUrl.trim()) && (
              <View style={s.section}>
                <Text style={s.title}>Video</Text>
                {profile.highlightUrl.trim() && (
                  <Text style={s.item}>
                    <Text style={s.strong}>Highlights: </Text>
                    <Link src={profile.highlightUrl.trim()} style={s.link}>
                      {short(profile.highlightUrl.trim())}
                    </Link>
                  </Text>
                )}
                {profile.matchUrl.trim() && (
                  <Text style={s.item}>
                    <Text style={s.strong}>Full match: </Text>
                    <Link src={profile.matchUrl.trim()} style={s.link}>
                      {short(profile.matchUrl.trim())}
                    </Link>
                  </Text>
                )}
              </View>
            )}
            {coach.name.trim() && (
              <View style={s.section}>
                <Text style={s.title}>Reference</Text>
                <Text style={[s.item, s.strong]}>{coach.name.trim()}</Text>
                {coach.club.trim() && <Text style={[s.item, s.muted]}>{coach.club.trim()}</Text>}
                {coach.contact.trim() && <Text style={s.item}>{coach.contact.trim()}</Text>}
              </View>
            )}
            <View style={s.section}>
              <Text style={s.title}>Online profile</Text>
              <Link src={profileUrl} style={[s.item, s.link]}>
                {short(profileUrl)}
              </Link>
            </View>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>{profile.name} · Football CV</Text>
          <Text>Updated {formatDate((profile.updatedAt || new Date().toISOString()).slice(0, 10))}</Text>
        </View>
      </Page>
    </Document>
  );
}
