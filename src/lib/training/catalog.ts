import exercisesData from "@/data/training/exercises.json";
import techniquesData from "@/data/training/movement-techniques.json";
import weeklyProgramData from "@/data/training/weekly-program.json";
import templatesData from "@/data/training/workout-templates.json";
import progressionRulesData from "@/data/training/progression-rules.json";
import unresolvedRefsData from "@/data/training/unresolved-refs.json";
import type {
  Exercise,
  MovementTechnique,
  WeeklyProgramDay,
  WorkoutTemplate,
  ProgressionRule,
  UnresolvedRef,
  ItemKind,
} from "@/lib/training/types";

export const exercises = exercisesData as Exercise[];
export const movementTechniques = techniquesData as MovementTechnique[];
export const weeklyProgram = weeklyProgramData as WeeklyProgramDay[];
export const workoutTemplates = templatesData as WorkoutTemplate[];
export const progressionRules = progressionRulesData as ProgressionRule[];
export const unresolvedRefs = unresolvedRefsData as UnresolvedRef[];

const exerciseBySlug = new Map(exercises.map((e) => [e.slug, e]));
const techniqueBySlug = new Map(movementTechniques.map((t) => [t.slug, t]));
const templateBySlug = new Map(workoutTemplates.map((t) => [t.slug, t]));
const unresolvedBySlug = new Map(unresolvedRefs.map((u) => [u.slug, u]));

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return exerciseBySlug.get(slug);
}

export function getTechniqueBySlug(slug: string): MovementTechnique | undefined {
  return techniqueBySlug.get(slug);
}

export function getTemplateBySlug(slug: string): WorkoutTemplate | undefined {
  return templateBySlug.get(slug);
}

export interface ResolvedItem {
  slug: string;
  kind: ItemKind;
  name: string;
  dose: string | null;
  exercise?: Exercise;
  technique?: MovementTechnique;
  unresolved?: UnresolvedRef;
}

/** Resolve a template item slug+kind into its full catalog record (or the unresolved-ref stub). */
export function resolveItem(slug: string, kind: ItemKind): ResolvedItem {
  if (kind === "exercise") {
    const exercise = exerciseBySlug.get(slug);
    return {
      slug,
      kind,
      name: exercise?.name ?? slug,
      dose: exercise ? [exercise.defaultSets, exercise.defaultReps].filter(Boolean).join(" x ") || null : null,
      exercise,
    };
  }
  if (kind === "technique") {
    const technique = techniqueBySlug.get(slug);
    return {
      slug,
      kind,
      name: technique?.name ?? slug,
      dose: technique?.suggestedDose ?? null,
      technique,
    };
  }
  const unresolved = unresolvedBySlug.get(slug);
  return {
    slug,
    kind: "unresolved",
    name: unresolved?.label ?? slug,
    dose: null,
    unresolved,
  };
}
