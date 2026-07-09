import { exercises, movementTechniques } from "@/lib/training/catalog";
import type { ResolvedItem } from "@/lib/training/catalog";

/** lowercase, spaces -> hyphens, strip anything that isn't a letter/number/hyphen. */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Best-effort fallback for resolving a bare display name to a catalog item when no
 * slug+kind is already known. Checks the exercise catalog first, then movement
 * techniques. This is a heuristic, not authoritative — a name like "Seated or Lying
 * Leg Curl" slugifies to "seated-or-lying-leg-curl", not the real catalog slug
 * "leg-curl", so this only succeeds when the display name happens to match the slug
 * shape. Prefer passing a real slug+kind (e.g. from a already-resolved catalog item)
 * whenever one is available instead of relying on this.
 */
export function resolveByName(name: string): ResolvedItem | null {
  const slug = slugifyName(name);

  const exercise = exercises.find((e) => e.slug === slug);
  if (exercise) {
    return {
      slug: exercise.slug,
      kind: "exercise",
      name: exercise.name,
      dose: [exercise.defaultSets, exercise.defaultReps].filter(Boolean).join(" x ") || null,
      exercise,
    };
  }

  const technique = movementTechniques.find((t) => t.slug === slug);
  if (technique) {
    return {
      slug: technique.slug,
      kind: "technique",
      name: technique.name,
      dose: technique.suggestedDose,
      technique,
    };
  }

  return null;
}
