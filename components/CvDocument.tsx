import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ageFrom, formatDate } from "@/lib/dates";
import { careerRows, cleanList, formatHeight, formatWeight, POSITION_NAMES, type CareerRow } from "@/lib/profile";
import { SITE } from "@/lib/site";
import type { Profile } from "@/lib/store";

/*
 * One-page A4 football CV, rendered in the browser with @react-pdf/renderer.
 *
 * `scale` grows or shrinks type and spacing so the content fills the page: lib/cv.tsx
 * renders at several scales and keeps the largest one that still fits on one page.
 * Sections the player left empty are not rendered, and each column spreads its
 * sections evenly down the page, so there is no blank block at the bottom.
 */

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

const C = {
  ink: "#0b120e",
  muted: "#56635c",
  line: "#dde4e0",
  green: "#11794a",
  tint: "#e7f6ed",
  band: "#07100b",
  box: "#0c1711",
  accent: "#3be584",
  bandMuted: "#93a39a",
  bandLine: "#1f2d25",
};

const PAGE_PAD = 36;
const COL_GAP = 26;
const LEFT_FLEX = 1.38;

/**
 * Text grows only a little; spacing, stat boxes, photo and QR code grow more. A sparse CV
 * therefore fills the page with larger blocks and roomier sections rather than huge type.
 */
function makeStyles(scale: number) {
  const t = Math.min(scale, 1.2);
  const b = scale;
  const photoW = 104 * Math.min(b, 1.4);
  return StyleSheet.create({
    page: { fontFamily: "Inter", fontSize: 10.5 * t, color: C.ink, backgroundColor: "#ffffff", flexDirection: "column" },

    band: { backgroundColor: C.band, paddingHorizontal: PAGE_PAD, paddingVertical: 24 * Math.min(b, 1.6), flexDirection: "row", gap: 22 },
    photo: { width: photoW, height: photoW * 1.25, borderRadius: 6, objectFit: "cover" },
    photoEmpty: { width: photoW, height: photoW * 1.25, borderRadius: 6, backgroundColor: "#16211b", alignItems: "center", justifyContent: "center" },
    initials: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40 * t, color: C.accent },
    head: { flex: 1, justifyContent: "center" },
    positions: { color: C.accent, fontWeight: 600, fontSize: 8.5 * t, letterSpacing: 1.2, textTransform: "uppercase" },
    name: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 38 * Math.min(b, 1.3), color: "#ffffff", textTransform: "uppercase", marginTop: 3 * b, lineHeight: 1 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 11 * b, columnGap: 20, rowGap: 7 * b },
    contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 * b, paddingTop: 9 * b, borderTopWidth: 1, borderTopColor: C.bandLine, columnGap: 20, rowGap: 7 * b },
    metaLabel: { fontSize: 6.5 * t, color: C.bandMuted, textTransform: "uppercase", letterSpacing: 1 },
    metaValue: { fontSize: 9.5 * t, color: "#ffffff", fontWeight: 600, marginTop: 2 },

    looking: { backgroundColor: C.tint, paddingHorizontal: PAGE_PAD, paddingVertical: 9 * b, flexDirection: "row", alignItems: "center", gap: 12 },
    lookingLabel: { fontSize: 7 * t, fontWeight: 700, color: C.green, letterSpacing: 1.3, textTransform: "uppercase" },
    lookingText: { flex: 1, fontSize: 10.5 * t, fontWeight: 600, color: C.ink, lineHeight: 1.35 },

    stats: { paddingHorizontal: PAGE_PAD, paddingTop: 16 * b },
    statsLabel: { fontSize: 7.5 * t, fontWeight: 700, color: C.green, letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 6 * b },
    statRow: { flexDirection: "row", gap: 8 },
    statBox: { flex: 1, backgroundColor: C.box, borderRadius: 6, paddingVertical: 11 * b, paddingHorizontal: 12 },
    statValue: { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 44 * Math.min(b, 1.6), color: C.accent, lineHeight: 1 },
    statLabel: { fontSize: 7 * t, fontWeight: 600, color: C.bandMuted, textTransform: "uppercase", letterSpacing: 1.1, marginTop: 3 * b },

    body: { flexGrow: 1, flexShrink: 0, flexDirection: "row", paddingHorizontal: PAGE_PAD, paddingTop: 18 * b, paddingBottom: 14 * b, gap: COL_GAP },
    col: { flexDirection: "column", justifyContent: "space-between", rowGap: 15 * b },
    section: {},
    title: { fontSize: 7.5 * t, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1.4, paddingBottom: 4 * b, marginBottom: 7 * b, borderBottomWidth: 1, borderBottomColor: C.line },
    // react-pdf multiplies lineHeight by the style's own fontSize (default 18), so set both.
    para: { fontSize: 10.5 * t, lineHeight: 1.5 },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 * b },
    tag: { fontSize: 9.5 * t, fontWeight: 600, color: C.green, backgroundColor: C.tint, borderRadius: 10, paddingVertical: 3.5 * b, paddingHorizontal: 9 * b },
    tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 4.5 * b, borderBottomWidth: 0.75, borderBottomColor: C.line },
    th: { fontSize: 6.5 * t, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, paddingRight: 5 },
    td: { fontSize: 9.5 * t, lineHeight: 1.3, paddingRight: 5 },
    tdStrong: { fontSize: 9.5 * t, lineHeight: 1.3, fontWeight: 600 },
    current: { fontSize: 6 * t, fontWeight: 700, color: C.green, letterSpacing: 0.8 },
    bulletRow: { flexDirection: "row", gap: 7, marginBottom: 4 * b },
    bullet: { width: 4, height: 4, backgroundColor: C.accent, marginTop: 4.5 * t },
    bulletText: { flex: 1, fontSize: 10 * t, lineHeight: 1.4 },
    kv: { flexDirection: "row", marginBottom: 4 * b, gap: 6 },
    k: { width: "36%", fontSize: 8.5 * t, color: C.muted, lineHeight: 1.45 },
    v: { flex: 1, fontSize: 9.5 * t, fontWeight: 600, lineHeight: 1.4 },
    line: { fontSize: 9.5 * t, lineHeight: 1.45 },
    strong: { fontWeight: 600 },
    muted: { color: C.muted },
    link: { color: C.green, textDecoration: "none" },
    qrRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    qr: { width: 58 * Math.min(b, 2), height: 58 * Math.min(b, 2) },
    qrText: { flex: 1 },
    small: { fontSize: 8 * t, color: C.muted, lineHeight: 1.4 },
    linkLabel: { fontSize: 7.5 * t, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 1 },
    linkBlock: { marginBottom: 6 * b },

    footer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: PAGE_PAD, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line, fontSize: 7.5, color: C.muted },
  });
}

