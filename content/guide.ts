/**
 * ALL GUIDE CONTENT LIVES IN THIS FILE.
 *
 * To add your real chapters, replace the title, summary and body of each chapter below.
 *
 * Writing the body:
 * - Leave a blank line between paragraphs.
 * - Start a line with "## " for a subheading.
 * - Start lines with "- " for bullet points.
 *
 * Each chapter needs a unique `id`. It appears in the chapter's web address and is how
 * "mark as read" is remembered, so changing an id resets that chapter's tick.
 * Chapters appear in the order they're listed here. Add or remove chapters freely.
 */

export type Chapter = {
  id: string;
  title: string;
  summary: string;
  body: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: "how-scouting-works",
    title: "How scouting really works",
    summary: "Placeholder summary: who scouts are, where they look and what they write down.",
    body: `
Placeholder text for chapter 1. Replace it with your own writing in content/guide.ts.

This chapter will explain how scouts find players at different levels of the game, from academies to non-league, and what they are actually looking for when they watch a match.

## What this chapter covers

- Placeholder point one: who does the scouting at each level
- Placeholder point two: where scouts get their leads from
- Placeholder point three: what goes into a scouting report

## Your next step

Placeholder: end each chapter with one clear action the reader can take today.
`,
  },
  {
    id: "player-profile",
    title: "Building a profile scouts read",
    summary: "Placeholder summary: the details that matter on a player profile and CV.",
    body: `
Placeholder text for chapter 2. Replace it with your own writing in content/guide.ts.

This chapter will walk through each part of a player profile, what a scout reads first, and how to use the Profile Builder to make yours.

## What this chapter covers

- Placeholder point one: the details every profile needs
- Placeholder point two: choosing a photo
- Placeholder point three: writing a short bio

## Your next step

Placeholder: one action, for example finishing your profile in the Profile Builder.
`,
  },
  {
    id: "highlight-reel",
    title: "Your highlight reel",
    summary: "Placeholder summary: what to film, how to cut it and what to leave out.",
    body: `
Placeholder text for chapter 3. Replace it with your own writing in content/guide.ts.

This chapter will cover how to get footage, which clips to include for your position, and how long a highlight reel should be.

## What this chapter covers

- Placeholder point one: getting footage of your games
- Placeholder point two: picking clips for your position
- Placeholder point three: editing and uploading

## Your next step

Placeholder: one action the reader can take today.
`,
  },
  {
    id: "contacting-clubs",
    title: "Contacting clubs",
    summary: "Placeholder summary: who to message, what to say and when to follow up.",
    body: `
Placeholder text for chapter 4. Replace it with your own writing in content/guide.ts.

This chapter will explain how to find the right person at a club, how to write a message that gets read, and how to follow up without being ignored.

## What this chapter covers

- Placeholder point one: finding the right contact
- Placeholder point two: writing the first message
- Placeholder point three: following up

## Your next step

Placeholder: one action, for example sending your first message from the Message Builder.
`,
  },
  {
    id: "trials",
    title: "Trials: before, during and after",
    summary: "Placeholder summary: how to prepare, how to play and what to do afterwards.",
    body: `
Placeholder text for chapter 5. Replace it with your own writing in content/guide.ts.

This chapter will cover the week before a trial, what coaches watch for on the day, and what to do after the final whistle.

## What this chapter covers

- Placeholder point one: preparing in the week before
- Placeholder point two: standing out on the day
- Placeholder point three: following up afterwards

## Your next step

Placeholder: one action the reader can take today.
`,
  },
  {
    id: "non-league",
    title: "The non-league pathway",
    summary: "Placeholder summary: how the non-league pyramid works and how to move up it.",
    body: `
Placeholder text for chapter 6. Replace it with your own writing in content/guide.ts.

This chapter will explain the steps of the non-league pyramid, how players move between levels, and how to approach a non-league manager.

## What this chapter covers

- Placeholder point one: how the pyramid is structured
- Placeholder point two: moving up a level
- Placeholder point three: approaching managers

## Your next step

Placeholder: one action the reader can take today.
`,
  },
  {
    id: "us-college",
    title: "Playing college soccer in the US",
    summary: "Placeholder summary: divisions, eligibility and contacting college coaches.",
    body: `
Placeholder text for chapter 7. Replace it with your own writing in content/guide.ts.

This chapter will cover how US college soccer is organised, what coaches need from international players, and how the recruiting timeline works.

## What this chapter covers

- Placeholder point one: the college divisions
- Placeholder point two: academic requirements
- Placeholder point three: the recruiting timeline

## Your next step

Placeholder: one action the reader can take today.
`,
  },
  {
    id: "staying-ready",
    title: "Handling rejection and staying ready",
    summary: "Placeholder summary: dealing with knock-backs and keeping your momentum.",
    body: `
Placeholder text for chapter 8. Replace it with your own writing in content/guide.ts.

This chapter will cover how to handle a rejection, what to learn from it, and how to keep training and contacting clubs until the right chance comes.

## What this chapter covers

- Placeholder point one: dealing with a no
- Placeholder point two: asking for feedback
- Placeholder point three: keeping a routine

## Your next step

Placeholder: one action the reader can take today.
`,
  },
];
