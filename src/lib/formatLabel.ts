/** Converts a snake_case (or hyphenated) catalog token into sentence-case display text. */
export function formatLabel(str: string | null | undefined): string {
  if (!str) return "";
  const spaced = str.replace(/[_-]+/g, " ").trim().replace(/\s+/g, " ");
  if (!spaced) return "";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export function formatLabels(items: string[]): string[] {
  return items.map(formatLabel);
}