type S = ReturnType<typeof makeStyles>;
const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
/** Fits a link on one line of a column: long ones end in "…" (the link itself still goes to the full address). */
const fit = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
/** Rough number of characters that fit across `width` points of Inter at `size`. */
const charsFor = (width: number, size: number) => Math.floor(width / (size * 0.56));
const NARROW_COL = (595.28 - PAGE_PAD * 2 - COL_GAP) / (LEFT_FLEX + 1);

type SectionId = "profile" | "strengths" | "career" | "honours" | "physical" | "availability" | "education" | "video" | "coach" | "online";
const LEFT: SectionId[] = ["profile", "strengths", "career", "honours"];
const RIGHT: SectionId[] = ["physical", "availability", "education", "video", "coach"];

/** Rough height (pt at scale 1) of a section, only used to balance the two columns. */
function estimateHeight(id: SectionId, p: Profile, width: number): number {
  const lines = (text: string, size: number, w: number) => Math.max(1, Math.ceil((text.length * size * 0.52) / w));
  const title = 22;
  switch (id) {
    case "profile": return title + lines(p.bio, 10.5, width) * 15.8;
    case "strengths": return title + Math.ceil(cleanList(p.strengths).reduce((n, s) => n + s.length * 5 + 24, 0) / width) * 21;
    case "career": return title + 15 + careerRows(p).length * 19;
    case "honours": return title + cleanList(p.honours).reduce((n, h) => n + lines(h, 10, width - 11) * 14 + 4, 0);
    case "physical": return title + [formatHeight(p.heightCm), formatWeight(p.physical.weightKg), p.foot, p.physical.sprint.trim(), p.physical.fitness.trim()].filter(Boolean).length * 17;
    case "availability": return title + [p.availability.trials, p.availability.travel].filter(Boolean).reduce((n, v) => n + lines(v, 9.5, width * 0.62) * 14 + 4, 0);
    case "education": return title + [p.education.school, p.education.grades, p.education.graduationYear].filter(Boolean).reduce((n, v) => n + lines(v, 9.5, width * 0.62) * 14 + 4, 0);
    case "video": return title + [p.highlightUrl.trim(), p.matchUrl.trim()].filter(Boolean).length * 26;
    case "coach": return title + [p.coach.name, p.coach.club, p.coach.contact].filter((x) => x.trim()).length * 15;
    case "online": return title + 60;
  }
}

