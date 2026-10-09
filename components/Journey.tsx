import Timeline, { type TimelineItem } from "@/components/ui/timeline";
import walking from "@/public/images/hero.jpg";

/** Placeholder milestones: they alternate above and below the line. Keep it to 7 for the tuned layout. */
const STEPS: TimelineItem[] = [
  { id: "day-1", label: "Day 1", content: "Build your player profile and a one-page football CV." },
  { id: "day-2", label: "Day 2", content: "Put your highlight reel and full-match footage in one place." },
  { id: "week-1", label: "Week 1", content: "Send your first messages to managers, academies and college coaches." },
  { id: "week-2", label: "Week 2", content: "Track every reply and follow up on the right day." },
  { id: "week-4", label: "Week 4", content: "Turn replies into training sessions and trial invites." },
  { id: "trial-day", label: "Trial day", content: "Walk in prepared, play your game and leave an impression." },
  { id: "signed", label: "Signed", content: "Put pen to paper and start the next chapter." },
];

export function Journey() {
  return (
    <Timeline
      id="journey"
      items={STEPS}
      title="Your road to signed"
      periodLabel="Day 1 — Signed"
      textColor="var(--color-ink)"
      mutedTextColor="var(--color-muted)"
      activeColor="var(--color-accent)"
      backgroundColor="var(--color-bg)"
      image={walking}
      imageAlt="A footballer walking away across a floodlit pitch at night."
      imagePosition="72% center"
      headingClassName="font-display font-extrabold uppercase"
      duration={1.4}
    />
  );
}
