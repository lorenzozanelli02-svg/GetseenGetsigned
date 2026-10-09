import { Circle, Document, Font, Image, Line, Link, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { ageFrom, formatDate } from "@/lib/dates";
import { careerRows, cleanList, formatHeight, PITCH_SPOTS, POSITION_NAMES, statItems, type CareerRow } from "@/lib/profile";
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

    pitchRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    marker: { position: "absolute", alignItems: "center", justifyContent: "center", borderRadius: 20, borderWidth: 1.2, borderColor: C.green },
    markerText: { fontWeight: 700, letterSpacing: 0.3 },
    legend: { flex: 1, paddingTop: 2 },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 * b },
    legendDot: { width: 13 * t, height: 13 * t, borderRadius: 7 * t, borderWidth: 1, borderColor: C.green, alignItems: "center", justifyContent: "center" },
    legendNum: { fontSize: 7 * t, fontWeight: 700 },
    legendText: { flex: 1, fontSize: 9.5 * t, lineHeight: 1.3 },
    legendMain: { fontSize: 6 * t, fontWeight: 700, color: C.green, letterSpacing: 0.8 },

    footer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: PAGE_PAD, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line, fontSize: 7.5, color: C.muted },
  });
}

type S = ReturnType<typeof makeStyles>;
const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
/** Fits a link on one line of a column: long ones end in "…" (the link itself still goes to the full address). */
const fit = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
/** Rough number of characters that fit across `width` points of Inter at `size`. */
const charsFor = (width: number, size: number) => Math.floor(width / (size * 0.56));

type SectionId = "pitch" | "profile" | "strengths" | "career" | "honours" | "details" | "video" | "coach" | "college" | "online";
const LEFT: SectionId[] = ["pitch", "profile", "strengths", "career", "honours"];
const RIGHT: SectionId[] = ["details", "video", "coach", "college"];
const INNER = 595.28 - PAGE_PAD * 2 - COL_GAP;
const LEFT_W = (INNER * LEFT_FLEX) / (LEFT_FLEX + 1);
const RIGHT_W = INNER - LEFT_W;

/** Height, foot and date of birth, for the Player details section. */
function detailRows(p: Profile): [string, string][] {
  return [
    ["Height", formatHeight(p.heightCm)],
    ["Preferred foot", p.foot],
    ["Date of birth", p.dob ? formatDate(p.dob) : ""],
  ].filter(([, v]) => v) as [string, string][];
}

function collegeRows(p: Profile): [string, string][] {
  return [
    ["Graduating", p.college.graduationYear.trim() && `Class of ${p.college.graduationYear.trim()}`],
    ["GPA", p.college.gpa.trim()],
    ["Intended major", p.college.major.trim()],
  ].filter(([, v]) => v) as [string, string][];
}

/** The pitch grows with the scale, so a sparse CV gets a big pitch, but never wider than 62% of its column. */
const pitchWidth = (b: number, colWidth: number) => Math.min(96 * b, colWidth * 0.62);

/** Rough height (pt at scale 1) of a section, only used to balance the two columns. */
function estimateHeight(id: SectionId, p: Profile, width: number): number {
  const lines = (text: string, size: number, w: number) => Math.max(1, Math.ceil((text.length * size * 0.52) / w));
  const title = 22;
  switch (id) {
    case "profile": return title + lines(p.bio, 10.5, width) * 15.8;
    case "strengths": return title + Math.ceil(cleanList(p.strengths).reduce((n, s) => n + s.length * 5 + 24, 0) / width) * 21;
    case "career": return title + 15 + careerRows(p).length * 19;
    case "honours": return title + cleanList(p.honours).reduce((n, h) => n + lines(h, 10, width - 11) * 14 + 4, 0);
    case "pitch": return title + (pitchWidth(1, width) * 90) / 68;
    case "details": return title + detailRows(p).length * 17;
    case "college": return title + collegeRows(p).reduce((n, [, v]) => n + lines(v, 9.5, width * 0.62) * 14 + 4, 0);
    case "video": return title + [p.highlightUrl.trim(), p.matchUrl.trim()].filter(Boolean).length * 26;
    case "coach": return title + [p.coach.name, p.coach.club, p.coach.contact].filter((x) => x.trim()).length * 15;
    case "online": return title + 78;
  }
}

/** Which sections have content, split into the two columns; a very short column takes sections from the other. */
export function planColumns(p: Profile): { left: SectionId[]; right: SectionId[] } {
  const has: Record<SectionId, boolean> = {
    pitch: p.positions.some((pos) => PITCH_SPOTS[pos]),
    profile: !!p.bio.trim(),
    strengths: cleanList(p.strengths).length > 0,
    // The current club is in the header, so the table only appears once there are previous clubs.
    career: careerRows(p).length > 1,
    honours: cleanList(p.honours).length > 0,
    details: detailRows(p).length > 0,
    video: !!(p.highlightUrl.trim() || p.matchUrl.trim()),
    coach: !!p.coach.name.trim(),
    college: collegeRows(p).length > 0,
    online: true,
  };
  const left = LEFT.filter((id) => has[id]);
  const right = RIGHT.filter((id) => has[id]);
  const leftW = LEFT_W;
  const rightW = RIGHT_W;
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
    { label: "Age", value: age !== null ? String(age) : "" },
    { label: "Club", value: p.club.trim() },
    { label: "Level", value: p.level.trim() },
  ].filter((m) => m.value);
  const contact = [
    { label: "Phone", value: p.contact.phone.trim() },
    { label: "Email", value: p.contact.email.trim() },
    { label: "Based in", value: p.contact.location.trim() },
  ].filter((m) => m.value);
  const season = p.stats.season;
  const stats = statItems(p).map((st) => ({ label: st.long, value: st.value }));
  const hasStats = stats.some((st) => st.value);
  const initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const { left, right } = planColumns(p);
  const render = (width: number) => (id: SectionId) => <CvSection key={id} id={id} p={p} s={s} profileUrl={profileUrl} qr={qr} scale={scale} width={width} />;

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
          <View style={[s.col, { flex: LEFT_FLEX }]}>{left.map(render(LEFT_W))}</View>
          <View style={[s.col, { flex: 1 }]}>{right.map(render(RIGHT_W))}</View>
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