/** Which sections have content, split into the two columns; a very short column takes sections from the other. */
export function planColumns(p: Profile): { left: SectionId[]; right: SectionId[] } {
  const has: Record<SectionId, boolean> = {
    profile: !!p.bio.trim(),
    strengths: cleanList(p.strengths).length > 0,
    career: careerRows(p).length > 0,
    honours: cleanList(p.honours).length > 0,
    physical: !!(formatHeight(p.heightCm) || formatWeight(p.physical.weightKg) || p.foot || p.physical.sprint.trim() || p.physical.fitness.trim()),
    availability: !!(p.availability.trials.trim() || p.availability.travel.trim()),
    education: !!(p.education.school.trim() || p.education.grades.trim() || p.education.graduationYear.trim()),
    video: !!(p.highlightUrl.trim() || p.matchUrl.trim()),
    coach: !!p.coach.name.trim(),
    online: true,
  };
  const left = LEFT.filter((id) => has[id]);
  const right = RIGHT.filter((id) => has[id]);
  const inner = 595.28 - PAGE_PAD * 2 - COL_GAP;
  const leftW = (inner * LEFT_FLEX) / (LEFT_FLEX + 1);
  const rightW = inner - leftW;
  const total = (ids: SectionId[], w: number) => ids.reduce((n, id) => n + estimateHeight(id, p, w), 0);
  // The online profile and QR code sit at the bottom of the shorter column.
  if (total(left, leftW) <= total(right, rightW)) left.push("online");
  else right.push("online");
  for (let i = 0; i < 4; i++) {
    const lh = total(left, leftW);
    const rh = total(right, rightW);
    const [long, shortCol, longW, shortW] = lh > rh ? [left, right, leftW, rightW] : [right, left, rightW, leftW];
    if (long.length < 2 || Math.min(lh, rh) >= 0.6 * Math.max(lh, rh)) break;
    const moved = long[long.length - 1];
    const before = Math.abs(lh - rh);
    const after = Math.abs(total(long.slice(0, -1), longW) - total([...shortCol, moved], shortW));
    if (after >= before) break;
    long.pop();
    shortCol.push(moved);
  }
  return { left, right };
}

