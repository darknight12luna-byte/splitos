export type Mood = "TIRED" | "NORMAL" | "ENERGIZED" | "STRONG";

export interface CaptionInput {
  mood: Mood;
  title: string;
  itemCount: number;
  streakDay: number;
  highlightNames: string[];
}

const TEMPLATES: Record<Mood, string[]> = {
  TIRED: [
    "Day {streak}. Ngl I almost bailed on {titleLower} today — energy was not there. But I got through {itemCount} of it anyway. Some days it's just about showing up. {highlightLine}",
    "Not every day is a good day. Day {streak} of this and today I was running on fumes. Still finished {titleLower}. {highlightLine}",
  ],
  NORMAL: [
    "Day {streak}. Solid {titleLower} today — {itemCount} moves in, nothing fancy, just consistent work. {highlightLine}",
    "Day {streak} in the books. {title}. Building the habit one session at a time. {highlightLine}",
  ],
  ENERGIZED: [
    "Day {streak} and I felt GOOD today ⚡ Crushed {titleLower} — {itemCount} moves down. {highlightLine}",
    "Feeling the momentum on Day {streak}. Today's {titleLower} flew by. {highlightLine}",
  ],
  STRONG: [
    "Day {streak} 💪 Strongest I've felt yet. {title} done, {itemCount} moves, no cap. {highlightLine}",
    "Day {streak}. Today I actually felt like an athlete for once. {title}. {highlightLine}",
  ],
};

export function generateCaption(input: CaptionInput): string {
  const variants = TEMPLATES[input.mood];
  const template = variants[Math.floor(Math.random() * variants.length)];

  const highlightLine = input.highlightNames.length
    ? `Also nailed ${input.highlightNames.join(" and ")} today 🏆`
    : "";

  return template
    .replace(/{streak}/g, String(input.streakDay))
    .replace(/{title}/g, input.title)
    .replace(/{titleLower}/g, input.title.toLowerCase())
    .replace(/{itemCount}/g, String(input.itemCount))
    .replace(/{highlightLine}/g, highlightLine)
    .trim();
}