function CvSection({ id, p, s, profileUrl, qr, scale, width }: { id: SectionId; p: Profile; s: S; profileUrl: string; qr: string; scale: number; width: number }) {
  const linkChars = charsFor(width, (s.line.fontSize as number) ?? 10);
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
          <Title s={s}>Honours</Title>
          {cleanList(p.honours).map((h) => (
            <View key={h} style={s.bulletRow} wrap={false}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{h}</Text>
            </View>
          ))}
        </View>
      );
    case "pitch":
      return <PitchSection p={p} s={s} scale={scale} width={width} />;
    case "details":
      return (
        <View style={s.section}>
          <Title s={s}>Player details</Title>
          <Rows s={s} rows={detailRows(p)} />
        </View>
      );
    case "college":
      return (
        <View style={s.section}>
          <Title s={s}>US college</Title>
          <Rows s={s} rows={collegeRows(p)} />
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
            <Text style={[s.small, s.qrText]}>Scan for highlights, stats and references</Text>
          </View>
          {/* Under the code, using the column's full width. Long addresses split after /player/ rather than running off the page. */}
          <Link src={profileUrl} style={[s.line, s.link, { marginTop: 6 }]}>
            {short(profileUrl).length <= charsFor(width, s.line.fontSize as number) ? short(profileUrl) : short(profileUrl).replace(/(\/player\/)/, "$1\n")}
          </Link>
        </View>
      );
  }
}

function CareerTable({ rows, s }: { rows: CareerRow[]; s: S }) {
  const cols = [
    { key: "club", label: "Club", flex: 2.6 },
    { key: "years", label: "Years", flex: 1.1 },
    { key: "level", label: "Level", flex: 2 },
  ] as const;
  return (
    <View style={s.section}>
      <Title s={s}>Career history</Title>
      <View style={[s.tr, { paddingTop: 0 }]}>
        {cols.map((c) => (
          <Text key={c.key} style={[s.th, { flex: c.flex }]}>
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
          <Text style={[s.td, { flex: cols[1].flex }]}>{r.years || "–"}</Text>
          <Text style={[s.td, { flex: cols[2].flex, paddingRight: 0 }]}>{r.level || "–"}</Text>
        </View>
      ))}
    </View>
  );
}

/** A pitch with the player's positions marked (main position filled), and a numbered key beside it. */
function PitchSection({ p, s, scale, width }: { p: Profile; s: S; scale: number; width: number }) {
  const positions = p.positions.filter((pos) => PITCH_SPOTS[pos]);
  const w = pitchWidth(scale, width);
  const h = (w * 90) / 68;
  const k = w / 68;
  const size = Math.max(15, Math.min(24, 15 * Math.sqrt(scale)));
  const lines = { stroke: "#b5d4c1", strokeWidth: 0.8, fill: "none" };
  return (
    <View style={s.section} wrap={false}>
      <Title s={s}>{positions.length > 1 ? "Positions" : "Position"}</Title>
      <View style={s.pitchRow}>
        <View style={{ width: w, height: h }}>
          <Svg width={w} height={h} viewBox="0 0 68 90">
            <Rect x={0} y={0} width={68} height={90} rx={2} fill="#eef7f1" />
            <Rect x={3} y={3} width={62} height={84} {...lines} />
            <Line x1={3} y1={45} x2={65} y2={45} {...lines} />
            <Circle cx={34} cy={45} r={7.5} {...lines} />
            <Rect x={15} y={3} width={38} height={13} {...lines} />
            <Rect x={25} y={3} width={18} height={5} {...lines} />
            <Rect x={15} y={74} width={38} height={13} {...lines} />
            <Rect x={25} y={82} width={18} height={5} {...lines} />
            <Path d="M27.5 16 A7 7 0 0 0 40.5 16 M27.5 74 A7 7 0 0 1 40.5 74" {...lines} />
          </Svg>
          {positions.map((pos, i) => {
            const spot = PITCH_SPOTS[pos];
            const main = i === 0;
            const mw = size * (pos.length > 2 ? 1.45 : 1.2);
            return (
              <View
                key={pos}
                style={[
                  s.marker,
                  { left: spot.x * 68 * k - mw / 2, top: spot.y * 90 * k - size / 2, width: mw, height: size, backgroundColor: main ? C.green : "#ffffff" },
                ]}
              >
                <Text style={[s.markerText, { fontSize: size * 0.42, color: main ? "#ffffff" : C.green }]}>{pos}</Text>
              </View>
            );
          })}
        </View>
        <View style={s.legend}>
          {positions.map((pos, i) => (
            <View key={pos} style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: i === 0 ? C.green : "#ffffff" }]}>
                <Text style={[s.legendNum, { color: i === 0 ? "#ffffff" : C.green }]}>{i + 1}</Text>
              </View>
              <Text style={s.legendText}>
                {POSITION_NAMES[pos] ?? pos}
                {i === 0 && positions.length > 1 && <Text style={s.legendMain}>{"\n"}MAIN</Text>}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