export function CvDocument({ profile: p, profileUrl, qr, scale = 1 }: { profile: Profile; profileUrl: string; qr: string; scale?: number }) {
  registerFonts();
  const s = makeStyles(scale);
  const age = ageFrom(p.dob);
  const facts = [
    { label: "Age", value: age !== null ? `${age} (${formatDate(p.dob)})` : "" },
    { label: "Club", value: p.club.trim() },
    { label: "Level", value: p.level.trim() },
  ].filter((m) => m.value);
  const contact = [
    { label: "Phone", value: p.contact.phone.trim() },
    { label: "Email", value: p.contact.email.trim() },
    { label: "Based in", value: p.contact.location.trim() },
    { label: "Nationality", value: p.contact.nationality.trim() },
  ].filter((m) => m.value);
  const { appearances, goals, assists, cleanSheets, season } = p.stats;
  const stats = [
    { label: "Appearances", value: appearances },
    { label: "Goals", value: goals },
    { label: "Assists", value: assists },
    { label: "Clean sheets", value: cleanSheets },
  ];
  const hasStats = stats.some((st) => st.value);
  const initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const { left, right } = planColumns(p);
  const render = (id: SectionId) => <CvSection key={id} id={id} p={p} s={s} profileUrl={profileUrl} qr={qr} />;

  return (
    <Document title={`${p.name} – Football CV`} author={p.name} creator={SITE.name}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          {p.photo ? (
            // react-pdf's Image has no alt prop; the name sits next to it.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={p.photo} style={s.photo} />
          ) : (
            <View style={s.photoEmpty}>
              <Text style={s.initials}>{initials}</Text>
            </View>
          )}
          <View style={s.head}>
            {p.positions.length > 0 && <Text style={s.positions}>{p.positions.map((x) => POSITION_NAMES[x] ?? x).join("  /  ")}</Text>}
            <Text style={s.name}>{p.name}</Text>
            {facts.length > 0 && (
              <View style={s.metaRow}>
                {facts.map((m) => (
                  <Meta key={m.label} {...m} s={s} />
                ))}
              </View>
            )}
            {contact.length > 0 && (
              <View style={s.contactRow}>
                {contact.map((m) => (
                  <Meta key={m.label} {...m} s={s} />
                ))}
              </View>
            )}
          </View>
        </View>

        {p.lookingFor.trim() && (
          <View style={s.looking}>
            <Text style={s.lookingLabel}>Looking for</Text>
            <Text style={s.lookingText}>{p.lookingFor.trim()}</Text>
          </View>
        )}

        {hasStats && (
          <View style={s.stats}>
            <Text style={s.statsLabel}>{[season.trim() ? `${season.trim()} season` : "This season", p.club.trim()].filter(Boolean).join("  ·  ")}</Text>
            <View style={s.statRow}>
              {stats.map((st) => (
                <View key={st.label} style={s.statBox}>
                  <Text style={s.statValue}>{st.value || "–"}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.body}>
          <View style={[s.col, { flex: LEFT_FLEX }]}>{left.map(render)}</View>
          <View style={[s.col, { flex: 1 }]}>{right.map(render)}</View>
        </View>

        <View style={s.footer}>
          <Text>{p.name} · Football CV</Text>
          <Text>
            {SITE.domain} · Updated {formatDate((p.updatedAt || new Date().toISOString()).slice(0, 10))}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function Meta({ label, value, s }: { label: string; value: string; s: S }) {
  return (
    <View>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function Title({ children, s }: { children: string; s: S }) {
  return <Text style={s.title}>{children}</Text>;
}

function Rows({ rows, s }: { rows: [string, string][]; s: S }) {
  return (
    <>
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <View key={k} style={s.kv}>
            <Text style={s.k}>{k}</Text>
            <Text style={s.v}>{v}</Text>
          </View>
        ))}
    </>
  );
}

function CvSection({ id, p, s, profileUrl, qr }: { id: SectionId; p: Profile; s: S; profileUrl: string; qr: string }) {
  const linkChars = charsFor(NARROW_COL, (s.line.fontSize as number) ?? 10);
  switch (id) {
    case "profile":
      return (
        <View style={s.section}>
          <Title s={s}>Profile</Title>
          <Text style={s.para}>{p.bio.trim()}</Text>
        </View>
      );
    case "strengths":
      return (
        <View style={s.section}>
          <Title s={s}>Key strengths</Title>
          <View style={s.tags}>
            {cleanList(p.strengths).map((t) => (
              <Text key={t} style={s.tag}>
                {t}
              </Text>
            ))}
          </View>
        </View>
      );
    case "career":
      return <CareerTable rows={careerRows(p)} s={s} />;
    case "honours":
      return (
        <View style={s.section}>
          <Title s={s}>Honours and representative football</Title>
          {cleanList(p.honours).map((h) => (
            <View key={h} style={s.bulletRow} wrap={false}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{h}</Text>
            </View>
          ))}
        </View>
      );
    case "physical":
      return (
        <View style={s.section}>
          <Title s={s}>Physical</Title>
          <Rows
            s={s}
            rows={[
              ["Height", formatHeight(p.heightCm)],
              ["Weight", formatWeight(p.physical.weightKg)],
              ["Preferred foot", p.foot],
              ["Sprint", p.physical.sprint.trim()],
              ["Fitness test", p.physical.fitness.trim()],
            ]}
          />
        </View>
      );
    case "availability":
      return (
        <View style={s.section}>
          <Title s={s}>Availability</Title>
          <Rows s={s} rows={[["Trials", p.availability.trials.trim()], ["Travel", p.availability.travel.trim()]]} />
        </View>
      );
    case "education":
      return (
        <View style={s.section}>
          <Title s={s}>Education</Title>
          <Rows s={s} rows={[["School", p.education.school.trim()], ["Grades", p.education.grades.trim()], ["Graduating", p.education.graduationYear.trim()]]} />
        </View>
      );
    case "video":
      return (
        <View style={s.section}>
          <Title s={s}>Video</Title>
          {[
            ["Highlights", p.highlightUrl.trim()],
            ["Full match", p.matchUrl.trim()],
          ]
            .filter(([, url]) => url)
            .map(([k, url]) => (
              <View key={k} style={s.linkBlock}>
                <Text style={s.linkLabel}>{k}</Text>
                <Link src={url} style={[s.line, s.link]}>
                  {fit(short(url), linkChars)}
                </Link>
              </View>
            ))}
        </View>
      );
    case "coach":
      return (
        <View style={s.section}>
          <Title s={s}>Coach reference</Title>
          <Text style={[s.line, s.strong]}>{p.coach.name.trim()}</Text>
          {p.coach.club.trim() && <Text style={[s.line, s.muted]}>{p.coach.club.trim()}</Text>}
          {p.coach.contact.trim() && <Text style={s.line}>{p.coach.contact.trim()}</Text>}
        </View>
      );
    case "online":
      return (
        <View style={s.section} wrap={false}>
          <Title s={s}>Online profile</Title>
          <View style={s.qrRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qr} style={s.qr} />
            <View style={s.qrText}>
              <Text style={s.small}>Scan for highlights, stats and references</Text>
              {/* Split after /player/ so the address wraps cleanly instead of running off the page. */}
              <Link src={profileUrl} style={[s.line, s.link, { marginTop: 3 }]}>
                {short(profileUrl).replace(/(\/player\/)/, "$1\n")}
              </Link>
            </View>
          </View>
        </View>
      );
  }
}

function CareerTable({ rows, s }: { rows: CareerRow[]; s: S }) {
  const cols = [
    { key: "club", label: "Club", flex: 2.4 },
    { key: "seasons", label: "Seasons", flex: 1.3 },
    { key: "level", label: "Level", flex: 1.9 },
    { key: "appearances", label: "Apps", flex: 0.75, right: true },
    { key: "goals", label: "Goals", flex: 0.85, right: true },
  ] as const;
  return (
    <View style={s.section}>
      <Title s={s}>Career history</Title>
      <View style={[s.tr, { paddingTop: 0 }]}>
        {cols.map((c) => (
          <Text key={c.key} style={[s.th, { flex: c.flex, textAlign: "right" in c ? "right" : "left" }, c.key === "goals" ? { paddingRight: 0 } : {}]}>
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r.key} style={s.tr} wrap={false}>
          <View style={{ flex: cols[0].flex, paddingRight: 5 }}>
            <Text style={s.tdStrong}>{r.club}</Text>
            {r.current && <Text style={s.current}>CURRENT</Text>}
          </View>
          <Text style={[s.td, { flex: cols[1].flex }]}>{r.seasons || "–"}</Text>
          <Text style={[s.td, { flex: cols[2].flex }]}>{r.level || "–"}</Text>
          <Text style={[s.td, { flex: cols[3].flex, textAlign: "right" }]}>{r.appearances || "–"}</Text>
          <Text style={[s.td, { flex: cols[4].flex, textAlign: "right", paddingRight: 0 }]}>{r.goals || "–"}</Text>
        </View>
      ))}
    </View>
  );
}
