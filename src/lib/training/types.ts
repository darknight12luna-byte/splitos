export interface MediaRef {
  title: string | null;
  url: string | null;
  source: string | null;
}

export interface Exercise {
  slug: string;
  name: string;
  category: string;
  movementPattern: string;
  equipment: string[];
  difficulty: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  executionSteps: string[];
  cues: string[];
  mistakes: string[];
  regressions: string[];
  progressions: string[];
  defaultSets: string | null;
  defaultReps: string | null;
  defaultRest: string | null;
  mediaReference: MediaRef | null;
  recommendedSearchQuery: string;
  coachNotes: string[];
  beginnerInstructions: string[];
}

export interface MovementTechnique {
  slug: string;
  name: string;
  techniqueType: string;
  parentSystem: string;
  difficulty: string;
  whatItTrains: string[];
  executionSteps: string[];
  keyCues: string[];
  commonMistakes: string[];
  beginnerVersion: string[];
  progressionVersion: string[];
  suggestedFrequency: string | null;
  suggestedDose: string | null;
  mediaReference: MediaRef | null;
  recommendedSearchQuery: string;
  coachNotes: string[];
}

export interface WeeklyProgramDay {
  dayLabel: string;
  sessionType: string;
  goal: string;
  templateSlug: string;
  frequency: string;
  notes: string | null;
}

export type ItemKind = "exercise" | "technique" | "unresolved";

export interface TemplateItem {
  slug: string;
  kind: ItemKind;
}

export interface WorkoutTemplate {
  slug: string;
  name: string;
  category: string;
  itemOrder: TemplateItem[];
  beginnerInstructions: string[];
  coachNotes: string[];
}

export interface ProgressionRule {
  slug: string;
  name: string;
  appliesTo: string[];
  logic: string;
  beginnerField: string | null;
  coachNote: string | null;
  coachNotes?: string[];
  beginnerInstructions?: string[];
}

export interface UnresolvedRef {
  slug: string;
  label: string;
  referencedBy: string[];
}
